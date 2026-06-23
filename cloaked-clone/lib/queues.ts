/**
 * BullMQ queue instances and job-helper functions for Shielded.
 *
 * Queues are lazily instantiated so that importing this module during
 * Next.js static build (when Redis is unavailable) does not throw.
 */

import { Queue } from 'bullmq';

// ─── Redis connection ─────────────────────────────────────────────────────────

function buildRedisConnection() {
  const url = process.env.REDIS_URL;
  if (url) {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port || '6379', 10),
      password: parsed.password || undefined,
      maxRetriesPerRequest: null as null,
    };
  }
  return {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null as null,
  };
}

export const redisConnection = buildRedisConnection();

// ─── Lazy queue singletons ────────────────────────────────────────────────────

let _scanQueue: Queue | null = null;
let _optOutQueue: Queue | null = null;
let _monitorQueue: Queue | null = null;
let _notificationQueue: Queue | null = null;

function getScanQueue(): Queue {
  if (!_scanQueue) {
    _scanQueue = new Queue('scan-queue', {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5_000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      },
    });
  }
  return _scanQueue;
}

function getOptOutQueue(): Queue {
  if (!_optOutQueue) {
    _optOutQueue = new Queue('opt-out-queue', {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 10_000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      },
    });
  }
  return _optOutQueue;
}

function getMonitorQueue(): Queue {
  if (!_monitorQueue) {
    _monitorQueue = new Queue('monitor-queue', {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 30_000 },
        removeOnComplete: { count: 50 },
        removeOnFail: { count: 25 },
      },
    });
  }
  return _monitorQueue;
}

function getNotificationQueue(): Queue {
  if (!_notificationQueue) {
    _notificationQueue = new Queue('notification-queue', {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'fixed', delay: 3_000 },
        removeOnComplete: { count: 200 },
        removeOnFail: { count: 50 },
      },
    });
  }
  return _notificationQueue;
}

// ─── Exported getters (backward-compatible with queue-as-value usage) ─────────

export const scanQueue = { add: (...a: Parameters<Queue['add']>) => getScanQueue().add(...a) } as Queue;
export const optOutQueue = { add: (...a: Parameters<Queue['add']>) => getOptOutQueue().add(...a) } as Queue;
export const monitorQueue = { add: (...a: Parameters<Queue['add']>) => getMonitorQueue().add(...a) } as Queue;
export const notificationQueue = { add: (...a: Parameters<Queue['add']>) => getNotificationQueue().add(...a) } as Queue;

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

// ─── Helper: enqueue a scan job ──────────────────────────────────────────────

export async function queueScanJob(userId: string, jobId: string): Promise<void> {
  await getScanQueue().add(
    'scan',
    { userId, jobId } satisfies ScanJobData,
    { jobId: `scan:${jobId}` },
  );
}

// ─── Helper: enqueue an opt-out job ──────────────────────────────────────────

export async function queueOptOutJob(
  userId: string,
  brokerId: string,
  recordId: string,
): Promise<void> {
  await getOptOutQueue().add(
    'opt-out',
    { userId, brokerId, recordId } satisfies OptOutJobData,
    { jobId: `optout:${recordId}` },
  );
}

// ─── Helper: enqueue a notification job ──────────────────────────────────────

export async function queueNotificationJob(
  type: string,
  userId: string,
  data: Record<string, unknown>,
): Promise<void> {
  await getNotificationQueue().add('notification', { type, userId, data } satisfies NotificationJobData);
}
