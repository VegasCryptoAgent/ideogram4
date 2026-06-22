"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  Trash2,
  ShieldCheck,
  Lock,
  CreditCard,
  ArrowRight,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import MarketingNavbar from "@/components/marketing/navbar";
import MarketingFooter from "@/components/marketing/footer";

// ── Inline PhoneInput ─────────────────────────────────────────────────────────

function PhoneInput() {
  const [phone, setPhone] = useState("");

  const fmt = (raw: string) => {
    const d = raw.replace(/\D/g, "").slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  };

  return (
    <div className="flex items-center gap-0 max-w-sm">
      <div className="flex items-center gap-3 flex-1 bg-white border border-[#E5E0D5] rounded-l-2xl px-4 py-3.5 focus-within:border-[#1A1A14] transition-colors">
        <span className="text-base">🇺🇸</span>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(fmt(e.target.value))}
          placeholder="(555) 000-0000"
          className="flex-1 outline-none text-sm text-[#1A1A14] placeholder-[#1A1A14]/30 bg-transparent"
        />
      </div>
      <Link
        href={`/get-started${phone ? `?phone=${encodeURIComponent(phone)}` : ""}`}
        className="flex items-center gap-2 bg-[#F97316] hover:bg-[#EA6B0F] text-white font-semibold text-sm px-5 py-[15px] rounded-r-2xl transition-colors whitespace-nowrap"
      >
        Scan free
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ── Feature data ──────────────────────────────────────────────────────────────

const FEATURE_SECTIONS = [
  {
    id: "aliases",
    label: "Email & Phone Aliases",
    icon: Mail,
    iconColor: "text-[#F97316]",
    iconBg: "bg-[#F97316]/10",
    headline: "Create unlimited masked identities.",
    body: "Stop handing your real email and phone number to every app, store, and website. Shield generates unique aliases that forward to you — and when one gets spammy, delete it instantly.",
    bullets: [
      "Dedicated inbox per alias with full message forwarding",
      "Forward to any real email — works with Gmail, iCloud, Outlook",
      "Create a new alias in under 5 seconds",
      "Auto-delete alias after first use or on schedule",
    ],
    imageRight: true,
    mockup: "aliases",
  },
  {
    id: "removal",
    label: "Data Broker Removal",
    icon: Trash2,
    iconColor: "text-red-500",
    iconBg: "bg-red-500/10",
    headline: "We delete you from 400+ people-search sites.",
    body: "Data brokers sell your name, address, phone number, and relatives to anyone willing to pay. Shield automatically submits opt-out requests and re-scans every 30 days to keep you clean.",
    bullets: [
      "Automated re-scans every 30 days — removals don't last forever",
      "400+ brokers covered including Spokeo, WhitePages, Intelius",
      "Downloadable removal certificates for each site",
      "Full audit trail with before/after snapshots",
    ],
    imageRight: false,
    mockup: "removal",
  },
  {
    id: "callguard",
    label: "Spam Call Guard",
    icon: Phone,
    iconColor: "text-green-600",
    iconBg: "bg-green-500/10",
    headline: "Your phone only rings when it matters.",
    body: "Call Guard intercepts unknown callers, screens them with AI, and only puts real people through. Robocalls and scammers never reach you — they just hear a disconnected line.",
    bullets: [
      "AI call screening that asks callers to identify themselves",
      "Instant robocall and scam number detection",
      "Custom block lists and allow lists",
      "Spam reports shared across the Shield network",
    ],
    imageRight: true,
    mockup: "callguard",
  },
  {
    id: "darkweb",
    label: "Dark Web & Breach Monitoring",
    icon: ShieldCheck,
    iconColor: "text-purple-500",
    iconBg: "bg-purple-500/10",
    headline: "Know instantly if your data is leaked.",
    body: "Hackers constantly dump billions of records onto dark web forums. Shield monitors these feeds 24/7 and alerts you the moment your email, SSN, or passwords appear — with step-by-step remediation.",
    bullets: [
      "24/7 continuous dark web scanning across forums and marketplaces",
      "SSN and credit file monitoring with real-time alerts",
      "Breach alerts delivered in minutes, not days",
      "Guided remediation steps for every type of exposure",
    ],
    imageRight: false,
    mockup: "darkweb",
  },
  {
    id: "vault",
    label: "Password Manager",
    icon: Lock,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
    headline: "One vault, every identity.",
    body: "Pair unique passwords with every alias you create. Shield's built-in vault generates strong passwords, stores TOTP codes, and autofills everything in your browser — all encrypted with AES-256.",
    bullets: [
      "Per-identity password generation and storage",
      "TOTP 2FA codes built right into the vault",
      "AES-256 encryption with zero-knowledge architecture",
      "One-click browser autofill via Chrome and Safari extensions",
    ],
    imageRight: true,
    mockup: "vault",
  },
  {
    id: "cards",
    label: "Virtual Cards",
    icon: CreditCard,
    iconColor: "text-pink-500",
    iconBg: "bg-pink-500/10",
    headline: "Pay without exposing your real card.",
    body: "Coming soon — Shield virtual cards generate a unique masked card number for every merchant. Set spending limits, freeze cards instantly, and eliminate card theft from compromised sites.",
    bullets: [
      "Unique masked card number per merchant or subscription",
      "Per-card spending limits and category controls",
      "Instant card freeze from the app — no bank call needed",
      "No risk of real card theft from data breaches",
    ],
    imageRight: false,
    mockup: "cards",
    soon: true,
  },
];

const NUMBERS = [
  { value: "60M+", label: "calls screened" },
  { value: "400+", label: "brokers covered" },
  { value: "1.7B+", label: "records removed" },
  { value: "4M+", label: "users protected" },
];

// ── Mockup components ─────────────────────────────────────────────────────────

function AliasMockup() {
  return (
    <div className="bg-[#141410] rounded-2xl overflow-hidden border border-white/8 w-full max-w-sm mx-auto">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1E1E1A] border-b border-white/8">
        <div className="w-2 h-2 rounded-full bg-red-500/60" />
        <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
        <div className="w-2 h-2 rounded-full bg-green-500/60" />
        <div className="flex-1 text-center text-[10px] text-white/25 font-mono">My Identities</div>
      </div>
      <div className="p-4 space-y-2.5">
        {[
          { label: "Shopping alias", email: "shop.k9x2@shield.email", msgs: 3, color: "bg-[#F97316]" },
          { label: "Work contacts", email: "work.3pt7@shield.email", msgs: 0, color: "bg-blue-500" },
          { label: "Newsletters", email: "news.9xm1@shield.email", msgs: 12, color: "bg-purple-500" },
          { label: "Dating app", email: "date.7bq5@shield.email", msgs: 1, color: "bg-pink-500" },
        ].map(({ label, email, msgs, color }) => (
          <div key={label} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2.5 border border-white/6">
            <div className="flex items-center gap-2.5">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <div>
                <div className="text-white text-xs font-medium">{label}</div>
                <div className="text-white/35 text-[10px] font-mono">{email}</div>
              </div>
            </div>
            {msgs > 0 && (
              <div className="bg-[#F97316] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {msgs}
              </div>
            )}
          </div>
        ))}
        <button className="w-full border border-dashed border-white/15 rounded-xl py-2 text-white/30 text-xs hover:border-white/30 hover:text-white/50 transition-colors">
          + New alias
        </button>
      </div>
    </div>
  );
}

