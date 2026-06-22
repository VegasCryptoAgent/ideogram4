"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Phone,
  Mail,
  Bell,
  Lock,
  Trash2,
  Globe,
  CreditCard,
  Star,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Menu,
  X,
  ArrowRight,
  Eye,
  CreditCard as CardIcon,
} from "lucide-react";

// ── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    title: "Email & Phone Aliases",
    desc: "Masked emails and phone numbers with dedicated inboxes to shop and sign up without ever sharing your real identity.",
    bg: "from-orange-500/20 to-orange-500/5",
    accent: "#F97316",
  },
  {
    title: "Online Data Removal",
    desc: "Shield removes your personal info from 400+ people-search sites and data brokers that sell your data to other parasites.",
    bg: "from-red-500/20 to-red-500/5",
    accent: "#ef4444",
  },
  {
    title: "Spam Call Protection",
    desc: "Call Guard intercepts spammers, scammers, and robocalls before they reach you. So your phone only rings when it matters.",
    bg: "from-green-500/20 to-green-500/5",
    accent: "#22c55e",
  },
  {
    title: "Dark Web & SSN Alerts",
    desc: "Your data is a target. We scan the dark web 24/7 for breached records and alert you the second your info is leaked to criminals.",
    bg: "from-purple-500/20 to-purple-500/5",
    accent: "#a855f7",
  },
  {
    title: "$1 Million Insurance",
    desc: "Identity theft and fraud ruins lives. We cover up to $1M in financial losses, with 24/7 support to restore your identity and credit.",
    bg: "from-blue-500/20 to-blue-500/5",
    accent: "#3b82f6",
    soon: true,
  },
  {
    title: "VPN for Private Browsing",
    desc: "WireGuard-encrypted browsing across 50+ global locations keeps your traffic and location completely private.",
    bg: "from-teal-500/20 to-teal-500/5",
    accent: "#14b8a6",
    soon: true,
  },
  {
    title: "Password Management",
    desc: "Stop reusing passwords. Generate and store unique passwords & TOTP codes tagged to each identity.",
    bg: "from-yellow-500/20 to-yellow-500/5",
    accent: "#eab308",
  },
  {
    title: "Virtual Cards (Beta)",
    desc: "Stop card theft. Pay with masked virtual cards so hackers and shady merchants never see your real details.",
    bg: "from-pink-500/20 to-pink-500/5",
    accent: "#ec4899",
    soon: true,
  },
];

const TESTIMONIALS = [
  {
    text: "It has been so nice not getting spam calls. Thank you Shield for getting my name off so many places. Great job.",
    name: "Candy Henry",
    source: "Google Play Store",
  },
  {
    text: "Since I've had Shield, it's been wonderful — no spam calls, it's really nice not to be bothered by unwanted calls.",
    name: "Ron M.",
    source: "Apple App Store",
  },
  {
    text: "Shield has helped CLEAN UP and PROTECT my credit, REMOVING my information from the DARK WEB, and sites mining data to sell to third parties.",
    name: "Edward P.",
    source: "Play Store",
  },
  {
    text: "Finally, my phone goes quiet. Not only does it get rid of all those spam calls, it also pulls all your information off the internet. It's a godsend.",
    name: "Lloydesonger",
    source: "Apple App Store",
  },
  {
    text: "Everyone should have this app. I didn't realize how casually I gave out public information or how many data brokers were profiting from using it.",
    name: "Wade",
    source: "Play Store",
  },
  {
    text: "I can't tell you the amount of stress that has been lifted from me ever since I signed up for Shield!",
    name: "Upenhappy",
    source: "Apple App Store",
  },
];

// ── PhoneInput ────────────────────────────────────────────────────────────────

