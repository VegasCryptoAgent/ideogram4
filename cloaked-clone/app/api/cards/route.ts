import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  listCards,
  createCard,
  updateCard,
  getCard,
  type PrivacyCard,
} from '@/lib/privacy-com'

const CARD_TYPE_MAP: Record<string, PrivacyCard['type']> = {
  'merchant-locked': 'MERCHANT_LOCKED',
  'single-use': 'SINGLE_USE',
  'multi-use': 'UNLOCKED',
}

function formatCard(pc: PrivacyCard, color: string) {
  return {
    id: pc.token,
    lastFour: pc.last_four,
    nickname: pc.memo ?? '',
    type: pc.type === 'MERCHANT_LOCKED'
      ? 'merchant-locked'
      : pc.type === 'SINGLE_USE'
        ? 'single-use'
        : 'multi-use',
    state: pc.state,
    frozen: pc.state === 'PAUSED',
    spendLimit: pc.spend_limit,
    spendLimitDuration: pc.spend_limit_duration,
    hostname: pc.hostname ?? null,
    expMonth: pc.exp_month,
    expYear: pc.exp_year,
    color,
    pan: pc.pan,
    cvv: pc.cvv,
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!process.env.PRIVACY_COM_API_KEY) {
    return NextResponse.json({
      data: [],
      message: 'Privacy.com API key not configured. Add PRIVACY_COM_API_KEY to your environment.',
    })
  }

  try {
    const dbCards = await prisma.virtualCard.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    if (dbCards.length === 0) return NextResponse.json({ data: [] })

    const [results, txRows] = await Promise.all([
      Promise.allSettled(dbCards.map((db) => getCard(db.token))),
      prisma.cardTransaction.findMany({
        where: { virtualCardId: { in: dbCards.map((d) => d.id) } },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    const txByCard: Record<string, typeof txRows> = {}
    for (const tx of txRows) {
      ;(txByCard[tx.virtualCardId] ??= []).push(tx)
    }

    const data = results
      .map((r, i) => {
        if (r.status !== 'fulfilled') return null
        const db = dbCards[i]
        const txs = txByCard[db.id] ?? []
        const spent = txs.filter((t) => t.status === 'APPROVED' || t.status === 'SETTLING' || t.status === 'SETTLED').reduce((s, t) => s + t.amount, 0)
        return {
          ...formatCard(r.value, db.color),
          spent: spent / 100,
          transactions: txs.slice(0, 20).map((t) => ({
            id: t.id,
            merchant: t.merchant,
            amount: t.amount / 100,
            date: new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: (t.status === 'APPROVED' || t.status === 'SETTLING' || t.status === 'SETTLED') ? 'approved' : 'blocked',
          })),
        }
      })
      .filter(Boolean)

    return NextResponse.json({ data })
  } catch (err: any) {
    console.error('[Cards GET]', err)
    return NextResponse.json({ data: [], error: err.message })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!process.env.PRIVACY_COM_API_KEY) {
    return NextResponse.json(
      { error: 'Privacy.com API key not configured.' },
      { status: 503 },
    )
  }

  const body = await req.json().catch(() => ({}))
  const {
    nickname = 'New Card',
    type = 'multi-use',
    spendLimit,
    hostname,
    color = 'blue',
  } = body

  const privacyType = CARD_TYPE_MAP[type] ?? 'UNLOCKED'

  try {
    const card = await createCard({
      memo: nickname,
      type: privacyType,
      ...(spendLimit ? { spend_limit: Math.round(spendLimit * 100), spend_limit_duration: 'MONTHLY' } : {}),
      ...(hostname && privacyType === 'MERCHANT_LOCKED' ? { hostname } : {}),
    })

    await prisma.virtualCard.create({
      data: {
        userId: session.user.id,
        token: card.token,
        color,
      },
    })

    return NextResponse.json({ data: formatCard(card, color) }, { status: 201 })
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

  const dbCard = await prisma.virtualCard.findFirst({
    where: { token: cardId, userId: session.user.id },
  })
  if (!dbCard) return NextResponse.json({ error: 'Card not found' }, { status: 404 })

  try {
    const card = await updateCard(cardId, { state: frozen ? 'PAUSED' : 'OPEN' })
    return NextResponse.json({ data: formatCard(card, dbCard.color) })
  } catch (err: any) {
    console.error('[Cards PATCH]', err)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
