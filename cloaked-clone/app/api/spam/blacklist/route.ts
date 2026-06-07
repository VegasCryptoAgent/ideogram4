// ============================================================
// Shielded Privacy App — Spam Blacklist API
// POST   /api/spam/blacklist → add to blacklist
// DELETE /api/spam/blacklist → remove from blacklist
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

const contactSchema = z.object({
  contact: z.string().min(1, 'Contact is required').max(200),
});

async function getOrCreateSettings(userId: string) {
  return prisma.spamSettings.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      blockUnknownCallers: false,
      blockRobocalls: true,
      spamSensitivity: 'medium',
      whitelist: [],
      blacklist: [],
    },
  });
}

// ── POST /api/spam/blacklist ──────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) return handleZodError(parsed.error);

    const { contact } = parsed.data;
    const settings = await getOrCreateSettings(session.id);

    if (settings.blacklist.includes(contact)) {
      return errorResponse('Contact is already in blacklist', 409);
    }

    if (settings.blacklist.length >= 500) {
      return errorResponse('Blacklist limit reached (500 entries)', 403);
    }

    const updated = await prisma.spamSettings.update({
      where: { userId: session.id },
      data: { blacklist: { push: contact } },
    });

    return successResponse({ blacklist: updated.blacklist });
  } catch (err) {
    console.error('[Blacklist POST]', err);
    return errorResponse('Failed to add to blacklist', 500);
  }
}

// ── DELETE /api/spam/blacklist ────────────────────────────────

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) return handleZodError(parsed.error);

    const { contact } = parsed.data;
    const settings = await getOrCreateSettings(session.id);

    const newBlacklist = settings.blacklist.filter((c) => c !== contact);

    const updated = await prisma.spamSettings.update({
      where: { userId: session.id },
      data: { blacklist: newBlacklist },
    });

    return successResponse({ blacklist: updated.blacklist });
  } catch (err) {
    console.error('[Blacklist DELETE]', err);
    return errorResponse('Failed to remove from blacklist', 500);
  }
}
