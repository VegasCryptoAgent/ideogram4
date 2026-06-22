"use client";

import { motion } from "framer-motion";
import {
  Target,
  Heart,
  Microscope,
  Users,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import MarketingNavbar from "@/components/marketing/navbar";
import MarketingFooter from "@/components/marketing/footer";

const stats = [
  { value: "4M+", label: "Users protected" },
  { value: "400+", label: "Brokers covered" },
  { value: "1.7B+", label: "Records removed" },
  { value: "$375M", label: "Raised" },
];

const teamMembers = [
  {
    initials: "SC",
    color: "bg-violet-500",
    name: "Sarah Chen",
    title: "CEO & Co-Founder",
    bio: "Former Google privacy engineer. Built privacy tools used by 50M+ users.",
  },
  {
    initials: "MW",
    color: "bg-blue-500",
    name: "Marcus Webb",
    title: "CTO & Co-Founder",
    bio: "Ex-NSA security researcher. 20 years in cryptography and data security.",
  },
  {
    initials: "PN",
    color: "bg-emerald-500",
    name: "Priya Nair",
    title: "Head of Product",
    bio: "Previously at Apple. Led privacy features for iOS 14–17.",
  },
  {
    initials: "JT",
    color: "bg-orange-500",
    name: "James Torres",
    title: "Head of Data Removal",
    bio: "Former FTC investigator specializing in data broker enforcement.",
  },
  {
    initials: "AJ",
    color: "bg-rose-500",
    name: "Aisha Johnson",
    title: "Head of Growth",
    bio: "Built consumer privacy brand at 3 successful startups.",
  },
  {
    initials: "DP",
    color: "bg-amber-500",
    name: "Dev Patel",
    title: "Head of Engineering",
    bio: "Ex-Cloudflare. Architect of large-scale distributed systems.",
  },
];

const pressOutlets = [
  "PCMag",
  "TechCrunch",
  "Forbes",
  "Wired",
  "WSJ",
  "New York Times",
];

const values = [
  {
    icon: Target,
    title: "Radical Transparency",
    body: "We tell you exactly what we do with your data, how we make money, and what our limitations are.",
  },
  {
    icon: Users,
    title: "User Control",
    body: "You own your data. Always. Delete your account and everything goes with it.",
  },
  {
    icon: Microscope,
    title: "Relentless Improvement",
    body: "Privacy threats evolve. So do we. Weekly updates, monthly feature drops.",
  },
  {
    icon: Heart,
    title: "People Over Profit",
    body: "We'd rather lose a feature than compromise user privacy.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F5F2EC] font-sans">
      <MarketingNavbar />

      {/* Hero */}
      <section className="bg-[#F5F2EC] pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#141410]/8 border border-[#D4CFC5] rounded-full px-4 py-1.5 text-sm text-[#1A1A14]/65 mb-8">
              Founded 2021
            </div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-[#141410] mb-6 leading-tight">
              We're fighting for your privacy.
            </h1>
            <p className="text-xl text-[#1A1A14]/65 max-w-2xl mx-auto leading-relaxed">
              Shield was founded in 2021 by a team obsessed with fixing the
              broken data economy. We believe everyone deserves control over
              their personal information.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-[#141410] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-8">
              Privacy shouldn't be a luxury.
            </h2>
            <div className="space-y-5 text-white/65 text-lg leading-relaxed">
              <p>
                Data brokers have built a $240 billion industry by collecting
                and selling your most sensitive information — your home address,
                phone number, family members, daily routine — to anyone willing
                to pay. Most people have no idea this is happening.
              </p>
              <p>
                The surveillance economy treats your personal data as a
                commodity. Every search, purchase, and social media interaction
                is tracked, packaged, and sold dozens of times over. We started
                Shield because we believed ordinary people deserved a way to
                fight back.
              </p>
              <p>
                Shield exists to give you back control. We automate the tedious
                process of opting out of data brokers, protect your real
                identity with aliases, and monitor the dark web so you don't
                have to. Privacy shouldn't require a law degree or thousands of
                hours of manual labor.
              </p>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="font-serif text-3xl md:text-4xl font-bold text-[#F97316] mb-2">
                  {stat.value}
                </div>
                <div className="text-white/55 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
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
              Meet the team
            </h2>
            <p className="text-[#1A1A14]/55 text-lg">
              Privacy experts, technologists, and advocates — united by one
              mission.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.name}
                className="bg-white border border-[#D4CFC5] rounded-2xl p-6 hover:border-[#F97316]/40 hover:shadow-md transition-all duration-300"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div
                  className={`w-14 h-14 ${member.color} rounded-full flex items-center justify-center mb-4`}
                >
                  <span className="text-white font-bold text-lg">
                    {member.initials}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#141410] mb-0.5">
                  {member.name}
                </h3>
                <p className="text-[#F97316] text-sm font-medium mb-3">
                  {member.title}
                </p>
                <p className="text-[#1A1A14]/65 text-sm leading-relaxed">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Press */}
      <section className="bg-[#1A1A14] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
              Shield in the press
            </h2>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-14"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {pressOutlets.map((outlet) => (
              <div
                key={outlet}
                className="bg-white/10 text-white/70 text-sm font-medium px-5 py-2.5 rounded-full border border-white/15 hover:bg-white/15 transition-colors"
              >
                {outlet}
              </div>
            ))}
          </motion.div>

          <motion.blockquote
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-white text-xl md:text-2xl font-serif italic leading-relaxed mb-5">
              "Shield is the most comprehensive privacy tool we've tested."
            </p>
            <cite className="text-[#F97316] text-sm font-medium not-italic">
              — PCMag, Editor's Choice 2026
            </cite>
          </motion.blockquote>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[#E8E3D9] py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#141410] mb-4">
              Our values
            </h2>
            <p className="text-[#1A1A14]/55 text-lg">
              The principles that guide every decision we make.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  className="bg-white border border-[#D4CFC5] rounded-2xl p-6"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="w-11 h-11 bg-[#F97316]/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#F97316]" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#141410] mb-3">
                    {value.title}
                  </h3>
                  <p className="text-[#1A1A14]/65 text-sm leading-relaxed">
                    {value.body}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Careers CTA */}
      <section className="bg-[#141410] py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-5">
              Join our mission
            </h2>
            <p className="text-white/65 text-lg leading-relaxed mb-10">
              We're hiring across engineering, privacy research, and growth.
              Come help us build the future of personal privacy.
            </p>
            <Link
              href="#"
              className="inline-flex items-center gap-2 bg-[#F97316] text-white rounded-full px-8 py-4 font-semibold text-lg hover:bg-[#EA6B0F] transition-colors"
            >
              View open roles
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
