// ============================================================
// Shielded Privacy App — Broker Removal Request API
// POST /api/brokers/[id]/remove → request removal from broker
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runOptOutJob } from '@/lib/optout-processor';
import { getAuthenticatedUser, successResponse, errorResponse } from '@/lib/api-helpers';

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  const { id: brokerId } = await params;

  try {
    const broker = await prisma.dataBroker.findUnique({ where: { id: brokerId } });
    if (!broker) return errorResponse('Broker not found', 404);

    let record = await prisma.brokerRecord.findUnique({
      where: { userId_brokerId: { userId: session.id, brokerId } },
    });

    // Allow requesting removal even if record doesn't exist (manual request)
    if (!record) {
      record = await prisma.brokerRecord.create({
        data: {
          userId: session.id,
          brokerId,
          status: 'found',
          lastChecked: new Date(),
        },
      });
    }

    // Don't allow duplicate removal requests
    const terminalStatuses = ['removal_requested', 'opt_out_requested', 'opt_out_in_progress', 'removed'];
    if (terminalStatuses.includes(record.status)) {
      return errorResponse(
        `A removal request has already been submitted (status: ${record.status})`,
        409
      );
    }

    // Fire the opt-out inline (fire-and-forget). runOptOutJob performs the real
    // opt-out (email / broker API), then transitions the record to
    // 'removal_requested' and creates the confirmation notification itself.
    // No BullMQ worker runs on Railway's single-process deployment, so we must
    // NOT enqueue — we run it directly.
    void runOptOutJob(session.id, brokerId, record.id);

    // Return an optimistic record so the UI updates immediately while the
    // opt-out completes in the background.
    const updated = await prisma.brokerRecord.findUnique({
      where: { id: record.id },
      include: { broker: { select: { name: true, website: true, category: true } } },
    });

    return successResponse({
      record: { ...updated, status: 'removal_requested', requestedAt: new Date() },
      message: `Removal request submitted to ${broker.name}. Estimated completion: ${broker.avgRemovalDays} days.`,
    });
  } catch (err) {
    console.error('[Broker Remove POST]', err);
    return errorResponse('Failed to submit removal request', 500);
  }
}
