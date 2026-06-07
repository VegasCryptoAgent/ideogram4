// ============================================================
// Shielded Privacy App — Cancel Subscription API
// POST /api/subscription/cancel → cancel at period end
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
      select: { subscriptionId: true, subscriptionStatus: true },
    });

    if (!user) return errorResponse('User not found', 404);

    if (!user.subscriptionId) {
      return errorResponse('No active subscription found', 400);
    }

    if (user.subscriptionStatus === 'canceled') {
      return errorResponse('Subscription is already canceled', 409);
    }

    // Cancel at end of billing period (not immediately)
    const subscription = await stripe.subscriptions.update(user.subscriptionId, {
      cancel_at_period_end: true,
    });

    await prisma.user.update({
      where: { id: session.id },
      data: { subscriptionStatus: 'canceled' },
    });

    return successResponse({
      message: 'Your subscription will be canceled at the end of the billing period.',
      cancelAt: new Date(subscription.current_period_end * 1000),
    });
  } catch (err) {
    console.error('[Subscription Cancel POST]', err);
    return errorResponse('Failed to cancel subscription', 500);
  }
}
