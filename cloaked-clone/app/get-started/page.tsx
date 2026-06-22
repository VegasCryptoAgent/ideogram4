"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ArrowRight,
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Zap,
  Users,
  ChevronRight,
} from "lucide-react";

// ── Step tracker data ────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: "Scan your number" },
  { num: 2, label: "Create your account" },
  { num: 3, label: "Choose your plan" },
];

// ── Plan options ──────────────────────────────────────────────────────────────

const PLANS = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    period: "/mo",
    desc: "Start free, no card required.",
    features: ["1 scan per month", "3 email aliases", "1 phone number", "Breach alerts"],
    cta: "Start for free",
    href: "/sign-up",
    highlight: false,
    badge: null,
    icon: Shield,
  },
  {
    key: "premium",
    name: "Premium",
    price: "$7.99",
    period: "/mo",
    desc: "Full protection. Cancel anytime.",
    features: ["Unlimited scans & removals", "Unlimited email aliases", "3 virtual numbers", "Spam call guard", "Dark web monitoring"],
    cta: "Start free trial",
    href: "/sign-up?plan=premium",
    highlight: true,
    badge: "Most Popular",
    icon: Zap,
  },
  {
    key: "family",
    name: "Family",
    price: "$11.99",
    period: "/mo",
    desc: "Protect everyone you love.",
    features: ["Everything in Premium", "Up to 5 members", "Family dashboard", "Shared removals"],
    cta: "Start family trial",
    href: "/sign-up?plan=family",
    highlight: false,
    badge: "Best Value",
    icon: Users,
  },
];

// ── PhoneInput ────────────────────────────────────────────────────────────────

function PhoneInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const fmt = (raw: string) => {
    const d = raw.replace(/\D/g, "").slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  };

  return (
    <div className="flex items-center bg-white border border-[#D4CFC5] rounded-2xl overflow-hidden focus-within:border-[#1A1A14] transition-colors shadow-sm">
      <div className="flex items-center gap-3 px-4 py-4 flex-1">
        <span className="text-xl">🇺🇸</span>
        <input
          type="tel"
          value={value}
          onChange={(e) => onChange(fmt(e.target.value))}
          placeholder="(555) 000-0000"
          className="flex-1 outline-none text-lg text-[#1A1A14] placeholder-[#1A1A14]/25 bg-transparent font-medium"
          autoFocus
        />
      </div>
    </div>
  );
}

// ── Step 1: Scan ──────────────────────────────────────────────────────────────

