// ============================================================
// Shielded Privacy App — Create Stripe Checkout Session
// POST /api/subscription/create → returns checkout URL
//
// Uses inline price_data so no STRIPE_PRICE_* env vars needed.
// planId is stored in subscription metadata; the webhook reads it
// from there (no price-ID lookup required).
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { stripe, PLANS } from '@/lib/stripe';
import {
  getAuthenticatedUser,
  successResponse,
  errorResponse,
  handleZodError,
} from '@/lib/api-helpers';

const createSchema = z.object({
  planId: z.enum(['starter', 'pro', 'ultimate']),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return handleZodError(parsed.error);

    const { planId } = parsed.data;
    const plan = PLANS[planId];

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { email: true, stripeCustomerId: true, subscriptionId: true, planId: true },
    });

    if (!user) return errorResponse('User not found', 404);

    if (user.planId === planId && user.subscriptionId) {
      return errorResponse('You are already subscribed to this plan', 409);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ideogram4-production.up.railway.app';

    // Ensure Stripe customer exists
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: session.id },
      });
      customerId = customer.id;

      await prisma.user.update({
        where: { id: session.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Build line item using inline price_data — no STRIPE_PRICE_* env var needed
    const unitAmount = Math.round(plan.monthlyPrice * 100); // cents

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Shield ${plan.name} Plan`,
              description: plan.description,
            },
            unit_amount: unitAmount,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard/settings?tab=billing&success=true&plan=${planId}`,
      cancel_url: `${appUrl}/dashboard/settings?tab=billing&canceled=true`,
      subscription_data: {
        trial_period_days: 14,
        metadata: { userId: session.id, planId },
      },
      metadata: { userId: session.id, planId },
      allow_promotion_codes: true,
    });

    return successResponse({ url: checkoutSession.url });
  } catch (err) {
    console.error('[Subscription Create POST]', err);
    return errorResponse('Failed to create checkout session', 500);
  }
}
