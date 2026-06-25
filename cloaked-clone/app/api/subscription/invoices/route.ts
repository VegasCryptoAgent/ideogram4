// ============================================================
// Shielded Privacy App — Billing Invoices API
// GET /api/subscription/invoices → real Stripe invoice history
// ============================================================
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { getAuthenticatedUser, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { stripeCustomerId: true },
    });

    // No Stripe customer yet → genuinely empty history (not fabricated)
    if (!user?.stripeCustomerId) {
      return successResponse({ invoices: [] });
    }

    const list = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit: 24,
    });

    const invoices = list.data
      // Only surface invoices that represent a real billing event
      .filter((inv) => inv.total !== 0 || inv.amount_paid !== 0)
      .map((inv) => ({
        id: inv.id,
        date: new Date((inv.status_transitions?.paid_at ?? inv.created) * 1000).toLocaleDateString(
          'en-US',
          { month: 'short', day: 'numeric', year: 'numeric' },
        ),
        description:
          inv.lines?.data?.[0]?.description ??
          (inv.number ? `Invoice ${inv.number}` : 'Shield subscription'),
        amount: `$${(inv.amount_paid / 100).toFixed(2)}`,
        status: inv.status === 'paid' ? 'Paid' : (inv.status ?? 'open').replace(/^\w/, (c) => c.toUpperCase()),
        invoicePdf: inv.invoice_pdf ?? null,
        hostedUrl: inv.hosted_invoice_url ?? null,
      }));

    return successResponse({ invoices });
  } catch (err) {
    console.error('[Invoices GET]', err);
    return errorResponse('Failed to fetch invoices', 500);
  }
}
