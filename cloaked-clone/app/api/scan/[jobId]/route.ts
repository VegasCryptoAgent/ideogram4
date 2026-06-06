// ============================================================
// Shielded Privacy App — Scan Job Detail API
// GET /api/scan/[jobId] → get specific scan job with progress
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, successResponse, errorResponse } from '@/lib/api-helpers';

type Params = { params: Promise<{ jobId: string }> };

export async function GET(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  const { jobId } = await params;

  try {
    const job = await prisma.scanJob.findFirst({
      where: { id: jobId, userId: session.id },
    });

    if (!job) return errorResponse('Scan job not found', 404);

    const progressPercent =
      job.totalBrokers > 0
        ? Math.round((job.scanned / job.totalBrokers) * 100)
        : job.status === 'completed'
        ? 100
        : 0;

    // Compute elapsed / estimated remaining time
    const startedAt = job.startedAt;
    let estimatedRemainingSeconds: number | null = null;

    if (startedAt && job.scanned > 0 && job.totalBrokers > job.scanned) {
      const elapsedMs = Date.now() - startedAt.getTime();
      const msPerBroker = elapsedMs / job.scanned;
      const remaining = job.totalBrokers - job.scanned;
      estimatedRemainingSeconds = Math.round((msPerBroker * remaining) / 1000);
    }

    // Get recent findings for this scan (broker records updated since scan started)
    const recentFindings = job.startedAt
      ? await prisma.brokerRecord.findMany({
          where: {
            userId: session.id,
            status: 'found',
            lastChecked: { gte: job.startedAt },
          },
          include: { broker: { select: { name: true, category: true, website: true } } },
          take: 10,
          orderBy: { lastChecked: 'desc' },
        })
      : [];

    return successResponse({
      job: { ...job, progressPercent, estimatedRemainingSeconds },
      recentFindings,
    });
  } catch (err) {
    console.error('[Scan Job GET]', err);
    return errorResponse('Failed to fetch scan job', 500);
  }
}
