/**
 * Opt-Out Worker — processes `opt-out-queue` jobs.
 *
 * For each job it:
 *  1. Loads the broker and user profile.
 *  2. Skips records that are already removed or have an in-flight request.
 *  3. Dispatches the opt-out via the broker's preferred method:
 *       - email      → sends a GDPR/CCPA removal email via Nodemailer/Resend
 *       - web_form   → logs the form URL and marks as submitted
 *       - api        → POSTs to the broker's opt-out API endpoint
 *  4. Updates BrokerRecord.status = 'removal_requested'.
 *  5. Creates an in-app notification.
 */

import { Worker, Job } from 'bullmq';
import nodemailer from 'nodemailer';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { queueNotificationJob, type OptOutJobData } from '../lib/queues';

// ─── Constants ────────────────────────────────────────────────────────────────

const QUEUE_NAME = 'opt-out-queue';

// ─── Email transport (SMTP / Resend) ──────────────────────────────────────────

/**
 * Returns a Nodemailer transporter.
 * Prefer Resend's SMTP bridge in production; fall back to a generic SMTP
 * config for self-hosted deployments.
 */
function createTransport(): nodemailer.Transporter {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    return nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: resendApiKey,
      },
    });
  }

  // Generic SMTP fallback (development / self-hosted).
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'localhost',
    port: parseInt(process.env.SMTP_PORT ?? '1025', 10),
    secure: false,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

// ─── Opt-out strategy implementations ────────────────────────────────────────

/**
 * Sends a formal opt-out / data-removal request email to the broker.
 */
async function sendOptOutEmail(
  broker: { name: string; optOutEmail: string | null; website: string },
  user: { firstName: string | null; lastName: string | null; email: string },
): Promise<void> {
  const to = broker.optOutEmail ?? `privacy@${broker.website}`;
  const transport = createTransport();
  const fromEmail = process.env.SHIELDED_FROM_EMAIL ?? 'privacy@shielded.app';

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

  await transport.sendMail({
    from: `"Shielded Privacy" <${fromEmail}>`,
    to,
    subject: `Data Removal Request — ${fullName}`,
    text: [
      `To whom it may concern at ${broker.name},`,
      '',
      `I am writing to formally request the removal of all personal information`,
      `associated with the following individual from your database, in accordance`,
      `with applicable privacy laws including the CCPA and GDPR where applicable:`,
      '',
      `  Full Name : ${fullName}`,
      `  Email     : ${user.email}`,
      '',
      `Please confirm receipt of this request and the expected timeline for removal.`,
      '',
      `This request is submitted on behalf of the individual via Shielded Privacy (https://shielded.app).`,
      '',
      `Thank you for your cooperation.`,
    ].join('\n'),
    html: `
      <p>To whom it may concern at <strong>${broker.name}</strong>,</p>
      <p>
        I am writing to formally request the removal of all personal information
        associated with the following individual from your database, in accordance
        with applicable privacy laws including the CCPA and GDPR where applicable:
      </p>
      <ul>
        <li><strong>Full Name:</strong> ${fullName}</li>
        <li><strong>Email:</strong> ${user.email}</li>
      </ul>
      <p>
        Please confirm receipt of this request and the expected timeline for removal.
      </p>
      <p>
        This request is submitted on behalf of the individual via
        <a href="https://shielded.app">Shielded Privacy</a>.
      </p>
      <p>Thank you for your cooperation.</p>
    `,
  });

  console.log(`[OptOut] Email sent to ${to} for broker ${broker.name}`);
}

/**
 * Simulates submission of a web-form opt-out.
 * In a real implementation this would use Playwright to navigate the
 * broker's opt-out form and fill in the user's details.
 */
async function submitWebForm(
  broker: { name: string; optOutUrl: string | null; website: string },
  user: { firstName: string | null; lastName: string | null; email: string },
): Promise<void> {
  const url = broker.optOutUrl ?? `https://${broker.website}/opt-out`;
  console.log(
    `[OptOut] Web-form opt-out for ${broker.name}: navigating to ${url} ` +
      `for user ${user.firstName} ${user.lastName} <${user.email}>`,
  );
  // TODO: integrate Playwright headless browser for real form submission.
}

