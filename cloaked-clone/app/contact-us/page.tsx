"use client";

import { useState } from "react";
import {
  MessageCircle,
  Mail,
  BookOpen,
  ChevronDown,
  CheckCircle,
  MapPin,
} from "lucide-react";
import MarketingNavbar from "@/components/marketing/navbar";
import MarketingFooter from "@/components/marketing/footer";

const faqs = [
  {
    q: "How do I cancel my subscription?",
    a: "You can cancel your subscription at any time from Settings → Billing. Your access will continue until the end of the current billing period, and you won't be charged again.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes! Shield offers a 7-day free trial for Premium. No credit card required during the trial. You'll be prompted to add payment info only if you decide to continue.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "After cancellation, your data is retained for a 30-day grace period in case you resubscribe. After 30 days, all personal data associated with your account is permanently deleted from our servers.",
  },
  {
    q: "Does Shield work outside the US?",
    a: "Shield currently supports users in the United States and Canada. Data broker removal is limited to US-based brokers. We're actively working on expanding to additional regions.",
  },
  {
    q: "How do I get a refund?",
    a: "Shield offers a 30-day money-back guarantee. If you're not satisfied for any reason within the first 30 days, contact support@shield.id and we'll issue a full refund, no questions asked.",
  },
  {
    q: "How do I report a security vulnerability?",
    a: "We take security seriously. Please email security@shield.id with details of any vulnerability you discover. We operate a responsible disclosure program and offer bug bounty rewards for verified findings.",
  },
];

export default function ContactUsPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F2EC]">
      <MarketingNavbar />

      {/* Hero */}
      <section className="bg-[#F5F2EC] py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-5xl md:text-6xl text-[#141410] font-bold leading-tight mb-5">
            How can we help?
          </h1>
          <p className="text-[#1A1A14]/60 text-xl">
            Our support team typically responds within a few hours.
          </p>
        </div>
      </section>

      {/* Support Channels */}
      <section className="pb-20 px-6 bg-[#F5F2EC]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <MessageCircle className="w-6 h-6" />,
              title: "Live Chat",
              description: "Available Mon–Fri, 9am–6pm ET",
              buttonText: "Start chat",
              buttonStyle: "bg-[#F97316] hover:bg-[#EA6B0F] text-white",
              href: "#",
            },
            {
              icon: <Mail className="w-6 h-6" />,
              title: "Email Support",
              description: "support@shield.id — For billing, account issues, and general questions.",
              buttonText: "Send email",
              buttonStyle: "border border-[#D4CFC5] text-[#1A1A14] hover:border-[#1A1A14]",
              href: "mailto:support@shield.id",
            },
            {
              icon: <BookOpen className="w-6 h-6" />,
              title: "Help Center",
              description: "Browse 200+ articles. Find answers to common questions instantly.",
              buttonText: "Browse articles →",
              buttonStyle: "border border-[#D4CFC5] text-[#1A1A14] hover:border-[#1A1A14]",
              href: "/help",
            },
          ].map((channel) => (
            <div
              key={channel.title}
              className="bg-white border border-[#E5E0D5] rounded-2xl p-6 flex flex-col gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 flex items-center justify-center text-[#F97316]">
                {channel.icon}
              </div>
              <div>
                <h3 className="font-serif text-lg text-[#141410] font-bold mb-1">
                  {channel.title}
                </h3>
                <p className="text-[#1A1A14]/55 text-sm leading-relaxed">
                  {channel.description}
                </p>
              </div>
              <a
                href={channel.href}
                className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${channel.buttonStyle}`}
              >
                {channel.buttonText}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-[#0E0E0A] py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-serif text-4xl text-white font-bold mb-3">
              Send us a message
            </h2>
            <p className="text-white/50">We'll get back to you within 24 hours.</p>
          </div>

          {submitted ? (
            <div className="bg-white/5 border border-green-500/30 rounded-2xl p-10 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="font-serif text-2xl font-bold text-white mb-2">
                Message sent!
              </h3>
              <p className="text-white/60">
                We'll be in touch within 24 hours.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316] transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316] transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  Subject
                </label>
                <select
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316] transition-all appearance-none"
                >
                  <option value="" className="bg-[#1A1A14]">Select a subject…</option>
                  <option value="general" className="bg-[#1A1A14]">General question</option>
                  <option value="billing" className="bg-[#1A1A14]">Billing & payments</option>
                  <option value="technical" className="bg-[#1A1A14]">Technical issue</option>
                  <option value="privacy" className="bg-[#1A1A14]">Privacy concern</option>
                  <option value="partnership" className="bg-[#1A1A14]">Partnership</option>
                  <option value="press" className="bg-[#1A1A14]">Press inquiry</option>
                  <option value="other" className="bg-[#1A1A14]">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316] transition-all resize-none"
                  placeholder="Tell us how we can help…"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#F97316] hover:bg-[#EA6B0F] text-white py-3.5 rounded-xl font-semibold transition-colors"
              >
                Send message
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-[#F5F2EC]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl text-[#141410] font-bold mb-4">
              Frequently asked questions
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white border border-[#E5E0D5] rounded-2xl overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left gap-4"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium text-[#141410]">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#1A1A14]/40 shrink-0 transition-transform ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-[#1A1A14]/65 text-sm leading-relaxed border-t border-[#E5E0D5] pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Office Card */}
      <section className="bg-[#0E0E0A] py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-xl bg-[#F97316]/15 flex items-center justify-center text-[#F97316] shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-white font-bold mb-1">
                Shield Privacy, Inc.
              </h3>
              <p className="text-white/60 mb-2">2600 S Loop W, Suite 400, Houston, TX 77054</p>
              <p className="text-white/40 text-sm">
                We're a remote-first company with teams across North America.
              </p>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
