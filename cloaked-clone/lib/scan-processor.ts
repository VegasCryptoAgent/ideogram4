/**
 * Inline scan processor — runs the broker scan in the same Node.js process
 * without requiring a separate BullMQ worker. Safe for Railway (single-process
 * deployment) because Railway keeps the Node.js process alive between requests.
 *
 * Real broker detection uses direct HTTP requests with browser-like headers.
 * Set SCRAPER_API_KEY (ScraperAPI) or SCRAPINGBEE_API_KEY (ScrapingBee) in
 * Railway environment variables to route requests through a proxy for sites
 * that enforce bot protection.
 */

import axios from 'axios';
import { prisma } from './prisma';
import { calculatePrivacyScore } from '../services/privacy-score';
import { runOptOutJob } from './optout-processor';

const REQUEST_TIMEOUT_MS = 8_000;

// How many brokers to check at once. Sequential checks (76 brokers × up to
// 8s each) could take ~10 min and look stuck; batching finishes in ~1–2 min.
const SCAN_CONCURRENCY = 6;

// Bot-detection signals — if the response HTML contains these we can't trust the result
const BOT_SIGNALS = ['captcha', 'i am not a robot', 'access denied', 'cf-challenge', 'ddos-guard', 'please verify you are a human'];

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  Connection: 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Cache-Control': 'max-age=0',
};

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Checks whether a given data broker's search page returns the user's name.
 *
 * Strategy:
 *  1. Build the search URL from the broker's scanUrlTemplate.
 *  2. If SCRAPER_API_KEY is set, route through ScraperAPI (bypasses most CAPTCHAs).
 *     If SCRAPINGBEE_API_KEY is set, use ScrapingBee instead.
 *  3. Otherwise attempt a direct request with browser-like headers.
 *  4. Search the raw HTML for the user's full name (case-insensitive).
 *  5. On any error or bot-detection page, return false (conservative — don't flag false positives).
 */
async function checkBrokerForUser(
  broker: { name: string; scanUrlTemplate: string | null; website: string },
  profile: { firstName: string | null; lastName: string | null; state: string },
): Promise<boolean> {
  const firstName = profile.firstName?.trim() ?? '';
  const lastName = profile.lastName?.trim() ?? '';
  if (!firstName || !lastName) return false;

  const targetUrl =
    broker.scanUrlTemplate
      ?.replace('{firstName}', encodeURIComponent(firstName))
      .replace('{lastName}', encodeURIComponent(lastName))
      .replace('{state}', encodeURIComponent(profile.state)) ??
    `https://${broker.website}/search?q=${encodeURIComponent(`${firstName} ${lastName}`)}`;

  console.log(`[Scanner] Checking ${broker.name} → ${targetUrl}`);

  const scraperApiKey = process.env.SCRAPER_API_KEY;
  const scrapingBeeKey = process.env.SCRAPINGBEE_API_KEY;

  let requestUrl = targetUrl;
  let params: Record<string, string> | undefined;

  if (scraperApiKey) {
    // ScraperAPI: pass the target URL as a query param
    requestUrl = 'https://api.scraperapi.com/';
    params = { api_key: scraperApiKey, url: targetUrl };
  } else if (scrapingBeeKey) {
    // ScrapingBee: similar pattern
    requestUrl = 'https://app.scrapingbee.com/api/v1/';
    params = { api_key: scrapingBeeKey, url: targetUrl, render_js: 'false' };
  }

  try {
    const response = await axios.get<string>(requestUrl, {
      headers: BROWSER_HEADERS,
      params,
      timeout: REQUEST_TIMEOUT_MS,
      maxRedirects: 5,
      responseType: 'text',
      validateStatus: (s) => s < 500, // don't throw on 4xx
    });

    if (response.status === 403 || response.status === 429 || response.status === 401) {
      console.log(`[Scanner] ${broker.name} blocked (HTTP ${response.status})`);
      return false;
    }

    const html = response.data ?? '';
    const lowerHtml = typeof html === 'string' ? html.toLowerCase() : '';

    // Too short = almost certainly not a real results page
    if (lowerHtml.length < 400) {
      console.log(`[Scanner] ${broker.name} returned thin response (${lowerHtml.length} chars) — inconclusive`);
      return false;
    }

    // Bot / CAPTCHA detection — can't trust the result
    if (BOT_SIGNALS.some((sig) => lowerHtml.includes(sig))) {
      console.log(`[Scanner] ${broker.name} shows bot-protection page — inconclusive`);
      return false;
    }

    // Primary check: user's full name appears on the results page
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    const reversed = `${lastName}, ${firstName}`.toLowerCase();
    const found = lowerHtml.includes(fullName) || lowerHtml.includes(reversed);

    console.log(`[Scanner] ${broker.name} → ${found ? 'FOUND' : 'not found'} (page: ${lowerHtml.length} chars)`);
    return found;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // ECONNREFUSED, ETIMEDOUT, DNS errors, etc. — mark not found
    console.log(`[Scanner] ${broker.name} fetch error: ${msg}`);
    return false;
  }
}

export async function runScanJob(userId: string, scanJobId: string): Promise<void> {
  console.log(`[Scanner] Starting inline job ${scanJobId} for user ${userId}`);

  // Mark the job running immediately so the UI reflects progress right away and
  // a job can never appear stuck at "Queued" once processing has actually begun.
  await prisma.scanJob
    .update({ where: { id: scanJobId }, data: { status: 'running', startedAt: new Date() } })
    .catch((e) => console.error('[Scanner] could not mark running:', e));

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

    let brokers = await prisma.dataBroker.findMany({
      where: { isActive: true },
      orderBy: { priority: 'asc' },
    });

    if (brokers.length === 0) {
      console.warn('[Scanner] DataBroker table empty — auto-seeding from bundled list...');
      const { BROKERS } = await import('../data/brokers');
      for (const b of BROKERS) {
        try {
          const exists = await prisma.dataBroker.findFirst({ where: { website: b.website }, select: { id: true } });
          if (!exists) {
            await prisma.dataBroker.create({
              data: {
                name: b.name,
                website: b.website,
                category: b.category as string,
                optOutMethod: b.optOutMethod as string,
                optOutUrl: b.optOutUrl ?? null,
                optOutEmail: b.optOutEmail ?? null,
                scanUrlTemplate: b.scanUrlTemplate ?? null,
                difficulty: b.difficulty as string,
                avgRemovalDays: b.avgRemovalDays,
                priority: b.priority,
                isActive: true,
              },
            });
          }
        } catch (seedErr) {
          console.error('[Scanner] Auto-seed failed for', b.name, seedErr);
        }
      }
      brokers = await prisma.dataBroker.findMany({ where: { isActive: true }, orderBy: { priority: 'asc' } });
      console.log(`[Scanner] Auto-seeded ${brokers.length} brokers`);
    }

    if (brokers.length === 0) {
      await prisma.scanJob.update({
        where: { id: scanJobId },
        data: { status: 'completed', completedAt: new Date() },
      });
      console.warn('[Scanner] No active brokers after seeding — scan complete with 0 results');
      return;
    }

    await prisma.scanJob.update({
      where: { id: scanJobId },
      data: { totalBrokers: brokers.length },
    });

    let found = 0;
    let scanned = 0;

    // Check one broker and persist its record. Returns true if a listing was found.
    const processBroker = async (broker: (typeof brokers)[number]): Promise<boolean> => {
      try {
        const existing = await prisma.brokerRecord.findUnique({
          where: { userId_brokerId: { userId, brokerId: broker.id } },
        });

        const isFound = await checkBrokerForUser(broker, profile);

        if (existing) {
          await prisma.brokerRecord.update({
            where: { id: existing.id },
            data: { status: isFound ? 'found' : 'not_found', lastChecked: new Date() },
          });
          if (isFound && existing.status !== 'removal_requested' && existing.status !== 'removed') {
            void runOptOutJob(userId, broker.id, existing.id);
            return true;
          }
        } else {
          const newRecord = await prisma.brokerRecord.create({
            data: {
              userId,
              brokerId: broker.id,
              status: isFound ? 'found' : 'not_found',
              lastChecked: new Date(),
            },
          });
          if (isFound) {
            void runOptOutJob(userId, broker.id, newRecord.id);
            return true;
          }
        }
        return false;
      } catch (err) {
        console.error(`[Scanner] Error on broker ${broker.name}:`, err);
        return false;
      }
    };

    // Process brokers in small concurrent batches so the scan finishes quickly
    // and the progress counter advances steadily.
    for (let i = 0; i < brokers.length; i += SCAN_CONCURRENCY) {
      const batch = brokers.slice(i, i + SCAN_CONCURRENCY);
      const results = await Promise.all(batch.map(processBroker));
      found += results.filter(Boolean).length;
      scanned += batch.length;

      await prisma.scanJob
        .update({ where: { id: scanJobId }, data: { scanned, found } })
        .catch((e) => console.error('[Scanner] progress update failed:', e));

      // Brief stagger between batches to stay under broker rate limits.
      if (i + SCAN_CONCURRENCY < brokers.length) await sleep(300);
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
