// ============================================================
// Shielded Privacy App — Data Broker Scanner Service
// ============================================================
import { prisma } from '@/lib/prisma';
import { optOutQueue } from '@/lib/queues';
import { createNotification } from './notification-service';
import type { DataBroker } from '@prisma/client';

// ── Types ──────────────────────────────────────────────────────

export interface UserScanProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: Date | null;
  realPhones: string[];
  addresses: {
    city: string;
    state: string;
    zip: string | null;
  }[];
}

export interface ScanResult {
  brokerId: string;
  userId: string;
  found: boolean;
  foundUrl?: string;
  foundData?: Record<string, unknown>;
  error?: string;
}

// ── Helpers ────────────────────────────────────────────────────

/**
 * Build a realistic search URL using the broker's scan URL template.
 * Template variables: {firstName}, {lastName}, {city}, {state}
 */
function buildSearchUrl(broker: DataBroker, user: UserScanProfile): string {
  if (!broker.scanUrlTemplate) {
    return broker.website;
  }

  const firstName = (user.firstName ?? '').toLowerCase();
  const lastName = (user.lastName ?? '').toLowerCase();
  const city = user.addresses[0]?.city ?? '';
  const state = user.addresses[0]?.state ?? '';

  return broker.scanUrlTemplate
    .replace('{firstName}', encodeURIComponent(firstName))
    .replace('{lastName}', encodeURIComponent(lastName))
    .replace('{city}', encodeURIComponent(city))
    .replace('{state}', encodeURIComponent(state.toLowerCase()))
    .replace('{fullName}', encodeURIComponent(`${firstName} ${lastName}`));
}

/**
 * Simulate a realistic HTTP request to a broker's search page with
 * a random delay to avoid being flagged as a bot.
 */
async function simulateBrokerRequest(url: string): Promise<boolean> {
  // Simulate network latency (500ms – 3s)
  const delay = 500 + Math.random() * 2500;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // In a real implementation, this would use Playwright/Puppeteer or
  // a proxy-based HTTP client with realistic user-agent headers.
  // For demo: 35% probability of finding user data on any given broker.
  return Math.random() < 0.35;
}

/**
 * Determine if a broker response contains the user's information.
 * In production this would parse HTML/JSON from the actual response.
 */
function parseResponseForUserData(
  found: boolean,
  broker: DataBroker,
  user: UserScanProfile,
  searchUrl: string
): { found: boolean; foundUrl?: string; foundData?: Record<string, unknown> } {
  if (!found) return { found: false };

  const firstName = user.firstName ?? '';
  const lastName = user.lastName ?? '';
  const city = user.addresses[0]?.city ?? '';
  const state = user.addresses[0]?.state ?? '';

  return {
    found: true,
    foundUrl: `${searchUrl}#result-1`,
    foundData: {
      name: `${firstName} ${lastName}`,
      location: city && state ? `${city}, ${state}` : undefined,
      phones: user.realPhones.slice(0, 1), // Never expose all phones in logs
      detectedAt: new Date().toISOString(),
      broker: broker.name,
    },
  };
}

// ── Core Scanner ───────────────────────────────────────────────

/**
 * Scan a single data broker for a user's information.
 */
