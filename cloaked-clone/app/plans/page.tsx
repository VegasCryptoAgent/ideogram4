"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Minus,
  ChevronDown,
  Star,
  Shield,
  Zap,
  Users,
  Heart,
  ArrowRight,
} from "lucide-react";
import MarketingNavbar from "@/components/marketing/navbar";
import MarketingFooter from "@/components/marketing/footer";

// ── Data ──────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    key: "free",
    name: "Free",
    badge: null,
    monthlyPrice: 0,
    annualPrice: 0,
    desc: "Start free, no card required.",
    icon: Shield,
    iconColor: "text-[#1A1A14]",
    iconBg: "bg-[#1A1A14]/8",
    dark: false,
    features: [
      "1 privacy scan per month",
      "3 email aliases",
      "1 virtual phone number",
      "Breach alert emails",
    ],
    cta: "Start for free",
    href: "/sign-up",
  },
  {
    key: "premium",
    name: "Premium",
    badge: "Most Popular",
    monthlyPrice: 9.99,
    annualPrice: 7.99,
    desc: "Full protection for one person.",
    icon: Zap,
    iconColor: "text-[#F97316]",
    iconBg: "bg-[#F97316]/15",
    dark: true,
    features: [
      "Unlimited scans & removals",
      "Unlimited email aliases",
      "3 virtual phone numbers",
      "Call Guard spam blocker",
      "Dark web & SSN monitoring",
      "Password manager",
      "Priority support",
    ],
    cta: "Start free trial",
    href: "/sign-up?plan=premium",
  },
  {
    key: "couple",
    name: "Couple",
    badge: "NEW",
    monthlyPrice: 12.99,
    annualPrice: 10.39,
    desc: "Full protection for you and one partner.",
    icon: Heart,
    iconColor: "text-pink-500",
    iconBg: "bg-pink-500/10",
    dark: false,
    features: [
      "Everything in Premium",
      "2 members included",
      "Shared dashboard",
      "Combined alias pool (unlimited)",
      "Shared virtual numbers (6 total)",
      "Family removal (both people)",
      "Priority support",
    ],
    cta: "Start Couple Trial",
    href: "/sign-up?plan=couple",
  },
  {
    key: "family",
    name: "Family",
    badge: "Best Value",
    monthlyPrice: 14.99,
    annualPrice: 11.99,
    desc: "Everything Premium, for your whole family.",
    icon: Users,
    iconColor: "text-[#1A1A14]",
    iconBg: "bg-[#1A1A14]/8",
    dark: false,
    features: [
      "Everything in Premium",
      "Up to 5 family members",
      "Shared family dashboard",
      "Shared broker removals",
      "Priority chat support",
    ],
    cta: "Start family trial",
    href: "/sign-up?plan=family",
  },
];

type CellValue = boolean | string;

const COMPARISON_ROWS: {
  feature: string;
  free: CellValue;
  premium: CellValue;
  couple: CellValue;
  family: CellValue;
}[] = [
  { feature: "Data broker removals", free: "1/month", premium: "Unlimited", couple: "Unlimited", family: "Unlimited" },
  { feature: "Email aliases", free: "3", premium: "Unlimited", couple: "Unlimited", family: "Unlimited" },
  { feature: "Phone numbers", free: "1", premium: "3", couple: "6 total", family: "3 per member" },
  { feature: "Spam call blocking", free: false, premium: true, couple: true, family: true },
  { feature: "Dark web monitoring", free: false, premium: true, couple: true, family: true },
  { feature: "SSN monitoring", free: false, premium: true, couple: true, family: true },
  { feature: "Password manager", free: false, premium: true, couple: true, family: true },
  { feature: "Identity insurance", free: false, premium: true, couple: true, family: true },
  { feature: "Virtual cards", free: false, premium: true, couple: true, family: true },
  { feature: "Shared dashboard", free: false, premium: false, couple: true, family: true },
  { feature: "Members included", free: "1", premium: "1", couple: "2", family: "Up to 5" },
];

