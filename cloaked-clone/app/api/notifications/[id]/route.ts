// ============================================================
// Shielded Privacy App — Single Notification API
// PATCH /api/notifications/[id] → mark notification as read
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, successResponse, errorResponse } from '@/lib/api-helpers';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  const { id } = await params;

  try {
    // Verify ownership before marking read
    const notification = await prisma.notification.findFirst({
      where: { id, userId: session.id },
    });

    if (!notification) return errorResponse('Notification not found', 404);

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return successResponse(updated);
  } catch (err) {
    console.error('[Notification PATCH]', err);
    return errorResponse('Failed to update notification', 500);
  }
}