function PhoneInput({ dark = false, placeholder = "Enter phone number" }: { dark?: boolean; placeholder?: string }) {
  const [phone, setPhone] = useState("");

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  return (
    <div className="relative flex items-center">
      <div className={`flex items-center gap-2 flex-1 border rounded-xl px-4 py-3.5 ${
        dark
          ? "bg-white/8 border-white/15 focus-within:border-white/35"
          : "bg-white border-[#E5E0D5] focus-within:border-[#1A1A14]"
      } transition-colors`}>
        <span className="text-base mr-1">🇺🇸</span>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          placeholder={placeholder}
          className={`flex-1 outline-none text-sm bg-transparent ${
            dark ? "text-white placeholder-white/35" : "text-[#1A1A14] placeholder-[#1A1A14]/30"
          }`}
        />
        <Link
          href={`/sign-up${phone ? `?phone=${encodeURIComponent(phone)}` : ""}`}
          className="flex items-center justify-center w-9 h-9 bg-[#F97316] rounded-lg hover:bg-[#EA6B0F] transition-colors flex-shrink-0"
        >
          <ArrowRight className="w-4 h-4 text-white" />
        </Link>
      </div>
    </div>
  );
}

// ── FeatureCard ───────────────────────────────────────────────────────────────

function FeatureCard({ title, desc, bg, accent, soon }: typeof FEATURES[0]) {
  return (
    <div className="flex-shrink-0 w-[280px] md:w-[300px] rounded-2xl overflow-hidden border border-[#E5E0D5] bg-white">
      <div className={`h-48 bg-gradient-to-br ${bg} flex items-center justify-center`}>
        <div className="text-5xl opacity-60" style={{ filter: `drop-shadow(0 0 20px ${accent}60)` }}>
          {title.includes("Email") ? "📧" :
           title.includes("Removal") ? "🗑️" :
           title.includes("Call") ? "📞" :
           title.includes("Dark Web") ? "🔍" :
           title.includes("Insurance") ? "🛡️" :
           title.includes("VPN") ? "🌐" :
           title.includes("Password") ? "🔐" : "💳"}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-bold text-[#1A1A14] text-sm">{title}</h3>
          {soon && <span className="text-xs bg-[#F97316]/10 text-[#F97316] font-semibold px-1.5 py-0.5 rounded-full">SOON</span>}
        </div>
        <p className="text-[#1A1A14]/55 text-xs leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ── TestimonialSlider ─────────────────────────────────────────────────────────

function TestimonialSlider() {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % TESTIMONIALS.length);
  }, []);

  useEffect(() => {
    timeoutRef.current = setTimeout(next, 5000);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [current, next]);

  const t = TESTIMONIALS[current];

  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="flex justify-center gap-0.5 mb-6">
        {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-[#F97316] fill-current" />)}
      </div>
      <motion.p
        key={current}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-white text-lg sm:text-xl leading-relaxed mb-6"
      >
        "{t.text}"
      </motion.p>
      <div className="text-white/60 text-sm">
        <span className="font-semibold text-white">{t.name}</span>
        <span className="mx-2">·</span>
        {t.source}
      </div>
      <div className="flex justify-center gap-2 mt-6">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-[#F97316]" : "bg-white/20"}`}
          />
        ))}
      </div>
    </div>
  );
}

