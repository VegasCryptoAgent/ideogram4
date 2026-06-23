import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  })

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ data: [] })
  }

  try {
    const stripe = getStripe()
    const cards = await stripe.issuing.cards.list({
      limit: 10,
    })

    return NextResponse.json({
      data: cards.data
        .filter((c) => c.metadata?.userId === session.user!.id)
        .map((card) => ({
          id: card.id,
          last4: card.last4,
          expMonth: card.exp_month,
          expYear: card.exp_year,
          status: card.status,
          type: card.type,
          nickname: card.metadata?.nickname ?? null,
          spendingLimit: card.spending_controls?.spending_limits?.[0]?.amount ?? null,
          frozen: card.status === 'inactive',
        })),
    })
  } catch (err: any) {
    if (
      err.code === 'more_permissions_required' ||
      err.type === 'StripePermissionError'
    ) {
      return NextResponse.json({
        data: [],
        message: 'Stripe Issuing requires account approval. Visit dashboard.stripe.com to apply.',
      })
    }
    console.error('[Cards GET]', err)
    return NextResponse.json({ data: [], error: err.message })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { nickname, spendingLimit } = body

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true, name: true, email: true },
  })

  try {
    const stripe = getStripe()

    // Create or reuse a cardholder
    let cardholderId = user?.stripeCustomerId ?? ''

    const card = await stripe.issuing.cards.create({
      cardholder: cardholderId,
      currency: 'usd',
      type: 'virtual',
      ...(spendingLimit
        ? {
            spending_controls: {
              spending_limits: [
                { amount: Math.round(spendingLimit * 100), interval: 'monthly' },
              ],
            },
          }
        : {}),
      metadata: {
        userId: session.user.id,
        nickname: nickname ?? '',
      },
    })

    return NextResponse.json({ data: card }, { status: 201 })
  } catch (err: any) {
    console.error('[Cards POST]', err)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { cardId, frozen } = body

  try {
    const stripe = getStripe()
    const card = await stripe.issuing.cards.update(cardId, {
      status: frozen ? 'inactive' : 'active',
    })
    return NextResponse.json({ data: card })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
