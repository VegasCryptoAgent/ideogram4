import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, parseISO } from "date-fns";
import type { BrokerRecord, PrivacyScoreBreakdown } from "./types";

// --------------- Class utilities ---------------

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --------------- Privacy score ---------------

/**
 * Calculate a 0–100 privacy score from the user's broker records.
 *
 * Scoring logic:
 * - Start at 100
 * - Each "found" broker deducts points based on priority
 * - Removed brokers restore partial points
 * - Active aliases and phones add bonus points
 * - Unresolved breaches deduct points
 */
export function calculatePrivacyScore(
  brokerRecords: Pick<
    BrokerRecord,
    "status" | "brokerId"
  >[] = [],
  extras: {
    activeAliases?: number;
    activePhones?: number;
    unresolvedBreaches?: number;
  } = {}
): PrivacyScoreBreakdown {
  const totalBrokers = brokerRecords.length;
  const foundBrokers = brokerRecords.filter(
    (r) =>
      r.status === "found" ||
      r.status === "opt_out_requested" ||
      r.status === "opt_out_in_progress"
  ).length;
  const removedBrokers = brokerRecords.filter(
    (r) => r.status === "removed"
  ).length;
  const pendingBrokers = brokerRecords.filter(
    (r) =>
      r.status === "opt_out_requested" || r.status === "opt_out_in_progress"
  ).length;

  // Broker score (0–60 points)
  let brokerScore = 60;
  if (totalBrokers > 0) {
    const exposureRatio = foundBrokers / Math.max(totalBrokers, 1);
    brokerScore = Math.round(60 * (1 - exposureRatio * 0.8));
  }

  // Alias score (0–20 points): reward having active aliases
  const aliasCount = extras.activeAliases ?? 0;
  const aliasScore = Math.min(20, Math.round(aliasCount * 4));

  // Phone score (0–10 points): reward having active virtual phones
  const phoneCount = extras.activePhones ?? 0;
  const phoneScore = Math.min(10, Math.round(phoneCount * 5));

  // Breach score (10 base, deduct per breach)
  const breachCount = extras.unresolvedBreaches ?? 0;
  const breachScore = Math.max(0, 10 - breachCount * 5);

  const total = Math.min(
    100,
    Math.max(0, brokerScore + aliasScore + phoneScore + breachScore)
  );

  return {
    total,
    brokerScore,
    aliasScore,
    phoneScore,
    breachScore,
    details: {
      totalBrokers,
      foundBrokers,
      removedBrokers,
      pendingBrokers,
      activeAliases: aliasCount,
      activePhones: phoneCount,
      unresolvedBreaches: breachCount,
    },
  };
}

// --------------- Phone number helpers ---------------

/**
 * Format a phone number for display: e.g. "(415) 555-0100"
 */
export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    const local = digits.slice(1);
    return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

/**
 * Convert a phone number to E.164 format: e.g. "+14155550100"
 */
export function formatPhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return `+${digits}`;
}

/**
 * Combined formatter that returns both display and E.164.
 */
export function formatPhoneNumber(phone: string): {
  display: string;
  e164: string;
} {
  return {
    display: formatPhoneDisplay(phone),
    e164: formatPhoneE164(phone),
  };
}

// --------------- Email alias generation ---------------

/**
 * Generate a unique email alias.
 * Pattern: <label-slug>.<short-hash>@<domain>
 * Example: shopping.a3f9@shield.app
 */
export function generateEmailAlias(
  userId: string,
  label: string,
  domain: string
): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 20);

  // Generate a short hash from userId + timestamp
  const hash = hashShort(`${userId}-${Date.now()}`);

  return `${slug || "alias"}.${hash}@${domain}`;
}

function hashShort(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36).slice(0, 6);
}

// --------------- Avatar helpers ---------------

/**
 * Get initials from a full name or email.
 * "John Doe" → "JD", "johndoe@example.com" → "J"
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";

  const isEmail = name.includes("@");
  if (isEmail) return name[0].toUpperCase();

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

// --------------- Date utilities ---------------

/**
 * Format a Date or ISO string to "Jan 15, 2024"
 */
export function formatDate(
  date: Date | string | null | undefined,
  fmt = "MMM d, yyyy"
): string {
  if (!date) return "—";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, fmt);
  } catch {
    return "—";
  }
}

/**
 * Format a date as relative time: "3 hours ago", "2 days ago"
 */
export function formatRelativeTime(
  date: Date | string | null | undefined
): string {
  if (!date) return "—";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "—";
  }
}

// --------------- String utilities ---------------

/**
 * Truncate a string to a maximum length, appending "…" if needed.
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length - 1) + "…";
}

/**
 * Capitalize the first letter of each word.
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Convert a camelCase or snake_case string to Title Case with spaces.
 */
export function humanize(str: string): string {
  return str
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// --------------- Number utilities ---------------

/**
 * Format a number as currency: 9.99 → "$9.99"
 */
export function formatCurrency(
  amount: number,
  currency = "USD",
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format large numbers with commas: 1234567 → "1,234,567"
 */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

// --------------- Privacy score label ---------------

/**
 * Return a human-readable label and color class for a privacy score.
 */
export function getScoreLabel(score: number): {
  label: string;
  colorClass: string;
} {
  if (score >= 80)
    return { label: "Excellent", colorClass: "text-success-600" };
  if (score >= 60) return { label: "Good", colorClass: "text-warning-600" };
  if (score >= 40) return { label: "Fair", colorClass: "text-orange-500" };
  return { label: "At Risk", colorClass: "text-danger-600" };
}

// --------------- URL utilities ---------------

/**
 * Ensure a URL has the https:// scheme.
 */
export function ensureHttps(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

/**
 * Extract the domain from a URL: "https://www.spokeo.com/john-doe" → "spokeo.com"
 */
export function extractDomain(url: string): string {
  try {
    const u = new URL(ensureHttps(url));
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// --------------- Misc ---------------

/**
 * Sleep for N milliseconds (useful in background workers).
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a random alphanumeric string of a given length.
 */
export function randomString(length = 8): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

/**
 * Deep clone a serializable object.
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
