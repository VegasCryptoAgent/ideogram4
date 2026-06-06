/**
 * Notification Worker — processes `notification-queue` jobs.
 *
 * Supported notification types (each maps to an HTML email template):
 *
 *  welcome              Sent immediately after user registration.
 *  scan_complete        Summary of the latest broker scan.
 *  removal_requested    Confirmation that an opt-out was submitted.
 *  removal_confirmed    Data has been removed from a broker.
 *  breach_alert         A new data breach was detected (urgent styling).
 *  weekly_digest        Weekly summary for Pro / Ultimate subscribers.
 *
 * Email delivery uses Resend when RESEND_API_KEY is set, falling back to
 * a generic SMTP transport (e.g. Mailhog in development).
 */

import { Worker, Job } from 'bullmq';
import nodemailer from 'nodemailer';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import type { NotificationJobData } from '../lib/queues';

// ─── Constants ────────────────────────────────────────────────────────────────

const QUEUE_NAME = 'notification-queue';
const FROM_EMAIL = process.env.SHIELDED_FROM_EMAIL ?? 'noreply@shielded.app';
const APP_URL = process.env.NEXTAUTH_URL ?? 'https://shielded.app';

// ─── Email transport ──────────────────────────────────────────────────────────

function createTransport(): nodemailer.Transporter {
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    return nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: { user: 'resend', pass: apiKey },
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

// ─── Shared branding wrapper ──────────────────────────────────────────────────

function withLayout(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.5px;">
                🛡️ Shielded
              </h1>
              <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.8);">Privacy Protection</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background:#1e293b;padding:40px;border-radius:0 0 12px 12px;">
              ${body}
              <hr style="border:none;border-top:1px solid #334155;margin:32px 0;" />
              <p style="font-size:12px;color:#64748b;text-align:center;margin:0;">
                You're receiving this email because you have an account on
                <a href="${APP_URL}" style="color:#818cf8;text-decoration:none;">Shielded</a>.
                <br/>
                <a href="${APP_URL}/settings/notifications" style="color:#818cf8;text-decoration:none;">
                  Manage notification preferences
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Email templates ──────────────────────────────────────────────────────────

function welcomeTemplate(data: Record<string, unknown>): { subject: string; html: string } {
  const name = (data.name as string) ?? 'there';
  return {
    subject: `Welcome to Shielded — your privacy protection starts now`,
    html: withLayout('Welcome to Shielded', `
      <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#f1f5f9;">
        Welcome, ${name}! 👋
      </h2>
      <p style="color:#94a3b8;line-height:1.6;margin:0 0 16px;">
        Your Shielded account is ready. We scan 200+ data broker sites and automatically
        request removal of your personal information.
      </p>
      <p style="color:#94a3b8;line-height:1.6;margin:0 0 24px;">
        Here's what happens next:
      </p>
      <ol style="color:#94a3b8;line-height:2;margin:0 0 32px;padding-left:20px;">
        <li>Complete your profile (name, addresses, phone numbers)</li>
        <li>Run your first privacy scan</li>
        <li>We'll automatically request removal from any brokers that list your data</li>
        <li>Track your privacy score as it improves over time</li>
      </ol>
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:8px;padding:14px 28px;">
            <a href="${APP_URL}/dashboard" style="color:#fff;text-decoration:none;font-weight:600;font-size:16px;">
              Go to Dashboard →
            </a>
          </td>
        </tr>
      </table>
    `),
  };
}

function scanCompleteTemplate(data: Record<string, unknown>): { subject: string; html: string } {
  const found = (data.found as number) ?? 0;
  const scanned = (data.scanned as number) ?? 0;
  const score = (data.score as number) ?? 0;

  const scoreColor = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';

  return {
    subject: found > 0
      ? `Scan complete — ${found} listing${found !== 1 ? 's' : ''} found on data broker sites`
      : `Scan complete — your data looks clean!`,
    html: withLayout('Scan Complete', `
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f1f5f9;">
        Privacy Scan Complete
      </h2>
      <p style="color:#94a3b8;margin:0 0 32px;">
        We finished scanning ${scanned} data broker sites.
      </p>

      <!-- Stats row -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
        <tr>
          <td width="33%" align="center" style="background:#0f172a;border-radius:8px;padding:20px;margin:0 4px;">
            <div style="font-size:32px;font-weight:800;color:${scoreColor};">${score}</div>
            <div style="font-size:12px;color:#64748b;margin-top:4px;">Privacy Score</div>
          </td>
          <td width="8px"></td>
          <td width="33%" align="center" style="background:#0f172a;border-radius:8px;padding:20px;">
            <div style="font-size:32px;font-weight:800;color:#ef4444;">${found}</div>
            <div style="font-size:12px;color:#64748b;margin-top:4px;">Listings Found</div>
          </td>
          <td width="8px"></td>
          <td width="33%" align="center" style="background:#0f172a;border-radius:8px;padding:20px;">
            <div style="font-size:32px;font-weight:800;color:#f1f5f9;">${scanned}</div>
            <div style="font-size:12px;color:#64748b;margin-top:4px;">Sites Scanned</div>
          </td>
        </tr>
      </table>

      ${found > 0
        ? `<p style="color:#94a3b8;line-height:1.6;margin:0 0 24px;">
             We've automatically submitted removal requests to all ${found} broker${found !== 1 ? 's' : ''}
             where your data was found. Removals typically take 3–14 days.
           </p>`
        : `<p style="color:#22c55e;line-height:1.6;margin:0 0 24px;">
             Great news — none of the scanned brokers are listing your personal data.
             We'll keep monitoring and let you know if anything changes.
           </p>`
      }

      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:8px;padding:14px 28px;">
            <a href="${APP_URL}/dashboard/brokers" style="color:#fff;text-decoration:none;font-weight:600;font-size:16px;">
              View Full Report →
            </a>
          </td>
        </tr>
      </table>
    `),
  };
}

function removalRequestedTemplate(data: Record<string, unknown>): { subject: string; html: string } {
  const brokerName = (data.brokerName as string) ?? 'a data broker';
  const days = (data.avgRemovalDays as number) ?? 14;

  return {
    subject: `Removal requested from ${brokerName}`,
    html: withLayout('Removal Requested', `
      <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#f1f5f9;">
        Removal Request Submitted
      </h2>
      <p style="color:#94a3b8;line-height:1.6;margin:0 0 16px;">
        We've submitted a data removal request to <strong style="color:#f1f5f9;">${brokerName}</strong>
        on your behalf.
      </p>
      <div style="background:#0f172a;border-left:3px solid #6366f1;border-radius:0 8px 8px 0;padding:16px 20px;margin:0 0 24px;">
        <p style="margin:0;color:#94a3b8;font-size:14px;">
          ⏱️ Expected removal time: <strong style="color:#f1f5f9;">${days} day${days !== 1 ? 's' : ''}</strong>
        </p>
      </div>
      <p style="color:#94a3b8;line-height:1.6;margin:0 0 24px;">
        We'll automatically verify the removal after ${days} days and notify you when
        your data has been taken down.
      </p>
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:8px;padding:14px 28px;">
            <a href="${APP_URL}/dashboard/brokers" style="color:#fff;text-decoration:none;font-weight:600;font-size:16px;">
              Track Progress →
            </a>
          </td>
        </tr>
      </table>
    `),
  };
}

function removalConfirmedTemplate(data: Record<string, unknown>): { subject: string; html: string } {
  const brokerName = (data.brokerName as string) ?? 'a data broker';

  return {
    subject: `✅ Your data has been removed from ${brokerName}`,
    html: withLayout('Removal Confirmed', `
      <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#22c55e;">
        ✅ Removal Confirmed!
      </h2>
      <p style="color:#94a3b8;line-height:1.6;margin:0 0 16px;">
        Your personal data has been successfully removed from
        <strong style="color:#f1f5f9;">${brokerName}</strong>.
      </p>
      <p style="color:#94a3b8;line-height:1.6;margin:0 0 24px;">
        We'll continue to monitor this broker and re-request removal if your data
        reappears in the future.
      </p>
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:8px;padding:14px 28px;">
            <a href="${APP_URL}/dashboard" style="color:#fff;text-decoration:none;font-weight:600;font-size:16px;">
              View Privacy Score →
            </a>
          </td>
        </tr>
      </table>
    `),
  };
}

function breachAlertTemplate(data: Record<string, unknown>): { subject: string; html: string } {
  const breachName = (data.breachName as string) ?? 'Unknown';
  const breachDate = data.breachDate ? new Date(data.breachDate as string).toLocaleDateString() : 'Unknown';
  const exposed = (data.dataExposed as string[]) ?? [];

  return {
    subject: `🚨 Data breach alert: your email found in ${breachName}`,
    html: withLayout('Breach Alert', `
      <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:16px 20px;margin:0 0 24px;">
        <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#ef4444;">
          🚨 Data Breach Detected
        </h2>
        <p style="margin:0;color:#fca5a5;font-size:14px;">Immediate action recommended</p>
      </div>

      <p style="color:#94a3b8;line-height:1.6;margin:0 0 16px;">
        Your email address was found in the
        <strong style="color:#f1f5f9;">${breachName}</strong> data breach
        (breach date: ${breachDate}).
      </p>

      <div style="background:#0f172a;border-radius:8px;padding:20px;margin:0 0 24px;">
        <p style="margin:0 0 12px;color:#94a3b8;font-size:14px;font-weight:600;">
          Exposed data types:
        </p>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${exposed.map((d) =>
            `<span style="background:#ef4444;color:#fff;font-size:12px;font-weight:600;padding:4px 10px;border-radius:100px;">${d}</span>`
          ).join(' ')}
        </div>
      </div>

      <p style="color:#94a3b8;line-height:1.6;margin:0 0 8px;font-weight:600;color:#f1f5f9;">
        Recommended actions:
      </p>
      <ol style="color:#94a3b8;line-height:2;margin:0 0 32px;padding-left:20px;">
        <li>Change your password on any sites where you use the same credentials</li>
        <li>Enable two-factor authentication (2FA) where available</li>
        <li>Monitor your financial accounts for unusual activity</li>
        <li>Consider using unique email aliases for new sign-ups</li>
      </ol>

      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="background:#ef4444;border-radius:8px;padding:14px 28px;">
            <a href="${APP_URL}/dashboard/breaches" style="color:#fff;text-decoration:none;font-weight:600;font-size:16px;">
              View Breach Details →
            </a>
          </td>
        </tr>
      </table>
    `),
  };
}

function weeklyDigestTemplate(data: Record<string, unknown>): { subject: string; html: string } {
  const found = (data.found as number) ?? 0;
  const removed = (data.removed as number) ?? 0;
  const pending = (data.pending as number) ?? 0;
  const score = (data.score as number) ?? 0;

  return {
    subject: `Your weekly Shielded privacy report`,
    html: withLayout('Weekly Privacy Digest', `
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f1f5f9;">
        Weekly Privacy Report
      </h2>
      <p style="color:#64748b;margin:0 0 32px;font-size:14px;">
        Here's a summary of your privacy protection this week.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
        <tr>
          <td width="25%" align="center" style="background:#0f172a;border-radius:8px;padding:16px 8px;">
            <div style="font-size:28px;font-weight:800;color:#6366f1;">${score}</div>
            <div style="font-size:11px;color:#64748b;margin-top:4px;">Privacy Score</div>
          </td>
          <td width="4px"></td>
          <td width="25%" align="center" style="background:#0f172a;border-radius:8px;padding:16px 8px;">
            <div style="font-size:28px;font-weight:800;color:#ef4444;">${found}</div>
            <div style="font-size:11px;color:#64748b;margin-top:4px;">Found</div>
          </td>
          <td width="4px"></td>
          <td width="25%" align="center" style="background:#0f172a;border-radius:8px;padding:16px 8px;">
            <div style="font-size:28px;font-weight:800;color:#f59e0b;">${pending}</div>
            <div style="font-size:11px;color:#64748b;margin-top:4px;">Pending</div>
          </td>
          <td width="4px"></td>
          <td width="25%" align="center" style="background:#0f172a;border-radius:8px;padding:16px 8px;">
            <div style="font-size:28px;font-weight:800;color:#22c55e;">${removed}</div>
            <div style="font-size:11px;color:#64748b;margin-top:4px;">Removed</div>
          </td>
        </tr>
      </table>

      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:8px;padding:14px 28px;">
            <a href="${APP_URL}/dashboard" style="color:#fff;text-decoration:none;font-weight:600;font-size:16px;">
              View Full Dashboard →
            </a>
          </td>
        </tr>
      </table>
    `),
  };
}

// ─── Template router ──────────────────────────────────────────────────────────

function renderTemplate(
  type: string,
  data: Record<string, unknown>,
): { subject: string; html: string } {
  switch (type) {
    case 'welcome':
      return welcomeTemplate(data);
    case 'scan_complete':
      return scanCompleteTemplate(data);
    case 'removal_requested':
      return removalRequestedTemplate(data);
    case 'removal_confirmed':
      return removalConfirmedTemplate(data);
    case 'breach_alert':
      return breachAlertTemplate(data);
    case 'weekly_digest':
      return weeklyDigestTemplate(data);
    default:
      return {
        subject: `Shielded notification`,
        html: withLayout('Notification', `
          <p style="color:#94a3b8;">${JSON.stringify(data)}</p>
        `),
      };
  }
}

// ─── Worker processor ─────────────────────────────────────────────────────────

async function processNotificationJob(job: Job<NotificationJobData>): Promise<void> {
  const { type, userId, data } = job.data;

  // Load the user's email.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, firstName: true },
  });

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  const recipientName = user.firstName ?? user.name ?? 'there';
  const templateData = { ...data, name: recipientName };

  const { subject, html } = renderTemplate(type, templateData);

  const transport = createTransport();

  await transport.sendMail({
    from: `"Shielded Privacy" <${FROM_EMAIL}>`,
    to: user.email,
    subject,
    html,
  });

  console.log(`[Notification] Sent '${type}' email to ${user.email}`);
}

// ─── Worker instance ──────────────────────────────────────────────────────────

export const notificationWorker = new Worker<NotificationJobData>(
  QUEUE_NAME,
  processNotificationJob,
  {
    connection: redis,
    concurrency: 10,
    limiter: {
      max: 50,
      duration: 60_000, // max 50 emails per minute
    },
  },
);

// ─── Worker event listeners ───────────────────────────────────────────────────

notificationWorker.on('completed', (job) => {
  console.log(`[Notification] Job ${job.id} (${job.data.type}) sent`);
});

notificationWorker.on('failed', (job, err) => {
  console.error(`[Notification] Job ${job?.id} failed:`, err.message);
});

notificationWorker.on('error', (err) => {
  console.error('[Notification] Worker error:', err);
});

console.log('[Notification] Worker started and listening on', QUEUE_NAME);

export default notificationWorker;
