// ============================================================
// Shielded Privacy App — Notification Service
// ============================================================
import { prisma } from '@/lib/prisma';
import type { Notification } from '@prisma/client';

// In production, swap this with Resend / Nodemailer / SES
async function deliverEmail(to: string, subject: string, html: string): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Email] To: ${to} | Subject: ${subject}`);
    return;
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'noreply@shielded.app',
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('[Notification] Email delivery failed:', err);
  }
}

// ── Email Templates ───────────────────────────────────────────

const EMAIL_TEMPLATES: Record<string, (data: Record<string, unknown>) => { subject: string; html: string }> = {
  scan_complete: (data) => ({
    subject: 'Your Shielded scan is complete',
    html: `
      <h2>Scan Complete</h2>
      <p>We scanned <strong>${data.totalBrokers ?? 0}</strong> data broker sites.</p>
      <p>Found: <strong>${data.found ?? 0}</strong> records | Removed: <strong>${data.removed ?? 0}</strong></p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">View Results</a></p>
    `,
  }),

  record_found: (data) => ({
    subject: `Your data was found on ${data.brokerName ?? 'a data broker'}`,
    html: `
      <h2>Data Found</h2>
      <p>We found your personal information on <strong>${data.brokerName}</strong>.</p>
      <p>We've automatically requested removal on your behalf.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/brokers">View Details</a></p>
    `,
  }),

  record_removed: (data) => ({
    subject: `Your data was removed from ${data.brokerName ?? 'a data broker'}`,
    html: `
      <h2>Data Removed ✓</h2>
      <p>Your personal information has been successfully removed from <strong>${data.brokerName}</strong>.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/brokers">View All Removals</a></p>
    `,
  }),

  breach_detected: (data) => ({
    subject: `Your email was found in the ${data.breachName} breach`,
    html: `
      <h2>Data Breach Alert</h2>
      <p>Your email was found in a breach at <strong>${data.breachName}</strong>.</p>
      <p>Data exposed: ${Array.isArray(data.dataExposed) ? (data.dataExposed as string[]).join(', ') : 'Unknown'}</p>
      <p>We recommend changing your password and enabling two-factor authentication.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/breaches">View Breach Details</a></p>
    `,
  }),

  subscription_renewed: (data) => ({
    subject: 'Your Shielded subscription has been renewed',
    html: `
      <h2>Subscription Renewed</h2>
      <p>Your <strong>${data.planName ?? 'Shielded'}</strong> subscription has been successfully renewed.</p>
      <p>Amount: $${data.amount ?? '0'}</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription">Manage Subscription</a></p>
    `,
  }),

  subscription_expiring: (data) => ({
    subject: 'Action required: Your Shielded subscription payment failed',
    html: `
      <h2>Payment Failed</h2>
      <p>We were unable to process your subscription payment.</p>
      <p>Please update your payment method to continue protecting your privacy.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription">Update Payment Method</a></p>
    `,
  }),

  call_blocked: (data) => ({
    subject: 'Spam call blocked by Shielded',
    html: `
      <h2>Spam Call Blocked</h2>
      <p>We blocked a spam call from <strong>${data.from}</strong> to your virtual number <strong>${data.virtualNumber}</strong>.</p>
      <p>Spam score: ${data.spamScore}/100</p>
    `,
  }),
};

// ── Core Functions ─────────────────────────────────────────────

/**
 * Create an in-app notification for a user.
 */
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  data?: object
): Promise<Notification> {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      data: data ?? undefined,
      isRead: false,
    },
  });
}

/**
 * Send an email notification using a named template.
 */
export async function sendEmailNotification(
  userId: string,
  template: string,
  data: Record<string, unknown>
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, firstName: true },
  });

  if (!user) {
    console.warn(`[Notification] User ${userId} not found for email notification`);
    return;
  }

  const templateFn = EMAIL_TEMPLATES[template];
  if (!templateFn) {
    console.warn(`[Notification] Unknown email template: ${template}`);
    return;
  }

  const { subject, html } = templateFn({ ...data, firstName: user.firstName });
  await deliverEmail(user.email, subject, html);
}

/**
 * Mark a specific notification as read.
 */
export async function markAsRead(notificationId: string): Promise<void> {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

/**
 * Mark all notifications for a user as read.
 */
export async function markAllAsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
