// ============================================================
// Shielded Privacy App — Virtual Phone Detail/Settings API
// GET    /api/phone/[id] → get phone with call log
// PATCH  /api/phone/[id] → update settings
// DELETE /api/phone/[id] → release number
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { releaseVirtualNumber } from '@/services/phone-service';
import {
  getAuthenticatedUser,
  successResponse,
  errorResponse,
  handleZodError,
} from '@/lib/api-helpers';

const updatePhoneSchema = z.object({
  label: z.string().max(100).optional(),
  forwardTo: z
    .string()
    .regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number format')
    .optional()
    .nullable(),
  isActive: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

// ── GET /api/phone/[id] ───────────────────────────────────────

export async function GET(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  const { id } = await params;

  try {
    const phone = await prisma.virtualPhone.findFirst({
      where: { id, userId: session.id },
      include: {
        callLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: { select: { callLogs: true } },
      },
    });

    if (!phone) return errorResponse('Virtual phone number not found', 404);

    return successResponse(phone);
  } catch (err) {
    console.error('[Phone Detail GET]', err);
    return errorResponse('Failed to fetch phone details', 500);
  }
}

// ── PATCH /api/phone/[id] ─────────────────────────────────────

export async function PATCH(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  const { id } = await params;

  try {
    const existing = await prisma.virtualPhone.findFirst({
      where: { id, userId: session.id },
    });
    if (!existing) return errorResponse('Virtual phone number not found', 404);

    const body = await req.json();
    const parsed = updatePhoneSchema.safeParse(body);
    if (!parsed.success) return handleZodError(parsed.error);

    const updated = await prisma.virtualPhone.update({
      where: { id },
      data: {
        ...(parsed.data.label !== undefined && { label: parsed.data.label }),
        ...(parsed.data.forwardTo !== undefined && { forwardTo: parsed.data.forwardTo }),
        ...(parsed.data.isActive !== undefined && { isActive: parsed.data.isActive }),
        updatedAt: new Date(),
      },
    });

    return successResponse(updated);
  } catch (err) {
    console.error('[Phone PATCH]', err);
    return errorResponse('Failed to update phone settings', 500);
  }
}

// ── DELETE /api/phone/[id] ────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  const { id } = await params;

  try {
    const existing = await prisma.virtualPhone.findFirst({
      where: { id, userId: session.id },
    });
    if (!existing) return errorResponse('Virtual phone number not found', 404);

    await releaseVirtualNumber(id);

    return successResponse({ message: `Virtual number ${existing.number} released successfully` });
  } catch (err) {
    console.error('[Phone DELETE]', err);
    const message = err instanceof Error ? err.message : 'Failed to release phone number';
    return errorResponse(message, 500);
  }
}
