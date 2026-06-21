import Stripe from "stripe";
import type { Plan, PlanId } from "./types";

// --------------- Stripe client singleton (lazy) ---------------

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error(
        "Missing STRIPE_SECRET_KEY environment variable."
      );
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
      maxNetworkRetries: 2,
    });
  }
  return _stripe;
}

// Keep a named export for backwards compat with webhooks route
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// --------------- Plan definitions ---------------

export const PLANS: Record<PlanId, Plan> = {
  starter: {
    id: "starter",
    name: "Starter",
    monthlyPrice: 4.99,
    annualPrice: 3.99,
    stripePriceId: process.env.STRIPE_PRICE_STARTER ?? "",
    description: "Basic privacy protection for individuals",
    features: [
      "Scan 50+ data broker sites",
      "Automatic opt-out requests",
      "Monthly scans",
      "1 virtual phone number",
      "5 email aliases",
      "Email breach alerts",
      "Privacy score dashboard",
    ],
    limits: {
      virtualPhones: 1,
      emailAliases: 5,
      scanIntervalDays: 30,
      brokerCoverage: 50,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    monthlyPrice: 9.99,
    annualPrice: 7.99,
    stripePriceId: process.env.STRIPE_PRICE_PRO ?? "",
    description: "Comprehensive privacy for the privacy-conscious",
    features: [
      "Scan 150+ data broker sites",
      "Automatic opt-out requests",
      "Weekly scans",
      "3 virtual phone numbers",
      "Spam call blocking",
      "10 email aliases",
      "Email breach monitoring",
      "Priority opt-out processing",
      "Privacy score dashboard",
    ],
    limits: {
      virtualPhones: 3,
      emailAliases: 10,
      scanIntervalDays: 7,
      brokerCoverage: 150,
    },
    highlighted: true,
  },
  ultimate: {
    id: "ultimate",
    name: "Ultimate",
    monthlyPrice: 19.99,
    annualPrice: 15.99,
    stripePriceId: process.env.STRIPE_PRICE_ULTIMATE ?? "",
    description: "Maximum privacy with unlimited protection",
    features: [
      "Scan 200+ data broker sites",
      "Automatic opt-out requests",
      "Daily scans",
      "Unlimited virtual phone numbers",
      "Advanced spam call AI blocking",
      "Unlimited email aliases",
      "Real-time breach monitoring",
      "Express opt-out processing",
      "Family plan (up to 5 members)",
      "Dedicated privacy agent",
      "Priority support",
    ],
    limits: {
      virtualPhones: -1,
      emailAliases: -1,
      scanIntervalDays: 1,
      brokerCoverage: 200,
    },
  },
};

// --------------- Helper functions ---------------

/**
 * Create a Stripe customer.
 */
export async function createCustomer(params: {
  email: string;
  name?: string;
  userId: string;
}): Promise<Stripe.Customer> {
  return stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: { userId: params.userId },
  });
}

/**
 * Create or retrieve a Stripe customer for a user.
 */
export async function createOrRetrieveCustomer(params: {
  userId: string;
  email: string;
  name?: string;
}): Promise<string> {
  const existing = await stripe.customers.search({
    query: `metadata['userId']:'${params.userId}'`,
    limit: 1,
  });

  if (existing.data.length > 0) {
    return existing.data[0].id;
  }

  const customer = await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: { userId: params.userId },
  });

  return customer.id;
}

/**
 * Create a subscription for a customer.
 */
export async function createSubscription(params: {
  customerId: string;
  priceId: string;
  trialDays?: number;
}): Promise<Stripe.Subscription> {
  return stripe.subscriptions.create({
    customer: params.customerId,
    items: [{ price: params.priceId }],
    trial_period_days: params.trialDays,
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
  });
}

/**
 * Cancel a subscription — immediately or at period end.
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediately = false
): Promise<Stripe.Subscription> {
  if (immediately) {
    return stripe.subscriptions.cancel(subscriptionId);
  }
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Get a Stripe billing portal URL for managing subscriptions.
 */
export async function getPortalUrl(params: {
  customerId: string;
  returnUrl: string;
}): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });
  return session.url;
}

/**
 * Create a Stripe checkout session for a subscription.
 */
export async function createCheckoutSession(params: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  trialDays?: number;
}): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create({
    customer: params.customerId,
    payment_method_types: ["card"],
    line_items: [{ price: params.priceId, quantity: 1 }],
    mode: "subscription",
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    subscription_data: params.trialDays
      ? { trial_period_days: params.trialDays }
      : undefined,
    allow_promotion_codes: true,
  });
}

/**
 * Retrieve a subscription with expanded fields.
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["default_payment_method", "items.data.price.product"],
  });
}

/**
 * Construct a Stripe webhook event (for API route handlers).
 */
export function constructWebhookEvent(
  body: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET environment variable");
  }
  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}

/**
 * Map a Stripe price ID back to an internal plan ID.
 */
export function getPlanFromPriceId(priceId: string): PlanId | null {
  for (const [planId, plan] of Object.entries(PLANS)) {
    if (plan.stripePriceId === priceId) {
      return planId as PlanId;
    }
  }
  return null;
}

/**
 * Get plan limits by plan ID, with safe fallback for unauthenticated users.
 */
export function getPlanLimits(planId: string | null | undefined) {
  if (!planId || !(planId in PLANS)) {
    return {
      virtualPhones: 0,
      emailAliases: 0,
      scanIntervalDays: 90,
      brokerCoverage: 0,
    };
  }
  return PLANS[planId as PlanId].limits;
}
