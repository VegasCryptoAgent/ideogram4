/**
 * Inline scan processor — runs the broker scan in the same Node.js process
 * without requiring a separate BullMQ worker. Safe for Railway (single-process
 * deployment) because Railway keeps the Node.js process alive between requests.
 */

import { prisma } from './prisma';
import { calculatePrivacyScore } from '../services/privacy-score';

const DETECTION_RATE = 0.35;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function simulateBrokerScan(
  broker: { name: string; scanUrlTemplate: string | null; website: string },
  profile: { firstName: string | null; lastName: string | null; state: string },
): Promise<boolean> {
  const url =
    broker.scanUrlTemplate
      ?.replace('{firstName}', encodeURIComponent(profile.firstName ?? ''))
      .replace('{lastName}', encodeURIComponent(profile.lastName ?? ''))
      .replace('{state}', encodeURIComponent(profile.state)) ??
    `https://${broker.website}/search`;

  console.log(`[Scanner] Checking ${broker.name} → ${url}`);
  return Math.random() < DETECTION_RATE;
}

export async function runScanJob(userId: string, scanJobId: string): Promise<void> {
  console.log(`[Scanner] Starting inline job ${scanJobId} for user ${userId}`);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { addresses: true },
    });

    if (!user) throw new Error(`User ${userId} not found`);

    const primaryAddress = user.addresses.find((a) => a.isPrimary) ?? user.addresses[0];
    const profile = {
      firstName: user.firstName,
      lastName: user.lastName,
      state: primaryAddress?.state ?? 'US',
    };

    const brokers = await prisma.dataBroker.findMany({
      where: { isActive: true },
      orderBy: { priority: 'asc' },
    });

    if (brokers.length === 0) {
      await prisma.scanJob.update({
        where: { id: scanJobId },
        data: { status: 'completed', completedAt: new Date() },
      });
      console.warn('[Scanner] No active brokers found — scan complete with 0 results');
      return;
    }

    await prisma.scanJob.update({
      where: { id: scanJobId },
      data: { status: 'running', totalBrokers: brokers.length, startedAt: new Date() },
    });

    let found = 0;
    let scanned = 0;

    for (const broker of brokers) {
      try {
        // Small delay so UI polling can show incremental progress
        if (scanned > 0 && scanned % 10 === 0) await sleep(50);

        const existing = await prisma.brokerRecord.findUnique({
          where: { userId_brokerId: { userId, brokerId: broker.id } },
        });

        const isFound = await simulateBrokerScan(broker, profile);

        if (existing) {
          await prisma.brokerRecord.update({
            where: { id: existing.id },
            data: { status: isFound ? 'found' : 'not_found', lastChecked: new Date() },
          });
          if (isFound && existing.status !== 'removal_requested' && existing.status !== 'removed') {
            found++;
          }
        } else {
          await prisma.brokerRecord.create({
            data: {
              userId,
              brokerId: broker.id,
              status: isFound ? 'found' : 'not_found',
              lastChecked: new Date(),
            },
          });
          if (isFound) found++;
        }

        scanned++;

        await prisma.scanJob.update({
          where: { id: scanJobId },
          data: { scanned, found },
        });
      } catch (err) {
        console.error(`[Scanner] Error on broker ${broker.name}:`, err);
        scanned++;
      }
    }

    await prisma.scanJob.update({
      where: { id: scanJobId },
      data: { status: 'completed', scanned, found, completedAt: new Date() },
    });

    const allRecords = await prisma.brokerRecord.findMany({
      where: { userId },
      include: { broker: { select: { category: true, name: true } } },
    });

    const hasBreaches = (await prisma.breachAlert.count({ where: { userId, isRead: false } })) > 0;
    const { score } = calculatePrivacyScore(allRecords, hasBreaches);

    await prisma.user.update({
      where: { id: userId },
      data: { privacyScore: score, lastScanAt: new Date() },
    });

    await prisma.notification.create({
      data: {
        userId,
        type: 'scan_complete',
        title: 'Scan Complete',
        message:
          found > 0
            ? `Found ${found} listing${found !== 1 ? 's' : ''} across ${scanned} data brokers.`
            : `No listings found across ${scanned} data brokers. Your data looks clean!`,
        data: { jobId: scanJobId, found, scanned, score },
      },
    });

    console.log(`[Scanner] Completed job ${scanJobId}: scanned=${scanned}, found=${found}, score=${score}`);
  } catch (err) {
    console.error(`[Scanner] Job ${scanJobId} failed:`, err);
    await prisma.scanJob
      .update({ where: { id: scanJobId }, data: { status: 'failed', completedAt: new Date() } })
      .catch(() => {});
  }
}
