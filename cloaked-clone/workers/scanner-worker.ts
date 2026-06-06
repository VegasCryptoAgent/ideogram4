/**
 * Scanner Worker — processes `scan-queue` jobs.
 *
 * For each job it:
 *  1. Loads the user profile (name, addresses, phones).
 *  2. Fetches all active brokers from the database.
 *  3. Marks the ScanJob as `running`.
 *  4. Iterates every broker with a 500 ms inter-request delay to avoid
 *     hammering external services and triggering rate-limit bans.
 *  5. Simulates an HTTP presence-check with a realistic 35% detection rate.
 *  6. Persists scan results to BrokerRecord.
 *  7. Queues an opt-out job for every detected listing.
 *  8. Finalises the ScanJob, recalculates the privacy score, and creates
 *     an in-app notification.
 */

import { Worker, Job } from 'bullmq';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { queueOptOutJob, queueNotificationJob, type ScanJobData } from '../lib/queues';
import { calculatePrivacyScore } from '../services/privacy-score';

// ─── Constants ────────────────────────────────────────────────────────────────

const QUEUE_NAME = 'scan-queue';
const DETECTION_RATE = 0.35; // 35 % of brokers "find" the user
const INTER_REQUEST_DELAY_MS = 500;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Non-blocking sleep. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Simulates an HTTP scan against a data broker URL template.
 * In a real implementation this would use Playwright / Puppeteer to
 * navigate the broker's search page and check for a matching record.
 *
 * Returns `true` when the user's data appears to be listed.
 */
async function simulateBrokerScan(
  broker: { name: string; scanUrlTemplate: string | null; website: string },
  profile: { firstName: string | null; lastName: string | null; state: string },
): Promise<boolean> {
  // Build the URL we *would* request so it appears in logs.
  const url =
    broker.scanUrlTemplate
      ?.replace('{firstName}', encodeURIComponent(profile.firstName ?? ''))
      .replace('{lastName}', encodeURIComponent(profile.lastName ?? ''))
      .replace('{state}', encodeURIComponent(profile.state)) ??
    `https://${broker.website}/search`;

  console.log(`[Scanner] Checking ${broker.name} → ${url}`);

  // Probabilistic detection to simulate realistic scan results.
  return Math.random() < DETECTION_RATE;
}

// ─── Worker processor ─────────────────────────────────────────────────────────

