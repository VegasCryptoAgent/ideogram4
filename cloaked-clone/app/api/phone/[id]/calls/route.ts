// ============================================================
// Shielded Privacy App — Call Log API
// GET /api/phone/[id]/calls → paginated call log for number
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getAuthenticatedUser,
  successResponse,
  errorResponse,
  getPaginationParams,
} from '@/lib/api-helpers';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  const { id: virtualPhoneId } = await params;
  const { page, limit, skip } = getPaginationParams(req);

  try {
    // Verify ownership
    const phone = await prisma.virtualPhone.findFirst({
      where: { id: virtualPhoneId, userId: session.id },
      select: { id: true, number: true },
    });
    if (!phone) return errorResponse('Virtual phone number not found', 404);

    const url = new URL(req.url);
    const isSpamFilter = url.searchParams.get('spam');
    const statusFilter = url.searchParams.get('status');

    const where: Record<string, unknown> = { virtualPhoneId };
    if (isSpamFilter === 'true') where.isSpam = true;
    if (isSpamFilter === 'false') where.isSpam = false;
    if (statusFilter) where.status = statusFilter;

    const [calls, total] = await Promise.all([
      prisma.callLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.callLog.count({ where }),
    ]);

    return successResponse({
      phone: { id: phone.id, number: phone.number },
      items: calls,
      total,
      page,
      pageSize: limit,
      hasMore: skip + limit < total,
    });
  } catch (err) {
    console.error('[Call Log GET]', err);
    return errorResponse('Failed to fetch call log', 500);
  }
}
