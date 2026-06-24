/**
 * Inline opt-out processor — runs data-removal requests in the same Node.js
 * process without a separate BullMQ worker. Safe for Railway single-process
 * deployments.
 *
 * For web-form brokers (where Playwright automation isn't available) we fall
 * back to sending a formal GDPR/CCPA removal email — legally equivalent and
 * accepted by most brokers.
 */

import nodemailer from 'nodemailer';
import { prisma } from './prisma';

// ─── Email transport ──────────────────────────────────────────────────────────

function createTransport(): nodemailer.Transporter {
  if (process.env.RESEND_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: { user: 'resend', pass: process.env.RESEND_API_KEY },
    });
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'localhost',
    port: parseInt(process.env.SMTP_PORT ?? '1025', 10),
    secure: false,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

// ─── Opt-out strategies ───────────────────────────────────────────────────────

async function sendOptOutEmail(
  broker: { name: string; optOutEmail: string | null; website: string; optOutUrl: string | null },
  user: { firstName: string | null; lastName: string | null; email: string },
): Promise<void> {
  const to = broker.optOutEmail ?? `privacy@${broker.website}`;
  const from = process.env.SHIELDED_FROM_EMAIL ?? 'privacy@shielded.app';
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
  const optOutLink = broker.optOutUrl ? `\nOpt-out page: ${broker.optOutUrl}` : '';

  const transport = createTransport();
  await transport.sendMail({
    from: `"Shield Privacy" <${from}>`,
    to,
    subject: `Data Removal Request — ${fullName}`,
    text: [
      `To whom it may concern at ${broker.name},`,
      '',
      `I am writing to formally request the removal of all personal information`,
      `associated with the following individual from your database, in accordance`,
      `with the California Consumer Privacy Act (CCPA), the General Data Protection`,
      `Regulation (GDPR), and any other applicable privacy laws:`,
      '',
      `  Full Name : ${fullName}`,
      `  Email     : ${user.email}`,
      `${optOutLink}`,
      '',
      `Please confirm receipt of this request and the expected timeline for removal.`,
      `Under CCPA, you are required to honor this request within 45 days.`,
      '',
      `This request is submitted via Shield Privacy (https://shielded.app).`,
      '',
      `Thank you for your cooperation.`,
    ].join('\n'),
    html: `
      <p>To whom it may concern at <strong>${broker.name}</strong>,</p>
      <p>
        I am writing to formally request the removal of all personal information
        associated with the following individual from your database, in accordance
        with the California Consumer Privacy Act (CCPA), GDPR, and any other applicable privacy laws:
      </p>
      <table style="border-collapse:collapse;margin:8px 0">
        <tr><td style="padding:2px 16px 2px 0;font-weight:bold">Full Name:</td><td>${fullName}</td></tr>
        <tr><td style="padding:2px 16px 2px 0;font-weight:bold">Email:</td><td>${user.email}</td></tr>
        ${broker.optOutUrl ? `<tr><td style="padding:2px 16px 2px 0;font-weight:bold">Opt-out page:</td><td><a href="${broker.optOutUrl}">${broker.optOutUrl}</a></td></tr>` : ''}
      </table>
      <p>
        Please confirm receipt and expected removal timeline.
        Under CCPA you are required to honor this request within 45 days.
      </p>
      <p>
        This request is submitted via
        <a href="https://shielded.app">Shield Privacy</a>.
      </p>
      <p>Thank you for your cooperation.</p>
    `,
  });

  console.log(`[OptOut] Removal email sent to ${to} for broker ${broker.name}`);
}

async function callBrokerApi(
  broker: { name: string; optOutUrl: string | null; website: string },
  user: { firstName: string | null; lastName: string | null; email: string },
): Promise<void> {
  const endpoint = broker.optOutUrl ?? `https://api.${broker.website}/opt-out`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName: user.firstName, lastName: user.lastName, email: user.email }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Broker API ${broker.name} returned ${res.status}`);
  console.log(`[OptOut] API opt-out accepted by ${broker.name}`);
}

// ─── Core function ────────────────────────────────────────────────────────────

export async function runOptOutJob(
  userId: string,
  brokerId: string,
  recordId: string,
): Promise<void> {
  try {
    const [broker, record, user] = await Promise.all([
      prisma.dataBroker.findUnique({ where: { id: brokerId } }),
      prisma.brokerRecord.findUnique({ where: { id: recordId } }),
      prisma.user.findUnique({ where: { id: userId } }),
    ]);

    if (!broker || !record || !user) {
      console.warn(`[OptOut] Missing data for recordId=${recordId}`);
      return;
    }

    if (record.status === 'removed' || record.status === 'removal_requested') {
      console.log(`[OptOut] Skipping ${recordId} — already ${record.status}`);
      return;
    }

    const userProfile = { firstName: user.firstName, lastName: user.lastName, email: user.email };

    switch (broker.optOutMethod) {
      case 'email':
        await sendOptOutEmail(broker, userProfile);
        break;

      case 'web_form':
        // Playwright automation not available in single-process Railway deployment.
        // Fall back to a formal email opt-out — legally equivalent and accepted by
        // most brokers per CCPA requirements.
        await sendOptOutEmail(broker, userProfile);
        break;

      case 'api':
        try {
          await callBrokerApi(broker, userProfile);
        } catch {
          // API call failed — fall back to email
          await sendOptOutEmail(broker, userProfile);
        }
        break;

      default:
        await sendOptOutEmail(broker, userProfile);
    }

    await prisma.brokerRecord.update({
      where: { id: recordId },
      data: { status: 'removal_requested', requestedAt: new Date() },
    });

    await prisma.notification.create({
      data: {
        userId,
        type: 'record_found',
        title: 'Removal Requested',
        message: `Your removal request has been submitted to ${broker.name}. Expect confirmation within ${broker.avgRemovalDays} day${broker.avgRemovalDays !== 1 ? 's' : ''}.`,
        data: { brokerId, recordId, brokerName: broker.name, avgRemovalDays: broker.avgRemovalDays },
      },
    });

    console.log(`[OptOut] Completed opt-out for ${broker.name} (record ${recordId})`);
  } catch (err) {
    console.error(`[OptOut] Failed for recordId=${recordId}:`, err);
  }
}

/**
 * Trigger opt-outs for all found broker records for a user.
 * Called after a scan completes.
 */
export async function runOptOutsForUser(userId: string): Promise<void> {
  const found = await prisma.brokerRecord.findMany({
    where: {
      userId,
      status: 'found',
    },
    select: { id: true, brokerId: true },
  });

  console.log(`[OptOut] Queuing ${found.length} opt-out(s) for user ${userId}`);

  for (const record of found) {
    await runOptOutJob(userId, record.brokerId, record.id);
  }
}
