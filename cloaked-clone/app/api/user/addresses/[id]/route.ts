// ============================================================
// Shielded Privacy App — Single Address API
// PATCH  /api/user/addresses/[id] → update address
// DELETE /api/user/addresses/[id] → remove address
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  getAuthenticatedUser,
  successResponse,
  errorResponse,
  handleZodError,
} from '@/lib/api-helpers';

const updateAddressSchema = z.object({
  street: z.string().max(200).optional().nullable(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  zip: z.string().max(20).optional().nullable(),
  country: z.string().max(2).optional(),
  isPrimary: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

// ── PATCH /api/user/addresses/[id] ───────────────────────────

export async function PATCH(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  const { id } = await params;

  try {
    const existing = await prisma.userAddress.findFirst({
      where: { id, userId: session.id },
    });
    if (!existing) return errorResponse('Address not found', 404);

    const body = await req.json();
    const parsed = updateAddressSchema.safeParse(body);
    if (!parsed.success) return handleZodError(parsed.error);

    const { isPrimary, ...rest } = parsed.data;

    // If setting as primary, unset existing
    if (isPrimary) {
      await prisma.userAddress.updateMany({
        where: { userId: session.id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const updated = await prisma.userAddress.update({
      where: { id },
      data: {
        ...rest,
        ...(isPrimary !== undefined && { isPrimary }),
      },
    });

    return successResponse(updated);
  } catch (err) {
    console.error('[Address PATCH]', err);
    return errorResponse('Failed to update address', 500);
  }
}

// ── DELETE /api/user/addresses/[id] ──────────────────────────

export async function DELETE(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  const { id } = await params;

  try {
    const existing = await prisma.userAddress.findFirst({
      where: { id, userId: session.id },
    });
    if (!existing) return errorResponse('Address not found', 404);

    await prisma.userAddress.delete({ where: { id } });

    return successResponse({ message: 'Address deleted' });
  } catch (err) {
    console.error('[Address DELETE]', err);
    return errorResponse('Failed to delete address', 500);
  }
}