const TESTIMONIALS = [
  {
    text: "I switched from a competitor and instantly got more features for half the price. The annual plan is a no-brainer.",
    name: "Rachel M.",
    location: "Austin, TX",
  },
  {
    text: "The family plan is incredible value. All 4 of us are protected and I've already seen my spam calls drop by 90%.",
    name: "David K.",
    location: "Chicago, IL",
  },
  {
    text: "Started on Free just to test it out. Upgraded to Premium the same week when I saw how many brokers had my info.",
    name: "Sandra T.",
    location: "Seattle, WA",
  },
];

const FAQS = [
  {
    q: "Is there really a free plan with no credit card required?",
    a: "Yes, absolutely. Our Free plan gives you a real privacy scan, 3 email aliases, and 1 virtual phone number with zero strings attached. No credit card, no trial period — just free.",
  },
  {
    q: "How does the annual billing discount work?",
    a: "When you choose annual billing, Premium drops from $9.99/month to $7.99/month (billed $95.88/year), Couple drops from $12.99/month to $10.39/month, and Family drops from $14.99/month to $11.99/month (billed $143.88/year). That's roughly 20% off compared to month-to-month.",
  },
  {
    q: "Can I cancel at any time?",
    a: "Yes. You can cancel your subscription at any time from your account settings. Monthly subscribers lose access at the end of their billing period. Annual subscribers receive a prorated refund for unused months.",
  },
  {
    q: "How does the free trial work?",
    a: "Premium, Couple, and Family come with a 7-day free trial. You'll enter your payment info upfront but won't be charged until the trial ends. Cancel any time during the trial and you pay nothing.",
  },
  {
    q: "What does the Family plan include exactly?",
    a: "The Family plan covers up to 5 members under a single subscription. Each member gets their own private dashboard, unlimited aliases, and full broker removal coverage. You also get a shared family dashboard to oversee everyone's protection from one place.",
  },
  {
    q: "What's the difference between Couple and Family?",
    a: "The Couple plan covers exactly 2 people and shares a combined alias pool and 6 virtual phone numbers. The Family plan covers up to 5 people, each with 3 virtual numbers, plus a shared family oversight dashboard.",
  },
  {
    q: "Is my payment information secure?",
    a: "All payments are processed through Stripe, a PCI DSS Level 1 certified payment processor. Shield never stores your raw card data. Your payment information is encrypted end-to-end.",
  },
];

// ── Cell renderer ─────────────────────────────────────────────────────────────

function ComparisonCell({ value }: { value: CellValue }) {
  if (value === true) {
    return (
      <div className="flex justify-center">
        <div className="w-6 h-6 rounded-full bg-[#F97316]/10 flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-[#F97316]" strokeWidth={2.5} />
        </div>
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="flex justify-center">
        <Minus className="w-4 h-4 text-[#1A1A14]/20" />
      </div>
    );
  }
  return (
    <div className="text-center text-sm text-[#1A1A14]/70 font-medium">{value}</div>
  );
}

