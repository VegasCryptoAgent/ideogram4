// ============================================================
// Shielded Privacy App — User Profile API
// GET /api/user/profile    → fetch profile
// PATCH /api/user/profile  → update profile
// DELETE /api/user/profile → delete account
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import {
  getAuthenticatedUser,
  successResponse,
  errorResponse,
  handleZodError,
} from '@/lib/api-helpers';

// ── Validation Schema ──────────────────────────────────────────

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  middleName: z.string().max(100).optional().nullable(),
  dateOfBirth: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)), 'Invalid date')
    .optional()
    .nullable(),
  realPhones: z.array(z.string().min(7).max(20)).optional(),
});

// ── GET /api/user/profile ─────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        middleName: true,
        dateOfBirth: true,
        image: true,
        realPhones: true,
        privacyScore: true,
        lastScanAt: true,
        onboardingDone: true,
        stripeCustomerId: true,
        subscriptionId: true,
        subscriptionStatus: true,
        planId: true,
        trialEndsAt: true,
        createdAt: true,
        updatedAt: true,
        addresses: true,
        spamSettings: true,
        _count: {
          select: {
            virtualPhones: true,
            emailAliases: true,
            brokerRecords: true,
            notifications: { where: { isRead: false } },
            breachAlerts: { where: { isRead: false } },
          },
        },
      },
    });

    if (!user) return errorResponse('User not found', 404);

    return successResponse(user);
  } catch (err) {
    console.error('[Profile GET]', err);
    return errorResponse('Failed to fetch profile', 500);
  }
}

// ── PATCH /api/user/profile ───────────────────────────────────

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) return handleZodError(parsed.error);

    const { firstName, lastName, middleName, dateOfBirth, realPhones } = parsed.data;

    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(middleName !== undefined && { middleName }),
        ...(dateOfBirth !== undefined && {
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        }),
        ...(realPhones !== undefined && { realPhones }),
        // Keep name in sync
        ...(firstName !== undefined || lastName !== undefined
          ? {
              name: [firstName ?? session.name?.split(' ')[0], lastName ?? session.name?.split(' ')[1]]
                .filter(Boolean)
                .join(' ') || null,
            }
          : {}),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        middleName: true,
        dateOfBirth: true,
        realPhones: true,
        updatedAt: true,
      },
    });

    return successResponse(updatedUser);
  } catch (err) {
    console.error('[Profile PATCH]', err);
    return errorResponse('Failed to update profile', 500);
  }
}

// ── DELETE /api/user/profile ──────────────────────────────────

export async function DELETE(): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: { virtualPhones: { where: { twilioSid: { not: null } } } },
    });

    if (!user) return errorResponse('User not found', 404);

    // 1. Cancel Stripe subscription
    if (user.subscriptionId) {
      try {
        await stripe.subscriptions.cancel(user.subscriptionId);
      } catch (stripeErr) {
        console.error('[Profile DELETE] Stripe cancellation failed:', stripeErr);
      }
    }

    // 2. Release Twilio virtual numbers
    if (user.virtualPhones.length > 0) {
      const { twilioClient } = await import('@/lib/twilio');
      for (const phone of user.virtualPhones) {
        if (phone.twilioSid) {
          try {
            await twilioClient.incomingPhoneNumbers(phone.twilioSid).remove();
          } catch (twilioErr) {
            console.error(`[Profile DELETE] Failed to release Twilio number ${phone.number}:`, twilioErr);
          }
        }
      }
    }

    // 3. Delete user (cascades to all related data via Prisma onDelete: Cascade)
    await prisma.user.delete({ where: { id: session.id } });

    return successResponse({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('[Profile DELETE]', err);
    return errorResponse('Failed to delete account', 500);
  }
}
