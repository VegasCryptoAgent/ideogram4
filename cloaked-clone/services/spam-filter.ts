// ============================================================
// Shielded Privacy App — Spam Filter Service
// ============================================================
import type { SpamSettings } from '@prisma/client';

// Known spam phone number prefixes / area codes
const SPAM_AREA_CODES = new Set([
  '641', '712', '515', '218', '209', '559', '661', '714', '760', '805',
  '818', '909', '951', '310', '323', '213', '424', '747', '626', '562',
]);

const ROBOCALL_PATTERNS = [
  /^1?800\d{7}$/,
  /^1?888\d{7}$/,
  /^1?877\d{7}$/,
  /^1?866\d{7}$/,
  /^1?855\d{7}$/,
  /^1?844\d{7}$/,
  /^1?833\d{7}$/,
];

const SPAM_PHONE_KEYWORDS = [
  '000-000-0000',
  '999-999-9999',
  '123-456-7890',
];

// Known spam email patterns
const SPAM_EMAIL_DOMAINS = new Set([
  'guerrillamail.com', 'mailinator.com', 'tempmail.com', 'throwam.com',
  'maildrop.cc', 'yopmail.com', 'dispostable.com', 'trashmail.com',
  'sharklasers.com', 'guerrillamailblock.com', 'grr.la', 'spam4.me',
  '0815.ru', '0wnd.net', '0wnd.org', '10minutemail.com', '20minutemail.com',
  'mailnull.com', 'spamgourmet.com', 'spamgourmet.net', 'notsharingmy.info',
]);

const SPAM_SUBJECT_PATTERNS = [
  /\b(free|win|winner|prize|congratulations|urgent|act now|limited time|offer expires)\b/i,
  /\b(click here|click now|subscribe|unsubscribe|remove me)\b/i,
  /\b(earn money|make money|work from home|cash|income|financial freedom)\b/i,
  /\b(viagra|cialis|pharmacy|medication|prescri?ption|drugs?)\b/i,
  /\b(lottery|jackpot|gambling|casino|bet)\b/i,
  /\b(verify your account|confirm your|account suspended|unusual activity)\b/i,
  /\b(security alert|password reset|unauthorized access)\b/i,
  /\b(crypto|bitcoin|nft|invest(ment)?|trading)\b/i,
  /\b(loan|mortgage|refinanc|debt|credit score)\b/i,
  /\b(weight loss|diet|fat burn|keto|slim)\b/i,
  /!{2,}/, // Multiple exclamation marks
  /\$\d{3,}/, // Dollar amounts
  /FREE[^A-Za-z]/, // FREE in caps
];

const SPAM_BODY_PATTERNS = [
  /\b(click (here|below|this link)|click to (claim|verify|confirm|access))\b/i,
  /\b(unsubscribe|opt.?out|remove from list)\b/i,
  /\b(this (email|message) was sent to)\b/i,
  /\b(you (have|'ve) been selected|you (are|'re) a winner)\b/i,
  /\b(act (now|fast|immediately|today)|limited time offer)\b/i,
  /https?:\/\/[^\s]{60,}/, // Very long URLs
  /(.)\1{5,}/, // Repeated characters
];

/**
 * Score a phone number for spam likelihood (0–100).
 * Higher = more likely spam.
 */
export async function scorePhoneNumber(number: string): Promise<number> {
  let score = 0;

  // Normalize number
  const normalized = number.replace(/\D/g, '');

  // Check for known spam patterns
  for (const literal of SPAM_PHONE_KEYWORDS) {
    if (number.includes(literal)) {
      score += 70;
      break;
    }
  }

  // Check robocall patterns
  for (const pattern of ROBOCALL_PATTERNS) {
    if (pattern.test(normalized)) {
      score += 40;
      break;
    }
  }

  // Check spam area codes
  const areaCode = normalized.startsWith('1') ? normalized.slice(1, 4) : normalized.slice(0, 3);
  if (SPAM_AREA_CODES.has(areaCode)) {
    score += 15;
  }

  // Check for suspicious number patterns
  if (/^(.)\1+$/.test(normalized)) {
    // All same digits
    score += 60;
  }

  if (normalized === '0000000000' || normalized === '1111111111') {
    score += 80;
  }

  // Too short or too long
  if (normalized.length < 10 || normalized.length > 15) {
    score += 20;
  }

  // International numbers from high-spam regions
  if (normalized.startsWith('234') || normalized.startsWith('355') || normalized.startsWith('675')) {
    score += 25;
  }

  return Math.min(100, score);
}

