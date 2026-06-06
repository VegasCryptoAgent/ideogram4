/**
 * Setup script — verifies all external service connections, seeds broker data,
 * creates BullMQ queues, and initialises the repeatable-job scheduler.
 *
 * Run once before starting the application for the first time, or after
 * environment changes:
 *
 *   npx tsx scripts/setup.ts
 */

import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import Stripe from 'stripe';
import twilio from 'twilio';
import { Queue } from 'bullmq';
import { BROKERS } from '../data/brokers';
import { initializeScheduler } from '../workers/scheduler';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ok(label: string): void {
  console.log(`  ✔ ${label}`);
}

function fail(label: string, err: unknown): never {
  console.error(`  ✗ ${label}:`, err instanceof Error ? err.message : String(err));
  process.exit(1);
}

function section(title: string): void {
  console.log(`\n── ${title} ${'─'.repeat(Math.max(0, 50 - title.length))}`);
}

// ─── 1. Database ──────────────────────────────────────────────────────────────

async function verifyDatabase(): Promise<PrismaClient> {
  section('Verifying PostgreSQL connection');

  const prisma = new PrismaClient({ log: ['error'] });

  try {
    await prisma.$queryRaw`SELECT 1`;
    ok('PostgreSQL connection successful');
    return prisma;
  } catch (err) {
    fail('PostgreSQL connection failed', err);
  }
}

// ─── 2. Redis ─────────────────────────────────────────────────────────────────

async function verifyRedis(): Promise<void> {
  section('Verifying Redis connection');

  const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
    maxRetriesPerRequest: 1,
    connectTimeout: 5_000,
    lazyConnect: true,
  });

  try {
    await redis.connect();
    const pong = await redis.ping();
    if (pong !== 'PONG') throw new Error(`Unexpected PING response: ${pong}`);
    ok('Redis connection successful');
  } catch (err) {
    fail('Redis connection failed', err);
  } finally {
    redis.disconnect();
  }
}

// ─── 3. Twilio ────────────────────────────────────────────────────────────────

async function verifyTwilio(): Promise<void> {
  section('Verifying Twilio credentials');

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token) {
    console.warn('  ⚠ TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN not set — skipping');
    return;
  }

  try {
    const client = twilio(sid, token);
    await client.api.accounts(sid).fetch();
    ok('Twilio credentials valid');
  } catch (err) {
    fail('Twilio credential verification failed', err);
  }
}

// ─── 4. Stripe ────────────────────────────────────────────────────────────────

async function verifyStripe(): Promise<void> {
  section('Verifying Stripe credentials');

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.warn('  ⚠ STRIPE_SECRET_KEY not set — skipping');
    return;
  }

  try {
    const stripe = new Stripe(key, { apiVersion: '2024-10-28.acacia', typescript: true });
    await stripe.balance.retrieve();
    ok('Stripe credentials valid');
  } catch (err) {
    fail('Stripe credential verification failed', err);
  }
}

// ─── 5. Seed brokers ──────────────────────────────────────────────────────────

async function seedBrokers(prisma: PrismaClient): Promise<void> {
  section('Seeding broker data');

  let created = 0;
  let skipped = 0;

  for (const broker of BROKERS) {
    try {
      const existing = await prisma.dataBroker.findFirst({
        where: { website: broker.website },
      });

      if (existing) {
        await prisma.dataBroker.update({
          where: { id: existing.id },
          data: {
            name: broker.name,
            category: broker.category,
            optOutMethod: broker.optOutMethod,
            optOutUrl: broker.optOutUrl ?? null,
            optOutEmail: (broker as { optOutEmail?: string }).optOutEmail ?? null,
            scanUrlTemplate: broker.scanUrlTemplate ?? null,
            difficulty: broker.difficulty,
            avgRemovalDays: broker.avgRemovalDays,
            priority: broker.priority,
            isActive: broker.isActive ?? true,
          },
        });
        skipped++;
      } else {
        await prisma.dataBroker.create({
          data: {
            name: broker.name,
            website: broker.website,
            category: broker.category,
            optOutMethod: broker.optOutMethod,
            optOutUrl: broker.optOutUrl ?? null,
            optOutEmail: (broker as { optOutEmail?: string }).optOutEmail ?? null,
            scanUrlTemplate: broker.scanUrlTemplate ?? null,
            difficulty: broker.difficulty,
            avgRemovalDays: broker.avgRemovalDays,
            priority: broker.priority,
            isActive: broker.isActive ?? true,
          },
        });
        created++;
      }
    } catch (err) {
      console.warn(`  ⚠ Failed to seed broker "${broker.name}":`, err instanceof Error ? err.message : err);
    }
  }

  ok(`Broker seed complete: ${created} created, ${skipped} updated (${BROKERS.length} total)`);
}

// ─── 6. Create BullMQ queues ──────────────────────────────────────────────────

async function createQueues(): Promise<void> {
  section('Creating BullMQ queues');

  const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    lazyConnect: true,
  });

  const QUEUE_NAMES = ['scan-queue', 'opt-out-queue', 'monitor-queue', 'notification-queue'];

  for (const name of QUEUE_NAMES) {
    const q = new Queue(name, { connection: redis });
    // Calling getJobCounts forces BullMQ to initialise the queue key in Redis.
    await q.getJobCounts();
    ok(`Queue "${name}" ready`);
  }

  redis.disconnect();
}

// ─── 7. Start scheduler ───────────────────────────────────────────────────────

async function startScheduler(): Promise<void> {
  section('Initialising scheduler');

  try {
    await initializeScheduler();
    ok('Scheduler initialised');
  } catch (err) {
    fail('Scheduler initialisation failed', err);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║     Shielded Privacy — Setup Script      ║');
  console.log('╚══════════════════════════════════════════╝');

  const prisma = await verifyDatabase();
  await verifyRedis();
  await verifyTwilio();
  await verifyStripe();
  await seedBrokers(prisma);
  await createQueues();
  await startScheduler();

  console.log('\n✅ Setup complete — Shielded is ready to run.\n');

  await prisma.$disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('\n[Setup] Unexpected error:', err);
  process.exit(1);
});
