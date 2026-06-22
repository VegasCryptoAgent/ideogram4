"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Target,
  DollarSign,
  Wrench,
  BarChart2,
  CheckCircle,
  Star,
} from "lucide-react";
import MarketingNavbar from "@/components/marketing/navbar";
import MarketingFooter from "@/components/marketing/footer";

const stats = [
  { value: "30%", label: "Recurring commission" },
  { value: "$50", label: "Avg monthly payout" },
  { value: "60-day", label: "Cookie window" },
  { value: "2,000+", label: "Active affiliates" },
];

const steps = [
  {
    number: "1",
    title: "Sign up",
    description: "Apply in minutes. Get approved within 24 hours.",
  },
  {
    number: "2",
    title: "Share your link",
    description: "Get a unique tracking link and promotional materials.",
  },
  {
    number: "3",
    title: "Earn monthly",
    description: "Receive 30% of every subscription payment your referrals make.",
  },
];

const commissions = [
  { plan: "Free plan referral", rate: "$0 / mo", note: "Converts to paid at 40% rate" },
  { plan: "Premium referral", rate: "$2.99 / mo", note: "30% of $9.99, recurring" },
  { plan: "Family referral", rate: "$4.49 / mo", note: "30% of $14.99, recurring" },
  { plan: "Annual Premium", rate: "$28.80 upfront", note: "30% of $95.88 annual plan" },
];

const whyShield = [
  {
    icon: <Target className="w-6 h-6" />,
    title: "High conversion rate",
    description:
      "Our free scan shows users exactly what risk they face. 40% of free users upgrade within 7 days.",
  },
  {
    icon: <DollarSign className="w-6 h-6" />,
    title: "Recurring commissions",
    description:
      "You earn every month your referrals stay subscribed. Not just the first month.",
  },
  {
    icon: <Wrench className="w-6 h-6" />,
    title: "Marketing materials",
    description:
      "Banners, email templates, landing pages, and social assets ready to use.",
  },
  {
    icon: <BarChart2 className="w-6 h-6" />,
    title: "Real-time dashboard",
    description:
      "Track clicks, signups, conversions, and earnings in real time.",
  },
];

const testimonials = [
  {
    quote:
      "I promoted Shield to my privacy-focused newsletter and earned $1,200 in my first month. The conversion rate is unlike anything I've seen.",
    name: "Marcus T.",
    role: "Tech newsletter creator, 45K subscribers",
    rating: 5,
  },
  {
    quote:
      "The recurring commissions are a game changer. I set it up once and the checks just keep coming in.",
    name: "Sarah K.",
    role: "YouTube creator, 120K subscribers",
    rating: 5,
  },
  {
    quote:
      "Shield's affiliate team is incredibly responsive. They helped me set up custom landing pages that doubled my conversions.",
    name: "David R.",
    role: "Cybersecurity blogger",
    rating: 5,
  },
];

