// ============================================================
// Shielded Privacy App — Broker Detail API
// GET /api/brokers/[id] → get specific broker record details
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, successResponse, errorResponse } from '@/lib/api-helpers';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  const { id } = await params;

  try {
    const broker = await prisma.dataBroker.findUnique({ where: { id } });
    if (!broker) return errorResponse('Broker not found', 404);

    const record = await prisma.brokerRecord.findUnique({
      where: { userId_brokerId: { userId: session.id, brokerId: id } },
    });

    return successResponse({
      broker: {
        id: broker.id,
        name: broker.name,
        website: broker.website,
        logoUrl: broker.logoUrl,
        category: broker.category,
        optOutUrl: broker.optOutUrl,
        optOutMethod: broker.optOutMethod,
        optOutEmail: broker.optOutEmail,
        difficulty: broker.difficulty,
        avgRemovalDays: broker.avgRemovalDays,
        priority: broker.priority,
      },
      record: record
        ? {
            id: record.id,
            status: record.status,
            foundUrl: record.foundUrl,
            foundData: record.foundData,
            requestedAt: record.requestedAt,
            removedAt: record.removedAt,
            lastChecked: record.lastChecked,
            createdAt: record.createdAt,
          }
        : null,
    });
  } catch (err) {
    console.error('[Broker Detail GET]', err);
    return errorResponse('Failed to fetch broker details', 500);
  }
}
