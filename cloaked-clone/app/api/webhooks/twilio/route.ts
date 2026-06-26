// ============================================================
// Shielded Privacy App — Twilio Webhook Handler
// POST /api/webhooks/twilio
//
// Events handled:
//   Incoming voice call → spam check → forward or block
//   Incoming SMS        → log, forward if not spam
//   Call status update  → update call log with duration/status
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { prisma } from '@/lib/prisma';
import { evaluateCallSpam } from '@/services/phone-service';
import { createNotification } from '@/services/notification-service';

// Twilio sends form-encoded POST data
export const dynamic = 'force-dynamic';

// ── Helpers ────────────────────────────────────────────────────

/**
 * Parse a URL-encoded Twilio payload string into a flat object.
 */
function parseFormBody(text: string): Record<string, string> {
  const params = new URLSearchParams(text);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * Verify the request actually came from Twilio using the X-Twilio-Signature
 * header. Without this, anyone could POST forged call/SMS payloads — inflating
 * spam counters and triggering real outbound SMS at the account's expense.
 *
 * Returns true if valid. Fails closed in production when the auth token is
 * missing; allows through in development for local testing.
 */
function verifyTwilioSignature(
  req: NextRequest,
  params: Record<string, string>,
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Twilio Webhook] TWILIO_AUTH_TOKEN not set — rejecting in production');
      return false;
    }
    console.warn('[Twilio Webhook] TWILIO_AUTH_TOKEN not set — skipping verification (development only)');
    return true;
  }

  const signature = req.headers.get('x-twilio-signature');
  if (!signature) return false;

  // Twilio computes the signature over the exact public URL it was configured
  // with. Behind a proxy req.url may show an internal host, so prefer the
  // configured app URL + path.
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  const url = base
    ? `${base}${req.nextUrl.pathname}${req.nextUrl.search}`
    : req.url;

  try {
    return twilio.validateRequest(authToken, signature, url, params);
  } catch (err) {
    console.error('[Twilio Webhook] Signature validation error:', err);
    return false;
  }
}

/**
 * Generate TwiML response XML.
 */
