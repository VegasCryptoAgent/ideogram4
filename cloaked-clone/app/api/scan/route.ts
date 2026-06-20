// ============================================================
// Shielded Privacy App — Scan Trigger/Status API
// POST /api/scan → trigger new scan
// GET  /api/scan → get latest scan status
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scannerQueue } from '@/lib/queues';
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
    });

    if (activeScan) {
      return errorResponse('A scan is already in progress. Please wait for it to complete.', 409);
    }

    // Create scan job
    const scanJob = await prisma.scanJob.create({
      data: { userId: session.id, status: 'pending' },
    });

    // Add to BullMQ queue
    await scannerQueue.add(
      'scan',
      { userId: session.id, scanJobId: scanJob.id },
      { jobId: `scan-${session.id}-${scanJob.id}`, priority: 2 }
    );

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

export async function GET(): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
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
