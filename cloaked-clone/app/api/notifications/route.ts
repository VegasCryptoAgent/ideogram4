// ============================================================
// Shielded Privacy App — Notifications API
// GET  /api/notifications         → list notifications (paginated)
// POST /api/notifications/read-all is handled via path routing
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { markAllAsRead } from '@/services/notification-service';
import {
  getAuthenticatedUser,
  successResponse,
  errorResponse,
  getPaginationParams,
} from '@/lib/api-helpers';

// ── GET /api/notifications ────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  const { page, limit, skip } = getPaginationParams(req);

  const url = new URL(req.url);
  const onlyUnread = url.searchParams.get('unread') === 'true';
  const typeFilter = url.searchParams.get('type');

  try {
    const where: Record<string, unknown> = { userId: session.id };
    if (onlyUnread) where.isRead = false;
    if (typeFilter) where.type = typeFilter;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId: session.id, isRead: false } }),
    ]);

    return successResponse({
      items: notifications,
      total,
      unreadCount,
      page,
      pageSize: limit,
      hasMore: skip + limit < total,
    });
  } catch (err) {
    console.error('[Notifications GET]', err);
    return errorResponse('Failed to fetch notifications', 500);
  }
}

// ── POST /api/notifications (mark all as read) ────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  const url = new URL(req.url);
  // Handle /api/notifications?action=read-all
  if (url.searchParams.get('action') !== 'read-all') {
    return errorResponse('Invalid action', 400);
  }

  try {
    await markAllAsRead(session.id);
    return successResponse({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('[Notifications POST read-all]', err);
    return errorResponse('Failed to mark notifications as read', 500);
  }
}
