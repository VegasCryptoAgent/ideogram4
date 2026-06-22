"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Shield,
  Phone,
  Mail,
  Bell,
  Lock,
  Trash2,
  Globe,
  CreditCard,
  Eye,
  Zap,
  ChevronDown,
  CheckCircle,
  Star,
  Menu,
  X,
  ArrowRight,
  Users,
  Database,
  ShieldCheck,
} from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Mail,
    title: "Email & Phone Aliases",
    desc: "Generate unlimited masked emails and numbers. Sign up anywhere without exposing your real identity — every alias has its own dedicated inbox.",
    soon: false,
  },
  {
    icon: Trash2,
    title: "Data Broker Removal",
    desc: "We scrub your personal info from 400+ people-search sites and data brokers — automatically, on an ongoing basis.",
    soon: false,
  },
  {
    icon: Phone,
    title: "Spam Call Guard",
    desc: "AI-powered call screening intercepts robocalls and scammers before your phone rings. Legitimate callers always get through.",
    soon: false,
  },
  {
    icon: Bell,
    title: "Dark Web Monitoring",
    desc: "Continuous scanning of breach databases. The moment your info surfaces, you get an instant alert with next steps.",
    soon: false,
  },
  {
    icon: CheckCircle,
    title: "$1M Identity Insurance",
    desc: "Up to $1,000,000 in financial loss coverage with 24/7 live agents ready to restore your identity and credit.",
    soon: true,
  },
  {
    icon: Globe,
    title: "VPN & Private Browsing",
    desc: "WireGuard-encrypted connections across 50+ global locations. Your IP, location, and traffic stay invisible.",
    soon: true,
  },
  {
    icon: Lock,
    title: "Password Manager",
    desc: "Create and autofill unique passwords for every site, tied to each of your masked identities.",
    soon: false,
  },
  {
    icon: CreditCard,
    title: "Virtual Payment Cards",
    desc: "Pay with masked cards that have per-merchant spending limits. Merchants see a burner number — never your real card.",
    soon: true,
  },
];

const STEPS = [
  {
    num: "01",
    icon: Eye,
    title: "Scan your exposure",
    desc: "We search 400+ data broker sites using your name, phone, and email to reveal exactly where your personal data is listed and sold.",
  },
  {
    num: "02",
    icon: Trash2,
    title: "Remove your records",
    desc: "Our automated agents submit removal requests to every broker that has your data — and re-submit when they relist it months later.",
  },
  {
    num: "03",
    icon: Shield,
    title: "Stay protected",
    desc: "Aliases route all future contact through Shield. Scammers and trackers hit a dead end while you stay in full control.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    desc: "See your risk. No credit card required.",
    features: ["1 privacy scan", "3 email aliases", "1 virtual phone number", "Basic breach alerts"],
    cta: "Start Free",
    href: "/sign-up",
    highlight: false,
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "/mo",
    desc: "Full protection for individuals.",
    features: [
      "Unlimited scans & removals",
      "Unlimited email aliases",
      "3 virtual phone numbers",
      "Spam call guard",
      "Dark web monitoring",
      "Password manager",
    ],
    cta: "Start Free Trial",
    href: "/sign-up?plan=premium",
    highlight: true,
  },
  {
    name: "Family",
    price: "$14.99",
    period: "/mo",
    desc: "Protect up to 5 people.",
    features: [
      "Everything in Premium",
      "Up to 5 members",
      "Shared family dashboard",
      "Priority support",
    ],
    cta: "Start Family Trial",
    href: "/sign-up?plan=family",
    highlight: false,
  },
];

const TESTIMONIALS = [
  {
    name: "Marcus T.",
    role: "Software Engineer",
    text: "Within a week Shield had removed my info from 40+ broker sites I didn't even know existed. The alias system is genuinely life-changing for inbox zero.",
    stars: 5,
  },
  {
    name: "Priya K.",
    role: "Small Business Owner",
    text: "I've been using privacy tools for years. Shield is the first one that actually shows you real-time proof the removals are working.",
    stars: 5,
  },
  {
    name: "James L.",
    role: "Freelancer",
    text: "My spam calls dropped by 80% in the first month. The virtual numbers are seamless — clients never notice anything different.",
    stars: 5,
  },
];

