// ============================================================
// Shielded Privacy App — Email Alias API
// GET  /api/email-aliases → list aliases
// POST /api/email-aliases → create alias
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getPlanLimits } from '@/lib/stripe';
import { createEmailAlias } from '@/services/email-alias-service';
import {
  getAuthenticatedUser,
  successResponse,
  createdResponse,
  errorResponse,
  handleZodError,
} from '@/lib/api-helpers';

const createAliasSchema = z.object({
  label: z.string().max(100).optional().default(''),
  forwardTo: z.string().email('Invalid email address').optional().default(''),
});

// ── GET /api/email-aliases ────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const aliases = await prisma.emailAlias.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(aliases);
  } catch (err) {
    console.error('[EmailAlias GET]', err);
    return errorResponse('Failed to fetch email aliases', 500);
  }
}

// ── POST /api/email-aliases ───────────────────────────────────

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

    const currentCount = await prisma.emailAlias.count({
      where: { userId: session.id },
    });

    if (currentCount >= limits.emailAliases) {
      return errorResponse(
        `Your plan allows up to ${limits.emailAliases} email alias${limits.emailAliases !== 1 ? 'es' : ''}. Please upgrade to add more.`,
        403
      );
    }

    const body = await req.json();
    const parsed = createAliasSchema.safeParse(body);
    if (!parsed.success) return handleZodError(parsed.error);

    const { label, forwardTo } = parsed.data;

    const alias = await createEmailAlias(session.id, label, forwardTo || user.email);

    return createdResponse(alias);
  } catch (err) {
    console.error('[EmailAlias POST]', err);
    const message = err instanceof Error ? err.message : 'Failed to create email alias';
    return errorResponse(message, 500);
  }
}
