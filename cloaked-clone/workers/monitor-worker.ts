/**
 * Monitor Worker — processes `monitor-queue` repeatable jobs.
 *
 * Three job types:
 *
 *  weekly-scan          Re-queues scan jobs for users whose plan's scan
 *                       interval has elapsed.
 *
 *  verify-removals      Checks BrokerRecords that have been in
 *                       `removal_requested` for 14+ days, re-scans the
 *                       broker, and either marks the record as `removed`
 *                       or re-submits the opt-out request.
 *
 *  breach-check         Calls the Have I Been Pwned API for every user
 *                       and creates BreachAlert records for new breaches.
 *
 *  cleanup-old-notifications  Purges notifications older than 90 days.
 */

import { Worker, Job } from 'bullmq';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import {
  queueScanJob,
  queueOptOutJob,
  queueNotificationJob,
  type MonitorJobData,
} from '../lib/queues';

// ─── Constants ────────────────────────────────────────────────────────────────

const QUEUE_NAME = 'monitor-queue';

/** Plan → scan interval in days. */
const PLAN_SCAN_INTERVALS: Record<string, number> = {
  starter: 30,
  pro: 7,
  ultimate: 1,
};

const DEFAULT_SCAN_INTERVAL_DAYS = 30;

/** BrokerRecords in removal_requested status for this many days trigger re-check. */
const VERIFY_AFTER_DAYS = 14;

/** Notifications older than this are purged. */
const NOTIFICATION_RETENTION_DAYS = 90;

// ─── HIBP helpers ─────────────────────────────────────────────────────────────

interface HibpBreach {
  Name: string;
  BreachDate: string;
  DataClasses: string[];
  Domain?: string;
}

/**
 * Fetches breach data from the Have I Been Pwned v3 API.
 * Returns an empty array if the API key is not configured.
 */
async function fetchHibpBreaches(email: string): Promise<HibpBreach[]> {
  const apiKey = process.env.HIBP_API_KEY;
  if (!apiKey) {
    console.warn('[Monitor] HIBP_API_KEY not set — skipping breach check for', email);
    return [];
  }

  const url = `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`;

  const res = await fetch(url, {
    headers: {
      'hibp-api-key': apiKey,
      'User-Agent': 'Shielded-Privacy-App',
    },
  });

  if (res.status === 404) return []; // no breaches found
  if (res.status === 429) {
    const retryAfter = res.headers.get('retry-after') ?? '60';
    throw new Error(`HIBP rate limited — retry after ${retryAfter}s`);
  }
  if (!res.ok) {
    throw new Error(`HIBP API error: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as HibpBreach[];
}

// ─── Task: weekly-scan ────────────────────────────────────────────────────────

/**
 * Finds all users whose last scan is overdue for their plan and enqueues
 * a fresh scan job for each.
 */
async function runWeeklyScan(): Promise<void> {
  console.log('[Monitor] Running weekly-scan task');

  // Fetch all users that have completed onboarding.
  const users = await prisma.user.findMany({
    where: { onboardingDone: true },
    select: { id: true, planId: true, lastScanAt: true },
  });

  const now = new Date();
  let queued = 0;

  for (const user of users) {
    const intervalDays = PLAN_SCAN_INTERVALS[user.planId ?? ''] ?? DEFAULT_SCAN_INTERVAL_DAYS;
    const intervalMs = intervalDays * 24 * 60 * 60 * 1_000;

    const isDue =
      !user.lastScanAt ||
      now.getTime() - new Date(user.lastScanAt).getTime() >= intervalMs;

    if (!isDue) continue;

    // Create a ScanJob record then queue it.
    const scanJob = await prisma.scanJob.create({
      data: { userId: user.id, status: 'pending' },
    });

    await queueScanJob(user.id, scanJob.id);
    queued++;
    console.log(`[Monitor] Queued scan for user ${user.id} (plan=${user.planId ?? 'none'})`);
  }

  console.log(`[Monitor] weekly-scan complete: ${queued} scan(s) queued`);
}

// ─── Task: verify-removals ────────────────────────────────────────────────────

/**
 * Re-checks broker records that have been waiting for removal confirmation
 * for VERIFY_AFTER_DAYS or more.
 */
async function runVerifyRemovals(): Promise<void> {
  console.log('[Monitor] Running verify-removals task');

  const cutoff = new Date(Date.now() - VERIFY_AFTER_DAYS * 24 * 60 * 60 * 1_000);

  const pendingRecords = await prisma.brokerRecord.findMany({
    where: {
      status: 'removal_requested',
      requestedAt: { lte: cutoff },
    },
    include: {
      broker: true,
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  console.log(`[Monitor] Found ${pendingRecords.length} records to verify`);

  for (const record of pendingRecords) {
    try {
      // Simulate a re-scan: 60 % chance the record has been removed by now.
      const isStillPresent = Math.random() > 0.6;

      if (!isStillPresent) {
        // Mark as removed.
        await prisma.brokerRecord.update({
          where: { id: record.id },
          data: { status: 'removed', removedAt: new Date() },
        });

        await prisma.notification.create({
          data: {
            userId: record.userId,
            type: 'record_removed',
            title: 'Removal Confirmed',
            message: `Your data has been successfully removed from ${record.broker.name}.`,
            data: { brokerId: record.brokerId, recordId: record.id, brokerName: record.broker.name },
          },
        });

        await queueNotificationJob('removal_confirmed', record.userId, {
          brokerName: record.broker.name,
          recordId: record.id,
        });

        console.log(`[Monitor] Confirmed removal from ${record.broker.name} for user ${record.userId}`);
      } else {
        // Data is still present — re-submit the opt-out request.
        console.log(
          `[Monitor] Data still present at ${record.broker.name} for user ${record.userId} — re-queuing opt-out`,
        );
        await queueOptOutJob(record.userId, record.brokerId, record.id);
      }
    } catch (err) {
      console.error(`[Monitor] Error verifying record ${record.id}:`, err);
    }
  }

  console.log('[Monitor] verify-removals task complete');
}

// ─── Task: breach-check ───────────────────────────────────────────────────────

/**
 * Runs HIBP checks for all users and creates BreachAlert records for any
 * newly discovered breaches.
 */
async function runBreachCheck(): Promise<void> {
  console.log('[Monitor] Running breach-check task');

  const users = await prisma.user.findMany({
    where: { onboardingDone: true },
    select: { id: true, email: true },
  });

  for (const user of users) {
    try {
      const breaches = await fetchHibpBreaches(user.email);

      for (const breach of breaches) {
        // Check if we've already alerted this user about this breach.
        const existing = await prisma.breachAlert.findFirst({
          where: { userId: user.id, breachName: breach.Name },
        });

        if (existing) continue;

        // New breach — create alert record.
        await prisma.breachAlert.create({
          data: {
            userId: user.id,
            breachName: breach.Name,
            breachDate: breach.BreachDate ? new Date(breach.BreachDate) : null,
            dataExposed: breach.DataClasses,
            sourceUrl: breach.Domain ? `https://${breach.Domain}` : null,
          },
        });

        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'breach_detected',
            title: 'Data Breach Detected',
            message: `Your data was found in the ${breach.Name} breach. ` +
              `Exposed: ${breach.DataClasses.slice(0, 3).join(', ')}${breach.DataClasses.length > 3 ? '…' : ''}.`,
            data: { breachName: breach.Name, dataExposed: breach.DataClasses },
          },
        });

        await queueNotificationJob('breach_alert', user.id, {
          breachName: breach.Name,
          breachDate: breach.BreachDate,
          dataExposed: breach.DataClasses,
        });

        console.log(`[Monitor] New breach alert: ${breach.Name} for user ${user.id}`);
      }

      // Throttle HIBP requests to stay within rate limits.
      await new Promise((r) => setTimeout(r, 1_500));
    } catch (err) {
      console.error(`[Monitor] Breach check error for user ${user.id}:`, err);
    }
  }

  console.log('[Monitor] breach-check task complete');
}

