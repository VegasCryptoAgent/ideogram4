// ============================================================
// Shielded Privacy App — Scan History API
// GET /api/scan/history → paginated scan history
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

  const { page, limit, skip } = getPaginationParams(req);

  try {
    const [jobs, total] = await Promise.all([
      prisma.scanJob.findMany({
        where: { userId: session.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.scanJob.count({ where: { userId: session.id } }),
    ]);

    const jobsWithProgress = jobs.map((job) => ({
      ...job,
      progressPercent:
        job.totalBrokers > 0
          ? Math.round((job.scanned / job.totalBrokers) * 100)
          : job.status === 'completed'
          ? 100
          : 0,
      durationSeconds:
        job.startedAt && job.completedAt
          ? Math.round((job.completedAt.getTime() - job.startedAt.getTime()) / 1000)
          : null,
    }));

    return successResponse({
      items: jobsWithProgress,
      total,
      page,
      pageSize: limit,
      hasMore: skip + limit < total,
    });
  } catch (err) {
    console.error('[Scan History GET]', err);
    return errorResponse('Failed to fetch scan history', 500);
  }
}
