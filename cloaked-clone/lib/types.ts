// ============================================================
// Shielded Privacy App — Shared TypeScript Types
// ============================================================

// --------------- Subscription / Billing ---------------

export type PlanId = "starter" | "pro" | "ultimate";

export interface Plan {
  id: PlanId;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  stripePriceId: string;
  description: string;
  features: string[];
  limits: {
    virtualPhones: number; // -1 = unlimited
    emailAliases: number;  // -1 = unlimited
    scanIntervalDays: number;
    brokerCoverage: number;
  };
  highlighted?: boolean;
}

// --------------- User ---------------

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  dateOfBirth: Date | null;
  image: string | null;
  realPhones: string[];
  privacyScore: number;
  lastScanAt: Date | null;
  onboardingDone: boolean;
  stripeCustomerId: string | null;
  subscriptionId: string | null;
  subscriptionStatus: SubscriptionStatus | null;
  planId: PlanId | null;
  trialEndsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "paused"
  | "trialing"
  | "unpaid";

// --------------- User Address ---------------

export interface UserAddress {
  id: string;
  userId: string;
  street: string | null;
  city: string;
  state: string;
  zip: string | null;
  country: string;
  isPrimary: boolean;
}

export interface UserAddressInput {
  street?: string;
  city: string;
  state: string;
  zip?: string;
  country?: string;
  isPrimary?: boolean;
}

// --------------- Virtual Phone ---------------

export interface VirtualPhone {
  id: string;
  userId: string;
  number: string;
  friendlyName: string | null;
  label: string | null;
  twilioSid: string | null;
  isActive: boolean;
  forwardTo: string | null;
  callsReceived: number;
  smsReceived: number;
  spamBlocked: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VirtualPhoneCreateInput {
  label?: string;
  areaCode?: string;
  forwardTo?: string;
}

// --------------- Email Alias ---------------

export interface EmailAlias {
  id: string;
  userId: string;
  alias: string;
  label: string | null;
  forwardTo: string;
  isActive: boolean;
  emailsReceived: number;
  spamBlocked: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailAliasCreateInput {
  label?: string;
  forwardTo?: string;
}

// --------------- Data Broker ---------------

export type BrokerCategory =
  | "people_search"
  | "background_check"
  | "marketing"
  | "credit_bureau"
  | "social_media"
  | "genealogy"
  | "business_intelligence"
  | "phone_directory"
  | "other";

export type OptOutMethod =
  | "web_form"
  | "email"
  | "mail"
  | "phone"
  | "automated";

export type BrokerDifficulty = "easy" | "medium" | "hard" | "very_hard";

export interface DataBroker {
  id: string;
  name: string;
  website: string;
  logoUrl: string | null;
  category: BrokerCategory;
  optOutUrl: string | null;
  optOutMethod: OptOutMethod;
  optOutEmail: string | null;
  scanUrlTemplate: string | null;
  difficulty: BrokerDifficulty;
  avgRemovalDays: number;
  isActive: boolean;
  priority: number;
}

// --------------- Broker Record ---------------

export type BrokerRecordStatus =
  | "scanning"
  | "found"
  | "not_found"
  | "opt_out_requested"
  | "opt_out_in_progress"
  | "removed"
  | "failed"
  | "monitoring";

export interface BrokerRecord {
  id: string;
  userId: string;
  brokerId: string;
  status: BrokerRecordStatus;
  foundUrl: string | null;
  foundData: Record<string, unknown> | null;
  requestedAt: Date | null;
  removedAt: Date | null;
  lastChecked: Date;
  createdAt: Date;
  updatedAt: Date;
  broker?: DataBroker;
}

export interface BrokerRecordWithBroker extends BrokerRecord {
  broker: DataBroker;
}

// --------------- Scan Job ---------------

export type ScanStatus =
  | "pending"
  | "running"
  | "paused"
  | "completed"
  | "failed";

export interface ScanJob {
  id: string;
  userId: string;
  status: ScanStatus;
  totalBrokers: number;
  scanned: number;
  found: number;
  removed: number;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  progressPercent?: number;
}

// --------------- Spam / Call Settings ---------------

export type SpamSensitivity = "low" | "medium" | "high";

export interface SpamSettings {
  id: string;
  userId: string;
  blockUnknownCallers: boolean;
  blockRobocalls: boolean;
  spamSensitivity: SpamSensitivity;
  whitelist: string[];
  blacklist: string[];
}

export interface SpamSettingsInput {
  blockUnknownCallers?: boolean;
  blockRobocalls?: boolean;
  spamSensitivity?: SpamSensitivity;
  whitelist?: string[];
  blacklist?: string[];
}

// --------------- Call Log ---------------

export type CallStatus =
  | "ringing"
  | "in-progress"
  | "completed"
  | "busy"
  | "failed"
  | "no-answer"
  | "canceled"
  | "blocked";

export interface CallLog {
  id: string;
  virtualPhoneId: string;
  from: string;
  to: string;
  duration: number | null;
  status: CallStatus;
  isSpam: boolean;
  spamScore: number | null;
  transcript: string | null;
  createdAt: Date;
}

// --------------- Notification ---------------

export type NotificationType =
  | "scan_complete"
  | "record_found"
  | "record_removed"
  | "breach_detected"
  | "call_blocked"
  | "alias_forwarded"
  | "subscription_renewed"
  | "subscription_expiring"
  | "system";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data: Record<string, unknown> | null;
  createdAt: Date;
}

// --------------- Breach Alert ---------------

export interface BreachAlert {
  id: string;
  userId: string;
  breachName: string;
  breachDate: Date | null;
  dataExposed: string[];
  isRead: boolean;
  sourceUrl: string | null;
  createdAt: Date;
}

// --------------- Privacy Score ---------------

export interface PrivacyScoreBreakdown {
  total: number; // 0–100
  brokerScore: number;
  aliasScore: number;
  phoneScore: number;
  breachScore: number;
  details: {
    totalBrokers: number;
    foundBrokers: number;
    removedBrokers: number;
    pendingBrokers: number;
    activeAliases: number;
    activePhones: number;
    unresolvedBreaches: number;
  };
}

// --------------- API Response Types ---------------

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// --------------- Dashboard Stats ---------------

export interface DashboardStats {
  privacyScore: number;
  totalBrokers: number;
  foundBrokers: number;
  removedBrokers: number;
  pendingRemoval: number;
  activePhones: number;
  activeAliases: number;
  spamBlocked: number;
  breachAlerts: number;
  lastScanAt: Date | null;
}

// --------------- Broker Seed Type (for data/brokers.ts) ---------------

export interface BrokerSeed {
  name: string;
  website: string;
  category: BrokerCategory;
  optOutUrl?: string | null;
  optOutMethod: OptOutMethod;
  optOutEmail?: string;
  scanUrlTemplate?: string | null;
  difficulty: BrokerDifficulty;
  avgRemovalDays: number;
  priority: number;
}