function twiml(xml: string): NextResponse {
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>\n<Response>${xml}</Response>`, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}

// ── Event Handlers ─────────────────────────────────────────────

/**
 * Handle an incoming voice call.
 */
async function handleIncomingCall(payload: Record<string, string>): Promise<NextResponse> {
  const { From: from, To: to, CallSid: callSid } = payload;

  if (!from || !to) {
    return twiml('<Hangup/>');
  }

  // Find the virtual phone for the called number
  const virtualPhone = await prisma.virtualPhone.findUnique({
    where: { number: to },
    include: {
      user: { include: { spamSettings: true } },
    },
  });

  if (!virtualPhone) {
    console.warn(`[Twilio Webhook] No virtual phone found for number: ${to}`);
    return twiml('<Hangup/>');
  }

  if (!virtualPhone.isActive) {
    return twiml('<Reject/>');
  }

  const spamSettings = virtualPhone.user.spamSettings;

  // Evaluate spam
  let isSpam = false;
  let spamScore = 0;

  if (spamSettings) {
    const evaluation = await evaluateCallSpam(from, spamSettings);
    isSpam = evaluation.isSpam;
    spamScore = evaluation.score;
  }

  // Log the call
  await prisma.callLog.create({
    data: {
      virtualPhoneId: virtualPhone.id,
      from,
      to,
      status: isSpam ? 'blocked' : 'ringing',
      isSpam,
      spamScore,
    },
  });

  // Update counters
  await prisma.virtualPhone.update({
    where: { id: virtualPhone.id },
    data: {
      callsReceived: { increment: 1 },
      ...(isSpam && { spamBlocked: { increment: 1 } }),
    },
  });

  if (isSpam) {
    // Create notification for blocked call
    await createNotification(
      virtualPhone.userId,
      'call_blocked',
      'Spam call blocked',
      `A spam call from ${from} was blocked on your Shielded number ${to}.`,
      { from, to, spamScore, callSid }
    );

    return twiml('<Reject reason="busy"/>');
  }

  // Forward the call if a forwarding number is configured
  if (virtualPhone.forwardTo) {
    return twiml(`
      <Dial callerId="${to}" timeout="30">
        <Number>${virtualPhone.forwardTo}</Number>
      </Dial>
    `);
  }

  // No forwarding number — play a message and record voicemail
  return twiml(`
    <Say voice="alice">
      Your call is being handled by Shielded Privacy. The owner of this number is not available.
      Please leave a message after the tone.
    </Say>
    <Record maxLength="120" transcribe="true" transcribeCallback="/api/webhooks/twilio"/>
  `);
}

/**
 * Handle incoming SMS.
 */
async function handleIncomingSms(payload: Record<string, string>): Promise<NextResponse> {
  const { From: from, To: to, Body: body } = payload;

  if (!from || !to) {
    return new NextResponse('OK', { status: 200 });
  }

  const virtualPhone = await prisma.virtualPhone.findUnique({
    where: { number: to },
    include: {
      user: { include: { spamSettings: true } },
    },
  });

  if (!virtualPhone) {
    return new NextResponse('OK', { status: 200 });
  }

  const spamSettings = virtualPhone.user.spamSettings;
  let isSpam = false;
  let spamScore = 0;

  if (spamSettings) {
    const evaluation = await evaluateCallSpam(from, spamSettings);
    isSpam = evaluation.isSpam;
    spamScore = evaluation.score;
  }

  // Log the SMS
  await prisma.callLog.create({
    data: {
      virtualPhoneId: virtualPhone.id,
      from,
      to,
      status: isSpam ? 'blocked' : 'completed',
      isSpam,
      spamScore,
      transcript: body ?? null,
    },
  });

  await prisma.virtualPhone.update({
    where: { id: virtualPhone.id },
    data: {
      smsReceived: { increment: 1 },
      ...(isSpam && { spamBlocked: { increment: 1 } }),
    },
  });

  if (!isSpam && virtualPhone.forwardTo) {
    // In production, use Twilio to forward SMS to the real number
    try {
      const { twilioClient, TWILIO_PHONE_NUMBER } = await import('@/lib/twilio');
      await twilioClient.messages.create({
        body: `[Shielded] From ${from}: ${body}`,
        from: TWILIO_PHONE_NUMBER,
        to: virtualPhone.forwardTo,
      });
    } catch (err) {
      console.error('[Twilio Webhook] Failed to forward SMS:', err);
    }
  }

  return new NextResponse('OK', { status: 200 });
}

/**
 * Handle call status callback (completed, failed, etc.).
 */
async function handleCallStatus(payload: Record<string, string>): Promise<NextResponse> {
  const {
    CallSid: callSid,
    CallStatus: callStatus,
    CallDuration: duration,
    From: from,
    To: to,
  } = payload;

  if (!callSid || !callStatus) {
    return new NextResponse('OK', { status: 200 });
  }

  try {
    // Find the call log by from+to (since we don't store CallSid)
    const existingLog = await prisma.callLog.findFirst({
      where: { from, to },
      orderBy: { createdAt: 'desc' },
    });

    if (existingLog) {
      await prisma.callLog.update({
        where: { id: existingLog.id },
        data: {
          status: callStatus.toLowerCase(),
          duration: duration ? parseInt(duration, 10) : null,
        },
      });
    }
  } catch (err) {
    console.error('[Twilio Webhook] Failed to update call status:', err);
  }

  return new NextResponse('OK', { status: 200 });
}

// ── Main Route Handler ─────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const rawBody = await req.text();
    const payload = parseFormBody(rawBody);

    if (!verifyTwilioSignature(req, payload)) {
      return new NextResponse('Invalid Twilio signature', { status: 403 });
    }

    const callStatus = payload['CallStatus'];
    const messageStatus = payload['MessageStatus'] || payload['SmsStatus'];

    // Determine event type from payload fields
    if (payload['RecordingUrl']) {
      // Voicemail/transcription callback — no action needed for now
      return new NextResponse('OK', { status: 200 });
    }

    if (payload['MessageSid'] || messageStatus) {
      // SMS event
      return handleIncomingSms(payload);
    }

    if (payload['CallSid']) {
      // Call event — determine if incoming or status update
      const isStatusCallback =
        callStatus &&
        ['completed', 'busy', 'failed', 'no-answer', 'canceled'].includes(
          callStatus.toLowerCase()
        );

      if (isStatusCallback) {
        return handleCallStatus(payload);
      }

      return handleIncomingCall(payload);
    }

    return new NextResponse('OK', { status: 200 });
  } catch (err) {
    console.error('[Twilio Webhook] Unexpected error:', err);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
