"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  Phone,
  Mail,
  Bell,
  AlertTriangle,
  Lock,
  CheckCircle,
  ChevronDown,
  ArrowRight,
  Star,
  X,
  Zap,
  Eye,
  Database,
  Scan,
  RefreshCw,
  Menu,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Fade in animation variant
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// Animated section wrapper
function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const BROKERS = [
  "Spokeo", "WhitePages", "BeenVerified", "Intelius", "PeopleFinder",
  "Radaris", "MyLife", "PeopleSmart", "TruthFinder", "Instant Checkmate",
  "ZabaSearch", "Pipl", "FastPeopleSearch", "USSearch", "PeopleLooker",
];

const FEATURES = [
  {
    icon: Database,
    title: "Data Broker Removal",
    description: "Automatically opt out from 200+ data broker sites that sell your personal information.",
    color: "from-violet-600 to-purple-700",
  },
  {
    icon: Phone,
    title: "Virtual Phone Numbers",
    description: "Get dedicated phone numbers for sign-ups. Forward calls, block spam, stay anonymous.",
    color: "from-blue-600 to-indigo-700",
  },
  {
    icon: Mail,
    title: "Email Aliases",
    description: "Create unlimited email aliases. Each sender gets a unique address — you stay protected.",
    color: "from-emerald-600 to-teal-700",
  },
  {
    icon: ShieldCheck,
    title: "Spam Call Blocking",
    description: "AI-powered spam detection blocks robocalls and scam callers before they reach you.",
    color: "from-rose-600 to-pink-700",
  },
  {
    icon: AlertTriangle,
    title: "Breach Monitoring",
    description: "Instant alerts when your email, phone, or passwords appear in a data breach.",
    color: "from-amber-600 to-orange-700",
  },
  {
    icon: Bell,
    title: "Real-Time Alerts",
    description: "Push notifications the moment a data broker lists your info or a breach is detected.",
    color: "from-cyan-600 to-sky-700",
  },
];

const STEPS = [
  {
    number: "01",
    icon: Lock,
    title: "Tell Us About You",
    description: "Securely enter your name, address history, and phone number. Your data is AES-256 encrypted and never sold — it's only used to find your listings on broker sites.",
  },
  {
    number: "02",
    icon: Scan,
    title: "We Scan 200+ Sites",
    description: "Our scanners immediately start searching every major data broker and people-search site. Most first scans complete within 24 hours.",
  },
  {
    number: "03",
    icon: X,
    title: "We Remove Your Data",
    description: "Automated opt-out requests are sent to every broker that has your data. We handle follow-ups and verify removal completion.",
  },
  {
    number: "04",
    icon: RefreshCw,
    title: "We Monitor Weekly",
    description: "Data brokers re-add removed listings constantly. We scan weekly and automatically re-request removal whenever you reappear.",
  },
];

const COMPARISON = [
  { feature: "Scan Frequency", shielded: "Weekly", cloaked: "Monthly", deleteme: "Quarterly", incogni: "Monthly" },
  { feature: "Immediate First Scan", shielded: true, cloaked: false, deleteme: false, incogni: false },
  { feature: "Data Brokers Covered", shielded: "200+", cloaked: "100+", deleteme: "750+", incogni: "180+" },
  { feature: "Virtual Phone Numbers", shielded: true, cloaked: true, deleteme: false, incogni: false },
  { feature: "Email Aliases", shielded: true, cloaked: true, deleteme: false, incogni: false },
  { feature: "Breach Monitoring", shielded: true, cloaked: false, deleteme: false, incogni: false },
  { feature: "Spam AI Blocking", shielded: true, cloaked: false, deleteme: false, incogni: false },
  { feature: "Starting Price", shielded: "$4.99/mo", cloaked: "$7.99/mo", deleteme: "$10.75/mo", incogni: "$6.49/mo" },
];