async function processScanJob(job: Job<ScanJobData>): Promise<void> {
  const { userId, jobId } = job.data;

  console.log(`[Scanner] Starting job ${jobId} for user ${userId}`);

  // 1 ── Load user profile ───────────────────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { addresses: true },
  });

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  const primaryAddress = user.addresses.find((a) => a.isPrimary) ?? user.addresses[0];
  const profile = {
    firstName: user.firstName,
    lastName: user.lastName,
    state: primaryAddress?.state ?? '',
  };

  // 2 ── Load active brokers ─────────────────────────────────────────────────
  const brokers = await prisma.dataBroker.findMany({
    where: { isActive: true },
    orderBy: { priority: 'asc' },
  });

  if (brokers.length === 0) {
    console.warn('[Scanner] No active brokers found — aborting scan');
    return;
  }

  // 3 ── Mark job as running ─────────────────────────────────────────────────
  await prisma.scanJob.update({
    where: { id: jobId },
    data: {
      status: 'running',
      totalBrokers: brokers.length,
      startedAt: new Date(),
    },
  });

  let found = 0;
  let scanned = 0;

  // 4 ── Iterate brokers ─────────────────────────────────────────────────────
  for (const broker of brokers) {
    try {
      // Rate-limit guard: wait between requests.
      if (scanned > 0) {
        await sleep(INTER_REQUEST_DELAY_MS);
      }

      // Check if a BrokerRecord already exists for this user+broker pair.
      const existing = await prisma.brokerRecord.findUnique({
        where: { userId_brokerId: { userId, brokerId: broker.id } },
      });

      // Update job progress before scanning so the UI reflects the current broker.
      await job.updateProgress({
        scanned,
        found,
        total: brokers.length,
        currentBroker: broker.name,
      });

      const isFound = await simulateBrokerScan(broker, profile);

      if (existing) {
        // Update existing record status.
        await prisma.brokerRecord.update({
          where: { id: existing.id },
          data: {
            status: isFound ? 'found' : 'not_found',
            lastChecked: new Date(),
          },
        });

        if (isFound && existing.status !== 'removal_requested' && existing.status !== 'removed') {
          found++;
          await queueOptOutJob(userId, broker.id, existing.id);
        }
      } else {
        // Create a fresh record.
        const record = await prisma.brokerRecord.create({
          data: {
            userId,
            brokerId: broker.id,
            status: isFound ? 'found' : 'not_found',
            lastChecked: new Date(),
          },
        });

        if (isFound) {
          found++;
          await queueOptOutJob(userId, broker.id, record.id);
        }
      }

      scanned++;

      // Persist incremental progress so the API can stream it to the UI.
      await prisma.scanJob.update({
        where: { id: jobId },
        data: { scanned, found },
      });
    } catch (brokerErr) {
      console.error(`[Scanner] Error scanning broker ${broker.name}:`, brokerErr);
      // Continue with remaining brokers rather than aborting the whole job.
      scanned++;
    }
  }

  // 5 ── Finalise the scan job ───────────────────────────────────────────────
  await prisma.scanJob.update({
    where: { id: jobId },
    data: {
      status: 'completed',
      scanned,
      found,
      completedAt: new Date(),
    },
  });

  // 6 ── Recalculate privacy score ───────────────────────────────────────────
  const allRecords = await prisma.brokerRecord.findMany({
    where: { userId },
    include: { broker: { select: { category: true, name: true } } },
  });

  const hasBreaches =
    (await prisma.breachAlert.count({ where: { userId, isRead: false } })) > 0;

  const { score } = calculatePrivacyScore(allRecords, hasBreaches);

  // 7 ── Persist score and last-scan timestamp ───────────────────────────────
  await prisma.user.update({
    where: { id: userId },
    data: {
      privacyScore: score,
      lastScanAt: new Date(),
    },
  });

  // 8 ── Create in-app notification ─────────────────────────────────────────
  await prisma.notification.create({
    data: {
      userId,
      type: 'scan_complete',
      title: 'Scan Complete',
      message:
        found > 0
          ? `Found ${found} new listing${found !== 1 ? 's' : ''} across ${scanned} data brokers.`
          : `No new listings found across ${scanned} data brokers. Your data looks clean!`,
      data: { jobId, found, scanned, score },
    },
  });

  // Also queue an email notification.
  await queueNotificationJob('scan_complete', userId, {
    jobId,
    found,
    scanned,
    score,
    brokerCount: brokers.length,
  });

  console.log(
    `[Scanner] Completed job ${jobId}: scanned=${scanned}, found=${found}, score=${score}`,
  );
}

// ─── Worker instance ──────────────────────────────────────────────────────────

export const scannerWorker = new Worker<ScanJobData>(QUEUE_NAME, processScanJob, {
  connection: redis,
  concurrency: 2,
  limiter: {
    max: 1,        // max 1 job per…
    duration: 1_000, // …second per worker instance
  },
});

// ─── Worker event listeners ───────────────────────────────────────────────────

scannerWorker.on('completed', (job) => {
  console.log(`[Scanner] Job ${job.id} completed successfully`);
});

scannerWorker.on('failed', (job, err) => {
  console.error(`[Scanner] Job ${job?.id} failed (attempt ${job?.attemptsMade}):`, err.message);
});

scannerWorker.on('stalled', (jobId) => {
  console.warn(`[Scanner] Job ${jobId} stalled — will be retried`);
});

scannerWorker.on('error', (err) => {
  console.error('[Scanner] Worker error:', err);
});

console.log('[Scanner] Worker started and listening on', QUEUE_NAME);

export default scannerWorker;
