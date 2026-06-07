// ============================================================
// Shielded Privacy App — Stripe Customer Portal
// POST /api/subscription/portal → returns portal URL
// ============================================================
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { getAuthenticatedUser, successResponse, errorResponse } from '@/lib/api-helpers';

export async function POST(): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { stripeCustomerId: true },
    });

    if (!user) return errorResponse('User not found', 404);

    if (!user.stripeCustomerId) {
      return errorResponse(
        'No billing account found. Please subscribe to a plan first.',
        400
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://shielded.app';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appUrl}/dashboard/subscription`,
    });

    return successResponse({ url: portalSession.url });
  } catch (err) {
    console.error('[Subscription Portal POST]', err);
    return errorResponse('Failed to create billing portal session', 500);
  }
}