/**
 * POSTs an opt-out request to a broker's API endpoint.
 */
async function callBrokerApi(
  broker: { name: string; optOutUrl: string | null; website: string },
  user: { firstName: string | null; lastName: string | null; email: string },
): Promise<void> {
  const endpoint = broker.optOutUrl ?? `https://api.${broker.website}/opt-out`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    }),
  });

  if (!response.ok) {
    throw new Error(`Broker API opt-out failed: ${response.status} ${response.statusText}`);
  }

  console.log(`[OptOut] API opt-out accepted by ${broker.name}`);
}

// ─── Worker processor ─────────────────────────────────────────────────────────

async function processOptOutJob(job: Job<OptOutJobData>): Promise<void> {
  const { userId, brokerId, recordId } = job.data;

  console.log(`[OptOut] Processing opt-out: record=${recordId} broker=${brokerId} user=${userId}`);

  // 1 ── Load broker ─────────────────────────────────────────────────────────
  const broker = await prisma.dataBroker.findUnique({ where: { id: brokerId } });
  if (!broker) {
    throw new Error(`DataBroker ${brokerId} not found`);
  }

  // 2 ── Load BrokerRecord and skip if already actioned ─────────────────────
  const record = await prisma.brokerRecord.findUnique({ where: { id: recordId } });
  if (!record) {
    throw new Error(`BrokerRecord ${recordId} not found`);
  }

  if (record.status === 'removed' || record.status === 'removal_requested') {
    console.log(
      `[OptOut] Skipping record ${recordId} — status is already '${record.status}'`,
    );
    return;
  }

  // 3 ── Load user ───────────────────────────────────────────────────────────
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  const userProfile = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };

  // 4 ── Dispatch opt-out via broker's preferred method ─────────────────────
  switch (broker.optOutMethod) {
    case 'email':
      await sendOptOutEmail(broker, userProfile);
      break;
    case 'web_form':
      await submitWebForm(broker, userProfile);
      break;
    case 'api':
      await callBrokerApi(broker, userProfile);
      break;
    default:
      console.warn(`[OptOut] Unknown optOutMethod '${broker.optOutMethod}' for ${broker.name}`);
  }

  // 5 ── Update BrokerRecord ─────────────────────────────────────────────────
  await prisma.brokerRecord.update({
    where: { id: recordId },
    data: {
      status: 'removal_requested',
      requestedAt: new Date(),
    },
  });

  // 6 ── Create in-app notification ─────────────────────────────────────────
  await prisma.notification.create({
    data: {
      userId,
      type: 'record_found',
      title: 'Removal Requested',
      message: `Your removal request has been submitted to ${broker.name}. ` +
        `Expect confirmation within ${broker.avgRemovalDays} day${broker.avgRemovalDays !== 1 ? 's' : ''}.`,
      data: { brokerId, recordId, brokerName: broker.name, avgRemovalDays: broker.avgRemovalDays },
    },
  });

  await queueNotificationJob('removal_requested', userId, {
    brokerName: broker.name,
    avgRemovalDays: broker.avgRemovalDays,
    recordId,
  });

  console.log(`[OptOut] Opt-out submitted to ${broker.name} for user ${userId}`);
}

// ─── Worker instance ──────────────────────────────────────────────────────────

export const optOutWorker = new Worker<OptOutJobData>(QUEUE_NAME, processOptOutJob, {
  connection: redis,
  concurrency: 5, // multiple concurrent opt-outs are safe
  limiter: {
    max: 10,
    duration: 60_000, // max 10 opt-outs per minute (avoids IP bans)
  },
});

// ─── Worker event listeners ───────────────────────────────────────────────────

optOutWorker.on('completed', (job) => {
  console.log(`[OptOut] Job ${job.id} completed`);
});

optOutWorker.on('failed', (job, err) => {
  console.error(`[OptOut] Job ${job?.id} failed (attempt ${job?.attemptsMade}):`, err.message);
});

optOutWorker.on('stalled', (jobId) => {
  console.warn(`[OptOut] Job ${jobId} stalled — will be retried`);
});

optOutWorker.on('error', (err) => {
  console.error('[OptOut] Worker error:', err);
});

console.log('[OptOut] Worker started and listening on', QUEUE_NAME);

export default optOutWorker;