function StepScan({ onNext }: { onNext: (phone: string) => void }) {
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length >= 10) {
      onNext(phone);
    }
  };

  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
    >
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-[#F97316]/10 text-[#F97316] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          Free privacy scan
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-[#1A1A14] font-serif leading-tight mb-3">
          See who's selling your data.
        </h1>
        <p className="text-[#1A1A14]/55 text-base leading-relaxed">
          Enter your phone number for a free privacy scan. We check 400+ data broker databases and tell you exactly what they know about you. Takes 30 seconds.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PhoneInput value={phone} onChange={setPhone} />

        <button
          type="submit"
          disabled={phone.replace(/\D/g, "").length < 10}
          className="w-full flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#EA6B0F] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-2xl transition-colors shadow-lg shadow-[#F97316]/20"
        >
          Scan my number free
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>

      <p className="text-[#1A1A14]/35 text-xs text-center mt-4">
        No spam. No credit card. Just your results.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4 mt-8 pt-6 border-t border-[#E5E0D5]">
        {["🔒 SOC 2 Compliant", "✓ BBB Accredited", "⭐ 4.8 rated"].map((b) => (
          <span key={b} className="text-xs text-[#1A1A14]/45 font-medium">{b}</span>
        ))}
      </div>

      <p className="text-center text-xs text-[#1A1A14]/40 mt-6">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-[#F97316] hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}

// ── Step 2: Account ───────────────────────────────────────────────────────────

function StepAccount({
  phone,
  onNext,
  onBack,
}: {
  phone: string;
  onNext: () => void;
  onBack: () => void;
}) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [showPwd, setShowPwd] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const valid =
    form.firstName.length > 0 &&
    form.lastName.length > 0 &&
    form.email.includes("@") &&
    form.password.length >= 8;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (valid) onNext();
  };

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-[#1A1A14]/45 hover:text-[#1A1A14] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="mb-7">
        <h1 className="text-4xl font-bold text-[#1A1A14] font-serif leading-tight mb-2">
          Protect your identity in minutes.
        </h1>
        <p className="text-[#1A1A14]/55 text-sm">
          Scanning{" "}
          <span className="font-semibold text-[#1A1A14]/80 font-mono">{phone}</span>
          {" "}— create an account to see your results.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#1A1A14]/55 mb-1.5 uppercase tracking-wide">
              First name
            </label>
            <input
              type="text"
              value={form.firstName}
              onChange={set("firstName")}
              placeholder="Jane"
              autoFocus
              className="w-full bg-white border border-[#D4CFC5] rounded-xl px-4 py-3 text-sm text-[#1A1A14] placeholder-[#1A1A14]/30 outline-none focus:border-[#1A1A14] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1A1A14]/55 mb-1.5 uppercase tracking-wide">
              Last name
            </label>
            <input
              type="text"
              value={form.lastName}
              onChange={set("lastName")}
              placeholder="Doe"
              className="w-full bg-white border border-[#D4CFC5] rounded-xl px-4 py-3 text-sm text-[#1A1A14] placeholder-[#1A1A14]/30 outline-none focus:border-[#1A1A14] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1A1A14]/55 mb-1.5 uppercase tracking-wide">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="jane@example.com"
            className="w-full bg-white border border-[#D4CFC5] rounded-xl px-4 py-3 text-sm text-[#1A1A14] placeholder-[#1A1A14]/30 outline-none focus:border-[#1A1A14] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1A1A14]/55 mb-1.5 uppercase tracking-wide">
            Password
          </label>
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              value={form.password}
              onChange={set("password")}
              placeholder="Min. 8 characters"
              className="w-full bg-white border border-[#D4CFC5] rounded-xl px-4 py-3 pr-11 text-sm text-[#1A1A14] placeholder-[#1A1A14]/30 outline-none focus:border-[#1A1A14] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A14]/30 hover:text-[#1A1A14]/60 transition-colors"
            >
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {form.password.length > 0 && (
            <div className="flex gap-1.5 mt-2">
              {[1, 2, 3, 4].map((lvl) => (
                <div
                  key={lvl}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    form.password.length >= lvl * 3
                      ? lvl <= 2
                        ? "bg-[#F97316]"
                        : "bg-green-500"
                      : "bg-[#E5E0D5]"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!valid}
          className="w-full flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#EA6B0F] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-2xl transition-colors mt-2 shadow-lg shadow-[#F97316]/20"
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>

      <div className="relative flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-[#E5E0D5]" />
        <span className="text-xs text-[#1A1A14]/35 font-medium">or continue with</span>
        <div className="flex-1 h-px bg-[#E5E0D5]" />
      </div>

      <button className="w-full flex items-center justify-center gap-3 border border-[#D4CFC5] bg-white hover:bg-[#F5F2EC] text-[#1A1A14] font-medium text-sm py-3.5 rounded-2xl transition-colors">
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </button>

      <p className="text-center text-xs text-[#1A1A14]/35 mt-5 leading-relaxed">
        By creating an account you agree to our{" "}
        <Link href="#" className="underline hover:text-[#1A1A14]/60">Terms of Service</Link>
        {" "}and{" "}
        <Link href="#" className="underline hover:text-[#1A1A14]/60">Privacy Policy</Link>.
      </p>
    </motion.div>
  );
}

// ── Step 3: Plan ──────────────────────────────────────────────────────────────

function StepPlan({ onBack }: { onBack: () => void }) {
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-[#1A1A14]/45 hover:text-[#1A1A14] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="mb-7">
        <h1 className="text-3xl font-bold text-[#1A1A14] font-serif leading-tight mb-2">
          Choose your plan.
        </h1>
        <p className="text-[#1A1A14]/55 text-sm">
          Start free or unlock full protection. Upgrade or cancel anytime.
        </p>
      </div>

      <div className="space-y-3">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.key}
              className={`relative rounded-2xl border p-5 ${
                plan.highlight
                  ? "bg-[#141410] border-[#F97316]/30"
                  : "bg-white border-[#E5E0D5]"
              }`}
            >
              {plan.badge && (
                <div
                  className={`absolute -top-3 left-5 text-xs font-bold px-3 py-1 rounded-full ${
                    plan.badge === "Most Popular"
                      ? "bg-[#F97316] text-white"
                      : "bg-[#1A1A14] text-white"
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${plan.highlight ? "bg-[#F97316]/15" : "bg-[#1A1A14]/6"}`}>
                  <Icon className={`w-5 h-5 ${plan.highlight ? "text-[#F97316]" : "text-[#1A1A14]"}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className={`font-bold text-base ${plan.highlight ? "text-white" : "text-[#1A1A14]"}`}>
                      {plan.name}
                    </span>
                    <span className={`text-xl font-black font-serif ${plan.highlight ? "text-white" : "text-[#1A1A14]"}`}>
                      {plan.price}
                    </span>
                    <span className={`text-xs ${plan.highlight ? "text-white/40" : "text-[#1A1A14]/40"}`}>
                      {plan.period}
                    </span>
                  </div>
                  <p className={`text-xs mb-3 ${plan.highlight ? "text-white/50" : "text-[#1A1A14]/50"}`}>
                    {plan.desc}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-1.5">
                        <Check className={`w-3 h-3 flex-shrink-0 ${plan.highlight ? "text-[#F97316]" : "text-[#F97316]"}`} strokeWidth={2.5} />
                        <span className={`text-xs ${plan.highlight ? "text-white/65" : "text-[#1A1A14]/60"}`}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={plan.href}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-colors ${
                      plan.highlight
                        ? "bg-[#F97316] text-white hover:bg-[#EA6B0F]"
                        : "bg-[#1A1A14] text-white hover:bg-black"
                    }`}
                  >
                    {plan.cta}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-5">
        <Link
          href="/sign-up"
          className="text-sm text-[#1A1A14]/45 hover:text-[#1A1A14] transition-colors inline-flex items-center gap-1"
        >
          Continue with free plan
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}

// ── Sidebar step tracker ──────────────────────────────────────────────────────

function Sidebar({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-12">
        <Shield className="w-7 h-7 text-[#1A1A14]" fill="currentColor" />
        <span className="text-xl font-bold text-[#1A1A14] font-serif">Shield</span>
      </Link>

      {/* Steps */}
      <div className="space-y-0">
        {STEPS.map((step, i) => {
          const isComplete = step.num < currentStep;
          const isActive = step.num === currentStep;
          const isUpcoming = step.num > currentStep;
          const isLast = i === STEPS.length - 1;

          return (
            <div key={step.num} className="flex gap-4">
              {/* Line + dot */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                    isComplete
                      ? "bg-green-500 border-green-500"
                      : isActive
                      ? "bg-white border-[#F97316] shadow-md shadow-[#F97316]/20"
                      : "bg-white border-[#D4CFC5]"
                  }`}
                >
                  {isComplete ? (
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                  ) : isActive ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
                  ) : (
                    <span className="text-xs font-bold text-[#1A1A14]/30">{step.num}</span>
                  )}
                </div>
                {!isLast && (
                  <div className={`w-0.5 h-10 my-1 rounded-full ${isComplete ? "bg-green-300" : "bg-[#E5E0D5]"}`} />
                )}
              </div>

              {/* Label */}
              <div className="pb-10 pt-0.5">
                <div
                  className={`text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-[#1A1A14]"
                      : isComplete
                      ? "text-green-600"
                      : "text-[#1A1A14]/35"
                  }`}
                >
                  {step.label}
                </div>
                {isActive && (
                  <div className="text-xs text-[#1A1A14]/40 mt-0.5">
                    Step {step.num} of {STEPS.length}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom trust badges */}
      <div className="mt-auto pt-8 space-y-2">
        {["🔒 SOC 2 Compliant", "✓ No data sold", "⭐ 4.8 rated"].map((b) => (
          <div key={b} className="text-xs text-[#1A1A14]/40 font-medium">{b}</div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function GetStartedPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [phone, setPhone] = useState("");

  const handleScanNext = (p: string) => {
    setPhone(p);
    setCurrentStep(2);
  };

  const handleAccountNext = () => setCurrentStep(3);
  const handleBack = () => setCurrentStep((s) => Math.max(1, s - 1));

  return (
    <div className="min-h-screen bg-[#F5F2EC] flex flex-col lg:flex-row">
      {/* ── Sidebar (desktop) ── */}
      <div className="hidden lg:flex lg:w-72 xl:w-80 bg-white border-r border-[#E5E0D5] flex-shrink-0 p-8 xl:p-10">
        <Sidebar currentStep={currentStep} />
      </div>

      {/* ── Mobile top bar ── */}
      <div className="lg:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-[#E5E0D5]">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#1A1A14]" fill="currentColor" />
          <span className="font-bold text-[#1A1A14] font-serif">Shield</span>
        </Link>
        <div className="flex items-center gap-2">
          {STEPS.map((s) => (
            <div
              key={s.num}
              className={`w-2 h-2 rounded-full transition-colors ${
                s.num < currentStep
                  ? "bg-green-500"
                  : s.num === currentStep
                  ? "bg-[#F97316]"
                  : "bg-[#D4CFC5]"
              }`}
            />
          ))}
        </div>
        <div className="text-xs text-[#1A1A14]/45 font-medium">
          Step {currentStep} of {STEPS.length}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex items-start lg:items-center justify-center px-5 sm:px-8 py-10 lg:py-0">
        <div className="w-full max-w-lg">
          {/* Back to home — top left on desktop */}
          <div className="hidden lg:flex items-center gap-1.5 mb-8">
            <Link
              href="/"
              className="text-xs text-[#1A1A14]/40 hover:text-[#1A1A14] transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Shield.com
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <StepScan key="scan" onNext={handleScanNext} />
            )}
            {currentStep === 2 && (
              <StepAccount key="account" phone={phone} onNext={handleAccountNext} onBack={handleBack} />
            )}
            {currentStep === 3 && (
              <StepPlan key="plan" onBack={handleBack} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Right illustration panel (desktop only, step 1 only) ── */}
      {currentStep === 1 && (
        <div className="hidden xl:flex xl:w-96 bg-[#141410] flex-shrink-0 flex-col justify-center px-10 py-16 gap-5">
          <div className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-2">
            What we scan for
          </div>

          {[
            { icon: "🗂️", label: "Data broker listings", count: "400+ sites", color: "text-[#F97316]" },
            { icon: "🔍", label: "Dark web mentions", count: "Millions of records", color: "text-purple-400" },
            { icon: "📞", label: "Spam call registries", count: "50+ databases", color: "text-green-400" },
            { icon: "🔐", label: "Breach databases", count: "14B+ records", color: "text-blue-400" },
            { icon: "📍", label: "Location data brokers", count: "200+ sources", color: "text-pink-400" },
          ].map(({ icon, label, count, color }) => (
            <div key={label} className="flex items-center gap-4 bg-white/5 border border-white/8 rounded-xl px-4 py-3">
              <span className="text-xl">{icon}</span>
              <div className="flex-1">
                <div className="text-white/75 text-sm font-medium">{label}</div>
                <div className={`text-xs font-semibold ${color}`}>{count}</div>
              </div>
            </div>
          ))}

          <div className="mt-4 bg-[#F97316]/10 border border-[#F97316]/20 rounded-xl px-4 py-3">
            <div className="text-white font-semibold text-sm mb-1">Average result:</div>
            <div className="text-[#F97316] font-black text-3xl font-serif">47</div>
            <div className="text-white/50 text-xs">data brokers holding your info</div>
          </div>
        </div>
      )}
    </div>
  );
}
