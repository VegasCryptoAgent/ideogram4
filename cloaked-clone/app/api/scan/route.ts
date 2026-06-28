// ============================================================
// Shielded Privacy App — Scan Trigger/Status API
// POST /api/scan → trigger new scan
// GET  /api/scan → get latest scan status
// GET  /api/scan?all=true → get scan history (last 10 jobs)
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { unstable_after as after } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runScanJob } from '@/lib/scan-processor';
import { getPlanLimits } from '@/lib/stripe';
import { getAuthenticatedUser, successResponse, errorResponse } from '@/lib/api-helpers';
import { differenceInDays } from 'date-fns';

// ── POST /api/scan ────────────────────────────────────────────

export async function POST(_req: NextRequest): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { planId: true, lastScanAt: true },
    });

    if (!user) return errorResponse('User not found', 404);

    const limits = getPlanLimits(user.planId);

    // Check scan frequency limit
    if (user.lastScanAt) {
      const daysSinceLastScan = differenceInDays(new Date(), user.lastScanAt);
      if (daysSinceLastScan < limits.scanIntervalDays) {
        const daysUntilNext = limits.scanIntervalDays - daysSinceLastScan;
        return errorResponse(
          `You can run a new scan in ${daysUntilNext} day${daysUntilNext !== 1 ? 's' : ''}. Upgrade your plan for more frequent scans.`,
          429
        );
      }
    }

    // Check for a pending/running scan
    const activeScan = await prisma.scanJob.findFirst({
      where: { userId: session.id, status: { in: ['pending', 'running'] } },
      orderBy: { createdAt: 'desc' },
    });

    if (activeScan) {
      // Auto-clear jobs that have been stuck for more than 15 minutes
      const staleMs = 15 * 60 * 1000;
      const isStale = Date.now() - activeScan.createdAt.getTime() > staleMs;
      if (!isStale) {
        return errorResponse('A scan is already in progress. Please wait for it to complete.', 409);
      }
      await prisma.scanJob.update({
        where: { id: activeScan.id },
        data: { status: 'failed', completedAt: new Date() },
      });
    }

    // Create scan job
    const scanJob = await prisma.scanJob.create({
      data: { userId: session.id, status: 'pending' },
    });

    // Process the scan AFTER the response is sent. `after()` is the supported
    // Next.js mechanism that GUARANTEES the callback runs once the response
    // flushes — unlike a bare `void promise`, whose execution context Next can
    // tear down, leaving the job stuck at "pending" forever.
    after(async () => {
      try {
        await runScanJob(session.id, scanJob.id);
      } catch (err) {
        console.error('[Scan after()] runScanJob threw:', err);
        await prisma.scanJob
          .update({ where: { id: scanJob.id }, data: { status: 'failed', completedAt: new Date() } })
          .catch(() => {});
      }
    });

    return successResponse({
      jobId: scanJob.id,
      status: 'pending',
      message: 'Scan started. Results will appear as brokers are checked.',
    });
  } catch (err) {
    console.error('[Scan POST]', err);
    return errorResponse('Failed to start scan', 500);
  }
}

// ── GET /api/scan ─────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  const { searchParams } = new URL(req.url);
  const all = searchParams.get('all') === 'true';

  try {
    if (all) {
      const jobs = await prisma.scanJob.findMany({
        where: { userId: session.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      return successResponse({ jobs });
    }

    const latestJob = await prisma.scanJob.findFirst({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestJob) {
      return successResponse({ job: null, message: 'No scans have been run yet.' });
    }

    const progressPercent =
      latestJob.totalBrokers > 0
        ? Math.round((latestJob.scanned / latestJob.totalBrokers) * 100)
        : 0;

    return successResponse({ job: { ...latestJob, progressPercent } });
  } catch (err) {
    console.error('[Scan GET]', err);
    return errorResponse('Failed to fetch scan status', 500);
  }
}
