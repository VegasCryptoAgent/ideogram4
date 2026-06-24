// ============================================================
// Shield — Privacy.com Webhook Handler
// POST /api/webhooks/privacy-com
//
// Events handled:
//   transaction.created  → store transaction, update card spent total
//   transaction.updated  → update transaction status (settled/voided)
//   card.updated         → sync card state (paused/closed)
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ── Signature verification ────────────────────────────────────

function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.PRIVACY_COM_WEBHOOK_SECRET;
  if (!secret) return true; // skip in dev if secret not set

  if (!signatureHeader) return false;

  const expected = createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('hex');

  try {
    return timingSafeEqual(
      Buffer.from(signatureHeader.replace(/^sha256=/, ''), 'hex'),
      Buffer.from(expected, 'hex'),
    );
  } catch {
    return false;
  }
}

// ── Event handlers ────────────────────────────────────────────

async function handleTransactionCreated(tx: any) {
  // Look up which user owns this card
  const dbCard = await prisma.virtualCard.findFirst({
    where: { token: tx.card_token },
    select: { id: true, userId: true },
  });
  if (!dbCard) return;

  // Upsert the transaction record
  await prisma.cardTransaction.upsert({
    where: { privacyToken: tx.token },
    update: {
      amount: tx.amount ?? 0,
      status: tx.result ?? 'APPROVED',
      settledAt: tx.settled_amount != null ? new Date() : null,
    },
    create: {
      privacyToken: tx.token,
      virtualCardId: dbCard.id,
      userId: dbCard.userId,
      merchant: tx.merchant?.descriptor ?? 'Unknown',
      merchantCity: tx.merchant?.city ?? null,
      amount: tx.amount ?? 0,
      currency: tx.currency ?? 'USD',
      status: tx.result ?? 'APPROVED',
      settledAt: null,
    },
  });
}

async function handleTransactionUpdated(tx: any) {
  await prisma.cardTransaction.updateMany({
    where: { privacyToken: tx.token },
    data: {
      amount: tx.amount ?? undefined,
      status: tx.result ?? undefined,
      settledAt: tx.status === 'SETTLED' ? new Date() : undefined,
    },
  });
}

async function handleCardUpdated(card: any) {
  // If Privacy.com closes a card externally, remove it from our DB too
  if (card.state === 'CLOSED') {
    await prisma.virtualCard.deleteMany({ where: { token: card.token } });
  }
}

// ── Route handler ─────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text();
  const signature = req.headers.get('x-privacy-hmac-sha256');

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: { event_type: string; card?: any; transaction?: any };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    switch (event.event_type) {
      case 'transaction.created':
        await handleTransactionCreated(event.transaction);
        break;
      case 'transaction.updated':
        await handleTransactionUpdated(event.transaction);
        break;
      case 'card.updated':
        await handleCardUpdated(event.card);
        break;
      default:
        // Unhandled event — acknowledge receipt
        break;
    }
  } catch (err) {
    console.error('[Privacy.com webhook]', event.event_type, err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