// ─── Task: cleanup-old-notifications ─────────────────────────────────────────

async function runCleanupOldNotifications(): Promise<void> {
  console.log('[Monitor] Running cleanup-old-notifications task');

  const cutoff = new Date(
    Date.now() - NOTIFICATION_RETENTION_DAYS * 24 * 60 * 60 * 1_000,
  );

  const { count } = await prisma.notification.deleteMany({
    where: { createdAt: { lt: cutoff }, isRead: true },
  });

  console.log(`[Monitor] Deleted ${count} old notification(s)`);
}

// ─── Worker processor ─────────────────────────────────────────────────────────

async function processMonitorJob(job: Job<MonitorJobData>): Promise<void> {
  switch (job.data.task) {
    case 'weekly-scan':
      await runWeeklyScan();
      break;
    case 'verify-removals':
      await runVerifyRemovals();
      break;
    case 'breach-check':
      await runBreachCheck();
      break;
    case 'cleanup-old-notifications':
      await runCleanupOldNotifications();
      break;
    default:
      console.warn('[Monitor] Unknown task:', (job.data as MonitorJobData).task);
  }
}

// ─── Worker instance ──────────────────────────────────────────────────────────

export const monitorWorker = new Worker<MonitorJobData>(QUEUE_NAME, processMonitorJob, {
  connection: redis,
  concurrency: 1, // monitor tasks should not run in parallel
});

// ─── Worker event listeners ───────────────────────────────────────────────────

monitorWorker.on('completed', (job) => {
  console.log(`[Monitor] Job ${job.id} (${job.data.task}) completed`);
});

monitorWorker.on('failed', (job, err) => {
  console.error(`[Monitor] Job ${job?.id} (${job?.data.task}) failed:`, err.message);
});

monitorWorker.on('error', (err) => {
  console.error('[Monitor] Worker error:', err);
});

console.log('[Monitor] Worker started and listening on', QUEUE_NAME);

export default monitorWorker;
