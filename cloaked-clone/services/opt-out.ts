// ============================================================
// Shielded Privacy App — Opt-Out / Removal Request Service
// ============================================================
import { prisma } from '@/lib/prisma';
import { createNotification } from './notification-service';
import type { DataBroker, User, BrokerRecord } from '@prisma/client';

// ── Helpers ────────────────────────────────────────────────────

/**
 * Add a realistic delay to simulate a web request.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Build opt-out email body for a specific broker.
 */
function buildOptOutEmailBody(broker: DataBroker, user: User): string {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return `
To Whom It May Concern,

I am writing to request the immediate removal of my personal information from your database in accordance with applicable privacy laws including CCPA (California Consumer Privacy Act), GDPR, and/or other applicable state privacy regulations.

My information:
- Full Name: ${fullName}
- Email: ${user.email}

Please confirm the removal of all records associated with my name and email address. I would appreciate a confirmation email once the deletion has been completed.

This request is being sent under my rights as a data subject to opt out of data collection and sale.

Sincerely,
${fullName}
  `.trim();
}

// ── Core Functions ─────────────────────────────────────────────

/**
 * Submit an opt-out request for a user on a specific broker.
 * Chooses the appropriate method (web form, email, etc.) based on broker config.
 */
export async function submitOptOutRequest(
  broker: DataBroker,
  user: User,
  record: BrokerRecord
): Promise<void> {
  console.log(`[OptOut] Submitting opt-out for user ${user.id} on broker ${broker.name} (method: ${broker.optOutMethod})`);

  // Update record to in-progress
  await prisma.brokerRecord.update({
    where: { id: record.id },
    data: {
      status: 'opt_out_in_progress',
      requestedAt: new Date(),
    },
  });

  try {
    switch (broker.optOutMethod) {
      case 'email':
        await sendOptOutEmail(broker, user);
        break;
      case 'web_form':
        await processWebFormOptOut(broker, user);
        break;
      case 'automated':
        await processWebFormOptOut(broker, user);
        break;
      case 'mail':
        // Physical mail — log and mark as requested; human follow-up needed
        console.log(`[OptOut] Physical mail required for ${broker.name}`);
        break;
      case 'phone':
        // Phone opt-out — log and mark as requested
        console.log(`[OptOut] Phone opt-out required for ${broker.name}`);
        break;
      default:
        console.warn(`[OptOut] Unknown opt-out method: ${broker.optOutMethod}`);
    }

    // Mark as removal requested (pending verification)
    await prisma.brokerRecord.update({
      where: { id: record.id },
      data: { status: 'removal_requested', requestedAt: new Date() },
    });

    // Schedule a verification check (simulate with a delayed status update)
    // In production, this would be handled by the monitor worker
    const avgDays = broker.avgRemovalDays;
    console.log(`[OptOut] Opt-out submitted for ${broker.name}. Estimated removal: ${avgDays} days.`);

  } catch (err) {
    console.error(`[OptOut] Failed to submit opt-out for ${broker.name}:`, err);

    await prisma.brokerRecord.update({
      where: { id: record.id },
      data: { status: 'found' }, // Revert to found so it can be retried
    });

    throw err;
  }
}

/**
 * Send an opt-out email to a data broker.
 */
export async function sendOptOutEmail(broker: DataBroker, user: User): Promise<void> {
  if (!broker.optOutEmail) {
    throw new Error(`Broker ${broker.name} has no opt-out email configured`);
  }

  const subject = `Data Removal Request - ${[user.firstName, user.lastName].filter(Boolean).join(' ')}`;
  const body = buildOptOutEmailBody(broker, user);

  console.log(`[OptOut] Sending opt-out email to ${broker.optOutEmail} for broker ${broker.name}`);

  // Simulate email send delay
  await sleep(500 + Math.random() * 1000);

  // In production, use Resend/Nodemailer/SES:
  if (process.env.NODE_ENV === 'production') {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? 'optout@shielded.app',
        to: broker.optOutEmail,
        subject,
        text: body,
      });
    } catch (err) {
      console.error(`[OptOut] Email send failed for ${broker.name}:`, err);
      throw err;
    }
  }

  console.log(`[OptOut] Opt-out email sent to ${broker.optOutEmail}`);
}

/**
 * Process a web form opt-out for a data broker.
 * In production, this would use Playwright to fill and submit the opt-out form.
 */
export async function processWebFormOptOut(
  broker: DataBroker,
  user: User
): Promise<void> {
  if (!broker.optOutUrl) {
    throw new Error(`Broker ${broker.name} has no opt-out URL configured`);
  }

  console.log(`[OptOut] Processing web form opt-out for ${broker.name} at ${broker.optOutUrl}`);

  // Simulate web automation delay (3–8 seconds for a form submission)
  await sleep(3000 + Math.random() * 5000);

  /*
   * Production implementation using Playwright would look like:
   *
   * const browser = await chromium.launch({ headless: true });
   * const page = await browser.newPage();
   * await page.goto(broker.optOutUrl);
   * await page.fill('[name="firstName"]', user.firstName ?? '');
   * await page.fill('[name="lastName"]', user.lastName ?? '');
   * await page.fill('[name="email"]', user.email);
   * await page.click('[type="submit"]');
   * await browser.close();
   */

  console.log(`[OptOut] Web form submitted for ${broker.name}`);
}

/**
 * Verify whether a removal has been completed for a user on a broker.
 * Returns true if data is no longer present on the broker site.
 */
export async function verifyRemoval(brokerId: string, userId: string): Promise<boolean> {
  const { checkBrokerRemovalStatus } = await import('./broker-scanner');
  const removed = await checkBrokerRemovalStatus(brokerId, userId);

  if (removed) {
    // Recalculate privacy score
    const brokerRecords = await prisma.brokerRecord.findMany({
      where: { userId },
      include: { broker: { select: { category: true, name: true } } },
    });

    const { calculatePrivacyScore } = await import('./privacy-score');
    const hasBreaches = (await prisma.breachAlert.count({ where: { userId, isRead: false } })) > 0;
    const result = calculatePrivacyScore(brokerRecords, hasBreaches);

    await prisma.user.update({
      where: { id: userId },
      data: { privacyScore: result.score },
    });
  }

  return removed;
}
