// ============================================================
// Resend Inbound Email Webhook
// POST /api/webhooks/resend-inbound
//
// Resend routes inbound emails matching your domain's MX records
// to this endpoint. Each request contains the parsed email.
//
// Setup required (one-time, in Resend dashboard):
//   1. Add your domain (e.g. shield.app) under "Domains"
//   2. Set MX records: 10 inbound.resend.com
//   3. Under "Inbound" → add route: catch-all (*) → this webhook URL
//   4. Set EMAIL_ALIAS_DOMAIN env var to your domain
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { processInboundEmail } from '@/services/email-alias-service';

export const dynamic = 'force-dynamic';

interface ResendInboundPayload {
  to: string[];
  from: string;
  subject: string;
  html?: string;
  text?: string;
  headers?: Record<string, string>;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: ResendInboundPayload = await req.json();

    const to = body.to?.[0];
    const from = body.from ?? '';
    const subject = body.subject ?? '(no subject)';
    // Prefer text; fall back to stripping basic HTML tags
    const textBody =
      body.text ??
      (body.html ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    if (!to) {
      return NextResponse.json({ error: 'Missing to address' }, { status: 400 });
    }

    // Process against all alias addresses in the To header
    // (Resend may include multiple recipients)
    const recipients = body.to ?? [];
    await Promise.all(
      recipients.map((alias) => processInboundEmail(alias, from, subject, textBody)),
    );

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[Resend Inbound] Error processing email:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
