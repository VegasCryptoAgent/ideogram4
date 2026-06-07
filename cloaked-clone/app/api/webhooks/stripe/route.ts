// ============================================================
// Shielded Privacy App — Stripe Webhook Handler
// POST /api/webhooks/stripe
//
// Events handled:
//   customer.subscription.created  → update user subscription status
//   customer.subscription.updated  → update plan / status
//   customer.subscription.deleted  → downgrade to free
//   invoice.paid                   → send confirmation email
//   invoice.payment_failed         → send alert email
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { sendEmailNotification, createNotification } from '@/services/notification-service';

// Required config for raw body parsing in Next.js 15 App Router
export const dynamic = 'force-dynamic';

// ── Helpers ────────────────────────────────────────────────────

async function getUserByCustomerId(customerId: string) {
  return prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true, email: true, planId: true },
  });
}

/**
 * Extract planId from a Stripe subscription's metadata or price ID.
 */
async function getPlanIdFromSubscription(
  subscription: Stripe.Subscription
): Promise<string | null> {
  // Prefer metadata
  if (subscription.metadata?.planId) {
    return subscription.metadata.planId;
  }

  // Fall back to matching price IDs
  const priceId = subscription.items.data[0]?.price.id;
  if (!priceId) return null;

  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return 'starter';
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro';
  if (priceId === process.env.STRIPE_ULTIMATE_PRICE_ID) return 'ultimate';

  return null;
}

// ── Event Handlers ─────────────────────────────────────────────

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const user = await getUserByCustomerId(customerId);
  if (!user) {
    console.warn('[Stripe Webhook] No user found for customer:', customerId);
    return;
  }

  const planId = await getPlanIdFromSubscription(subscription);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      planId: planId ?? user.planId,
      trialEndsAt: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    },
  });

  console.log(`[Stripe Webhook] Subscription created for user ${user.id}: plan=${planId}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const user = await getUserByCustomerId(customerId);
  if (!user) return;

  const planId = await getPlanIdFromSubscription(subscription);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      planId: planId ?? user.planId,
      trialEndsAt: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    },
  });

  console.log(`[Stripe Webhook] Subscription updated for user ${user.id}: status=${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const user = await getUserByCustomerId(customerId);
  if (!user) return;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionId: null,
      subscriptionStatus: 'canceled',
      planId: null, // Downgrade to free
      trialEndsAt: null,
    },
  });

  await createNotification(
    user.id,
    'subscription_expiring',
    'Subscription canceled',
    'Your Shielded subscription has ended. Your privacy protection has been reduced. Resubscribe to continue full monitoring.',
    { subscriptionId: subscription.id }
  );

  console.log(`[Stripe Webhook] Subscription deleted for user ${user.id} — downgraded to free`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const user = await getUserByCustomerId(customerId);
  if (!user) return;

  const amountPaid = invoice.amount_paid / 100; // Convert from cents

  await createNotification(
    user.id,
    'subscription_renewed',
    'Payment successful',
    `Your Shielded subscription payment of $${amountPaid.toFixed(2)} was successful.`,
    { amount: amountPaid, invoiceId: invoice.id }
  );

  await sendEmailNotification(user.id, 'subscription_renewed', {
    planName: user.planId ?? 'Shielded',
    amount: amountPaid.toFixed(2),
    invoiceId: invoice.id,
  });

  console.log(`[Stripe Webhook] Invoice paid for user ${user.id}: $${amountPaid}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const user = await getUserByCustomerId(customerId);
  if (!user) return;

  await createNotification(
    user.id,
    'subscription_expiring',
    'Payment failed',
    'We could not process your subscription payment. Please update your payment method to keep your privacy protection active.',
    { invoiceId: invoice.id, attemptCount: invoice.attempt_count }
  );

  await sendEmailNotification(user.id, 'subscription_expiring', {
    attemptCount: invoice.attempt_count,
    nextPaymentAttempt: invoice.next_payment_attempt
      ? new Date(invoice.next_payment_attempt * 1000).toISOString()
      : null,
  });

  // Update subscription status to past_due
  await prisma.user.update({
    where: { id: user.id },
    data: { subscriptionStatus: 'past_due' },
  });

  console.log(`[Stripe Webhook] Payment failed for user ${user.id}`);
}

// ── Main Route Handler ─────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured');
    return new NextResponse('Webhook secret not configured', { status: 500 });
  }

  const rawBody = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return new NextResponse('Missing stripe-signature header', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err);
    return new NextResponse(`Webhook signature verification failed`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`[Stripe Webhook] Handler error for ${event.type}:`, err);
    return new NextResponse('Webhook handler error', { status: 500 });
  }
}