// ── LandingPage ───────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (dir: "left" | "right") => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: dir === "right" ? 320 : -320, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F5F2EC]">

      {/* ── Toast banner ───────────────────────────────────────────────────── */}
      <div className="bg-[#1A1A14] text-white text-sm text-center py-2.5 px-4">
        Shield raises $375M — privacy protection for everyone.{" "}
        <Link href="/sign-up" className="text-[#F97316] font-semibold hover:underline">
          Get started free →
        </Link>
      </div>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="bg-[#F5F2EC] border-b border-[#D4CFC5] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#1A1A14]" fill="currentColor" />
            <span className="text-lg font-bold text-[#1A1A14] font-serif">Shield</span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {(
              [
                { label: "Features", href: "/features" },
                { label: "Blog", href: "/blog" },
                { label: "Pricing", href: "/plans" },
                { label: "About", href: "/about" },
              ] as { label: string; href: string }[]
            ).map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-sm text-[#1A1A14]/65 hover:text-[#1A1A14] transition-colors font-medium"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/sign-in" className="text-sm font-medium text-[#1A1A14]/65 hover:text-[#1A1A14] transition-colors px-3 py-2 border border-[#1A1A14]/20 rounded-full hover:border-[#1A1A14]/40">
              Login
            </Link>
            <Link href="/sign-up" className="text-sm font-semibold bg-[#F97316] text-white px-5 py-2.5 rounded-full hover:bg-[#EA6B0F] transition-colors">
              Get Started
            </Link>
          </div>

          <button className="md:hidden p-2 text-[#1A1A14]" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-[#F5F2EC] border-t border-[#D4CFC5] px-4 pb-4">
            {[
              { label: "Features", href: "/features" },
              { label: "Pricing", href: "/plans" },
              { label: "Blog", href: "/blog" },
              { label: "About", href: "/about" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} className="block py-3 text-sm font-medium text-[#1A1A14]/70 border-b border-[#D4CFC5] last:border-0" onClick={() => setMobileOpen(false)}>
                {label}
              </Link>
            ))}
            <div className="flex gap-3 pt-4">
              <Link href="/sign-in" className="flex-1 text-center py-2.5 border border-[#1A1A14]/25 rounded-full text-sm font-medium text-[#1A1A14]">Login</Link>
              <Link href="/sign-up" className="flex-1 text-center py-2.5 bg-[#F97316] text-white rounded-full text-sm font-semibold">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero (light, 2-column) ──────────────────────────────────────────── */}
      <section className="bg-[#F5F2EC] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-5xl sm:text-6xl font-bold leading-[1.08] text-[#1A1A14] mb-5 font-serif">
              Fight against surveillance, spam, &amp;{" "}
              <em className="text-[#F97316] not-italic">identity theft.</em>
            </h1>
            <p className="text-[#1A1A14]/60 text-lg mb-2 font-semibold">You can't fight what you can't see.</p>
            <p className="text-[#1A1A14]/55 text-base mb-8 leading-relaxed">
              4 million Americans have already taken their free scan to uncover their risk. See who is selling your data right now.
            </p>
            <div className="mb-3">
              <PhoneInput />
            </div>
            <p className="text-xs text-[#1A1A14]/35">
              No credit card required. By scanning you agree to our{" "}
              <a href="#" className="underline hover:no-underline">Terms & Conditions</a>.
            </p>
          </motion.div>

          {/* Right — product visual */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="bg-[#141410] rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
              {/* Fake browser chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 bg-[#1E1E1A] border-b border-white/8">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                <div className="flex-1 mx-3 bg-white/6 rounded px-2 py-0.5 text-[10px] text-white/30 text-center">
                  app.shield.com/dashboard
                </div>
              </div>
              {/* Dashboard preview */}
              <div className="p-4 space-y-3">
                {/* Welcome */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white text-sm font-semibold font-serif">Good morning 👋</div>
                    <div className="text-white/40 text-xs">Last scan: 6 hours ago</div>
                  </div>
                  <div className="bg-[#F97316] text-white text-xs font-semibold px-3 py-1.5 rounded-lg">Scan Now</div>
                </div>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Brokers Found", v: "47", c: "text-red-400" },
                    { label: "Removed", v: "39", c: "text-green-400" },
                    { label: "Privacy Score", v: "72", c: "text-[#F97316]" },
                  ].map(({ label, v, c }) => (
                    <div key={label} className="bg-white/6 rounded-xl p-2.5 border border-white/8">
                      <div className="text-white/35 text-[10px]">{label}</div>
                      <div className={`text-xl font-black ${c}`}>{v}</div>
                    </div>
                  ))}
                </div>
                {/* Activity */}
                <div className="bg-white/5 rounded-xl p-3 border border-white/8">
                  <div className="text-white/35 text-[10px] mb-2">Recent Removals</div>
                  {["Spokeo", "WhitePages", "BeenVerified"].map((b) => (
                    <div key={b} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                        <span className="text-white/60 text-xs">{b}</span>
                      </div>
                      <span className="text-green-400 text-[10px] font-medium">Removed ✓</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-3 shadow-xl border border-[#E5E0D5] flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#1A1A14]">1.7B+ records removed</div>
                <div className="text-xs text-[#1A1A14]/40">from broker databases</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Dark: Data parasites ────────────────────────────────────────────── */}
      <section className="bg-[#141410] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 font-serif leading-tight">
                <span className="text-[#F97316]">Data parasites</span> put you and your family at{" "}
                <span className="text-[#F97316]">risk.</span>
              </h2>
              <p className="text-white/50 text-base leading-relaxed">
                Invisible actors are trading your secrets, tracking your location, and targeting your finances. It's not just a privacy breach — it's a direct threat to your family's safety.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: "Scammers & Fraudsters",
                  body: "They target your trust. Criminals use leaked data to craft hyper-realistic AI voice scams and deepfakes that trick you into handing over your life savings.",
                },
                {
                  title: "Identity Thieves",
                  body: "They steal your future. Hackers use your exposed SSN and info to drain bank accounts, open false loans, and destroy your credit score overnight.",
                },
                {
                  title: "Data Aggregators & Brokers",
                  body: "They sell your safety. These companies silently harvest your daily habits and sell your home address and family profile to anyone willing to pay.",
                },
              ].map(({ title, body }) => (
                <div key={title} className="bg-[#1E1E1A] border border-[#2C2C26] rounded-2xl p-5">
                  <h3 className="text-white font-semibold mb-2">{title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scan CTA inside dark section */}
          <div className="mt-16 pt-16 border-t border-white/8 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-3 font-serif">The problem is real, widespread, and personal.</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Every day, data brokers buy and sell your email, phone number, address, and more — fueling spam calls, scams, phishing attacks, and identity theft. Shield empowers you to fight back.
              </p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-3">Check how exposed you already are with our free safety scan.</p>
              <PhoneInput dark placeholder="+1   Enter phone number" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Light: Take back control ────────────────────────────────────────── */}
      <section className="bg-[#F5F2EC] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#1A1A14] font-serif max-w-xl leading-tight">
              Shield lets you take back control.
            </h2>
            <Link href="/sign-up" className="hidden md:inline-flex items-center border border-[#1A1A14]/25 text-[#1A1A14] text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#1A1A14] hover:text-white transition-colors">
              Get started
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
              {
                num: "01",
                title: "Clean your past exposure",
                body: "We wipe your personal info from broker databases, destroying the inventory that aggregators sell to scammers, marketers, and other bad actors.",
              },
              {
                num: "02",
                title: "Defend your present",
                body: "Use aliases to block spam calls and stop phishing. When breaches occur, fraudsters find disconnected junk instead of your real profile.",
              },
              {
                num: "03",
                title: "Protect your future",
                body: "With 24/7 monitoring and $1M insurance, you can rest easy knowing that even if criminals strike, your family's financial future is untouchable.",
              },
            ].map(({ num, title, body }) => (
              <div key={num} className="bg-white border border-[#E5E0D5] rounded-2xl p-6">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-10 h-10 bg-[#F97316]/15 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#F97316]" />
                  </div>
                  <span className="text-5xl font-black text-[#1A1A14]/6 font-serif">{num}</span>
                </div>
                <h3 className="font-bold text-[#1A1A14] mb-2">{title}</h3>
                <p className="text-[#1A1A14]/55 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          {/* Product images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <div className="bg-[#141410] rounded-2xl overflow-hidden aspect-video flex flex-col">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-[#1E1E1A]">
                <div className="w-2 h-2 rounded-full bg-red-500/60" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
                <div className="w-2 h-2 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 p-4 space-y-2.5">
                <div className="text-white/50 text-xs">Your Identities</div>
                {[
                  { label: "Shopping alias", email: "shop.k9x2@shield.email" },
                  { label: "Work contacts", email: "work.3pt7@shield.email" },
                  { label: "Newsletter", email: "news.9xm1@shield.email" },
                ].map(({ label, email }) => (
                  <div key={label} className="flex items-center justify-between bg-white/6 rounded-xl p-2.5 border border-white/8">
                    <div>
                      <div className="text-white text-xs font-medium">{label}</div>
                      <div className="text-white/40 text-[10px] font-mono">{email}</div>
                    </div>
                    <div className="text-green-400 text-[10px]">● Active</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#141410] rounded-2xl overflow-hidden aspect-video flex flex-col">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-[#1E1E1A]">
                <div className="w-2 h-2 rounded-full bg-red-500/60" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
                <div className="w-2 h-2 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 p-4">
                <div className="text-white/50 text-xs mb-2.5">Removal Progress</div>
                <div className="space-y-2">
                  {[
                    { broker: "Spokeo", pct: 100, done: true },
                    { broker: "WhitePages", pct: 100, done: true },
                    { broker: "BeenVerified", pct: 100, done: true },
                    { broker: "PeopleFinder", pct: 65, done: false },
                    { broker: "FastPeopleSearch", pct: 30, done: false },
                  ].map(({ broker, pct, done }) => (
                    <div key={broker}>
                      <div className="flex items-center justify-between text-[10px] text-white/40 mb-1">
                        <span>{broker}</span>
                        <span className={done ? "text-green-400" : "text-[#F97316]"}>{done ? "Removed ✓" : `${pct}%`}</span>
                      </div>
                      <div className="h-1 bg-white/8 rounded-full">
                        <div className={`h-full rounded-full ${done ? "bg-green-500" : "bg-[#F97316]"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Trust badge row */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-[#D4CFC5]">
            {[
              "⭐ Trustpilot 3.9/5",
              "🏆 Product Hunt",
              "📰 PCMag Editor's Choice",
              "✓ BBB Accredited",
              "🔒 SOC 2 Compliant",
            ].map((badge) => (
              <div key={badge} className="text-sm text-[#1A1A14]/50 font-medium">{badge}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features carousel ───────────────────────────────────────────────── */}
      <section id="features" className="bg-[#F5F2EC] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A14] font-serif">
              How does Shield protect my data?
            </h2>
            <div className="flex gap-2">
              <button onClick={() => scrollCarousel("left")} className="w-9 h-9 rounded-full border border-[#D4CFC5] flex items-center justify-center text-[#1A1A14]/50 hover:bg-white hover:text-[#1A1A14] transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => scrollCarousel("right")} className="w-9 h-9 rounded-full border border-[#D4CFC5] flex items-center justify-center text-[#1A1A14]/50 hover:bg-white hover:text-[#1A1A14] transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {FEATURES.map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── Dark: Numbers + Testimonials ────────────────────────────────────── */}
      <section className="bg-[#141410] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-14 gap-6">
            <h2 className="text-4xl sm:text-5xl font-bold text-white font-serif max-w-2xl leading-tight">
              Join hundreds of thousands of Americans fighting back.
            </h2>
            <Link href="/sign-up" className="flex-shrink-0 bg-[#F97316] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#EA6B0F] transition-colors text-sm">
              Get Started
            </Link>
          </div>

          {/* Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            {[
              { num: "60+", unit: "million", label: "calls screened" },
              { num: "13+", unit: "million", label: "accounts masked" },
              { num: "1.7+", unit: "billion", label: "records removed from broker sites" },
            ].map(({ num, unit, label }) => (
              <div key={label} className="bg-[#1E1E1A] border border-[#2C2C26] rounded-2xl p-8">
                <div className="text-5xl font-black text-white font-serif">{num}</div>
                <div className="text-4xl font-black text-white/60 font-serif mb-4">{unit}</div>
                <div className="text-white/50 text-lg">{label}</div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <TestimonialSlider />

          {/* Avatar row */}
          <div className="flex justify-center gap-2 mt-10">
            {["👤", "👩", "👨", "👩‍💼", "👨‍💼", "👩‍🦳", "👨‍🦳", "👩‍🦱"].map((emoji, i) => (
              <div key={i} className="w-10 h-10 rounded-full bg-[#2C2C26] border border-white/10 flex items-center justify-center text-base">
                {emoji}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────────── */}
      <section id="pricing" className="bg-[#F5F2EC] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#1A1A14] mb-4 font-serif">Simple, transparent pricing.</h2>
            <p className="text-[#1A1A14]/55">No hidden fees. Start free, upgrade when you're ready.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: "Free", price: "$0", period: "", desc: "See your risk — no card required.", features: ["1 privacy scan", "3 email aliases", "1 virtual phone number", "Basic breach alerts"], cta: "Start Free", href: "/sign-up", highlight: false },
              { name: "Premium", price: "$9.99", period: "/mo", desc: "Full protection for individuals.", features: ["Unlimited scans & removals", "Unlimited email aliases", "3 virtual phone numbers", "Spam call guard", "Dark web monitoring", "Password manager"], cta: "Start Free Trial", href: "/sign-up?plan=premium", highlight: true },
              { name: "Family", price: "$14.99", period: "/mo", desc: "Protect up to 5 people.", features: ["Everything in Premium", "Up to 5 members", "Shared family dashboard", "Priority support"], cta: "Start Family Trial", href: "/sign-up?plan=family", highlight: false },
            ].map(({ name, price, period, desc, features, cta, href, highlight }) => (
              <div key={name} className={`rounded-2xl p-6 border relative ${highlight ? "bg-[#141410] border-[#F97316]/30" : "bg-white border-[#E5E0D5]"}`}>
                {highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F97316] text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>}
                <div className="mb-5">
                  <div className={`text-sm font-semibold mb-1 ${highlight ? "text-[#F97316]" : "text-[#1A1A14]"}`}>{name}</div>
                  <div className={`flex items-end gap-0.5 mb-1 ${highlight ? "text-white" : "text-[#1A1A14]"}`}>
                    <span className="text-4xl font-black font-serif">{price}</span>
                    <span className={`text-sm mb-1.5 ${highlight ? "text-white/40" : "text-[#1A1A14]/40"}`}>{period}</span>
                  </div>
                  <div className={`text-xs ${highlight ? "text-white/50" : "text-[#1A1A14]/50"}`}>{desc}</div>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#F97316]" />
                      <span className={`text-sm ${highlight ? "text-white/75" : "text-[#1A1A14]/70"}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={href} className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-colors ${highlight ? "bg-[#F97316] text-white hover:bg-[#EA6B0F]" : "bg-[#1A1A14] text-white hover:bg-black"}`}>
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────────── */}
      <section className="bg-[#F5F2EC] py-20 px-4 sm:px-6 lg:px-8 border-t border-[#D4CFC5]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            {/* Mini trust badges */}
            <div className="flex flex-wrap gap-3 mb-8">
              {["⭐ Trustpilot 3.9", "🏆 Product Hunt", "📰 PCMag", "✓ BBB", "🔒 SOC 2"].map((b) => (
                <span key={b} className="text-xs text-[#1A1A14]/50 bg-white border border-[#E5E0D5] px-2.5 py-1 rounded-full">{b}</span>
              ))}
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-[#1A1A14] mb-4 font-serif">
              Your info shouldn't be currency for scammers.
            </h2>
            <p className="text-[#1A1A14]/55 mb-8 leading-relaxed">
              Shield stands with you in the fight against privacy exploiters — and gives you the tools to win.
            </p>
            <p className="text-sm text-[#1A1A14] font-medium mb-3">Scan your number to see who's selling your data.</p>
            <PhoneInput />
            <ul className="mt-5 space-y-1.5">
              {[
                "Is SOC 2 compliant and end-to-end encrypted",
                "Will never store your sensitive personal information",
                "Will never sell your sensitive personal information",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-[#1A1A14]/55">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right visual */}
          <div className="bg-[#141410] rounded-3xl p-6 space-y-3">
            <div className="text-white font-semibold text-sm font-serif mb-4">Shield protects you 24/7</div>
            {[
              { icon: "🛡️", title: "Data broker removals", status: "39 complete", color: "text-green-400" },
              { icon: "📧", title: "Email aliases active", status: "3 identities", color: "text-[#F97316]" },
              { icon: "📞", title: "Spam calls blocked", status: "247 this month", color: "text-blue-400" },
              { icon: "🔍", title: "Dark web monitoring", status: "Scanning now…", color: "text-purple-400" },
            ].map(({ icon, title, status, color }) => (
              <div key={title} className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/8">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{icon}</span>
                  <span className="text-white/70 text-sm">{title}</span>
                </div>
                <span className={`text-xs font-semibold ${color}`}>{status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-[#0E0E0A] border-t border-white/6">
        {/* Newsletter */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-white/8">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-white" fill="currentColor" />
              <span className="text-white font-bold font-serif text-lg">Shield</span>
            </div>
            <div className="flex-1 max-w-lg">
              <h3 className="text-white font-semibold mb-3">Stay up to date on features and releases.</h3>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-white/8 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/35 outline-none focus:border-white/35 transition-colors"
                />
                <button className="bg-[#F97316] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#EA6B0F] transition-colors">
                  Subscribe
                </button>
              </div>
              <p className="text-white/25 text-xs mt-2">You agree with our Privacy Policy and consent to receive updates from Shield.</p>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-10 border-b border-white/8">
            {[
              { heading: "Product", links: [
                { label: "Pricing", href: "/plans" },
                { label: "Features", href: "/features" },
                { label: "Get Started", href: "/get-started" },
                { label: "Trust & Security", href: "/trust" },
                { label: "Status", href: "#" },
              ]},
              { heading: "Company", links: [
                { label: "About", href: "/about" },
                { label: "Blog", href: "/blog" },
                { label: "Affiliates", href: "/affiliate-program" },
                { label: "Contact", href: "/contact-us" },
                { label: "Careers", href: "#" },
                { label: "Changelog", href: "/changelog" },
              ]},
              { heading: "Download", links: [
                { label: "App Store", href: "#" },
                { label: "Play Store", href: "#" },
                { label: "Extension", href: "#" },
                { label: "Whitepaper", href: "#" },
              ]},
              { heading: "Connect", links: [
                { label: "Instagram", href: "#" },
                { label: "TikTok", href: "#" },
                { label: "YouTube", href: "#" },
                { label: "Facebook", href: "#" },
                { label: "LinkedIn", href: "#" },
              ]},
              { heading: "Legal", links: [
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
                { label: "Prohibited Use Policy", href: "#" },
              ]},
            ].map(({ heading, links }) => (
              <div key={heading}>
                <div className="text-white/55 text-xs font-semibold mb-3 uppercase tracking-wide">{heading}</div>
                <ul className="space-y-2">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <Link href={href} className="text-white/30 text-xs hover:text-white/60 transition-colors">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Credits */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-white/25 text-xs">
              <Shield className="w-3 h-3" />
              <span>2026 Shield. All rights reserved.</span>
            </div>
            <p className="text-white/20 text-xs text-center">
              Currently available in 🇺🇸 and 🇨🇦. Email privacy@shield.id to opt out of the data exposure scan.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
