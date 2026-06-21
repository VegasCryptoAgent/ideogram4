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
  RefreshCw,
  Activity,
  BarChart2,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────────────

const THREATS = [
  {
    title: "Scammers & Fraudsters",
    desc: "They prey on your trust. Leaked data powers hyper-realistic AI voice scams and deepfakes designed to trick you out of your savings.",
  },
  {
    title: "Identity Thieves",
    desc: "They hijack your future. Exposed SSNs and personal info let criminals drain accounts, open fake loans, and wreck your credit overnight.",
  },
  {
    title: "Data Aggregators & Brokers",
    desc: "They profit from your safety. These companies quietly harvest your habits and sell your home address and family profile to anyone who pays.",
  },
];

const STEPS = [
  {
    num: "1",
    icon: Trash2,
    title: "Clean your past exposure",
    desc: "We wipe your personal info from broker databases — destroying the inventory that gets sold to scammers, spammers, and bad actors.",
  },
  {
    num: "2",
    icon: Shield,
    title: "Defend your present",
    desc: "Aliases block spam and phishing at the source. When breaches happen, fraudsters find disconnected junk instead of your real profile.",
  },
  {
    num: "3",
    icon: Lock,
    title: "Protect your future",
    desc: "With 24/7 breach monitoring and instant alerts — plus $1M identity insurance coming soon — you'll know the moment criminals get your data.",
  },
];

const FEATURES = [
  { icon: Mail,         title: "Email & Phone Aliases",    desc: "Masked emails and numbers with dedicated inboxes — shop and sign up without ever sharing your real identity.",                           soon: false },
  { icon: Trash2,       title: "Online Data Removal",      desc: "We remove your personal info from people-search sites and data brokers that sell it onward.",                                          soon: false },
  { icon: Phone,        title: "Spam Call Protection",     desc: "Call Guard intercepts spammers and robocalls before your phone rings — and never blocks the calls that matter.",                       soon: true  },
  { icon: Bell,         title: "Dark Web Alerts",          desc: "We scan the dark web around the clock and alert you the moment your info leaks to criminals.",                                        soon: false },
  { icon: CheckCircle,  title: "$1 Million Insurance",     desc: "Up to $1M in coverage for financial losses, with 24/7 experts to restore your identity and credit.",                                   soon: true  },
  { icon: Globe,        title: "VPN for Private Browsing", desc: "WireGuard-encrypted browsing across 50+ locations keeps your traffic and location private.",                                          soon: true  },
  { icon: Lock,         title: "Password Management",      desc: "Stop reusing passwords. Generate and store unique passwords tied to each identity.",                                                   soon: false },
  { icon: CreditCard,   title: "Virtual Cards",            desc: "Pay with masked cards and per-card spending limits — merchants never see your real details.",                                          soon: true  },
];

const ADVANTAGES = [
  { icon: Zap,          title: "Free plan, forever",                desc: "Start with a real free tier — 1 scan and 3 aliases, no credit card. Cloaked has no free plan."                                       },
  { icon: Eye,          title: "Pricing on the homepage",           desc: "$9.99/mo Premium, $14.99/mo Family. Right here, not hidden behind a checkout flow."                                                   },
  { icon: Mail,         title: "Family plan available today",       desc: "Protect up to 5 people now — while Cloaked's family sharing is still \"coming soon.\""                                                },
  { icon: CheckCircle,  title: '"Not me" one-click fix',            desc: "Wrong name or wrong state in your results? One click excludes it. No support ticket."                                                 },
  { icon: Phone,        title: "Call blocking that respects you",   desc: "Conservative by design — off by default, never blocks unknowns blindly, one toggle to disable."                                      },
  { icon: RefreshCw,    title: "Auto re-removal",                   desc: "Brokers re-list data within months. We re-scan automatically and file removals again."                                                },
  { icon: Activity,     title: "Live removal feed",                 desc: "Watch removal agents work broker-by-broker in real time — proof, not promises."                                                       },
  { icon: BarChart2,    title: "Honest status page",                desc: "A public page showing exactly which protections are live vs. simulated in beta."                                                      },
];