function RemovalMockup() {
  return (
    <div className="bg-[#141410] rounded-2xl overflow-hidden border border-white/8 w-full max-w-sm mx-auto">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1E1E1A] border-b border-white/8">
        <div className="w-2 h-2 rounded-full bg-red-500/60" />
        <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
        <div className="w-2 h-2 rounded-full bg-green-500/60" />
        <div className="flex-1 text-center text-[10px] text-white/25 font-mono">Broker Removals</div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-white/50 text-xs">39 of 47 removed</div>
          <div className="text-[#F97316] text-xs font-semibold">Last scan: 2h ago</div>
        </div>
        <div className="h-1.5 bg-white/8 rounded-full mb-4">
          <div className="h-full bg-gradient-to-r from-green-500 to-[#F97316] rounded-full" style={{ width: "83%" }} />
        </div>
        <div className="space-y-2">
          {[
            { name: "Spokeo", status: "removed", color: "text-green-400" },
            { name: "WhitePages", status: "removed", color: "text-green-400" },
            { name: "BeenVerified", status: "removed", color: "text-green-400" },
            { name: "Intelius", status: "removed", color: "text-green-400" },
            { name: "PeopleFinder", status: "pending", color: "text-[#F97316]" },
            { name: "FastPeopleSearch", status: "pending", color: "text-[#F97316]" },
          ].map(({ name, status, color }) => (
            <div key={name} className="flex items-center justify-between bg-white/4 rounded-lg px-3 py-2 border border-white/6">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${status === "removed" ? "bg-green-400" : "bg-[#F97316]"}`} />
                <span className="text-white/65 text-xs">{name}</span>
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-wide ${color}`}>
                {status === "removed" ? "Removed ✓" : "In progress"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CallGuardMockup() {
  return (
    <div className="bg-[#141410] rounded-2xl overflow-hidden border border-white/8 w-full max-w-sm mx-auto">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1E1E1A] border-b border-white/8">
        <div className="w-2 h-2 rounded-full bg-red-500/60" />
        <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
        <div className="w-2 h-2 rounded-full bg-green-500/60" />
        <div className="flex-1 text-center text-[10px] text-white/25 font-mono">Call Guard</div>
      </div>
      <div className="p-4 space-y-2">
        <div className="text-white/50 text-xs mb-3">Recent calls</div>
        {[
          { num: "(512) 555-0192", label: "Mom", time: "2m ago", status: "passed", badge: "Allowed" },
          { num: "(800) 346-7890", label: "Unknown", time: "14m ago", status: "blocked", badge: "Robocall" },
          { num: "(415) 789-1234", label: "Screened", time: "1h ago", status: "screened", badge: "Screened" },
          { num: "(900) 555-9999", label: "Scam likely", time: "3h ago", status: "blocked", badge: "Blocked" },
          { num: "(206) 900-1122", label: "Telemarketer", time: "5h ago", status: "blocked", badge: "Spam" },
        ].map(({ num, label, time, status, badge }) => (
          <div key={num} className="flex items-center justify-between bg-white/4 rounded-xl px-3 py-2.5 border border-white/6">
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                status === "passed" ? "bg-green-500/15" : status === "screened" ? "bg-[#F97316]/15" : "bg-red-500/15"
              }`}>
                <Phone className={`w-3 h-3 ${
                  status === "passed" ? "text-green-400" : status === "screened" ? "text-[#F97316]" : "text-red-400"
                }`} />
              </div>
              <div>
                <div className="text-white/75 text-xs font-medium">{label}</div>
                <div className="text-white/30 text-[10px] font-mono">{num}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                status === "passed"
                  ? "bg-green-500/15 text-green-400"
                  : status === "screened"
                  ? "bg-[#F97316]/15 text-[#F97316]"
                  : "bg-red-500/15 text-red-400"
              }`}>
                {badge}
              </div>
              <div className="text-white/25 text-[9px] mt-0.5">{time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DarkWebMockup() {
  return (
    <div className="bg-[#141410] rounded-2xl overflow-hidden border border-white/8 w-full max-w-sm mx-auto">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1E1E1A] border-b border-white/8">
        <div className="w-2 h-2 rounded-full bg-red-500/60" />
        <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
        <div className="w-2 h-2 rounded-full bg-green-500/60" />
        <div className="flex-1 text-center text-[10px] text-white/25 font-mono">Dark Web Monitor</div>
      </div>
      <div className="p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-red-400 text-xs font-semibold">New breach detected</div>
            <div className="text-white/50 text-[10px] mt-0.5">Your email was found in the "DataCorp Breach" — 2.1M records</div>
          </div>
        </div>
        <div className="space-y-2.5">
          {[
            { field: "Email address", value: "j***@gmail.com", risk: "high" },
            { field: "Password hash", value: "••••••••••••", risk: "high" },
            { field: "Phone number", value: "+1 (512) •••-••81", risk: "med" },
            { field: "Home address", value: "Austin, TX 787••", risk: "low" },
            { field: "SSN", value: "•••-••-7742", risk: "none" },
          ].map(({ field, value, risk }) => (
            <div key={field} className="flex items-center justify-between bg-white/4 rounded-lg px-3 py-2 border border-white/6">
              <div>
                <div className="text-white/40 text-[10px]">{field}</div>
                <div className="text-white/70 text-xs font-mono">{value}</div>
              </div>
              <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                risk === "high" ? "bg-red-500/15 text-red-400" :
                risk === "med" ? "bg-[#F97316]/15 text-[#F97316]" :
                risk === "low" ? "bg-yellow-500/15 text-yellow-400" :
                "bg-green-500/15 text-green-400"
              }`}>
                {risk === "none" ? "Safe" : risk === "low" ? "Low" : risk === "med" ? "Medium" : "Exposed"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VaultMockup() {
  const [shown, setShown] = useState(false);
  return (
    <div className="bg-[#141410] rounded-2xl overflow-hidden border border-white/8 w-full max-w-sm mx-auto">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1E1E1A] border-b border-white/8">
        <div className="w-2 h-2 rounded-full bg-red-500/60" />
        <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
        <div className="w-2 h-2 rounded-full bg-green-500/60" />
        <div className="flex-1 text-center text-[10px] text-white/25 font-mono">Password Vault</div>
      </div>
      <div className="p-4 space-y-2">
        <div className="text-white/40 text-[10px] mb-2">Linked to alias: shop.k9x2@shield.email</div>
        {[
          { site: "Amazon", user: "shop.k9x2@shield.email", pwd: "xK9#mLp2!rQv" },
          { site: "Netflix", user: "news.9xm1@shield.email", pwd: "Zt7&nBw3@cYq" },
          { site: "GitHub", user: "work.3pt7@shield.email", pwd: "Rj5$vWk8!mNx" },
        ].map(({ site, user, pwd }) => (
          <div key={site} className="bg-white/5 rounded-xl p-3 border border-white/8">
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-white/80 text-xs font-semibold">{site}</div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-green-500/15 rounded flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-green-400" />
                </div>
                <div className="text-[10px] text-green-400 font-medium">Strong</div>
              </div>
            </div>
            <div className="text-white/30 text-[10px] font-mono mb-1">{user}</div>
            <div className="flex items-center justify-between">
              <div className="text-white/50 text-[10px] font-mono">
                {shown ? pwd : "••••••••••••"}
              </div>
              <button
                onClick={() => setShown(!shown)}
                className="text-white/20 hover:text-white/50 transition-colors"
              >
                {shown ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardsMockup() {
  return (
    <div className="bg-[#141410] rounded-2xl overflow-hidden border border-white/8 w-full max-w-sm mx-auto">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1E1E1A] border-b border-white/8">
        <div className="w-2 h-2 rounded-full bg-red-500/60" />
        <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
        <div className="w-2 h-2 rounded-full bg-green-500/60" />
        <div className="flex-1 text-center text-[10px] text-white/25 font-mono">Virtual Cards</div>
      </div>
      <div className="p-4">
        <div className="bg-gradient-to-br from-[#F97316]/20 to-purple-500/20 rounded-2xl p-4 mb-4 border border-white/8 aspect-[1.6/1] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="text-white/60 text-xs font-semibold">Shield Virtual</div>
            <CreditCard className="w-5 h-5 text-white/40" />
          </div>
          <div>
            <div className="text-white font-mono text-sm tracking-[0.15em] mb-1">4785 •••• •••• 9214</div>
            <div className="flex items-center gap-4">
              <div>
                <div className="text-white/30 text-[9px] uppercase">Expires</div>
                <div className="text-white/60 text-xs font-mono">12/28</div>
              </div>
              <div>
                <div className="text-white/30 text-[9px] uppercase">Merchant</div>
                <div className="text-white/60 text-xs">Amazon only</div>
              </div>
              <div>
                <div className="text-white/30 text-[9px] uppercase">Limit</div>
                <div className="text-white/60 text-xs">$50/mo</div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { merchant: "Amazon", limit: "$50/mo", spent: "$34", active: true },
            { merchant: "Netflix", limit: "$20/mo", spent: "$15.99", active: true },
            { merchant: "Gym", limit: "$100/mo", spent: "$0", active: false },
          ].map(({ merchant, limit, spent, active }) => (
            <div key={merchant} className="flex items-center justify-between bg-white/4 rounded-lg px-3 py-2 border border-white/6">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${active ? "bg-green-400" : "bg-white/20"}`} />
                <span className="text-white/65 text-xs">{merchant}</span>
              </div>
              <div className="text-right">
                <div className="text-white/60 text-[10px]">{spent} of {limit}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const MOCKUP_MAP: Record<string, React.ReactNode> = {
  aliases: <AliasMockup />,
  removal: <RemovalMockup />,
  callguard: <CallGuardMockup />,
  darkweb: <DarkWebMockup />,
  vault: <VaultMockup />,
  cards: <CardsMockup />,
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#F5F2EC] overflow-x-hidden">
      <MarketingNavbar />

      {/* ── Hero ── */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 text-center bg-[#F5F2EC]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-[#F97316]/10 text-[#F97316] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            Full-stack privacy protection
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-[#1A1A14] font-serif leading-tight mb-5">
            Every tool you need to take back your privacy.
          </h1>
          <p className="text-[#1A1A14]/55 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Shield combines data removal, masked identities, spam blocking, and dark web monitoring into one privacy command center.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/plans"
              className="inline-flex items-center gap-2 bg-[#F97316] text-white font-semibold px-7 py-3.5 rounded-full hover:bg-[#EA6B0F] transition-colors text-sm"
            >
              See pricing
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="inline-flex items-center gap-2 border border-[#1A1A14]/20 text-[#1A1A14] font-medium px-7 py-3.5 rounded-full hover:border-[#1A1A14]/40 hover:bg-white transition-colors text-sm">
              Watch demo
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── Feature sections ── */}
      {FEATURE_SECTIONS.map((feat, i) => {
        const Icon = feat.icon;
        const isRight = feat.imageRight;

        return (
          <section
            key={feat.id}
            className={`py-20 px-4 sm:px-6 lg:px-8 ${i % 2 === 0 ? "bg-white" : "bg-[#F5F2EC]"}`}
          >
            <div className="max-w-6xl mx-auto">
              <div
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  isRight ? "" : "lg:[&>*:first-child]:order-2"
                }`}
              >
                {/* Text side */}
                <motion.div
                  initial={{ opacity: 0, x: isRight ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5 }}
                  className={isRight ? "" : "lg:order-2"}
                >
                  <div className={`w-11 h-11 rounded-xl ${feat.iconBg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${feat.iconColor}`} />
                  </div>

                  {feat.soon && (
                    <div className="inline-flex items-center gap-1.5 bg-[#1A1A14]/8 text-[#1A1A14]/60 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                      Coming soon
                    </div>
                  )}

                  <div className="text-xs font-semibold text-[#1A1A14]/40 uppercase tracking-wide mb-2">
                    {feat.label}
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A14] font-serif leading-tight mb-4">
                    {feat.headline}
                  </h2>

                  <p className="text-[#1A1A14]/60 text-base leading-relaxed mb-7">
                    {feat.body}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {feat.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${feat.iconBg}`}>
                          <Check className={`w-3 h-3 ${feat.iconColor}`} strokeWidth={2.5} />
                        </div>
                        <span className="text-sm text-[#1A1A14]/70 leading-snug">{b}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={feat.soon ? "/plans" : "/get-started"}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A1A14] border border-[#1A1A14]/20 px-5 py-2.5 rounded-full hover:bg-[#1A1A14] hover:text-white hover:border-[#1A1A14] transition-colors"
                  >
                    {feat.soon ? "Get notified" : "Learn more"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>

                {/* Visual side */}
                <motion.div
                  initial={{ opacity: 0, x: isRight ? 20 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className={`flex justify-center ${isRight ? "" : "lg:order-1"}`}
                >
                  <div className="w-full">
                    {MOCKUP_MAP[feat.mockup]}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        );
      })}

      {/* ── Numbers strip ── */}
      <section className="bg-[#141410] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white font-serif">
              Privacy at scale.
            </h2>
            <p className="text-white/45 text-sm mt-2">The numbers behind Shield.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {NUMBERS.map((n, i) => (
              <motion.div
                key={n.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-[#1E1E1A] border border-[#2C2C26] rounded-2xl p-6 text-center"
              >
                <div className="text-4xl font-black text-white font-serif mb-1">{n.value}</div>
                <div className="text-white/45 text-sm">{n.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA strip ── */}
      <section className="bg-[#F5F2EC] py-20 px-4 sm:px-6 lg:px-8 border-t border-[#E5E0D5]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-xl mx-auto text-center"
        >
          <h2 className="text-4xl font-bold text-[#1A1A14] font-serif mb-3">
            Start your free scan today.
          </h2>
          <p className="text-[#1A1A14]/55 text-base mb-7">
            See exactly who's selling your data and what they know about you.
          </p>
          <div className="flex justify-center mb-4">
            <PhoneInput />
          </div>
          <p className="text-[#1A1A14]/35 text-xs">
            No credit card required · No spam · Cancel anytime
          </p>
        </motion.div>
      </section>

      <MarketingFooter />
    </div>
  );
}
