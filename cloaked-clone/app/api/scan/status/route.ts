/**
 * GET /api/scan/status
 *
 * Returns the current (or most recent) scan job status for the authenticated
 * user in a shape optimised for real-time polling by the UI.
 *
 * Query params:
 *   jobId   (optional) — if omitted, returns the most recently created job.
 *
 * Response shape:
 * {
 *   success: true,
 *   data: {
 *     jobId:            string,
 *     status:           "pending" | "running" | "completed" | "failed",
 *     progressPercent:  number (0-100),
 *     currentBroker:    string | null,
 *     scanned:          number,
 *     found:            number,
 *     total:            number,
 *   } | null
 * }
 *
 * Returns data: null when the user has never run a scan.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await getAuthenticatedUser(req);
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');

    // Resolve the target job.
    const job = jobId
      ? await prisma.scanJob.findFirst({
          where: { id: jobId, userId: session.id },
        })
      : await prisma.scanJob.findFirst({
          where: { userId: session.id },
          orderBy: { createdAt: 'desc' },
        });

    if (!job) {
      return successResponse({ data: null });
    }

    // Calculate progress percentage.
    let progressPercent = 0;
    if (job.status === 'completed') {
      progressPercent = 100;
    } else if (job.totalBrokers > 0) {
      progressPercent = Math.min(
        99, // never show 100% until confirmed complete
        Math.round((job.scanned / job.totalBrokers) * 100),
      );
    }

    // currentBroker is not tracked in the DB (scan runs inline, no queue).
    const currentBroker: string | null = null;

    const payload = {
      jobId: job.id,
      status: job.status as 'pending' | 'running' | 'completed' | 'failed',
      progressPercent,
      currentBroker,
      scanned: job.scanned,
      found: job.found,
      total: job.totalBrokers,
    };

    return successResponse(payload);
  } catch (err) {
    console.error('[GET /api/scan/status]', err);
    return errorResponse('Failed to retrieve scan status', 500);
  }
}
