// ============================================================
// Shielded Privacy App — Subscription Sync Cron
// GET /api/cron/sync-subscriptions
//
// Called periodically (e.g., hourly) to pull latest Stripe
// subscription state for users whose status may have changed.
// This is a safety net for missed webhooks.
// ============================================================
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only sync users that have a Stripe customer ID but may have stale status
  const users = await prisma.user.findMany({
    where: {
      stripeCustomerId: { not: null },
      OR: [
        { subscriptionStatus: { in: ['active', 'trialing', 'past_due'] } },
        { subscriptionId: { not: null } },
      ],
    },
    select: { id: true, stripeCustomerId: true, subscriptionId: true, planId: true },
    take: 50, // process at most 50 per cron run to stay within Stripe rate limits
  })

  let synced = 0

  for (const user of users) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId!,
        limit: 3,
        expand: ['data.items.data.price'],
      })

      const active = subscriptions.data.find((s) =>
        ['active', 'trialing', 'past_due'].includes(s.status)
      )

      if (active) {
        const planId = active.metadata?.planId ?? user.planId ?? null
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionId: active.id,
            subscriptionStatus: active.status,
            planId: planId ?? undefined,
            trialEndsAt: active.trial_end ? new Date(active.trial_end * 1000) : null,
          },
        })
      } else if (user.subscriptionId) {
        // Subscription no longer active — downgrade
        await prisma.user.update({
          where: { id: user.id },
          data: { subscriptionStatus: 'canceled', planId: null, subscriptionId: null, trialEndsAt: null },
        })
      }
      synced++
    } catch (err) {
      console.warn(`[Subscription Sync Cron] Failed for user ${user.id}:`, err)
    }
  }

  return NextResponse.json({ synced, total: users.length })
}
