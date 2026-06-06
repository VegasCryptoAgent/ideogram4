// ============================================================
// Shielded Privacy App — User Addresses API
// GET  /api/user/addresses → list addresses
// POST /api/user/addresses → add address
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  getAuthenticatedUser,
  successResponse,
  createdResponse,
  errorResponse,
  handleZodError,
} from '@/lib/api-helpers';

const addressSchema = z.object({
  street: z.string().max(200).optional(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  zip: z.string().max(20).optional(),
  country: z.string().max(2).default('US'),
  isPrimary: z.boolean().default(false),
});

// ── GET /api/user/addresses ───────────────────────────────────

export async function GET(): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const addresses = await prisma.userAddress.findMany({
      where: { userId: session.id },
      orderBy: [{ isPrimary: 'desc' }, { id: 'asc' }],
    });

    return successResponse(addresses);
  } catch (err) {
    console.error('[Addresses GET]', err);
    return errorResponse('Failed to fetch addresses', 500);
  }
}

// ── POST /api/user/addresses ──────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const body = await req.json();
    const parsed = addressSchema.safeParse(body);
    if (!parsed.success) return handleZodError(parsed.error);

    const { street, city, state, zip, country, isPrimary } = parsed.data;

    // If setting as primary, unset existing primary
    if (isPrimary) {
      await prisma.userAddress.updateMany({
        where: { userId: session.id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const address = await prisma.userAddress.create({
      data: {
        userId: session.id,
        street: street ?? null,
        city,
        state,
        zip: zip ?? null,
        country,
        isPrimary,
      },
    });

    return createdResponse(address);
  } catch (err) {
    console.error('[Addresses POST]', err);
    return errorResponse('Failed to add address', 500);
  }
}
