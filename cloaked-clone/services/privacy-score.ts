// ============================================================
// Shielded Privacy App — Privacy Score Calculator Service
// ============================================================
// Re-exports from the lib version and adds service-layer helpers.

import type { BrokerRecord } from '@prisma/client';

export type PrivacyScoreCategory = 'Exposed' | 'At Risk' | 'Protected' | 'Shielded';

export type CategoryBreakdown = {
  category: string;
  found: number;
  removed: number;
  pending: number;
};

export type PrivacyScoreResult = {
  score: number;
  category: PrivacyScoreCategory;
  breakdown: CategoryBreakdown[];
  recommendations: string[];
  stats: {
    totalFound: number;
    totalRemoved: number;
    totalPending: number;
    totalScanning: number;
  };
};

type BrokerRecordWithBroker = BrokerRecord & {
  broker: { category: string; name: string };
};

function getCategory(score: number): PrivacyScoreCategory {
  if (score <= 40) return 'Exposed';
  if (score <= 70) return 'At Risk';
  if (score <= 90) return 'Protected';
  return 'Shielded';
}

function buildRecommendations(
  score: number,
  stats: PrivacyScoreResult['stats'],
  hasBreaches: boolean
): string[] {
  const recs: string[] = [];

  if (stats.totalFound > 0 && stats.totalPending === 0) {
    recs.push('Request removal from all data brokers where your data was found.');
  }
  if (stats.totalPending > 0) {
    recs.push(`${stats.totalPending} removal request(s) are in progress — check back soon.`);
  }
  if (hasBreaches) {
    recs.push('Your email was found in data breaches. Consider changing passwords and enabling 2FA.');
  }
  if (score < 70) {
    recs.push('Set up a virtual phone number to reduce exposure of your real number.');
    recs.push('Use email aliases for online sign-ups to limit spam and data harvesting.');
  }
  if (score >= 71 && score <= 90) {
    recs.push('Enable spam call filtering for your virtual phone numbers.');
    recs.push('Run a new scan to catch any newly added broker listings.');
  }
  if (score >= 91) {
    recs.push('Your privacy is well protected. Schedule regular scans to stay ahead of new data broker listings.');
  }

  return recs;
}

/**
 * Calculate a privacy score from 0–100 based on broker records.
 *
 * Score formula:
 *   Start at 100
 *   - Each "found" record (no removal): -2 points
 *   - Each "removal_requested" / "opt_out_*": -1 point
 *   - Each "removed": 0 (no deduction)
 *   - Has breach alerts: -10 points
 *
 * Category:
 *   0–40    → Exposed
 *   41–70   → At Risk
 *   71–90   → Protected
 *   91–100  → Shielded
 */
export function calculatePrivacyScore(
  brokerRecords: BrokerRecordWithBroker[],
  hasBreachAlerts = false
): PrivacyScoreResult {
  let score = 100;

  const categoryMap = new Map<string, CategoryBreakdown>();

  let totalFound = 0;
  let totalRemoved = 0;
  let totalPending = 0;
  let totalScanning = 0;

  for (const record of brokerRecords) {
    const cat = record.broker.category;
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, { category: cat, found: 0, removed: 0, pending: 0 });
    }
    const catData = categoryMap.get(cat)!;

    switch (record.status) {
      case 'found':
        score -= 2;
        totalFound++;
        catData.found++;
        break;
      case 'removal_requested':
      case 'opt_out_requested':
      case 'opt_out_in_progress':
        score -= 1;
        totalPending++;
        catData.pending++;
        break;
      case 'removed':
        totalRemoved++;
        catData.removed++;
        break;
      case 'scanning':
        totalScanning++;
        break;
      default:
        break;
    }
  }

  if (hasBreachAlerts) {
    score -= 10;
  }

  score = Math.max(0, Math.min(100, score));

  const breakdown = Array.from(categoryMap.values()).sort(
    (a, b) => b.found + b.pending - (a.found + a.pending)
  );

  const stats = { totalFound, totalRemoved, totalPending, totalScanning };
  const category = getCategory(score);
  const recommendations = buildRecommendations(score, stats, hasBreachAlerts);

  return { score, category, breakdown, recommendations, stats };
}
