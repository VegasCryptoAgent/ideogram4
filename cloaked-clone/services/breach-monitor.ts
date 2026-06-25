// ============================================================
// Shielded Privacy App — Data Breach Monitor (HIBP)
// ============================================================
import { prisma } from '@/lib/prisma';
import { createNotification, sendEmailNotification } from './notification-service';

// ── Types ──────────────────────────────────────────────────────

export interface HIBPBreach {
  Name: string;
  Title: string;
  Domain: string;
  BreachDate: string;
  AddedDate: string;
  ModifiedDate: string;
  PwnCount: number;
  Description: string;
  LogoPath: string;
  DataClasses: string[];
  IsVerified: boolean;
  IsFabricated: boolean;
  IsSensitive: boolean;
  IsRetired: boolean;
  IsSpamList: boolean;
  IsMalware: boolean;
}

export interface BreachInfo {
  name: string;
  title: string;
  domain: string;
  breachDate: Date | null;
  pwnCount: number;
  description: string;
  dataClasses: string[];
  isSensitive: boolean;
  logoUrl: string;
}

export interface BreachAlert {
  id: string;
  userId: string;
  breachName: string;
  breachDate: Date | null;
  dataExposed: string[];
  isRead: boolean;
  sourceUrl: string | null;
  createdAt: Date;
}

// ── HIBP API Client ────────────────────────────────────────────

const HIBP_BASE_URL = 'https://haveibeenpwned.com/api/v3';

async function hibpRequest<T>(path: string): Promise<T | null> {
  const apiKey = process.env.HIBP_API_KEY;
  if (!apiKey) {
    console.warn('[BreachMonitor] HIBP_API_KEY not configured — skipping breach check');
    return null;
  }

  try {
    const response = await fetch(`${HIBP_BASE_URL}${path}`, {
      headers: {
        'hibp-api-key': apiKey,
        'User-Agent': 'Shielded-Privacy-App/1.0',
        Accept: 'application/json',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (response.status === 404) {
      return null; // No breaches found (404 = "not found in HIBP")
    }

    if (response.status === 429) {
      console.warn('[BreachMonitor] HIBP rate limit hit. Backing off.');
      await new Promise((r) => setTimeout(r, 2000));
      return null;
    }

    if (!response.ok) {
      console.error(`[BreachMonitor] HIBP API error: ${response.status} ${response.statusText}`);
      return null;
    }

    return response.json() as Promise<T>;
  } catch (err) {
    console.error('[BreachMonitor] HIBP request failed:', err);
    return null;
  }
}

// ── Core Functions ─────────────────────────────────────────────

/**
 * Check an email address against the HIBP database and create breach alerts.
 * Returns an array of newly discovered breach alerts.
 */
export async function checkEmailForBreaches(
  email: string,
  userId: string
): Promise<BreachAlert[]> {
  const newAlerts: BreachAlert[] = [];

  const breaches = await hibpRequest<HIBPBreach[]>(
    `/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`
  );

  if (!breaches || breaches.length === 0) {
    console.log(`[BreachMonitor] No breaches found for ${email}`);
    return newAlerts;
  }

  for (const breach of breaches) {
    // Skip non-verified or fabricated breaches
    if (breach.IsFabricated || !breach.IsVerified) continue;

    // Check if we've already alerted for this breach
    const existing = await prisma.breachAlert.findFirst({
      where: { userId, breachName: breach.Name },
    });

    if (existing) continue;

    const breachDate = breach.BreachDate ? new Date(breach.BreachDate) : null;
    const sourceUrl = breach.Domain
      ? `https://haveibeenpwned.com/account/${encodeURIComponent(email)}`
      : null;

    const alert = await prisma.breachAlert.create({
      data: {
        userId,
        breachName: breach.Name,
        breachDate,
        dataExposed: breach.DataClasses,
        isRead: false,
        sourceUrl,
        pwnCount: breach.PwnCount ?? null,
        domain: breach.Domain || null,
      },
    });

    newAlerts.push(alert as BreachAlert);

    // Create in-app notification
    await createNotification(
      userId,
      'breach_detected',
      `Data breach: ${breach.Title}`,
      `Your email was found in the ${breach.Title} data breach. ${breach.DataClasses.length} types of data were exposed.`,
      {
        breachName: breach.Name,
        breachTitle: breach.Title,
        dataExposed: breach.DataClasses,
        breachDate: breachDate?.toISOString(),
      }
    );

    // Send email notification
    await sendEmailNotification(userId, 'breach_detected', {
      breachName: breach.Title,
      dataExposed: breach.DataClasses,
      breachDate: breachDate?.toISOString(),
    });
  }

  return newAlerts;
}

/**
 * Get detailed information about a specific breach by name.
 */
export async function getBreachDetails(breachName: string): Promise<BreachInfo | null> {
  const breach = await hibpRequest<HIBPBreach>(`/breach/${encodeURIComponent(breachName)}`);

  if (!breach) return null;

  return {
    name: breach.Name,
    title: breach.Title,
    domain: breach.Domain,
    breachDate: breach.BreachDate ? new Date(breach.BreachDate) : null,
    pwnCount: breach.PwnCount,
    description: breach.Description,
    dataClasses: breach.DataClasses,
    isSensitive: breach.IsSensitive,
    logoUrl: breach.LogoPath,
  };
}

/**
 * Process newly discovered breaches and notify users.
 * Called when HIBP reports new breaches (via webhook or polling).
 */
export async function processNewBreaches(
  userId: string,
  newBreaches: HIBPBreach[]
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user) return;

  for (const breach of newBreaches) {
    if (breach.IsFabricated || !breach.IsVerified) continue;

    const existing = await prisma.breachAlert.findFirst({
      where: { userId, breachName: breach.Name },
    });

    if (existing) continue;

    const breachDate = breach.BreachDate ? new Date(breach.BreachDate) : null;

    await prisma.breachAlert.create({
      data: {
        userId,
        breachName: breach.Name,
        breachDate,
        dataExposed: breach.DataClasses,
        isRead: false,
        sourceUrl: `https://haveibeenpwned.com/account/${encodeURIComponent(user.email)}`,
        pwnCount: breach.PwnCount ?? null,
        domain: breach.Domain || null,
      },
    });

    await createNotification(
      userId,
      'breach_detected',
      `New breach alert: ${breach.Title}`,
      `Your email was found in the ${breach.Title} data breach exposing ${breach.DataClasses.join(', ')}.`,
      { breachName: breach.Name, dataExposed: breach.DataClasses }
    );

    await sendEmailNotification(userId, 'breach_detected', {
      breachName: breach.Title,
      dataExposed: breach.DataClasses,
      breachDate: breachDate?.toISOString(),
    });
  }
}
