// ============================================================
// Shielded Privacy App — Brokers List API
// GET /api/brokers → list brokers with user's record status
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getAuthenticatedUser,
  successResponse,
  errorResponse,
  getPaginationParams,
} from '@/lib/api-helpers';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  const url = new URL(req.url);
  const statusFilter = url.searchParams.get('status') || 'all';
  const categoryFilter = url.searchParams.get('category') || '';
  const search = url.searchParams.get('search') || '';
  const { page, limit, skip } = getPaginationParams(req);

  try {
    // Build broker filter
    const brokerWhere: Record<string, unknown> = { isActive: true };
    if (categoryFilter) brokerWhere.category = categoryFilter;
    if (search) {
      brokerWhere.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { website: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get all matching brokers with user's record
    const [brokers, totalBrokers] = await Promise.all([
      prisma.dataBroker.findMany({
        where: brokerWhere,
        orderBy: [{ priority: 'asc' }, { name: 'asc' }],
        skip,
        take: limit,
        include: {
          records: {
            where: { userId: session.id },
            select: {
              id: true,
              status: true,
              foundUrl: true,
              requestedAt: true,
              removedAt: true,
              lastChecked: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.dataBroker.count({ where: brokerWhere }),
    ]);

    // Map brokers to include user record info
    const brokersWithStatus = brokers.map((broker) => {
      const record = broker.records[0] ?? null;
      return {
        id: broker.id,
        name: broker.name,
        website: broker.website,
        logoUrl: broker.logoUrl,
        category: broker.category,
        optOutMethod: broker.optOutMethod,
        difficulty: broker.difficulty,
        avgRemovalDays: broker.avgRemovalDays,
        priority: broker.priority,
        record: record
          ? {
              id: record.id,
              status: record.status,
              foundUrl: record.foundUrl,
              requestedAt: record.requestedAt,
              removedAt: record.removedAt,
              lastChecked: record.lastChecked,
            }
          : null,
        userStatus: record?.status ?? 'not_scanned',
      };
    });

    // Apply status filter (client-side after broker join)
    const filtered =
      statusFilter === 'all'
        ? brokersWithStatus
        : brokersWithStatus.filter((b) => {
            switch (statusFilter) {
              case 'found':
                return b.userStatus === 'found';
              case 'pending':
                return ['removal_requested', 'opt_out_requested', 'opt_out_in_progress'].includes(
                  b.userStatus
                );
              case 'removed':
                return b.userStatus === 'removed';
              case 'not_found':
                return b.userStatus === 'not_found';
              default:
                return true;
            }
          });

    // Summary stats
    const allUserRecords = await prisma.brokerRecord.groupBy({
      by: ['status'],
      where: { userId: session.id },
      _count: { status: true },
    });

    const stats = allUserRecords.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = row._count.status;
      return acc;
    }, {});

    return successResponse({
      items: filtered,
      total: totalBrokers,
      page,
      pageSize: limit,
      hasMore: skip + limit < totalBrokers,
      stats: {
        found: stats['found'] ?? 0,
        removal_requested:
          (stats['removal_requested'] ?? 0) +
          (stats['opt_out_requested'] ?? 0) +
          (stats['opt_out_in_progress'] ?? 0),
        removed: stats['removed'] ?? 0,
        scanning: stats['scanning'] ?? 0,
        not_found: stats['not_found'] ?? 0,
      },
    });
  } catch (err) {
    console.error('[Brokers GET]', err);
    return errorResponse('Failed to fetch brokers', 500);
  }
}
