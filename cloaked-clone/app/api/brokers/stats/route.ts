// ============================================================
// Shielded Privacy App — Broker Stats API
// GET /api/brokers/stats → summary stats for dashboard
// ============================================================
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const [records, totalActiveBrokers] = await Promise.all([
      prisma.brokerRecord.findMany({
        where: { userId: session.id },
        include: {
          broker: { select: { category: true, name: true } },
        },
      }),
      prisma.dataBroker.count({ where: { isActive: true } }),
    ]);

    // Aggregate by status
    let totalFound = 0;
    let totalPending = 0;
    let totalRemoved = 0;
    let totalScanning = 0;

    const byCategory: Record<
      string,
      { found: number; pending: number; removed: number; total: number }
    > = {};

    for (const record of records) {
      const cat = record.broker.category;
      if (!byCategory[cat]) {
        byCategory[cat] = { found: 0, pending: 0, removed: 0, total: 0 };
      }
      byCategory[cat].total++;

      switch (record.status) {
        case 'found':
          totalFound++;
          byCategory[cat].found++;
          break;
        case 'removal_requested':
        case 'opt_out_requested':
        case 'opt_out_in_progress':
          totalPending++;
          byCategory[cat].pending++;
          break;
        case 'removed':
          totalRemoved++;
          byCategory[cat].removed++;
          break;
        case 'scanning':
          totalScanning++;
          break;
      }
    }

    const byCategoryArray = Object.entries(byCategory).map(([category, counts]) => ({
      category,
      ...counts,
    }));

    return successResponse({
      total_found: totalFound,
      removal_requested: totalPending,
      removed: totalRemoved,
      scanning: totalScanning,
      total_brokers_monitored: totalActiveBrokers,
      scanned_so_far: records.length,
      by_category: byCategoryArray,
    });
  } catch (err) {
    console.error('[Broker Stats GET]', err);
    return errorResponse('Failed to fetch broker stats', 500);
  }
}
