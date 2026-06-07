// ============================================================
// Shielded Privacy App — Email Alias Detail API
// GET    /api/email-aliases/[id] → get alias details
// PATCH  /api/email-aliases/[id] → update alias
// DELETE /api/email-aliases/[id] → delete alias
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { deleteEmailAlias } from '@/services/email-alias-service';
import {
  getAuthenticatedUser,
  successResponse,
  errorResponse,
  handleZodError,
} from '@/lib/api-helpers';

const updateAliasSchema = z.object({
  label: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
  forwardTo: z.string().email('Invalid email address').optional(),
});

type Params = { params: Promise<{ id: string }> };

// ── GET /api/email-aliases/[id] ───────────────────────────────

export async function GET(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  const { id } = await params;

  try {
    const alias = await prisma.emailAlias.findFirst({
      where: { id, userId: session.id },
    });

    if (!alias) return errorResponse('Email alias not found', 404);

    return successResponse(alias);
  } catch (err) {
    console.error('[EmailAlias Detail GET]', err);
    return errorResponse('Failed to fetch alias', 500);
  }
}

// ── PATCH /api/email-aliases/[id] ────────────────────────────

export async function PATCH(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  const { id } = await params;

  try {
    const existing = await prisma.emailAlias.findFirst({
      where: { id, userId: session.id },
    });
    if (!existing) return errorResponse('Email alias not found', 404);

    const body = await req.json();
    const parsed = updateAliasSchema.safeParse(body);
    if (!parsed.success) return handleZodError(parsed.error);

    const updated = await prisma.emailAlias.update({
      where: { id },
      data: {
        ...(parsed.data.label !== undefined && { label: parsed.data.label }),
        ...(parsed.data.isActive !== undefined && { isActive: parsed.data.isActive }),
        ...(parsed.data.forwardTo !== undefined && { forwardTo: parsed.data.forwardTo }),
        updatedAt: new Date(),
      },
    });

    return successResponse(updated);
  } catch (err) {
    console.error('[EmailAlias PATCH]', err);
    return errorResponse('Failed to update email alias', 500);
  }
}

// ── DELETE /api/email-aliases/[id] ───────────────────────────

export async function DELETE(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  const { id } = await params;

  try {
    const existing = await prisma.emailAlias.findFirst({
      where: { id, userId: session.id },
    });
    if (!existing) return errorResponse('Email alias not found', 404);

    await deleteEmailAlias(id);

    return successResponse({ message: `Alias ${existing.alias} deleted` });
  } catch (err) {
    console.error('[EmailAlias DELETE]', err);
    return errorResponse('Failed to delete email alias', 500);
  }
}
