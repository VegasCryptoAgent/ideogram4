/**
 * Scheduler — registers all BullMQ repeatable jobs on application startup.
 *
 * Call `initializeScheduler()` once (e.g. from scripts/setup.ts or a
 * server startup file) to ensure repeatable jobs exist in Redis.
 * BullMQ is idempotent for repeatable jobs identified by the same key, so
 * calling this function multiple times is safe.
 *
 * Schedule overview:
 *   weekly-scan                  every 6 hours   (rotates through users per-run)
 *   verify-removals              every 24 hours
 *   breach-check                 every 7 days
 *   cleanup-old-notifications    every 30 days
 */

import { Queue } from 'bullmq';
import { redis } from '../lib/redis';
import type { MonitorJobData } from '../lib/queues';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RepeatableJobSpec {
  name: string;
  data: MonitorJobData;
  /** Cron pattern OR plain millisecond interval */
  every?: number;
  cron?: string;
  /** Readable label used in log output only */
  label: string;
}

// ─── Job definitions ──────────────────────────────────────────────────────────

const REPEATABLE_JOBS: RepeatableJobSpec[] = [
  {
    name: 'monitor-weekly-scan',
    data: { task: 'weekly-scan' },
    every: 6 * 60 * 60 * 1_000, // every 6 hours
    label: 'weekly-scan (every 6 h)',
  },
  {
    name: 'monitor-verify-removals',
    data: { task: 'verify-removals' },
    every: 24 * 60 * 60 * 1_000, // every 24 hours
    label: 'verify-removals (every 24 h)',
  },
  {
    name: 'monitor-breach-check',
    data: { task: 'breach-check' },
    every: 7 * 24 * 60 * 60 * 1_000, // every 7 days
    label: 'breach-check (every 7 d)',
  },
  {
    name: 'monitor-cleanup-notifications',
    data: { task: 'cleanup-old-notifications' },
    every: 30 * 24 * 60 * 60 * 1_000, // every 30 days
    label: 'cleanup-old-notifications (every 30 d)',
  },
];

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Registers all repeatable monitor jobs with BullMQ.
 * Safe to call multiple times (idempotent).
 */
export async function initializeScheduler(): Promise<void> {
  const monitorQueue = new Queue<MonitorJobData>('monitor-queue', {
    connection: redis,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 30_000 },
      removeOnComplete: { count: 50 },
      removeOnFail: { count: 25 },
    },
  });

  console.log('[Scheduler] Initialising repeatable jobs…');

  for (const spec of REPEATABLE_JOBS) {
    await monitorQueue.add(spec.name, spec.data, {
      repeat: spec.cron
        ? { pattern: spec.cron }
        : { every: spec.every! },
      jobId: spec.name, // stable ID prevents duplicate repeatable entries
    });

    console.log(`[Scheduler] ✔ Registered: ${spec.label}`);
  }

  // List registered repeatable jobs for confirmation.
  const registered = await monitorQueue.getRepeatableJobs();
  console.log(
    `[Scheduler] ${registered.length} repeatable job(s) active:`,
    registered.map((j) => `${j.name} (next: ${new Date(j.next).toISOString()})`),
  );

  console.log('[Scheduler] Initialisation complete');
}

/**
 * Removes all repeatable monitor jobs from Redis.
 * Useful for tests or when changing schedules.
 */
export async function clearScheduler(): Promise<void> {
  const monitorQueue = new Queue<MonitorJobData>('monitor-queue', { connection: redis });

  const jobs = await monitorQueue.getRepeatableJobs();
  for (const job of jobs) {
    await monitorQueue.removeRepeatableByKey(job.key);
    console.log(`[Scheduler] Removed repeatable job: ${job.name}`);
  }
}

// ─── Standalone entrypoint ────────────────────────────────────────────────────

if (require.main === module) {
  initializeScheduler()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Scheduler] Fatal error:', err);
      process.exit(1);
    });
}
