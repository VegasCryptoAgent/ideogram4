// ============================================================
// Shielded Privacy App — Subscription Sync
// POST /api/subscription/sync
//
// Pulls the latest subscription state from Stripe and updates
// the database. Called client-side after checkout redirect so
// the UI reflects payment before the webhook fires.
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
      select: { stripeCustomerId: true, subscriptionId: true },
    });

    if (!user) return errorResponse('User not found', 404);
    if (!user.stripeCustomerId) return successResponse({ synced: false, reason: 'no_customer' });

    // Find the latest active or trialing subscription for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      limit: 5,
      expand: ['data.items.data.price'],
    });

    const active = subscriptions.data.find((s) =>
      ['active', 'trialing', 'past_due'].includes(s.status)
    );

    if (!active) {
      // No active subscription — keep DB as-is to avoid wiping a just-paid sub
      return successResponse({ synced: false, reason: 'no_active_subscription' });
    }

    // Read planId from metadata (set at checkout) or fall back to price nickname
    const planId =
      active.metadata?.planId ??
      active.items.data[0]?.price?.nickname?.toLowerCase() ??
      null;

    await prisma.user.update({
      where: { id: session.id },
      data: {
        subscriptionId: active.id,
        subscriptionStatus: active.status,
        planId: planId ?? undefined,
        trialEndsAt: active.trial_end ? new Date(active.trial_end * 1000) : null,
      },
    });

    return successResponse({ synced: true, planId, status: active.status });
  } catch (err) {
    console.error('[Subscription Sync POST]', err);
    return errorResponse('Failed to sync subscription', 500);
  }
}