const FAQS = [
  {
    q: "How much does it cost?",
    a: "Free plan includes 1 scan and 3 aliases — no credit card, no expiry. Premium is $9.99/mo for unlimited scans, all aliases, and call protection. Family plan is $14.99/mo for up to 5 people.",
  },
  {
    q: "After my data is deleted, how long before brokers re-list it?",
    a: "Most brokers re-list within 30–90 days from new data sources. Shield re-scans automatically and files removal requests again whenever you reappear — no action needed from you.",
  },
  {
    q: "Why do you need my phone number to scan?",
    a: "We use your number as a search query — the same way someone looking you up would. Without it, we can't find your listings. Your number is encrypted, never sold, and you can delete it any time.",
  },
  {
    q: "What if the scan shows the wrong person?",
    a: "Click \"Not me\" on any result and it's excluded immediately. No support ticket, no delay. We only count listings that genuinely match you.",
  },
  {
    q: "Will call blocking make me miss important calls?",
    a: "No. Shield's call guard is conservative by design — it only screens numbers matching known spam patterns. Unknown callers ring through normally. You can disable it with one toggle.",
  },
  {
    q: "Do these removals actually work?",
    a: "Yes, though results vary by broker. Some remove data within 24 hours; others take 45 days. Your dashboard shows exactly which brokers have confirmed removal and which are still pending.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#E8E3D9]">

      {/* Announcement banner */}
      <div className="bg-[#F97316] text-white text-sm text-center py-2.5 px-4 font-medium">
        Shield Beta — free privacy scan, no credit card.{" "}
        <Link href="/sign-up" className="font-bold underline underline-offset-2 hover:no-underline">
          Get started free →
        </Link>
      </div>

      {/* Navbar */}
      <nav className="bg-[#E8E3D9]/95 backdrop-blur-sm border-b border-[#D4CFC5] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-[#1A1A14]" fill="currentColor" />
            <span className="text-lg font-bold text-[#1A1A14] font-serif">Shield</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {(
              [
                ["#features", "Features"],
                ["#how-it-works", "How It Works"],
                ["#pricing", "Pricing"],
                ["#faq", "FAQ"],
              ] as [string, string][]
            ).map(([href, label]) => (
              <a key={label} href={href} className="text-sm text-[#1A1A14]/60 hover:text-[#1A1A14] transition-colors font-medium">
                {label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/sign-in" className="text-sm text-[#1A1A14]/60 hover:text-[#1A1A14] transition-colors px-3 py-2 font-medium">
              Sign In
            </Link>
            <Link href="/sign-up" className="text-sm font-semibold bg-[#1A1A14] text-white px-5 py-2.5 rounded-full hover:bg-black transition-colors">
              Get Started Free
            </Link>
          </div>

          <button className="md:hidden p-2 text-[#1A1A14]" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-[#E8E3D9] border-t border-[#D4CFC5] px-4 pb-4">
            {([["#features", "Features"], ["#how-it-works", "How It Works"], ["#pricing", "Pricing"], ["#faq", "FAQ"]] as [string, string][]).map(
              ([href, label]) => (
                <a key={label} href={href} className="block py-3 text-[#1A1A14]/70 border-b border-[#D4CFC5] last:border-0 text-sm font-medium" onClick={() => setMobileOpen(false)}>
                  {label}
                </a>
              )
            )}
            <div className="flex gap-3 pt-4">
              <Link href="/sign-in" className="flex-1 text-center py-2.5 border border-[#1A1A14]/30 rounded-full text-sm font-medium text-[#1A1A14]">
                Sign In
              </Link>
              <Link href="/sign-up" className="flex-1 text-center py-2.5 bg-[#1A1A14] text-white rounded-full text-sm font-semibold">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="bg-[#141410] pt-20 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto mb-14"
          >
            <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 text-white/70 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-wide">
              <span className="w-1.5 h-1.5 bg-[#F97316] rounded-full animate-pulse" />
              PRIVACY PROTECTION · 400+ DATA BROKERS MONITORED
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] text-white mb-6 font-serif">
              Safeguard your{" "}
              <span className="text-[#F97316]">online privacy.</span>
            </h1>

            <p className="text-white/55 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
              Shield removes your personal data from broker databases, replaces your real identity with secure aliases, and alerts you the moment criminals get your info.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 bg-[#F97316] text-white font-semibold px-8 py-4 rounded-full hover:bg-[#EA6B0F] transition-colors text-base shadow-lg shadow-[#F97316]/25"
              >
                Start Free — No Card Required <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 bg-white/8 text-white font-semibold px-8 py-4 rounded-full border border-white/15 hover:bg-white/12 transition-colors text-base"
              >
                See How It Works
              </a>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-white/40 text-sm">
              {[
                { icon: ShieldCheck, label: "End-to-end encrypted" },
                { icon: Database, label: "400+ brokers monitored" },
                { icon: Users, label: "10,000+ users protected" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[#F97316]" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="bg-[#1E1E1A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-w-4xl mx-auto"
          >
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-[#141410]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4 bg-white/6 rounded-md px-3 py-1 text-xs text-white/30 text-center">
                app.shield.com/dashboard
              </div>
            </div>
            {/* Dashboard preview content */}
            <div className="p-5 grid grid-cols-3 gap-3">
              {[
                { label: "Brokers Found", value: "47", sub: "Active monitoring", color: "text-red-400" },
                { label: "Removals Done", value: "39", sub: "↑ 5 this week", color: "text-green-400" },
                { label: "Privacy Score", value: "72", sub: "At Risk → Protected", color: "text-[#F97316]" },
              ].map(({ label, value, sub, color }) => (
                <div key={label} className="bg-white/5 rounded-xl p-4 border border-white/8">
                  <div className="text-white/40 text-xs mb-1">{label}</div>
                  <div className={`text-2xl font-black ${color} mb-0.5`}>{value}</div>
                  <div className="text-white/25 text-xs">{sub}</div>
                </div>
              ))}
              <div className="col-span-3 bg-white/5 rounded-xl p-4 border border-white/8">
                <div className="text-white/40 text-xs mb-3">Recent Removals</div>
                <div className="space-y-2">
                  {[
                    { broker: "Spokeo", time: "2 min ago", done: true },
                    { broker: "WhitePages", time: "15 min ago", done: true },
                    { broker: "BeenVerified", time: "1 hour ago", done: true },
                  ].map(({ broker, time, done }) => (
                    <div key={broker} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                        <span className="text-white/70 text-xs">{broker}</span>
                      </div>
                      <span className="text-white/30 text-xs">{time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-[#E5E0D5] py-6 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "400+", label: "Data brokers monitored" },
            { value: "10K+", label: "Users protected" },
            { value: "500K+", label: "Records removed" },
            { value: "99.2%", label: "Removal success rate" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl font-black text-[#1A1A14] font-serif">{value}</div>
              <div className="text-xs text-[#1A1A14]/50 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-[#E8E3D9] py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#1A1A14] mb-4 font-serif">
              Everything you need to stay private.
            </h2>
            <p className="text-[#1A1A14]/60 max-w-xl mx-auto leading-relaxed">
              One platform to remove your past, protect your present, and secure your future.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc, soon }) => (
              <div key={title} className="bg-white border border-[#E5E0D5] rounded-2xl p-5 hover:border-[#F97316]/30 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 flex items-center justify-center mb-4 group-hover:bg-[#F97316]/20 transition-colors">
                  <Icon className="w-5 h-5 text-[#F97316]" />
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="font-bold text-[#1A1A14] text-sm">{title}</h3>
                  {soon && (
                    <span className="text-xs bg-[#F97316]/10 text-[#F97316] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                      SOON
                    </span>
                  )}
                </div>
                <p className="text-[#1A1A14]/55 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-[#141410] py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 font-serif">
              How Shield works.
            </h2>
            <p className="text-white/50 max-w-xl mx-auto leading-relaxed">
              Three steps to take back control of your personal data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STEPS.map(({ num, icon: Icon, title, desc }, i) => (
              <div key={title} className="relative bg-[#1E1E1A] border border-[#2C2C26] rounded-2xl p-6">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[#F97316]/15 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#F97316]" />
                  </div>
                  <span className="text-5xl font-black text-white/6 leading-none font-serif">{num}</span>
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 z-10">
                    <ArrowRight className="w-5 h-5 text-[#F97316]/40" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-[#E8E3D9] py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#1A1A14] mb-4 font-serif">
              Simple, transparent pricing.
            </h2>
            <p className="text-[#1A1A14]/60 max-w-xl mx-auto leading-relaxed">
              No hidden fees, no bait-and-switch. Start free and upgrade when you're ready.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {PLANS.map(({ name, price, period, desc, features, cta, href, highlight }) => (
              <div
                key={name}
                className={`rounded-2xl p-6 border relative ${
                  highlight
                    ? "bg-[#141410] border-[#F97316]/30 shadow-xl shadow-[#F97316]/10"
                    : "bg-white border-[#E5E0D5]"
                }`}
              >
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F97316] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    MOST POPULAR
                  </div>
                )}
                <div className="mb-5">
                  <div className={`text-sm font-semibold mb-1 ${highlight ? "text-[#F97316]" : "text-[#1A1A14]"}`}>{name}</div>
                  <div className={`flex items-end gap-0.5 mb-1 ${highlight ? "text-white" : "text-[#1A1A14]"}`}>
                    <span className="text-4xl font-black font-serif">{price}</span>
                    <span className="text-sm mb-1.5 opacity-50">{period}</span>
                  </div>
                  <div className={`text-xs ${highlight ? "text-white/50" : "text-[#1A1A14]/50"}`}>{desc}</div>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${highlight ? "text-[#F97316]" : "text-[#F97316]"}`} />
                      <span className={`text-sm ${highlight ? "text-white/75" : "text-[#1A1A14]/70"}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={href}
                  className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                    highlight
                      ? "bg-[#F97316] text-white hover:bg-[#EA6B0F]"
                      : "bg-[#1A1A14] text-white hover:bg-black"
                  }`}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#1A1A14] mb-4 font-serif">
              Real people. Real results.
            </h2>
            <p className="text-[#1A1A14]/60 max-w-xl mx-auto leading-relaxed">
              Privacy protection that actually works — and users who can prove it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, role, text, stars }) => (
              <div key={name} className="bg-[#E8E3D9] border border-[#D4CFC5] rounded-2xl p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#F97316] fill-current" />
                  ))}
                </div>
                <p className="text-[#1A1A14]/75 text-sm leading-relaxed mb-4">"{text}"</p>
                <div>
                  <div className="text-sm font-semibold text-[#1A1A14]">{name}</div>
                  <div className="text-xs text-[#1A1A14]/45">{role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-[#E8E3D9] py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#1A1A14] mb-4 font-serif">
              Questions, answered.
            </h2>
            <p className="text-[#1A1A14]/50">
              Straight answers — including the uncomfortable ones.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map(({ q, a }, i) => (
              <div key={i} className="bg-white border border-[#E5E0D5] rounded-xl overflow-hidden">
                <button
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[#FAFAF8] transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium text-[#1A1A14] text-sm sm:text-base pr-4">{q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#1A1A14]/40 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-[#1A1A14]/60 text-sm leading-relaxed">{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#141410] py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 bg-[#F97316]/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-7 h-7 text-[#F97316]" fill="currentColor" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 font-serif">
            Your data is being sold right now.
          </h2>
          <p className="text-white/50 mb-10 leading-relaxed text-lg max-w-xl mx-auto">
            Data brokers are making money off your home address, phone number, and daily habits. Shield removes the supply and alerts you to the rest.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 bg-[#F97316] text-white font-semibold px-8 py-4 rounded-full hover:bg-[#EA6B0F] transition-colors shadow-lg shadow-[#F97316]/25"
            >
              Start Free — No Card Required <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center bg-transparent text-white font-semibold px-8 py-4 rounded-full border border-white/20 hover:border-white/40 transition-colors"
            >
              Sign In
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-white/30 text-sm">
            {["End-to-end encrypted", "Never sells your data", "Cancel anytime"].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-white/20" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0E0E0A] border-t border-white/6 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-white" fill="currentColor" />
                <span className="text-white font-bold font-serif">Shield</span>
              </Link>
              <p className="text-white/30 text-xs max-w-xs leading-relaxed">
                Privacy protection that actually works. Remove your data from 400+ brokers and stay protected 24/7.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-12 gap-y-6">
              {[
                { heading: "Product", links: ["Features", "Pricing", "How It Works", "Status"] },
                { heading: "Company", links: ["About", "Blog", "Careers", "Press"] },
                { heading: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy"] },
              ].map(({ heading, links }) => (
                <div key={heading}>
                  <div className="text-white/60 text-xs font-semibold mb-3 tracking-wide uppercase">{heading}</div>
                  <ul className="space-y-2">
                    {links.map((l) => (
                      <li key={l}>
                        <a href="#" className="text-white/30 text-xs hover:text-white/60 transition-colors">{l}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-white/6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/25">© 2026 Shield Privacy, Inc. All rights reserved.</p>
            <p className="text-xs text-white/20">Not affiliated with Cloaked, Inc.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
