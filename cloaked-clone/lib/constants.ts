import type {
  BrokerCategory,
  PlanId,
  SpamSensitivity,
} from "./types";

// --------------- Subscription Plans ---------------

export const PLAN_IDS: PlanId[] = ["starter", "pro", "ultimate"];

export const PLAN_PRICES: Record<PlanId, { monthly: number; annual: number }> =
  {
    starter: { monthly: 4.99, annual: 3.99 },
    pro: { monthly: 9.99, annual: 7.99 },
    ultimate: { monthly: 19.99, annual: 15.99 },
  };

export const SCAN_INTERVAL_DAYS: Record<PlanId, number> = {
  starter: 30,
  pro: 7,
  ultimate: 1,
};

export const MAX_VIRTUAL_PHONES: Record<PlanId, number> = {
  starter: 1,
  pro: 3,
  ultimate: -1, // -1 = unlimited
};

export const MAX_EMAIL_ALIASES: Record<PlanId, number> = {
  starter: 5,
  pro: 10,
  ultimate: -1, // -1 = unlimited
};

export const BROKER_COVERAGE: Record<PlanId, number> = {
  starter: 50,
  pro: 150,
  ultimate: 200,
};

// --------------- Broker Categories ---------------

export const BROKER_CATEGORIES: Array<{
  id: BrokerCategory;
  label: string;
  description: string;
}> = [
  {
    id: "people_search",
    label: "People Search",
    description: "Sites that aggregate public records about individuals",
  },
  {
    id: "background_check",
    label: "Background Check",
    description: "Services providing criminal, financial, and identity checks",
  },
  {
    id: "marketing",
    label: "Marketing & Advertising",
    description: "Data brokers that sell personal data for targeted advertising",
  },
  {
    id: "credit_bureau",
    label: "Credit Bureau",
    description: "Agencies that collect and report credit and financial data",
  },
  {
    id: "social_media",
    label: "Social Media",
    description: "Platforms that collect and may share user profile data",
  },
  {
    id: "genealogy",
    label: "Genealogy",
    description: "Family history and ancestry research platforms",
  },
  {
    id: "business_intelligence",
    label: "Business Intelligence",
    description: "B2B platforms that aggregate professional and business data",
  },
  {
    id: "phone_directory",
    label: "Phone Directory",
    description: "Reverse phone lookup and directory services",
  },
  {
    id: "other",
    label: "Other",
    description: "Miscellaneous data collectors and aggregators",
  },
];

// --------------- Spam Sensitivity ---------------

export const SPAM_SENSITIVITY_LEVELS: Array<{
  id: SpamSensitivity;
  label: string;
  description: string;
}> = [
  {
    id: "low",
    label: "Low",
    description:
      "Only block confirmed spam numbers. Fewer false positives.",
  },
  {
    id: "medium",
    label: "Medium",
    description:
      "Block likely spam calls. Balanced between protection and accessibility.",
  },
  {
    id: "high",
    label: "High",
    description:
      "Block all suspicious callers. May block some legitimate calls.",
  },
];

// --------------- US States ---------------

