// ============================================================
// Shielded Privacy App — Subscription Status API
// GET /api/subscription → current subscription details
// ============================================================
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { PLANS, getPlanLimits } from '@/lib/stripe';
import { getAuthenticatedUser, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        planId: true,
        subscriptionId: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        stripeCustomerId: true,
        _count: {
          select: { virtualPhones: true, emailAliases: true },
        },
      },
    });

    if (!user) return errorResponse('User not found', 404);

    const limits = getPlanLimits(user.planId);

    let stripeSubscription = null;
    if (user.subscriptionId) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(user.subscriptionId, {
          expand: ['default_payment_method', 'latest_invoice'],
        });
      } catch (stripeErr) {
        console.warn('[Subscription GET] Failed to fetch Stripe subscription:', stripeErr);
      }
    }

    const currentPlan = user.planId ? PLANS[user.planId as keyof typeof PLANS] ?? null : null;

    return successResponse({
      planId: user.planId,
      planName: currentPlan?.name ?? 'Free',
      subscriptionStatus: user.subscriptionStatus,
      trialEndsAt: user.trialEndsAt,
      limits,
      usage: {
        virtualPhones: user._count.virtualPhones,
        emailAliases: user._count.emailAliases,
      },
      stripe: stripeSubscription
        ? {
            id: stripeSubscription.id,
            status: stripeSubscription.status,
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            cancelAt: stripeSubscription.cancel_at
              ? new Date(stripeSubscription.cancel_at * 1000)
              : null,
          }
        : null,
    });
  } catch (err) {
    console.error('[Subscription GET]', err);
    return errorResponse('Failed to fetch subscription', 500);
  }
}
