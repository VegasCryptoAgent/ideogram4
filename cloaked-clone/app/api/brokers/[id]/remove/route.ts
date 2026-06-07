// ============================================================
// Shielded Privacy App — Broker Removal Request API
// POST /api/brokers/[id]/remove → request removal from broker
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { optOutQueue } from '@/lib/queues';
import { createNotification } from '@/services/notification-service';
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

    // Update record status
    const updated = await prisma.brokerRecord.update({
      where: { id: record.id },
      data: {
        status: 'removal_requested',
        requestedAt: new Date(),
      },
      include: { broker: { select: { name: true, website: true, category: true } } },
    });

    // Queue opt-out job
    await optOutQueue.add(
      'opt-out',
      { userId: session.id, brokerId, recordId: record.id },
      { jobId: `opt-out-${session.id}-${brokerId}`, priority: 1 }
    );

    // Create in-app notification
    await createNotification(
      session.id,
      'record_found',
      `Removal requested from ${broker.name}`,
      `We've submitted a removal request to ${broker.name}. This typically takes ${broker.avgRemovalDays} days.`,
      { brokerId, brokerName: broker.name, recordId: record.id }
    );

    return successResponse({
      record: updated,
      message: `Removal request submitted to ${broker.name}. Estimated completion: ${broker.avgRemovalDays} days.`,
    });
  } catch (err) {
    console.error('[Broker Remove POST]', err);
    return errorResponse('Failed to submit removal request', 500);
  }
}