const TRUST_CARDS = [
  {
    title: "No fake reviews",
    desc: "We just launched, so we won't show you invented testimonials. As real users review Shield, their words will appear here — unedited.",
  },
  {
    title: "Live vs. simulated, in writing",
    desc: "Our public status page lists exactly which protections are live and which are still simulated in beta. No other privacy app does this.",
  },
  {
    title: "Watch it work",
    desc: "Your dashboard streams removal progress broker-by-broker in real time. Judge us by what you can see, not what we claim.",
  },
];

const FAQS = [
  {
    q: "How much does it cost?",
    a: "Free plan includes 1 scan and 3 aliases — no credit card needed, no expiry. Premium is $9.99/mo and includes unlimited scans, all aliases, and call protection. Family plan is $14.99/mo for up to 5 people.",
  },
  {
    q: "After my data is deleted, how long before brokers re-list it?",
    a: "Most brokers re-list within 30–90 days from new data sources. That's why Shield re-scans automatically — we file removal requests again whenever you reappear, with no action needed from you.",
  },
  {
    q: "Why do you need my phone number? Isn't that ironic?",
    a: "We use your number as a search query — the same way someone stalking you would. Without it, we can't find your listings. Your number is encrypted, never sold, and you can delete it any time.",
  },
  {
    q: "What if the scan shows the wrong person or wrong state?",
    a: "Click \"Not me\" on any result and it's excluded immediately. No support ticket, no delay. We only count listings that match you.",
  },
  {
    q: "Will call blocking make me miss important calls?",
    a: "No. Shield's call protection is conservative by design — it only screens numbers that match known spam patterns. Unknown callers ring through normally. You can disable it with one toggle.",
  },
  {
    q: "Do these apps actually work?",
    a: "Yes, but results vary by broker. Some remove data within 24 hours; others take 45 days. Our dashboard shows exactly which brokers have confirmed removal and which are still pending — no false promises.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [phone, setPhone] = useState("");

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#E8E3D9]">

      {/* Orange announcement banner */}
      <div className="bg-[#F97316] text-white text-sm text-center py-2.5 px-4">
        Shield Beta is live — free privacy scan, no credit card required.{" "}
        <Link href="/sign-up" className="font-semibold underline underline-offset-2 hover:no-underline">
          Get started
        </Link>
      </div>

      {/* Navbar */}
      <nav className="bg-[#E8E3D9] border-b border-[#D4CFC5] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#1A1A14]" fill="currentColor" />
            <span className="text-lg font-bold text-[#1A1A14] font-serif">Shield</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {(
              [
                ["#how-it-works", "How It Works"],
                ["#features", "Features"],
                ["#why-shield", "Why Shield"],
                ["#faq", "FAQ"],
              ] as [string, string][]
            ).map(([href, label]) => (
              <a
                key={label}
                href={href}
                className="text-sm text-[#1A1A14]/60 hover:text-[#1A1A14] transition-colors"
              >
                {label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm text-[#1A1A14]/60 hover:text-[#1A1A14] transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="text-sm font-semibold bg-[#1A1A14] text-white px-5 py-2.5 rounded-full hover:bg-black transition-colors"
            >
              Get Started
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-[#1A1A14]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-[#E8E3D9] border-t border-[#D4CFC5] px-4 pb-4">
            {(
              [
                ["#how-it-works", "How It Works"],
                ["#features", "Features"],
                ["#why-shield", "Why Shield"],
                ["#faq", "FAQ"],
              ] as [string, string][]
            ).map(([href, label]) => (
              <a
                key={label}
                href={href}
                className="block py-3 text-[#1A1A14]/70 border-b border-[#D4CFC5] last:border-0 text-sm"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </a>
            ))}
            <div className="flex gap-3 pt-4">
              <Link
                href="/sign-in"
                className="flex-1 text-center py-2.5 border border-[#1A1A14] rounded-full text-sm font-medium text-[#1A1A14]"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="flex-1 text-center py-2.5 bg-[#1A1A14] text-white rounded-full text-sm font-semibold"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="bg-[#E8E3D9] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <div className="pt-2">
            <h1 className="text-5xl sm:text-6xl font-bold leading-tight text-[#1A1A14] mb-6 font-serif">
              Fight back against surveillance, spam, &{" "}
              <em className="text-[#F97316] not-italic">identity theft.</em>
            </h1>

            <p className="text-[#1A1A14]/70 text-lg mb-6 leading-relaxed">
              You can't fight what you can't see. Scan your number to find out who's selling your
              data — free, in under a minute.
            </p>

            <ul className="space-y-3 mb-8">
              {[
                "Encrypted connections — your scan results stay yours",
                "We never store or sell your sensitive personal information",
                "Transparent pricing: free plan, Premium $9.99/mo",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#1A1A14]/80">
                  <CheckCircle className="w-4 h-4 text-[#F97316] flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>

            <p className="text-sm text-[#1A1A14]/40">
              Thousands have already taken their free scan to uncover their risk.
            </p>
          </div>

          {/* Right — Scan card */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_32px_rgba(0,0,0,0.08)] border border-[#E5E0D5]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#FDEEDE] flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-[#F97316]" />
              </div>
              <div>
                <div className="font-semibold text-[#1A1A14] text-sm">Free Privacy Scan</div>
                <div className="text-xs text-[#1A1A14]/50">See who's selling your data</div>
              </div>
            </div>

            <input
              type="tel"
              placeholder="(555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-[#E5E0D5] rounded-xl px-4 py-3.5 text-[#1A1A14] placeholder-[#1A1A14]/30 outline-none focus:border-[#1A1A14] transition-colors mb-3 text-base bg-white"
            />

            <Link
              href={`/sign-up${phone ? `?phone=${encodeURIComponent(phone)}` : ""}`}
              className="flex items-center justify-center gap-2 w-full bg-[#1A1A14] text-white py-3.5 rounded-xl font-semibold hover:bg-black transition-colors mb-4 text-sm"
            >
              Scan Now <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="bg-[#EEF2FF] rounded-xl p-4 mb-4">
              <div className="text-xs font-semibold text-[#1A1A14] mb-1">Why we ask for your number</div>
              <div className="text-xs text-[#1A1A14]/60 leading-relaxed">
                One-time verification only — to confirm you own the number being scanned. We don't
                sell your data or sign you up for marketing lists.
              </div>
            </div>

            <p className="text-xs text-center text-[#1A1A14]/40">
              No credit card required. Scan on demand — not once a month.
            </p>
          </div>
        </div>
      </section>

      {/* Dark: Threat section */}
      <section className="bg-[#141410] py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-4 font-serif">
            You can't fight what you can't see.
          </h2>
          <p className="text-white/50 text-center mb-14 max-w-2xl mx-auto leading-relaxed">
            Invisible actors are trading your secrets, tracking your location, and targeting your
            finances. It's not just a privacy breach — it's a threat to your family's safety.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {THREATS.map(({ title, desc }) => (
              <div key={title} className="bg-[#1E1E1A] border border-[#2C2C26] rounded-2xl p-6">
                <h3 className="text-[#F97316] font-semibold mb-3">{title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <p className="text-white/25 text-center mt-10 text-sm">
            The problem is real, widespread, and personal.
          </p>
        </div>
      </section>

      {/* Light: How it works */}
      <section id="how-it-works" className="bg-[#E8E3D9] py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#1A1A14] mb-4 font-serif">
            Shield lets you take back control.
          </h2>
          <p className="text-[#1A1A14]/60 mb-14 max-w-2xl leading-relaxed">
            Every day, data brokers buy and sell your email, phone number, and address — fueling
            spam calls, phishing, and identity theft. Shield removes the supply.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STEPS.map(({ num, icon: Icon, title, desc }) => (
              <div key={title} className="bg-white border border-[#E5E0D5] rounded-2xl p-6">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-10 h-10 rounded-full bg-[#E8EDFF] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#4F6AF5]" />
                  </div>
                  <span className="text-5xl font-black text-[#1A1A14]/8 leading-none">{num}</span>
                </div>
                <h3 className="font-bold text-[#1A1A14] mb-2">{title}</h3>
                <p className="text-[#1A1A14]/60 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Light: Features */}
      <section id="features" className="bg-[#E8E3D9] pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A14] mb-12 font-serif">
            How does Shield protect my data?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc, soon }) => (
              <div key={title} className="bg-white border border-[#E5E0D5] rounded-2xl p-5">
                <div className="w-10 h-10 rounded-full bg-[#FDEEDE] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#F97316]" />
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="font-bold text-[#1A1A14] text-sm">{title}</h3>
                  {soon && (
                    <span className="text-xs bg-[#FDEEDE] text-[#F97316] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                      COMING SOON
                    </span>
                  )}
                </div>
                <p className="text-[#1A1A14]/55 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dark: Only in Shield */}
      <section id="why-shield" className="bg-[#141410] py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#F97316] text-white text-sm font-semibold px-4 py-2 rounded-full mb-8">
            <Zap className="w-4 h-4" />
            Only in Shield
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 max-w-3xl font-serif">
            Everything Cloaked has.{" "}
            <em className="text-[#F97316]">Plus everything it doesn't.</em>
          </h2>
          <p className="text-white/50 mb-14 max-w-xl leading-relaxed">
            Same protection. Then we kept going — fixing the things real users complain about most.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ADVANTAGES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-[#1E1E1A] border border-[#2C2C26] rounded-2xl p-5">
                <Icon className="w-5 h-5 text-[#F97316] mb-4" />
                <h3 className="font-bold text-white text-sm mb-2">{title}</h3>
                <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Light: Built in the open */}
      <section className="bg-[#E8E3D9] py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#1A1A14] text-center mb-4 font-serif">
            Built in the open.
          </h2>
          <p className="text-[#1A1A14]/60 text-center mb-14 max-w-2xl mx-auto leading-relaxed">
            Privacy apps run on trust, and trust isn't earned with marketing. Here's our deal with you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TRUST_CARDS.map(({ title, desc }) => (
              <div key={title} className="bg-white border border-[#E5E0D5] rounded-2xl p-6">
                <CheckCircle className="w-6 h-6 text-[#F97316] mb-4" />
                <h3 className="font-bold text-[#1A1A14] mb-2">{title}</h3>
                <p className="text-[#1A1A14]/60 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Light: FAQ */}
      <section id="faq" className="bg-[#EDEAE0] py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#1A1A14] text-center mb-4 font-serif">
            Questions people actually ask
          </h2>
          <p className="text-[#1A1A14]/50 text-center mb-12">
            Straight answers — including the uncomfortable ones.
          </p>

          <div className="space-y-3">
            {FAQS.map(({ q, a }, i) => (
              <div key={i} className="bg-white border border-[#E5E0D5] rounded-xl overflow-hidden">
                <button
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[#FAFAF8] transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium text-[#1A1A14] text-sm sm:text-base pr-4">{q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#1A1A14]/40 flex-shrink-0 transition-transform duration-200 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
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

      {/* Dark: CTA */}
      <section className="bg-[#141410] py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 font-serif">
            Your info shouldn't be currency for scammers.
          </h2>
          <p className="text-white/50 mb-10 leading-relaxed">
            Shield stands with you in the fight against privacy exploiters — and gives you the tools
            to win.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 bg-[#F97316] text-white font-semibold px-8 py-4 rounded-full hover:bg-[#EA6B0F] transition-colors"
            >
              Start Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center bg-transparent text-white font-semibold px-8 py-4 rounded-full border border-white/25 hover:border-white/50 transition-colors"
            >
              View Pricing
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-white/30 text-sm">
            {["Encrypted connections", "Never stores your sensitive info", "Never sells your data"].map(
              (t) => (
                <span key={t}>{t}</span>
              )
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#141410] border-t border-white/8 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-white" fill="currentColor" />
            <span className="text-white font-bold font-serif">Shield</span>
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-6">
            {["Pricing", "Why Shield", "Status", "Privacy Policy", "Terms"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm text-white/35 hover:text-white/65 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>

          <p className="text-sm text-white/30">© 2026 Shield Privacy</p>
        </div>
      </footer>
    </div>
  );
}