const PLANS = [
  {
    name: "Starter",
    price: "$4.99",
    period: "/month",
    description: "Perfect for getting started with privacy protection.",
    badge: null,
    features: [
      "Monthly scans",
      "50 data brokers",
      "1 virtual phone number",
      "5 email aliases",
      "Basic breach alerts",
      "Email support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    description: "Complete privacy for individuals and families.",
    badge: "MOST POPULAR",
    features: [
      "Weekly scans",
      "200+ data brokers",
      "3 virtual phone numbers",
      "20 email aliases",
      "Advanced breach monitoring",
      "Spam AI filtering",
      "Priority support",
      "Family sharing (2 members)",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Ultimate",
    price: "$19.99",
    period: "/month",
    description: "Maximum protection for power users.",
    badge: null,
    features: [
      "Daily scans",
      "200+ data brokers",
      "Unlimited virtual phones",
      "Unlimited email aliases",
      "Priority removal requests",
      "Spam AI + custom rules",
      "Dedicated account manager",
      "Family sharing (5 members)",
      "API access",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah M.",
    role: "Marketing Manager",
    avatar: "SM",
    text: "I found 63 sites with my home address and phone number. Within 3 weeks, Shielded had removed 58 of them. The spam calls dropped by 80%. This is exactly what I needed.",
    rating: 5,
  },
  {
    name: "James R.",
    role: "Software Engineer",
    avatar: "JR",
    text: "As someone who cares deeply about privacy, I was shocked by how much data was out there. Shielded's dashboard makes it easy to see exactly what's been removed. The virtual numbers are a game changer.",
    rating: 5,
  },
  {
    name: "Linda K.",
    role: "Retired Teacher",
    avatar: "LK",
    text: "My daughter set this up for me after I started getting scary calls from strangers who knew my address. Three months later, the calls have basically stopped. Worth every penny.",
    rating: 5,
  },
  {
    name: "David T.",
    role: "Small Business Owner",
    avatar: "DT",
    text: "I use the email aliases for every service I sign up for. Now I know exactly who sold my data when I get spam. Shielded is a must-have in 2024.",
    rating: 5,
  },
];

const FAQS = [
  {
    question: "Is my data safe with Shielded?",
    answer: "Absolutely. We use AES-256 encryption at rest and in transit. Your personal information is only ever used to search for your listings on data broker sites — we never sell, share, or use it for any other purpose. You can delete your data from our systems at any time.",
  },
  {
    question: "How quickly will my data be removed?",
    answer: "Most data brokers honor removal requests within 7–14 days. Some larger brokers or those with manual processes can take up to 45 days. We track every request and follow up automatically until confirmed.",
  },
  {
    question: "What if my data reappears on a broker site?",
    answer: "Data brokers constantly re-add listings from new data sources. That's why we scan weekly (not just once). Whenever you reappear, we automatically re-submit removal requests — no action needed from you.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes. No contracts, no commitments. Cancel any time directly from your account settings. If you cancel, your protection continues until the end of your billing period.",
  },
  {
    question: "Why do you need my personal information to protect me?",
    answer: "We need to know what to look for. Data brokers list people by name, address, phone, and relatives. We use your provided information as search queries to find your specific listings — the same way someone who wanted to find you would search. Without it, we'd have no way to find your data.",
  },
  {
    question: "What's the difference between Shielded and a VPN?",
    answer: "A VPN hides your browsing traffic from your internet provider. Shielded removes information that's already been collected about you and is being actively sold. They solve different problems — many users use both together for comprehensive privacy.",
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [brokerIndex, setBrokerIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBrokerIndex((i) => (i + 1) % BROKERS.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Background mesh */}
      <div className="fixed inset-0 bg-mesh pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-indigo-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl" />
      </div>

      {/* NAVBAR */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/60 backdrop-blur-xl border-b border-white/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-glow">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Shielded</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {["Features", "Pricing", "How It Works", "Blog"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/sign-up">Start Free Trial</Link>
              </Button>
            </div>

            {/* Mobile menu */}
            <button
              className="md:hidden p-2 text-white/70 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden bg-black/90 backdrop-blur-xl border-b border-white/10 px-4 pb-4"
            >
              {["Features", "Pricing", "How It Works", "Blog"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                  className="block py-3 text-white/70 hover:text-white border-b border-white/5 last:border-0"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button size="sm" className="flex-1" asChild>
                  <Link href="/sign-up">Start Free</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge className="mb-6 px-4 py-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-green-400 mr-2 inline-block animate-pulse" />
                  14-Day Free Trial — No Credit Card Required
                </Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight"
              >
                Your Personal Data Is Being{" "}
                <span className="gradient-text">Sold Right Now</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 text-lg text-white/60 leading-relaxed max-w-xl"
              >
                Shielded finds and removes your information from{" "}
                <strong className="text-white">200+ data broker sites</strong>, gives you
                virtual phone numbers, and stops spam — automatically.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 flex flex-col sm:flex-row gap-4"
              >
                <Button size="lg" className="text-base shadow-glow-lg" asChild>
                  <Link href="/sign-up">
                    Remove My Data Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#how-it-works">See How It Works</a>
                </Button>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-10 flex flex-wrap gap-4"
              >
                {[
                  { icon: Database, text: "200+ Brokers Monitored" },
                  { icon: RefreshCw, text: "Weekly Scans" },
                  { icon: Bell, text: "Instant Alerts" },
                  { icon: ShieldCheck, text: "14-Day Free Trial" },
                ].map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-2 text-sm text-white/50"
                  >
                    <Icon className="w-4 h-4 text-violet-400" />
                    {text}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Shield Graphic */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex items-center justify-center"
            >
              {/* Orbiting dots */}
              <div className="relative w-80 h-80">
                {/* Outer orbit ring */}
                <div className="absolute inset-0 rounded-full border border-white/5" />
                <div className="absolute inset-8 rounded-full border border-white/5" />

                {/* Orbiting broker names */}
                {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                  <motion.div
                    key={i}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: `rotate(${deg}deg) translateX(140px) rotate(-${deg}deg)`,
                    }}
                    animate={{ rotate: [0, 360] }}
                    transition={{
                      duration: 20 + i * 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl glass-card flex items-center justify-center text-xs font-medium text-white/40 shadow-lg"
                      style={{ transform: `rotate(${deg}deg)` }}
                    >
                      {["SP", "WP", "BV", "IN", "TF", "RA"][i]}
                    </div>
                  </motion.div>
                ))}

                {/* Center Shield */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="relative"
                  >
                    <div className="w-32 h-32 bg-violet-600/20 rounded-full blur-2xl absolute inset-0 m-auto" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-glow-lg">
                      <ShieldCheck className="w-12 h-12 text-white" />
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Floating stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute top-4 right-0 glass-card rounded-xl px-4 py-3 text-sm"
              >
                <div className="text-white/40 text-xs mb-1">Last scan found</div>
                <div className="text-white font-bold">47 listings</div>
                <div className="text-green-400 text-xs">→ All removed</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="absolute bottom-8 left-0 glass-card rounded-xl px-4 py-3 text-sm"
              >
                <div className="text-white/40 text-xs mb-1">Scanning</div>
                <div className="text-white font-bold text-sm">
                  {BROKERS[brokerIndex]}
                </div>
                <div className="flex gap-0.5 mt-1.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-1 w-4 rounded-full bg-violet-600 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Section>
            <motion.div variants={fadeInUp} className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="secondary" className="mb-4">The Problem</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Why Your Data Is{" "}
                <span className="gradient-text">Everywhere</span>
              </h2>
              <p className="mt-4 text-white/50">
                Data brokers collect your information from public records, social media, purchase history, and more — then sell it to anyone willing to pay.
              </p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
              {[
                { value: "47", label: "Average listings found per person", color: "text-red-400" },
                { value: "30", label: "Days until brokers re-add removed data", color: "text-amber-400" },
                { value: "6.4B", label: "Records breached in 2024 alone", color: "text-rose-400" },
              ].map(({ value, label, color }) => (
                <motion.div
                  key={value}
                  variants={fadeInUp}
                  className="glass-card rounded-2xl p-8 text-center"
                >
                  <div className={`text-5xl font-black mb-3 ${color}`}>{value}</div>
                  <div className="text-white/50 text-sm">{label}</div>
                </motion.div>
              ))}
            </div>

            {/* Broker logos */}
            <motion.div variants={fadeInUp} className="text-center">
              <p className="text-white/30 text-sm mb-6 uppercase tracking-widest">Sites selling your data right now</p>
              <div className="flex flex-wrap justify-center gap-3">
                {BROKERS.map((broker) => (
                  <div
                    key={broker}
                    className="glass-card rounded-lg px-4 py-2 text-sm text-white/40 border border-red-500/10 bg-red-500/5"
                  >
                    {broker}
                  </div>
                ))}
                <div className="glass-card rounded-lg px-4 py-2 text-sm text-white/30">
                  +185 more
                </div>
              </div>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-white/2">
        <div className="max-w-7xl mx-auto">
          <Section>
            <motion.div variants={fadeInUp} className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="secondary" className="mb-4">How It Works</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Protection that runs{" "}
                <span className="gradient-text">on autopilot</span>
              </h2>
              <p className="mt-4 text-white/50">
                Set it up in 5 minutes. We handle everything from there.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map(({ number, icon: Icon, title, description }, i) => (
                <motion.div
                  key={number}
                  variants={fadeInUp}
                  className="relative"
                >
                  {i < STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-violet-600/30 to-transparent z-0" />
                  )}
                  <div className="glass-card rounded-2xl p-6 relative z-10 h-full border-violet-500/10">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-4xl font-black text-violet-600/20">{number}</span>
                      <div className="w-10 h-10 bg-violet-600/20 rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-violet-400" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Section>
            <motion.div variants={fadeInUp} className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="secondary" className="mb-4">Features</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Everything you need to{" "}
                <span className="gradient-text">take back control</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map(({ icon: Icon, title, description, color }) => (
                <motion.div
                  key={title}
                  variants={fadeInUp}
                  className="glass-card rounded-2xl p-6 hover:bg-white/8 transition-all duration-300 group"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{description}</p>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/2">
        <div className="max-w-5xl mx-auto">
          <Section>
            <motion.div variants={fadeInUp} className="text-center max-w-2xl mx-auto mb-12">
              <Badge variant="secondary" className="mb-4">Comparison</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Why choose{" "}
                <span className="gradient-text">Shielded</span>?
              </h2>
            </motion.div>

            <motion.div variants={fadeInUp} className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-white/50 text-sm font-medium">Feature</th>
                      <th className="p-4 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-violet-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg">
                          <Shield className="w-3.5 h-3.5" /> Shielded
                        </div>
                      </th>
                      <th className="p-4 text-center text-white/40 text-sm">Cloaked</th>
                      <th className="p-4 text-center text-white/40 text-sm">DeleteMe</th>
                      <th className="p-4 text-center text-white/40 text-sm">Incogni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map(({ feature, shielded, cloaked, deleteme, incogni }, i) => (
                      <tr
                        key={feature}
                        className={`border-b border-white/5 last:border-0 ${i % 2 === 0 ? "bg-white/2" : ""}`}
                      >
                        <td className="p-4 text-sm text-white/70">{feature}</td>
                        {[
                          { val: shielded, highlight: true },
                          { val: cloaked, highlight: false },
                          { val: deleteme, highlight: false },
                          { val: incogni, highlight: false },
                        ].map(({ val, highlight }, j) => (
                          <td key={j} className="p-4 text-center">
                            {typeof val === "boolean" ? (
                              val ? (
                                <CheckCircle className={`w-5 h-5 mx-auto ${highlight ? "text-green-400" : "text-green-600/50"}`} />
                              ) : (
                                <X className="w-5 h-5 mx-auto text-red-500/50" />
                              )
                            ) : (
                              <span className={`text-sm font-medium ${highlight ? "text-violet-300" : "text-white/40"}`}>
                                {val}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Section>
            <motion.div variants={fadeInUp} className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="secondary" className="mb-4">Pricing</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Simple, transparent{" "}
                <span className="gradient-text">pricing</span>
              </h2>
              <p className="mt-4 text-white/50">
                Start with a 14-day free trial. No credit card required.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PLANS.map(({ name, price, period, description, badge, features, cta, highlighted }) => (
                <motion.div
                  key={name}
                  variants={fadeInUp}
                  className={`relative rounded-2xl p-6 flex flex-col ${
                    highlighted
                      ? "bg-violet-600/20 border border-violet-500/50 shadow-glow-lg"
                      : "glass-card border-white/10"
                  }`}
                >
                  {badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-violet-600 text-white border-0 px-4 py-1">
                        {badge}
                      </Badge>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-1">{name}</h3>
                    <p className="text-white/40 text-sm mb-4">{description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black">{price}</span>
                      <span className="text-white/40 text-sm">{period}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm text-white/70">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={highlighted ? "default" : "outline"}
                    className="w-full"
                    asChild
                  >
                    <Link href="/sign-up">{cta}</Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/2">
        <div className="max-w-6xl mx-auto">
          <Section>
            <motion.div variants={fadeInUp} className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="secondary" className="mb-4">Testimonials</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Trusted by{" "}
                <span className="gradient-text">privacy-conscious people</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TESTIMONIALS.map(({ name, role, avatar, text, rating }) => (
                <motion.div
                  key={name}
                  variants={fadeInUp}
                  className="glass-card rounded-2xl p-6"
                >
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed mb-6">"{text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-violet-600/30 rounded-full flex items-center justify-center text-sm font-bold text-violet-300">
                      {avatar}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{name}</div>
                      <div className="text-xs text-white/40">{role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Section>
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">FAQ</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Common{" "}
                <span className="gradient-text">questions</span>
              </h2>
            </motion.div>

            <div className="space-y-3">
              {FAQS.map(({ question, answer }, i) => (
                <motion.div key={i} variants={fadeInUp}>
                  <button
                    className="w-full glass-card rounded-xl p-5 text-left flex items-start justify-between gap-4 hover:bg-white/8 transition-colors"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-medium text-sm sm:text-base">{question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-white/40 flex-shrink-0 transition-transform ${
                        openFaq === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-2 text-white/50 text-sm leading-relaxed">
                          {answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Section>
            <motion.div
              variants={fadeInUp}
              className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-violet-900/80 to-indigo-900/80 border border-violet-500/30 p-12 text-center shield-glow"
            >
              <div className="absolute inset-0 bg-mesh opacity-30" />
              <div className="relative z-10">
                <ShieldCheck className="w-16 h-16 text-violet-400 mx-auto mb-6" />
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Start protecting your privacy today
                </h2>
                <p className="text-white/60 mb-8 max-w-xl mx-auto">
                  Join thousands who have already removed their data from hundreds of broker sites. 14-day free trial, no credit card needed.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="xl" className="shadow-glow-lg" asChild>
                    <Link href="/sign-up">
                      Remove My Data Now
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <Button size="xl" variant="outline" asChild>
                    <Link href="/sign-in">Already have an account?</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">Shielded</span>
              </Link>
              <p className="text-white/40 text-sm leading-relaxed max-w-xs">
                The most comprehensive privacy protection platform. Remove your data, stay anonymous.
              </p>
              <div className="flex gap-3 mt-6">
                {["Tw", "Li", "Gh", "Yt"].map((social) => (
                  <button
                    key={social}
                    className="w-8 h-8 glass-card rounded-lg flex items-center justify-center text-xs text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {social}
                  </button>
                ))}
              </div>
            </div>
            {[
              {
                heading: "Product",
                links: ["Features", "Pricing", "How It Works", "Changelog"],
              },
              {
                heading: "Company",
                links: ["About", "Blog", "Careers", "Press"],
              },
              {
                heading: "Legal",
                links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "CCPA"],
              },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <h4 className="text-sm font-semibold mb-4 text-white/70">{heading}</h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-white/40 hover:text-white/70 transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/30">
              © 2024 Shielded Privacy Inc. All rights reserved.
            </p>
            <p className="text-sm text-white/30">
              Made with privacy in mind. We never sell your data.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
