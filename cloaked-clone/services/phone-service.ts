// ============================================================
// Shielded Privacy App — Virtual Phone Service (Twilio)
// ============================================================
import { prisma } from '@/lib/prisma';
import { scorePhoneNumber, isInWhitelist, isInBlacklist } from './spam-filter';
import type { VirtualPhone, CallLog, SpamSettings } from '@prisma/client';

// ── Twilio Client (lazy-loaded to avoid import errors in non-phone routes) ──

async function getTwilioClient() {
  const { twilioClient } = await import('@/lib/twilio');
  return twilioClient;
}

// ── Types ──────────────────────────────────────────────────────

interface SpamEvaluation {
  isSpam: boolean;
  score: number;
  reason?: string;
}

// ── Core Functions ─────────────────────────────────────────────

/**
 * Purchase a new virtual phone number via Twilio and persist it in the DB.
 */
export async function purchaseVirtualNumber(
  userId: string,
  areaCode: string,
  label: string,
  forwardTo: string
): Promise<VirtualPhone> {
  const client = await getTwilioClient();

  // Search for available numbers with the requested area code
  let availableNumbers;
  try {
    availableNumbers = await client.availablePhoneNumbers('US').local.list({
      areaCode: parseInt(areaCode, 10),
      smsEnabled: true,
      voiceEnabled: true,
      limit: 1,
    });
  } catch (err) {
    console.error('[PhoneService] Error fetching available numbers:', err);
    throw new Error('Unable to find available phone numbers for the requested area code');
  }

  if (!availableNumbers.length) {
    // Fall back to any US number
    availableNumbers = await client.availablePhoneNumbers('US').local.list({
      smsEnabled: true,
      voiceEnabled: true,
      limit: 1,
    });
  }

  if (!availableNumbers.length) {
    throw new Error('No phone numbers available. Please try a different area code.');
  }

  const numberToPurchase = availableNumbers[0].phoneNumber;

  // Purchase the number
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://shielded.app';

  const purchased = await client.incomingPhoneNumbers.create({
    phoneNumber: numberToPurchase,
    friendlyName: label || `Shielded — ${userId.slice(0, 8)}`,
    voiceUrl: `${appBaseUrl}/api/webhooks/twilio`,
    voiceMethod: 'POST',
    smsUrl: `${appBaseUrl}/api/webhooks/twilio`,
    smsMethod: 'POST',
    statusCallbackMethod: 'POST',
  });

  const virtualPhone = await prisma.virtualPhone.create({
    data: {
      userId,
      number: purchased.phoneNumber,
      friendlyName: purchased.friendlyName ?? label,
      label,
      twilioSid: purchased.sid,
      isActive: true,
      forwardTo: forwardTo || null,
    },
  });

  return virtualPhone;
}

/**
 * Release a virtual phone number from Twilio and delete from DB.
 */
export async function releaseVirtualNumber(phoneId: string): Promise<void> {
  const phone = await prisma.virtualPhone.findUnique({ where: { id: phoneId } });
  if (!phone) throw new Error('Virtual phone not found');

  if (phone.twilioSid) {
    try {
      const client = await getTwilioClient();
      await client.incomingPhoneNumbers(phone.twilioSid).remove();
    } catch (err) {
      console.error(`[PhoneService] Failed to release Twilio number ${phone.number}:`, err);
      // Continue with DB deletion even if Twilio fails
    }
  }

  await prisma.virtualPhone.delete({ where: { id: phoneId } });
}

/**
 * Get call logs for a virtual phone number.
 */
export async function getCallLogs(phoneId: string): Promise<CallLog[]> {
  return prisma.callLog.findMany({
    where: { virtualPhoneId: phoneId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}

/**
 * Evaluate whether an incoming call from a given number is likely spam.
 */
export async function evaluateCallSpam(
  from: string,
  spamSettings: SpamSettings
): Promise<SpamEvaluation> {
  // Whitelist check (immediate pass)
  if (isInWhitelist(from, spamSettings.whitelist)) {
    return { isSpam: false, score: 0, reason: 'whitelisted' };
  }

  // Blacklist check (immediate block)
  if (isInBlacklist(from, spamSettings.blacklist)) {
    return { isSpam: true, score: 100, reason: 'blacklisted' };
  }

  // Block unknown callers
  const normalized = from.replace(/\D/g, '');
  if (spamSettings.blockUnknownCallers && normalized.length < 7) {
    return { isSpam: true, score: 90, reason: 'unknown_caller' };
  }

  // Score the phone number
  const score = await scorePhoneNumber(from);

  // Check robocall patterns
  if (spamSettings.blockRobocalls) {
    const isRobocallNumber =
      /^1?(800|888|877|866|855|844|833)\d{7}$/.test(normalized) ||
      score >= 40;
    if (isRobocallNumber) {
      return { isSpam: true, score: Math.max(score, 75), reason: 'robocall_pattern' };
    }
  }

  // Threshold based on sensitivity
  let threshold: number;
  switch (spamSettings.spamSensitivity) {
    case 'high':
      threshold = 30;
      break;
    case 'medium':
      threshold = 55;
      break;
    case 'low':
      threshold = 75;
      break;
    default:
      threshold = 55;
  }

  return {
    isSpam: score >= threshold,
    score,
    reason: score >= threshold ? 'spam_score' : 'clean',
  };
}