export default function AffiliateProgramPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    website: "",
    promotion: "",
    audienceSize: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F2EC]">
      <MarketingNavbar />

      {/* Hero */}
      <section className="bg-[#F5F2EC] py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#F97316]/10 border border-[#F97316]/20 rounded-full px-4 py-1.5 mb-6">
            <DollarSign className="w-3.5 h-3.5 text-[#F97316]" />
            <span className="text-[#F97316] text-sm font-medium">Affiliate program</span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl text-[#141410] font-bold leading-tight mb-6">
            Earn 30% recurring commission
          </h1>
          <p className="text-[#1A1A14]/60 text-xl max-w-2xl mx-auto mb-10">
            Join Shield's affiliate program and earn every month your referrals stay subscribed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#apply"
              className="inline-flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#EA6B0F] text-white px-8 py-3.5 rounded-xl font-semibold transition-colors"
            >
              Join the program
              <ChevronRight className="w-4 h-4" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 border border-[#D4CFC5] text-[#1A1A14] px-8 py-3.5 rounded-xl font-semibold hover:border-[#1A1A14] transition-colors"
            >
              Learn more ↓
            </a>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#0E0E0A] py-10 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 px-6 py-2">
              <span className="text-white font-bold text-2xl md:text-3xl">{s.value}</span>
              <span className="text-white/50 text-xs uppercase tracking-wide text-center">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 bg-[#F5F2EC]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl text-[#141410] font-bold mb-4">How it works</h2>
            <p className="text-[#1A1A14]/55 text-lg">Simple. Transparent. Profitable.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#F97316] text-white font-serif font-bold text-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#F97316]/20">
                  {step.number}
                </div>
                <h3 className="font-serif text-xl text-[#141410] font-bold mb-3">{step.title}</h3>
                <p className="text-[#1A1A14]/60 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Structure */}
      <section className="py-20 px-6 bg-[#E8E3D9]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl text-[#141410] font-bold mb-4">
              Commission structure
            </h2>
            <p className="text-[#1A1A14]/55 text-lg">Earn on every plan, every month.</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#D4CFC5] overflow-hidden">
            <div className="grid grid-cols-3 bg-[#F5F2EC] border-b border-[#D4CFC5] px-6 py-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#1A1A14]/50">Plan</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-[#1A1A14]/50 text-center">You earn</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-[#1A1A14]/50 text-right">Details</span>
            </div>
            {commissions.map((row, i) => (
              <div
                key={row.plan}
                className={`grid grid-cols-3 px-6 py-4 items-center ${i < commissions.length - 1 ? "border-b border-[#E5E0D5]" : ""}`}
              >
                <span className="font-medium text-[#141410]">{row.plan}</span>
                <span className="text-[#F97316] font-bold text-center">{row.rate}</span>
                <span className="text-[#1A1A14]/50 text-sm text-right">{row.note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Shield Converts */}
      <section className="py-24 px-6 bg-[#0E0E0A]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl text-white font-bold mb-4">
              Why Shield converts well
            </h2>
            <p className="text-white/50 text-lg">Everything you need to earn big.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {whyShield.map((item) => (
              <div
                key={item.title}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F97316]/15 flex items-center justify-center text-[#F97316] mb-4">
                  {item.icon}
                </div>
                <h3 className="font-serif text-lg text-white font-bold mb-2">{item.title}</h3>
                <p className="text-white/55 leading-relaxed text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-[#F5F2EC]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl text-[#141410] font-bold mb-4">
              What affiliates say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white border border-[#E5E0D5] rounded-2xl p-6 flex flex-col gap-4"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#F97316] text-[#F97316]" />
                  ))}
                </div>
                <p className="text-[#1A1A14]/70 text-sm leading-relaxed flex-1">"{t.quote}"</p>
                <div>
                  <p className="font-semibold text-[#141410] text-sm">{t.name}</p>
                  <p className="text-[#1A1A14]/50 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-24 px-6 bg-[#E8E3D9]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-serif text-4xl text-[#141410] font-bold mb-4">
              Apply to become a Shield affiliate
            </h2>
            <p className="text-[#1A1A14]/55">We review all applications within 24 hours.</p>
          </div>

          {submitted ? (
            <div className="bg-white border border-green-200 rounded-2xl p-10 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-serif text-2xl font-bold text-[#141410] mb-2">
                Application submitted!
              </h3>
              <p className="text-[#1A1A14]/60">
                We'll review your application and get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-[#D4CFC5] rounded-2xl p-8 flex flex-col gap-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#141410] mb-1.5">
                    Full name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#D4CFC5] rounded-xl text-[#1A1A14] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316] transition-all"
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#141410] mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#D4CFC5] rounded-xl text-[#1A1A14] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316] transition-all"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#141410] mb-1.5">
                  Website / Social URL
                </label>
                <input
                  type="url"
                  required
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#D4CFC5] rounded-xl text-[#1A1A14] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316] transition-all"
                  placeholder="https://yoursite.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#141410] mb-1.5">
                  Monthly audience size
                </label>
                <select
                  required
                  value={form.audienceSize}
                  onChange={(e) => setForm({ ...form, audienceSize: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#D4CFC5] rounded-xl text-[#1A1A14] bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316] transition-all"
                >
                  <option value="">Select size…</option>
                  <option value="<1K">Less than 1,000</option>
                  <option value="1K-10K">1,000 – 10,000</option>
                  <option value="10K-100K">10,000 – 100,000</option>
                  <option value="100K+">100,000+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#141410] mb-1.5">
                  How will you promote Shield?
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.promotion}
                  onChange={(e) => setForm({ ...form, promotion: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#D4CFC5] rounded-xl text-[#1A1A14] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316] transition-all resize-none"
                  placeholder="Tell us about your audience and how you plan to promote Shield…"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#F97316] hover:bg-[#EA6B0F] text-white py-3.5 rounded-xl font-semibold transition-colors"
              >
                Submit Application
              </button>
              <p className="text-center text-[#1A1A14]/40 text-sm">
                We review all applications within 24 hours.
              </p>
            </form>
          )}
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
