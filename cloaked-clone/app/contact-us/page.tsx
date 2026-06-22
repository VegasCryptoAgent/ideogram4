"use client";

import { useState } from "react";
import {
  MessageCircle,
  Mail,
  BookOpen,
  ChevronDown,
  CheckCircle,
  MapPin,
  Check,
  Phone,
} from "lucide-react";
import MarketingNavbar from "@/components/marketing/navbar";
import MarketingFooter from "@/components/marketing/footer";

const faqs = [
  {
    q: "How do I cancel my subscription?",
    a: "You can cancel your subscription at any time from Settings → Billing. Your access will continue until the end of the current billing period, and you won't be charged again. Unlike Cloaked, Shield immediately stops all alias forwarding upon cancellation. You won't receive any calls or emails through Shield after you cancel.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes! Shield offers a 7-day free trial for Premium. No credit card required during the trial. You'll be prompted to add payment info only if you decide to continue.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "After cancellation, all aliases are disabled within 24 hours and forwarding stops immediately. All personal data associated with your account is permanently deleted from our servers within 30 days.",
  },
  {
    q: "Does Shield work outside the US?",
    a: "Shield currently supports users in the United States and Canada. Data broker removal is limited to US-based brokers. We're actively working on expanding to additional regions.",
  },
  {
    q: "How do I get a refund?",
    a: "Shield offers a 30-day money-back guarantee. If you're not satisfied for any reason within the first 30 days, contact support@shield.id and a human agent will issue a full refund — no questions asked. Refunds are processed within 3 business days.",
  },
  {
    q: "Do I have to deal with AI chatbots?",
    a: "No. Every Shield support interaction is handled by a real human. We believe AI chatbots are not appropriate for privacy and billing issues. When you contact us, you'll always reach a person.",
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
          <p className="text-[#1A1A14]/60 text-xl mb-6">
            Our support team typically responds within a few hours.
          </p>

          {/* REAL HUMANS badge */}
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-bold px-5 py-2.5 rounded-full">
            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-3 h-3 text-green-600" strokeWidth={3} />
            </div>
            REAL HUMANS — NOT AI CHATBOTS
          </div>
        </div>
      </section>

      {/* Support Channels */}
      <section className="pb-20 px-6 bg-[#F5F2EC]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Live Chat */}
          <div className="bg-white border border-[#E5E0D5] rounded-2xl p-6 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 flex items-center justify-center text-[#F97316]">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#141410] font-bold mb-1">
                Live Chat
              </h3>
              <p className="text-[#1A1A14]/55 text-sm leading-relaxed">
                Real support agents — Mon–Sun 8am–10pm ET. Average response time: under 3 minutes. No AI bots.
              </p>
            </div>
            <a
              href="#"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors bg-[#F97316] hover:bg-[#EA6B0F] text-white"
            >
              Start chat
            </a>
          </div>

          {/* Email Support */}
          <div className="bg-white border border-[#E5E0D5] rounded-2xl p-6 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 flex items-center justify-center text-[#F97316]">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#141410] font-bold mb-1">
                Email Support
              </h3>
              <p className="text-[#1A1A14]/55 text-sm leading-relaxed">
                support@shield.id — Human agents reply within 2 hours, guaranteed. Not an AI.
              </p>
            </div>
            <a
              href="mailto:support@shield.id"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors border border-[#D4CFC5] text-[#1A1A14] hover:border-[#1A1A14]"
            >
              Send email
            </a>
          </div>

          {/* Help Center */}
          <div className="bg-white border border-[#E5E0D5] rounded-2xl p-6 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 flex items-center justify-center text-[#F97316]">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#141410] font-bold mb-1">
                Help Center
              </h3>
              <p className="text-[#1A1A14]/55 text-sm leading-relaxed">
                Browse 200+ articles. Find answers to common questions instantly.
              </p>
            </div>
            <a
              href="/help"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors border border-[#D4CFC5] text-[#1A1A14] hover:border-[#1A1A14]"
            >
              Browse articles →
            </a>
          </div>
        </div>

        {/* 30-day money-back guarantee callout */}
        <div className="max-w-5xl mx-auto mt-6">
          <div className="bg-white border-2 border-[#F97316]/40 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-[#F97316]" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#141410] font-bold mb-1">
                30-Day Money-Back Guarantee
              </h3>
              <p className="text-[#1A1A14]/60 text-sm leading-relaxed">
                No questions asked. Full refund processed within 3 business days by a human agent.
                Contact us anytime within 30 days of purchase at{" "}
                <a href="mailto:support@shield.id" className="text-[#F97316] hover:underline">
                  support@shield.id
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-[#0E0E0A] py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-serif text-4xl text-white font-bold mb-3">
              Send us a message
            </h2>
            <p className="text-white/50">
              We'll get back to you within 2 hours. Always a human — never a bot.
            </p>
          </div>

          {submitted ? (
            <div className="bg-white/5 border border-green-500/30 rounded-2xl p-10 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="font-serif text-2xl font-bold text-white mb-2">
                Message sent!
              </h3>
              <p className="text-white/60">
                A real human will be in touch within 2 hours.
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
                  <option value="refund" className="bg-[#1A1A14]">Refund request</option>
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