// ── FAQ Item ──────────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#E5E0D5] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[#F5F2EC] transition-colors"
      >
        <span className="text-[#1A1A14] font-semibold text-sm pr-4">{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-[#1A1A14]/40 flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="px-6 pb-5 text-sm text-[#1A1A14]/60 leading-relaxed border-t border-[#E5E0D5] pt-4">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PlansPage() {
  const [annual, setAnnual] = useState(true);

  return (
    <div className="min-h-screen bg-[#F5F2EC] overflow-x-hidden">
      <MarketingNavbar />

      {/* ── Hero ── */}
      <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 bg-[#F97316]/10 text-[#F97316] text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <Shield className="w-3.5 h-3.5" />
            Trusted by 4M+ Americans
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-[#1A1A14] font-serif leading-tight mb-4">
            Simple, transparent pricing.
          </h1>
          <p className="text-[#1A1A14]/55 text-lg max-w-lg mx-auto">
            No hidden fees. No surprises. Start free and upgrade when you're ready.
          </p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex items-center justify-center gap-4 mt-8"
        >
          <span className={`text-sm font-medium transition-colors ${!annual ? "text-[#1A1A14]" : "text-[#1A1A14]/40"}`}>
            Monthly
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-12 h-6 rounded-full transition-colors ${annual ? "bg-[#F97316]" : "bg-[#1A1A14]/20"}`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${annual ? "translate-x-7" : "translate-x-1"}`}
            />
          </button>
          <span className={`text-sm font-medium transition-colors ${annual ? "text-[#1A1A14]" : "text-[#1A1A14]/40"}`}>
            Annual
          </span>
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
            Save 20%
          </span>
        </motion.div>

        {/* Competitive advantage banner */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="inline-flex items-center gap-2 mt-5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-4 py-2 rounded-full"
        >
          <Check className="w-3.5 h-3.5 text-green-600" strokeWidth={2.5} />
          Unlike Cloaked — all plans include working virtual cards from day one. No waitlist.
        </motion.div>
      </section>

      {/* ── Plan Cards ── */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map((plan, i) => {
            const Icon = plan.icon;
            const price = annual ? plan.annualPrice : plan.monthlyPrice;
            const crossedPrice = annual && plan.monthlyPrice > 0 ? plan.monthlyPrice : null;

            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 + i * 0.1 }}
                className={`relative rounded-3xl p-7 border flex flex-col ${
                  plan.dark
                    ? "bg-[#141410] border-[#F97316]/25 shadow-2xl shadow-black/30"
                    : "bg-white border-[#E5E0D5]"
                } ${i === 1 ? "sm:-mt-4 sm:mb-4" : ""}`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap ${
                      plan.badge === "Most Popular"
                        ? "bg-[#F97316] text-white"
                        : plan.badge === "NEW"
                        ? "bg-pink-500 text-white"
                        : "bg-[#1A1A14] text-white"
                    }`}
                  >
                    {plan.badge}
                  </div>
                )}

                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl ${plan.iconBg} flex items-center justify-center mb-5`}>
                  <Icon className={`w-5 h-5 ${plan.dark ? "text-[#F97316]" : plan.iconColor}`} />
                </div>

                {/* Name + desc */}
                <div className="mb-1">
                  <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${plan.dark ? "text-[#F97316]" : "text-[#1A1A14]/50"}`}>
                    {plan.name}
                  </div>
                  <div className={`text-xs leading-relaxed ${plan.dark ? "text-white/50" : "text-[#1A1A14]/50"}`}>
                    {plan.desc}
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-end gap-1.5 mt-4 mb-6">
                  <span className={`text-5xl font-black font-serif ${plan.dark ? "text-white" : "text-[#1A1A14]"}`}>
                    {price === 0 ? "$0" : `$${price.toFixed(2)}`}
                  </span>
                  {price > 0 && (
                    <div className="mb-2">
                      <div className={`text-sm ${plan.dark ? "text-white/40" : "text-[#1A1A14]/40"}`}>/mo</div>
                      {crossedPrice && (
                        <div className="text-xs text-[#1A1A14]/30 line-through">${crossedPrice.toFixed(2)}/mo</div>
                      )}
                    </div>
                  )}
                  {price === 0 && (
                    <div className={`text-sm mb-2 ${plan.dark ? "text-white/40" : "text-[#1A1A14]/40"}`}>/mo</div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 flex-1 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${plan.dark ? "bg-[#F97316]/15" : "bg-[#F97316]/10"}`}>
                        <Check className="w-3 h-3 text-[#F97316]" strokeWidth={2.5} />
                      </div>
                      <span className={`text-sm ${plan.dark ? "text-white/75" : "text-[#1A1A14]/70"}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.href}
                  className={`block w-full text-center py-3.5 rounded-xl font-semibold text-sm transition-colors ${
                    plan.dark
                      ? "bg-[#F97316] text-white hover:bg-[#EA6B0F]"
                      : plan.key === "couple"
                      ? "bg-pink-500 text-white hover:bg-pink-600"
                      : "bg-[#141410] text-white hover:bg-black"
                  }`}
                >
                  {plan.cta}
                </Link>

                {plan.key !== "free" && (
                  <p className={`text-center text-xs mt-3 ${plan.dark ? "text-white/30" : "text-[#1A1A14]/35"}`}>
                    7-day free trial · Cancel anytime
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Comparison Table ── */}
      <section className="bg-white border-y border-[#E5E0D5] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold text-[#1A1A14] font-serif mb-2">Compare plans</h2>
            <p className="text-[#1A1A14]/55 text-sm">Everything you need to make the right choice.</p>
          </motion.div>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr>
                  <th className="text-left pb-4 pl-4 sm:pl-0 text-xs font-semibold text-[#1A1A14]/40 uppercase tracking-wide">
                    Feature
                  </th>
                  {PLANS.map((p) => (
                    <th key={p.key} className="pb-4 text-center">
                      <div className={`text-sm font-bold ${p.dark ? "text-[#F97316]" : p.key === "couple" ? "text-pink-500" : "text-[#1A1A14]"}`}>
                        {p.name}
                      </div>
                      <div className="text-xs text-[#1A1A14]/40 mt-0.5">
                        {p.annualPrice === 0 ? "Free" : `$${p.annualPrice}/mo`}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-t border-[#F0EDE8] ${i % 2 === 0 ? "bg-[#FAFAF8]" : "bg-white"}`}
                  >
                    <td className="py-3.5 pl-4 sm:pl-0 text-sm text-[#1A1A14]/70 font-medium">{row.feature}</td>
                    <td className="py-3.5 px-4">
                      <ComparisonCell value={row.free} />
                    </td>
                    <td className="py-3.5 px-4">
                      <ComparisonCell value={row.premium} />
                    </td>
                    <td className="py-3.5 px-4">
                      <ComparisonCell value={row.couple} />
                    </td>
                    <td className="py-3.5 px-4">
                      <ComparisonCell value={row.family} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F5F2EC]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold text-[#1A1A14] font-serif mb-2">
              People love Shield
            </h2>
            <div className="flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-[#F97316] fill-current" />
              ))}
              <span className="ml-2 text-sm text-[#1A1A14]/50">4.8 · 12,000+ reviews</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="bg-white border border-[#E5E0D5] rounded-2xl p-6"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 text-[#F97316] fill-current" />
                  ))}
                </div>
                <p className="text-[#1A1A14]/70 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div>
                  <div className="text-sm font-semibold text-[#1A1A14]">{t.name}</div>
                  <div className="text-xs text-[#1A1A14]/40">{t.location}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F5F2EC] border-t border-[#E5E0D5]">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold text-[#1A1A14] font-serif mb-2">
              Frequently asked questions
            </h2>
            <p className="text-[#1A1A14]/55 text-sm">
              Have another question?{" "}
              <Link href="/contact-us" className="text-[#F97316] hover:underline">
                Contact us
              </Link>
            </p>
          </motion.div>

          <div className="space-y-3">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="bg-[#141410] py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="w-14 h-14 bg-[#F97316]/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-7 h-7 text-[#F97316]" fill="currentColor" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white font-serif leading-tight mb-4">
            Ready to take back your privacy?
          </h2>
          <p className="text-white/55 text-base mb-8">
            Join 4 million Americans who've already reclaimed control of their personal data.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/get-started"
              className="inline-flex items-center justify-center gap-2 bg-[#F97316] text-white font-semibold px-7 py-4 rounded-full hover:bg-[#EA6B0F] transition-colors text-sm"
            >
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sign-up?plan=premium"
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white font-medium px-7 py-4 rounded-full hover:border-white/40 transition-colors text-sm"
            >
              Start 7-day free trial
            </Link>
          </div>
          <p className="text-white/30 text-xs mt-5">No credit card required to start · Cancel anytime</p>
        </motion.div>
      </section>

      <MarketingFooter />
    </div>
  );
}