/**
 * Score an email for spam likelihood (0–100).
 * Higher = more likely spam.
 */
export async function scoreEmail(
  email: string,
  subject: string,
  content: string
): Promise<number> {
  let score = 0;

  // Check email domain
  const domain = email.split('@')[1]?.toLowerCase() ?? '';
  if (SPAM_EMAIL_DOMAINS.has(domain)) {
    score += 60;
  }

  // Suspicious local-part patterns
  const localPart = email.split('@')[0] ?? '';
  if (/^\d{8,}$/.test(localPart)) {
    // All digits — unusual for real senders
    score += 20;
  }
  if (/[+]{2,}/.test(localPart)) {
    score += 10;
  }

  // Subject line analysis
  let subjectHits = 0;
  for (const pattern of SPAM_SUBJECT_PATTERNS) {
    if (pattern.test(subject)) {
      subjectHits++;
    }
  }
  score += Math.min(50, subjectHits * 12);

  // Body analysis
  let bodyHits = 0;
  for (const pattern of SPAM_BODY_PATTERNS) {
    if (pattern.test(content)) {
      bodyHits++;
    }
  }
  score += Math.min(40, bodyHits * 10);

  // Check for HTML-heavy emails with minimal text
  const textLength = content.replace(/<[^>]+>/g, '').trim().length;
  const htmlLength = content.length;
  if (htmlLength > 500 && textLength < htmlLength * 0.1) {
    score += 15; // More HTML than text — typical spam
  }

  // Check for suspicious link density
  const linkCount = (content.match(/https?:\/\//g) || []).length;
  if (linkCount > 5) {
    score += Math.min(20, (linkCount - 5) * 3);
  }

  // ALL CAPS subject
  if (subject === subject.toUpperCase() && subject.length > 5) {
    score += 15;
  }

  return Math.min(100, score);
}

/**
 * Check if a contact is in the whitelist.
 */
export function isInWhitelist(contact: string, whitelist: string[]): boolean {
  const normalized = contact.toLowerCase().trim();
  return whitelist.some((entry) => {
    const e = entry.toLowerCase().trim();
    // Wildcard domain match: @example.com
    if (e.startsWith('@')) {
      return normalized.endsWith(e);
    }
    return normalized === e;
  });
}

/**
 * Check if a contact is in the blacklist.
 */
export function isInBlacklist(contact: string, blacklist: string[]): boolean {
  const normalized = contact.toLowerCase().trim();
  return blacklist.some((entry) => {
    const e = entry.toLowerCase().trim();
    if (e.startsWith('@')) {
      return normalized.endsWith(e);
    }
    return normalized === e;
  });
}

/**
 * Determine if a call/email should be blocked given the spam score, settings, and contact.
 */
export function shouldBlock(
  score: number,
  settings: SpamSettings,
  contact: string
): boolean {
  // Whitelist always wins
  if (isInWhitelist(contact, settings.whitelist)) {
    return false;
  }

  // Blacklist always blocks
  if (isInBlacklist(contact, settings.blacklist)) {
    return true;
  }

  // Determine score threshold based on sensitivity
  let threshold: number;
  switch (settings.spamSensitivity) {
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

  // Block unknown callers if enabled and number is unrecognized
  const normalizedContact = contact.replace(/\D/g, '');
  const isUnknown = normalizedContact === '' || normalizedContact.length < 7;
  if (settings.blockUnknownCallers && isUnknown) {
    return true;
  }

  // Block based on score threshold
  return score >= threshold;
}
