// ============================================================
// Shielded Privacy App — Spam Filter Settings API
// GET   /api/spam/settings → get settings
// PATCH /api/spam/settings → update settings
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

const updateSpamSettingsSchema = z.object({
  blockUnknownCallers: z.boolean().optional(),
  blockRobocalls: z.boolean().optional(),
  spamSensitivity: z.enum(['low', 'medium', 'high']).optional(),
});

// ── GET /api/spam/settings ────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    let settings = await prisma.spamSettings.findUnique({
      where: { userId: session.id },
    });

    // Auto-create defaults if not present
    if (!settings) {
      settings = await prisma.spamSettings.create({
        data: {
          userId: session.id,
          blockUnknownCallers: false,
          blockRobocalls: true,
          spamSensitivity: 'medium',
          whitelist: [],
          blacklist: [],
        },
      });
    }

    return successResponse(settings);
  } catch (err) {
    console.error('[SpamSettings GET]', err);
    return errorResponse('Failed to fetch spam settings', 500);
  }
}

// ── PATCH /api/spam/settings ──────────────────────────────────

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const body = await req.json();
    const parsed = updateSpamSettingsSchema.safeParse(body);
    if (!parsed.success) return handleZodError(parsed.error);

    const updated = await prisma.spamSettings.upsert({
      where: { userId: session.id },
      update: parsed.data,
      create: {
        userId: session.id,
        blockUnknownCallers: false,
        blockRobocalls: true,
        spamSensitivity: 'medium',
        whitelist: [],
        blacklist: [],
        ...parsed.data,
      },
    });

    return successResponse(updated);
  } catch (err) {
    console.error('[SpamSettings PATCH]', err);
    return errorResponse('Failed to update spam settings', 500);
  }
}