export const US_STATES: Array<{ abbreviation: string; name: string }> = [
  { abbreviation: "AL", name: "Alabama" },
  { abbreviation: "AK", name: "Alaska" },
  { abbreviation: "AZ", name: "Arizona" },
  { abbreviation: "AR", name: "Arkansas" },
  { abbreviation: "CA", name: "California" },
  { abbreviation: "CO", name: "Colorado" },
  { abbreviation: "CT", name: "Connecticut" },
  { abbreviation: "DE", name: "Delaware" },
  { abbreviation: "FL", name: "Florida" },
  { abbreviation: "GA", name: "Georgia" },
  { abbreviation: "HI", name: "Hawaii" },
  { abbreviation: "ID", name: "Idaho" },
  { abbreviation: "IL", name: "Illinois" },
  { abbreviation: "IN", name: "Indiana" },
  { abbreviation: "IA", name: "Iowa" },
  { abbreviation: "KS", name: "Kansas" },
  { abbreviation: "KY", name: "Kentucky" },
  { abbreviation: "LA", name: "Louisiana" },
  { abbreviation: "ME", name: "Maine" },
  { abbreviation: "MD", name: "Maryland" },
  { abbreviation: "MA", name: "Massachusetts" },
  { abbreviation: "MI", name: "Michigan" },
  { abbreviation: "MN", name: "Minnesota" },
  { abbreviation: "MS", name: "Mississippi" },
  { abbreviation: "MO", name: "Missouri" },
  { abbreviation: "MT", name: "Montana" },
  { abbreviation: "NE", name: "Nebraska" },
  { abbreviation: "NV", name: "Nevada" },
  { abbreviation: "NH", name: "New Hampshire" },
  { abbreviation: "NJ", name: "New Jersey" },
  { abbreviation: "NM", name: "New Mexico" },
  { abbreviation: "NY", name: "New York" },
  { abbreviation: "NC", name: "North Carolina" },
  { abbreviation: "ND", name: "North Dakota" },
  { abbreviation: "OH", name: "Ohio" },
  { abbreviation: "OK", name: "Oklahoma" },
  { abbreviation: "OR", name: "Oregon" },
  { abbreviation: "PA", name: "Pennsylvania" },
  { abbreviation: "RI", name: "Rhode Island" },
  { abbreviation: "SC", name: "South Carolina" },
  { abbreviation: "SD", name: "South Dakota" },
  { abbreviation: "TN", name: "Tennessee" },
  { abbreviation: "TX", name: "Texas" },
  { abbreviation: "UT", name: "Utah" },
  { abbreviation: "VT", name: "Vermont" },
  { abbreviation: "VA", name: "Virginia" },
  { abbreviation: "WA", name: "Washington" },
  { abbreviation: "WV", name: "West Virginia" },
  { abbreviation: "WI", name: "Wisconsin" },
  { abbreviation: "WY", name: "Wyoming" },
  { abbreviation: "DC", name: "District of Columbia" },
];

// --------------- App Constants ---------------

export const APP_NAME = "Shielded";
export const APP_TAGLINE = "Your Privacy, Protected.";
export const APP_DOMAIN = "shielded.app";
export const EMAIL_ALIAS_DOMAIN =
  process.env.EMAIL_ALIAS_DOMAIN ?? "shield.app";

export const TRIAL_DAYS = 7;

export const PRIVACY_SCORE_THRESHOLDS = {
  excellent: 80,
  good: 60,
  fair: 40,
  atRisk: 0,
} as const;

export const DEFAULT_SPAM_SENSITIVITY: SpamSensitivity = "medium";

export const MAX_ONBOARDING_ADDRESSES = 3;
export const MAX_ONBOARDING_PHONES = 5;

// --------------- Broker Status Labels ---------------

export const BROKER_STATUS_LABELS: Record<string, string> = {
  scanning: "Scanning",
  found: "Found",
  not_found: "Not Found",
  opt_out_requested: "Opt-Out Requested",
  opt_out_in_progress: "Processing",
  removed: "Removed",
  failed: "Failed",
  monitoring: "Monitoring",
};

export const BROKER_STATUS_COLORS: Record<string, string> = {
  scanning: "text-blue-500",
  found: "text-danger-600",
  not_found: "text-success-600",
  opt_out_requested: "text-warning-600",
  opt_out_in_progress: "text-warning-500",
  removed: "text-success-600",
  failed: "text-danger-500",
  monitoring: "text-primary-500",
};

// --------------- Navigation ---------------

export const DASHBOARD_NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: "LayoutDashboard" },
  { href: "/dashboard/brokers", label: "Data Brokers", icon: "Database" },
  { href: "/dashboard/phone", label: "Phone", icon: "Phone" },
  { href: "/dashboard/email", label: "Email Aliases", icon: "Mail" },
  { href: "/dashboard/breaches", label: "Breach Alerts", icon: "ShieldAlert" },
  { href: "/dashboard/settings", label: "Settings", icon: "Settings" },
] as const;
