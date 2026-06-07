// ============================================================
// Shielded Privacy App — Virtual Phone API
// GET  /api/phone → list virtual numbers
// POST /api/phone → purchase new virtual number
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getPlanLimits } from '@/lib/stripe';
import { purchaseVirtualNumber } from '@/services/phone-service';
import {
  getAuthenticatedUser,
  successResponse,
  createdResponse,
  errorResponse,
  handleZodError,
} from '@/lib/api-helpers';

const createPhoneSchema = z.object({
  areaCode: z.string().length(3, 'Area code must be 3 digits').regex(/^\d{3}$/).default('415'),
  label: z.string().max(100).optional().default(''),
  forwardTo: z
    .string()
    .regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number format')
    .optional()
    .default(''),
});

// ── GET /api/phone ────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const phones = await prisma.virtualPhone.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { callLogs: true } },
      },
    });

    return successResponse(phones);
  } catch (err) {
    console.error('[Phone GET]', err);
    return errorResponse('Failed to fetch virtual phone numbers', 500);
  }
}

// ── POST /api/phone ───────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { planId: true, email: true },
    });
    if (!user) return errorResponse('User not found', 404);

    const limits = getPlanLimits(user.planId);

    // Check plan limits
    const currentCount = await prisma.virtualPhone.count({
      where: { userId: session.id },
    });

    if (currentCount >= limits.virtualPhones) {
      return errorResponse(
        `Your plan allows up to ${limits.virtualPhones} virtual phone number${limits.virtualPhones !== 1 ? 's' : ''}. Please upgrade to add more.`,
        403
      );
    }

    const body = await req.json();
    const parsed = createPhoneSchema.safeParse(body);
    if (!parsed.success) return handleZodError(parsed.error);

    const { areaCode, label, forwardTo } = parsed.data;

    const virtualPhone = await purchaseVirtualNumber(
      session.id,
      areaCode,
      label,
      forwardTo
    );

    return createdResponse(virtualPhone);
  } catch (err) {
    console.error('[Phone POST]', err);
    const message = err instanceof Error ? err.message : 'Failed to purchase phone number';
    return errorResponse(message, 500);
  }
}
