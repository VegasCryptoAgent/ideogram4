"use client";

import { motion } from "framer-motion";
import {
  Lock,
  Shield,
  Ban,
  Globe,
  CheckCircle,
  X,
  Mail,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import MarketingNavbar from "@/components/marketing/navbar";
import MarketingFooter from "@/components/marketing/footer";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const pillars = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    body: "Your data is encrypted in transit and at rest using AES-256 and TLS 1.3. We can't read your data — and neither can anyone else.",
  },
  {
    icon: Shield,
    title: "SOC 2 Type II",
    body: "Shield undergoes regular third-party security audits. We're SOC 2 Type II certified for security, availability, and confidentiality.",
  },
  {
    icon: Ban,
    title: "Zero Data Sales",
    body: "We will never sell, rent, or share your personal data with third parties for advertising or marketing purposes. Full stop.",
  },
  {
    icon: Globe,
    title: "Privacy by Design",
    body: "Minimal data collection by design. We only collect what's necessary and give you full control to delete it at any time.",
  },
];

const techColumns = [
  {
    title: "Encryption",
    items: ["AES-256 at rest", "TLS 1.3 in transit", "E2E for aliases"],
  },
  {
    title: "Infrastructure",
    items: ["AWS GovCloud", "SOC 2 audited data centers", "99.9% uptime SLA"],
  },
  {
    title: "Access Control",
    items: [
      "Zero-knowledge architecture",
      "2FA required for staff",
      "Hardware security keys",
      "Least-privilege access",
    ],
  },
];

const weCollect = [
  "Email address",
  "Phone number (hashed)",
  "Usage analytics (anonymized)",
];

const weNeverCollect = [
  "SSN or government IDs",
  "Financial data",
  "Message content",
  "Browsing history",
];

const badges = ["SOC 2", "GDPR", "CCPA", "PIPEDA"];

export default function TrustPage() {
  return (
    <div className="min-h-screen bg-[#F5F2EC] font-sans">
      <MarketingNavbar />

      {/* Hero */}
      <section className="bg-[#141410] text-white pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/70 mb-8">
              <Lock className="w-3.5 h-3.5" />
              Security & Privacy
            </div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              We take your trust seriously.
            </h1>
            <p className="text-xl text-white/65 max-w-2xl mx-auto leading-relaxed">
              Built from the ground up with security, transparency, and your
              privacy as the foundation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trust Pillars */}
      <section className="bg-[#1A1A14] py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="font-serif text-3xl md:text-4xl font-bold text-white text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Our security commitments
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  className="bg-[#141410] border border-white/10 rounded-2xl p-8 hover:border-[#F97316]/40 transition-colors duration-300"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="w-12 h-12 bg-[#F97316]/10 rounded-xl flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-[#F97316]" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-white mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-white/65 leading-relaxed">{pillar.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technical Security Details */}
      <section className="bg-[#F5F2EC] py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#141410] mb-4">
              How we protect your data
            </h2>
            <p className="text-[#1A1A14]/55 text-lg">
              Technical details for the security-minded.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {techColumns.map((col, i) => (
              <motion.div
                key={col.title}
                className="bg-white border border-[#D4CFC5] rounded-2xl p-8"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <h3 className="font-serif text-xl font-bold text-[#141410] mb-5">
                  {col.title}
                </h3>
                <ul className="space-y-3">
                  {col.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#F97316] mt-0.5 flex-shrink-0" />
                      <span className="text-[#1A1A14]/65 text-sm leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Commitments */}
      <section className="bg-[#141410] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
              Data we collect vs. data we never touch
            </h2>
            <p className="text-white/55 text-lg">
              Transparency means telling you exactly what flows through our
              systems.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* What we collect */}
            <motion.div
              className="bg-white/5 border border-white/10 rounded-2xl p-8"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <h3 className="font-serif text-xl font-bold text-white">
                  What we collect
                </h3>
              </div>
              <ul className="space-y-4">
                {weCollect.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white/65 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* What we never collect */}
            <motion.div
              className="bg-white/5 border border-white/10 rounded-2xl p-8"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <X className="w-5 h-5 text-red-400" />
                <h3 className="font-serif text-xl font-bold text-white">
                  What we never collect
                </h3>
              </div>
              <ul className="space-y-4">
                {weNeverCollect.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white/65 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bug Bounty */}
      <section className="bg-[#E8E3D9] py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-14 h-14 bg-[#F97316]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-7 h-7 text-[#F97316]" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#141410] mb-4">
              Bug Bounty Program
            </h2>
            <p className="text-[#1A1A14]/65 text-lg leading-relaxed mb-8">
              Found a vulnerability? We pay researchers who responsibly disclose
              security issues. Help us keep Shield safe for everyone.
            </p>
            <a
              href="mailto:security@shield.id"
              className="inline-flex items-center gap-2 bg-[#141410] text-white rounded-full px-7 py-3.5 font-medium hover:bg-[#0E0E0A] transition-colors"
            >
              <Mail className="w-4 h-4" />
              security@shield.id
            </a>
          </motion.div>
        </div>
      </section>

      {/* Compliance Badges */}
      <section className="bg-[#F5F2EC] py-16 px-6 border-y border-[#D4CFC5]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-[#1A1A14]/55 text-sm uppercase tracking-widest font-medium">
              Compliance &amp; Certifications
            </p>
          </motion.div>
          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {badges.map((badge) => (
              <div
                key={badge}
                className="bg-[#141410] text-white text-sm font-medium px-5 py-2.5 rounded-full"
              >
                {badge}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#F97316] py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-5">
              Your privacy is our business — literally.
            </h2>
            <p className="text-white/80 text-lg mb-10 leading-relaxed">
              Every feature we build, every decision we make is in service of
              protecting you.
            </p>
            <Link
              href="/get-started"
              className="inline-flex items-center gap-2 bg-white text-[#F97316] rounded-full px-8 py-4 font-semibold text-lg hover:bg-white/90 transition-colors"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
