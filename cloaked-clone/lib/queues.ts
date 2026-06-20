/**
 * BullMQ queue instances and job-helper functions for Shielded.
 *
 * All four queues share the same ioredis connection but are logically
 * separated so each worker can scale independently.
 */

import { Queue } from 'bullmq';

// BullMQ requires connection options, not a raw ioredis instance
const connection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
};

// ─── Queue instances ──────────────────────────────────────────────────────────

export const scanQueue = new Queue('scan-queue', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5_000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

export const optOutQueue = new Queue('opt-out-queue', {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 10_000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

export const monitorQueue = new Queue('monitor-queue', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 30_000 },
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 25 },
  },
});

export const notificationQueue = new Queue('notification-queue', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'fixed', delay: 3_000 },
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 50 },
  },
});

// ─── Backward-compatible aliases (used by existing API routes) ────────────────

/** @deprecated Use scanQueue */
export const scannerQueue = scanQueue;

// ─── Job data types ───────────────────────────────────────────────────────────

export interface ScanJobData {
  userId: string;
  jobId: string;
}

export interface OptOutJobData {
  userId: string;
  brokerId: string;
  recordId: string;
}

export interface NotificationJobData {
  type: string;
  userId: string;
  data: Record<string, unknown>;
}

export interface MonitorJobData {
  task: 'weekly-scan' | 'verify-removals' | 'breach-check' | 'cleanup-old-notifications';
  userId?: string;
  recordId?: string;
  brokerId?: string;
}

// ─── Helper: enqueue a scan job ───────────────────────────────────────────────

/**
 * Adds a scan job to the scan-queue.
 * @param userId  The user whose profile should be scanned.
 * @param jobId   The ScanJob database record id.
 */
export async function queueScanJob(userId: string, jobId: string): Promise<void> {
  await scanQueue.add(
    'scan',
    { userId, jobId } satisfies ScanJobData,
    { jobId: `scan:${jobId}` }, // deduplicate by DB job id
  );
}

// ─── Helper: enqueue an opt-out job ──────────────────────────────────────────

/**
 * Adds an opt-out job to the opt-out-queue.
 * @param userId    The user requesting removal.
 * @param brokerId  The DataBroker id.
 * @param recordId  The BrokerRecord id.
 */
export async function queueOptOutJob(
  userId: string,
  brokerId: string,
  recordId: string,
): Promise<void> {
  await optOutQueue.add(
    'opt-out',
    { userId, brokerId, recordId } satisfies OptOutJobData,
    { jobId: `optout:${recordId}` }, // one in-flight opt-out per record
  );
}

// ─── Helper: enqueue a notification job ──────────────────────────────────────

/**
 * Adds a notification job to the notification-queue.
 * @param type    Template name (e.g. 'welcome', 'scan_complete').
 * @param userId  Recipient user id.
 * @param data    Template-specific payload.
 */
export async function queueNotificationJob(
  type: string,
  userId: string,
  data: Record<string, unknown>,
): Promise<void> {
  await notificationQueue.add('notification', { type, userId, data } satisfies NotificationJobData);
}