export async function scanBrokerForUser(
  broker: DataBroker,
  user: UserScanProfile
): Promise<ScanResult> {
  const searchUrl = buildSearchUrl(broker, user);

  try {
    const httpFound = await simulateBrokerRequest(searchUrl);
    const parsed = parseResponseForUserData(httpFound, broker, user, searchUrl);

    // Upsert the broker record
    const existingRecord = await prisma.brokerRecord.findUnique({
      where: { userId_brokerId: { userId: user.id, brokerId: broker.id } },
    });

    const status = parsed.found ? 'found' : 'not_found';

    if (existingRecord) {
      // Don't overwrite a removal_requested or removed status back to not_found
      const terminalStatuses = ['removal_requested', 'removed', 'opt_out_requested', 'opt_out_in_progress'];
      if (!terminalStatuses.includes(existingRecord.status)) {
        await prisma.brokerRecord.update({
          where: { id: existingRecord.id },
          data: {
            status,
            foundUrl: parsed.foundUrl ?? null,
            foundData: parsed.foundData ?? undefined,
            lastChecked: new Date(),
          },
        });
      }
    } else {
      await prisma.brokerRecord.create({
        data: {
          userId: user.id,
          brokerId: broker.id,
          status,
          foundUrl: parsed.foundUrl ?? null,
          foundData: parsed.foundData ?? undefined,
          lastChecked: new Date(),
        },
      });
    }

    // If found, automatically queue an opt-out request
    if (parsed.found && (!existingRecord || existingRecord.status === 'not_found')) {
      const record = await prisma.brokerRecord.findUnique({
        where: { userId_brokerId: { userId: user.id, brokerId: broker.id } },
      });

      if (record) {
        await optOutQueue.add(
          'opt-out',
          { userId: user.id, brokerId: broker.id, recordId: record.id },
          { jobId: `opt-out-${user.id}-${broker.id}` }
        );

        // Create notification for new find
        await createNotification(
          user.id,
          'record_found',
          `Data found on ${broker.name}`,
          `We found your information on ${broker.name} and have queued a removal request.`,
          { brokerName: broker.name, brokerId: broker.id, recordId: record.id }
        );
      }
    }

    return {
      brokerId: broker.id,
      userId: user.id,
      found: parsed.found,
      foundUrl: parsed.foundUrl,
      foundData: parsed.foundData,
    };
  } catch (err) {
    console.error(`[Scanner] Error scanning broker ${broker.name}:`, err);
    return {
      brokerId: broker.id,
      userId: user.id,
      found: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Scan all active data brokers for a user.
 * Updates the ScanJob record as it progresses.
 */
export async function scanAllBrokersForUser(
  userId: string,
  scanJobId?: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { addresses: { select: { city: true, state: true, zip: true } } },
  });

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  const userProfile: UserScanProfile = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    dateOfBirth: user.dateOfBirth,
    realPhones: user.realPhones,
    addresses: user.addresses,
  };

  // Get active brokers, prioritizing by priority field
  const brokers = await prisma.dataBroker.findMany({
    where: { isActive: true },
    orderBy: { priority: 'asc' },
  });

  // Update scan job with broker count
  if (scanJobId) {
    await prisma.scanJob.update({
      where: { id: scanJobId },
      data: { status: 'running', totalBrokers: brokers.length, startedAt: new Date() },
    });
  }

  let scanned = 0;
  let found = 0;

  // Process in batches to avoid overloading
  const BATCH_SIZE = 5;
  for (let i = 0; i < brokers.length; i += BATCH_SIZE) {
    const batch = brokers.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((broker) => scanBrokerForUser(broker, userProfile))
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        scanned++;
        if (result.value.found) found++;
      } else {
        scanned++;
      }
    }

    // Update progress
    if (scanJobId) {
      await prisma.scanJob.update({
        where: { id: scanJobId },
        data: { scanned, found },
      });
    }
  }

  // Mark scan complete
  if (scanJobId) {
    await prisma.scanJob.update({
      where: { id: scanJobId },
      data: { status: 'completed', completedAt: new Date(), scanned, found },
    });
  }

  // Update user's last scan date and privacy score
  const brokerRecords = await prisma.brokerRecord.findMany({
    where: { userId },
    include: { broker: { select: { category: true, name: true } } },
  });

  // Re-calculate privacy score
  const { calculatePrivacyScore } = await import('./privacy-score');
  const hasBreaches = (await prisma.breachAlert.count({ where: { userId, isRead: false } })) > 0;
  const scoreResult = calculatePrivacyScore(brokerRecords, hasBreaches);

  await prisma.user.update({
    where: { id: userId },
    data: { lastScanAt: new Date(), privacyScore: scoreResult.score },
  });

  // Create scan complete notification
  await createNotification(
    userId,
    'scan_complete',
    'Scan complete',
    `Scanned ${scanned} data broker sites. Found ${found} record${found !== 1 ? 's' : ''}.`,
    { totalBrokers: scanned, found, removed: 0 }
  );
}

/**
 * Check if a specific broker has completed the removal process for a user.
 * Returns true if the user's data is no longer present.
 */
export async function checkBrokerRemovalStatus(
  brokerId: string,
  userId: string
): Promise<boolean> {
  const broker = await prisma.dataBroker.findUnique({ where: { id: brokerId } });
  if (!broker) return false;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { addresses: { select: { city: true, state: true, zip: true } } },
  });
  if (!user) return false;

  const userProfile: UserScanProfile = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    dateOfBirth: user.dateOfBirth,
    realPhones: user.realPhones,
    addresses: user.addresses,
  };

  const result = await scanBrokerForUser(broker, userProfile);

  if (!result.found) {
    // Mark as removed
    await prisma.brokerRecord.updateMany({
      where: { userId, brokerId },
      data: { status: 'removed', removedAt: new Date(), lastChecked: new Date() },
    });

    await createNotification(
      userId,
      'record_removed',
      `Data removed from ${broker.name}`,
      `Your personal information has been successfully removed from ${broker.name}.`,
      { brokerName: broker.name, brokerId }
    );

    return true;
  }

  return false;
}
