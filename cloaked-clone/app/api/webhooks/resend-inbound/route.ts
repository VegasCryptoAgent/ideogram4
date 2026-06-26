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
import { createHmac, timingSafeEqual } from 'crypto';
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

/**
 * Verify the Svix signature Resend attaches to webhook deliveries. Without
 * this, anyone could POST a forged "inbound email" and inject spoofed mail
 * into any user's alias inbox (and have it forwarded to their real address).
 *
 * Resend/Svix scheme: signed content = `${id}.${timestamp}.${rawBody}`,
 * HMAC-SHA256 keyed by the base64-decoded secret (after the `whsec_` prefix),
 * base64-encoded, matched against any `v1,<sig>` entry in the svix-signature
 * header. Fails closed in production when the secret is unset; allowed in dev.
 */
function verifyResendSignature(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Resend Inbound] RESEND_WEBHOOK_SECRET not set — rejecting in production');
      return false;
    }
    console.warn('[Resend Inbound] RESEND_WEBHOOK_SECRET not set — skipping verification (development only)');
    return true;
  }

  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');
  if (!svixId || !svixTimestamp || !svixSignature) return false;

  try {
    const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
    const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
    const expected = createHmac('sha256', key).update(signedContent).digest();

    // Header is a space-separated list of `version,signature` pairs.
    return svixSignature.split(' ').some((part) => {
      const sig = part.split(',')[1];
      if (!sig) return false;
      const provided = Buffer.from(sig, 'base64');
      return provided.length === expected.length && timingSafeEqual(provided, expected);
    });
  } catch (err) {
    console.error('[Resend Inbound] Signature verification error:', err);
    return false;
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const rawBody = await req.text();

    if (!verifyResendSignature(req, rawBody)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body: ResendInboundPayload = JSON.parse(rawBody);

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
