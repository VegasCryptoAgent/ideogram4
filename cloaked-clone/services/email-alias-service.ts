// ============================================================
// Shielded Privacy App — Email Alias Service
// ============================================================
import { prisma } from '@/lib/prisma';
import { scoreEmail, isInWhitelist, isInBlacklist } from './spam-filter';
import type { EmailAlias } from '@prisma/client';

// ── Helpers ────────────────────────────────────────────────────

const ALIAS_DOMAIN = process.env.EMAIL_ALIAS_DOMAIN ?? 'shield.app';

/**
 * Convert a label string to a URL-safe slug.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30);
}

/**
 * Generate a unique alias address for the user.
 * Format: {label-slug}+{userid-short}@shield.app
 */
async function generateUniqueAlias(userId: string, label: string): Promise<string> {
  const slug = slugify(label) || 'alias';
  const shortId = userId.slice(-6).toLowerCase();
  const baseAlias = `${slug}+${shortId}@${ALIAS_DOMAIN}`;

  // Check uniqueness
  const existing = await prisma.emailAlias.findUnique({ where: { alias: baseAlias } });
  if (!existing) return baseAlias;

  // Append random suffix if collision
  let attempts = 0;
  while (attempts < 10) {
    const suffix = Math.floor(Math.random() * 9000 + 1000).toString();
    const candidate = `${slug}+${shortId}-${suffix}@${ALIAS_DOMAIN}`;
    const taken = await prisma.emailAlias.findUnique({ where: { alias: candidate } });
    if (!taken) return candidate;
    attempts++;
  }

  throw new Error('Unable to generate a unique alias. Please try a different label.');
}

// ── Core Functions ─────────────────────────────────────────────

/**
 * Create a new email alias for a user.
 */
export async function createEmailAlias(
  userId: string,
  label: string,
  forwardTo: string
): Promise<EmailAlias> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user) throw new Error('User not found');

  const alias = await generateUniqueAlias(userId, label || 'alias');
  const destination = forwardTo || user.email;

  return prisma.emailAlias.create({
    data: {
      userId,
      alias,
      label: label || null,
      forwardTo: destination,
      isActive: true,
    },
  });
}

/**
 * Delete an email alias. Verifies ownership before deletion.
 */
export async function deleteEmailAlias(aliasId: string): Promise<void> {
  await prisma.emailAlias.delete({ where: { id: aliasId } });
}

/**
 * Process an inbound email received at an alias address.
 * Evaluates spam, increments counters, and forwards if appropriate.
 */
export async function processInboundEmail(
  alias: string,
  from: string,
  subject: string,
  body: string
): Promise<void> {
  const aliasRecord = await prisma.emailAlias.findUnique({ where: { alias } });

  if (!aliasRecord) {
    console.warn(`[EmailAlias] No record found for alias: ${alias}`);
    return;
  }

  if (!aliasRecord.isActive) {
    console.log(`[EmailAlias] Alias ${alias} is inactive. Dropping email.`);
    return;
  }

  // Fetch user's spam settings
  const spamSettings = await prisma.spamSettings.findUnique({
    where: { userId: aliasRecord.userId },
  });

  // Evaluate spam
  const { score, isSpam } = await evaluateEmailSpam(from, subject, body);

  // Check whitelist / blacklist if settings exist
  let blocked = isSpam;
  if (spamSettings) {
    if (isInWhitelist(from, spamSettings.whitelist)) {
      blocked = false;
    } else if (isInBlacklist(from, spamSettings.blacklist)) {
      blocked = true;
    }
  }

  if (blocked) {
    // Increment spam counter
    await prisma.emailAlias.update({
      where: { id: aliasRecord.id },
      data: { spamBlocked: { increment: 1 } },
    });

    // Update user's spam settings counter
    if (spamSettings) {
      // No direct field on SpamSettings for this; notification-only approach
    }

    console.log(`[EmailAlias] Blocked spam email on ${alias} from ${from} (score: ${score})`);
    return;
  }

  // Increment received counter
  await prisma.emailAlias.update({
    where: { id: aliasRecord.id },
    data: { emailsReceived: { increment: 1 } },
  });

  // Forward the email to the user's real address
  try {
    await forwardEmail(aliasRecord.forwardTo, from, alias, subject, body, score);
  } catch (err) {
    console.error(`[EmailAlias] Failed to forward email from ${from} via ${alias}:`, err);
  }
}

/**
 * Forward an email to the user's real email address.
 */
async function forwardEmail(
  to: string,
  originalFrom: string,
  aliasAddress: string,
  subject: string,
  body: string,
  spamScore: number
): Promise<void> {
  const forwardSubject = `[Shielded] ${subject}`;
  const forwardBody = `
    <p style="color:#888;font-size:12px;border-bottom:1px solid #eee;padding-bottom:8px;">
      Forwarded via your Shielded alias: <strong>${aliasAddress}</strong><br>
      Original sender: <strong>${originalFrom}</strong> | Spam score: ${spamScore}/100
    </p>
    ${body}
  `;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[EmailAlias] [DEV] Forwarding to ${to}: "${forwardSubject}"`);
    return;
  }

  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? `noreply@${ALIAS_DOMAIN}`,
    replyTo: originalFrom,
    to,
    subject: forwardSubject,
    html: forwardBody,
  });
}

/**
 * Evaluate whether an email is spam.
 */
export async function evaluateEmailSpam(
  from: string,
  subject: string,
  body: string
): Promise<{ isSpam: boolean; score: number }> {
  const score = await scoreEmail(from, subject, body);

  // Default threshold: 55
  return { isSpam: score >= 55, score };
}
