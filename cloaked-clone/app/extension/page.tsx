"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Minus, Shield, Zap, AlertTriangle, KeyRound, MousePointerClick } from "lucide-react";
import MarketingNavbar from "@/components/marketing/navbar";
import MarketingFooter from "@/components/marketing/footer";

// ── Comparison table data ─────────────────────────────────────────────────────

type BoolOrString = boolean | string;

const COMPARISON: { feature: string; shield: BoolOrString; cloaked: BoolOrString }[] = [
  { feature: "AutoCloak sites supported", shield: "100+", cloaked: "~2 (beta)" },
  { feature: "Firefox support", shield: true, cloaked: false },
  { feature: "Safari support", shield: true, cloaked: false },
  { feature: "Breach detection", shield: true, cloaked: false },
  { feature: "Password manager integration", shield: true, cloaked: "Basic" },
  { feature: "Free with plan", shield: true, cloaked: true },
];

function CompareCell({ value }: { value: BoolOrString }) {
  if (value === true)
    return (
      <div className="flex justify-center">
        <div className="w-6 h-6 rounded-full bg-[#F97316]/15 flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-[#F97316]" strokeWidth={2.5} />
        </div>
      </div>
    );
  if (value === false)
    return (
      <div className="flex justify-center">
        <Minus className="w-4 h-4 text-white/20" />
      </div>
    );
  return <div className="text-center text-sm text-white/60 font-medium">{value}</div>;
}

// ── Browser icons (pure CSS) ──────────────────────────────────────────────────

const BROWSERS = [
  { name: "Chrome", color: "from-blue-500 via-red-400 to-yellow-400", letter: "C", textColor: "text-white" },
  { name: "Firefox", color: "from-orange-500 to-red-600", letter: "F", textColor: "text-white" },
  { name: "Safari", color: "from-blue-400 to-teal-400", letter: "S", textColor: "text-white" },
  { name: "Edge", color: "from-teal-500 to-blue-600", letter: "E", textColor: "text-white" },
  { name: "Brave", color: "from-orange-500 to-orange-700", letter: "B", textColor: "text-white" },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ExtensionPage() {
  return (
    <div className="min-h-screen bg-[#F5F2EC] overflow-x-hidden">
      <MarketingNavbar />

      {/* ── Hero (dark) ── */}
      <section className="bg-[#141410] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            {/* Left copy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              <div className="inline-flex items-center gap-2 bg-[#F97316]/10 text-[#F97316] text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6">
                <Zap className="w-3.5 h-3.5" />
                Now Available — Free with any Shield plan
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-serif leading-[1.08] mb-6">
                The Shield Extension brings{" "}
                <span className="text-[#F97316]">AutoCloak</span> to every website.
              </h1>
              <p className="text-white/55 text-lg leading-relaxed mb-8 max-w-xl">
                Install once. Shield generates unique aliases whenever you sign up anywhere — automatically.
              </p>
              <div className="flex flex-wrap gap-3 mb-4">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA6B0F] text-white font-semibold px-6 py-3.5 rounded-xl transition-colors text-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z" />
                  </svg>
                  Add to Chrome (Free)
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 border border-white/25 hover:border-white/50 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors text-sm"
                >
                  Add to Firefox
                </a>
              </div>
              <p className="text-white/30 text-xs">Also available for Safari and Edge</p>
            </motion.div>

            {/* Right: extension popup mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex justify-center lg:justify-end"
            >
              {/* Browser chrome */}
              <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
                {/* Browser toolbar */}
                <div className="bg-zinc-800 px-4 py-3 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  </div>
                  <div className="flex-1 bg-zinc-700 rounded-lg px-3 py-1 text-xs text-zinc-400">
                    amazon.com/account/register
                  </div>
                  <div className="w-6 h-6 rounded-md bg-[#F97316] flex items-center justify-center">
                    <Shield className="w-3.5 h-3.5 text-white" fill="white" />
                  </div>
                </div>

                {/* Extension popup dropdown */}
                <div className="bg-zinc-900 border-t border-white/10">
                  {/* Popup header */}
                  <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-white/10">
                    <div className="w-7 h-7 rounded-lg bg-[#F97316]/20 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-[#F97316]" fill="currentColor" />
                    </div>
                    <div>
                      <p className="text-white text-xs font-semibold">Shield Extension</p>
                      <p className="text-zinc-500 text-xs">AutoCloak active</p>
                    </div>
                    <div className="ml-auto">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    </div>
                  </div>

                  {/* Detection notice */}
                  <div className="px-4 py-3 bg-amber-500/5 border-b border-amber-500/15">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <p className="text-amber-400 text-xs font-medium">Sign-up form detected</p>
                    </div>
                    <p className="text-zinc-400 text-xs">amazon.com/account/register</p>
                  </div>

                  {/* Creating alias animation */}
                  <div className="px-4 py-3.5 border-b border-white/10">
                    <p className="text-zinc-400 text-xs mb-2">AutoCloak is creating an alias...</p>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-[#F97316] rounded-full animate-pulse" style={{ width: '75%' }} />
                    </div>
                  </div>

                  {/* Result */}
                  <div className="px-4 py-3.5 border-b border-white/10">
                    <p className="text-zinc-500 text-xs mb-1.5">Alias created</p>
                    <div className="flex items-center gap-2">
                      <code className="text-[#F97316] font-mono text-sm font-medium">
                        amzn-x7k2@shield.app
                      </code>
                      <div className="ml-auto w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-green-400" strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>

                  {/* Copied confirmation */}
                  <div className="px-4 py-3 flex items-center gap-2">
                    <MousePointerClick className="w-3.5 h-3.5 text-green-400" />
                    <p className="text-green-400 text-xs font-medium">Copied to clipboard & autofilled</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features row (cream) ── */}
      <section className="bg-[#F5F2EC] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#141410] font-serif mb-3">
              Everything you need. Built into the browser.
            </h2>
            <p className="text-[#1A1A14]/55 max-w-lg mx-auto text-sm">
              The Shield extension adds a powerful privacy layer to every website you visit.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: <Zap className="w-6 h-6 text-[#F97316]" />,
                bg: "bg-[#F97316]/10",
                title: "AutoCloak",
                desc: "Detects signup forms and creates aliases automatically. Works on 100+ sites without any setup.",
              },
              {
                icon: <MousePointerClick className="w-6 h-6 text-blue-500" />,
                bg: "bg-blue-500/10",
                title: "Autofill",
                desc: "One-click fill with your Shield aliases. Never type a fake email again or copy-paste manually.",
              },
              {
                icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
                bg: "bg-red-500/10",
                title: "Breach Alert",
                desc: "Real-time alerts when you're on a breached site. Instantly see if the site you're visiting has been compromised.",
              },
              {
                icon: <KeyRound className="w-6 h-6 text-green-500" />,
                bg: "bg-green-500/10",
                title: "Password Fill",
                desc: "Fill passwords from your Shield vault directly in the browser. No extra apps or copy-pasting needed.",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="bg-white border border-[#E5E0D5] rounded-2xl p-6"
              >
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="text-[#141410] font-bold text-base mb-2 font-serif">{f.title}</h3>
                <p className="text-[#1A1A14]/60 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Browser compatibility (dark) ── */}
      <section className="bg-[#141410] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-serif mb-3">
              Works in every browser.
            </h2>
            <p className="text-white/45 text-sm mb-12">
              Install in seconds. No account required to get started.
            </p>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            {BROWSERS.map((b, i) => (
              <motion.div
                key={b.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex flex-col items-center gap-3"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center shadow-lg`}>
                  <span className={`text-2xl font-black ${b.textColor}`}>{b.letter}</span>
                </div>
                <p className="text-white/60 text-xs font-medium">{b.name}</p>
                <a
                  href="#"
                  className="text-xs bg-white/10 hover:bg-white/15 text-white/70 hover:text-white px-3.5 py-1.5 rounded-lg transition-colors font-medium"
                >
                  Install
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How AutoCloak works (cream) ── */}
      <section className="bg-[#F5F2EC] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#141410] font-serif mb-3">
              How AutoCloak works
            </h2>
            <p className="text-[#1A1A14]/55 text-sm">From signup form to protected alias in under a second.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "You visit a signup page",
                desc: "Browse to any website and navigate to their account creation or signup page.",
                mockup: (
                  <div className="bg-white rounded-xl border border-[#E5E0D5] p-4 mt-4 space-y-2">
                    <div className="h-2.5 bg-[#E5E0D5] rounded-full w-3/4" />
                    <div className="h-2.5 bg-[#E5E0D5] rounded-full w-1/2" />
                    <div className="mt-3 space-y-2">
                      <div className="h-8 border border-[#D4CFC5] rounded-lg bg-white px-3 flex items-center">
                        <span className="text-xs text-[#1A1A14]/30">Enter your email...</span>
                      </div>
                      <div className="h-8 border border-[#D4CFC5] rounded-lg bg-white" />
                    </div>
                    <div className="h-8 bg-[#E5E0D5] rounded-lg w-full mt-1" />
                  </div>
                ),
              },
              {
                step: "02",
                title: "Shield detects the email field",
                desc: "AutoCloak scans the page for email input fields and highlights them in real time.",
                mockup: (
                  <div className="bg-white rounded-xl border border-[#E5E0D5] p-4 mt-4 space-y-2">
                    <div className="h-2.5 bg-[#E5E0D5] rounded-full w-3/4" />
                    <div className="h-2.5 bg-[#E5E0D5] rounded-full w-1/2" />
                    <div className="mt-3 space-y-2">
                      {/* Animated orange highlight on email field */}
                      <div className="h-8 border-2 border-[#F97316] rounded-lg bg-[#F97316]/5 px-3 flex items-center gap-2 relative overflow-hidden">
                        <span className="text-xs text-[#F97316] font-medium">Email field detected</span>
                        <div
                          className="absolute inset-0 bg-[#F97316]/10 animate-pulse"
                          style={{ animationDuration: '1.5s' }}
                        />
                      </div>
                      <div className="h-8 border border-[#D4CFC5] rounded-lg bg-white" />
                    </div>
                    <div className="h-8 bg-[#E5E0D5] rounded-lg w-full mt-1" />
                  </div>
                ),
              },
              {
                step: "03",
                title: "Alias created and filled automatically",
                desc: "Shield generates a unique alias and fills it into the field — no typing required.",
                mockup: (
                  <div className="bg-white rounded-xl border border-[#E5E0D5] p-4 mt-4 space-y-2">
                    <div className="h-2.5 bg-[#E5E0D5] rounded-full w-3/4" />
                    <div className="h-2.5 bg-[#E5E0D5] rounded-full w-1/2" />
                    <div className="mt-3 space-y-2">
                      <div className="h-8 border border-green-400 rounded-lg bg-green-50 px-3 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" strokeWidth={2.5} />
                        <span className="text-xs text-green-700 font-mono truncate">amzn-x7k2@shield.app</span>
                      </div>
                      <div className="h-8 border border-[#D4CFC5] rounded-lg bg-white" />
                    </div>
                    <div className="h-8 bg-[#1A1A14] rounded-lg w-full mt-1 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">Create Account</span>
                    </div>
                  </div>
                ),
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="bg-white border border-[#E5E0D5] rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#F97316] font-black text-sm">{item.step}</span>
                  </div>
                  <h3 className="text-[#141410] font-bold text-sm font-serif leading-snug">{item.title}</h3>
                </div>
                <p className="text-[#1A1A14]/55 text-sm leading-relaxed">{item.desc}</p>
                {item.mockup}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison vs Cloaked (dark) ── */}
      <section className="bg-[#141410] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-serif mb-3">
              Shield vs Cloaked extension
            </h2>
            <p className="text-white/45 text-sm">
              We built the extension competitors promised but never delivered.
            </p>
          </motion.div>

          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[440px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wide">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="text-sm font-bold text-[#F97316]">Shield</div>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="text-sm font-bold text-white/40">Cloaked</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.feature} className={`border-t border-white/5 ${i % 2 === 0 ? 'bg-white/2' : ''}`}>
                    <td className="px-6 py-4 text-sm text-white/70 font-medium">{row.feature}</td>
                    <td className="px-6 py-4">
                      <CompareCell value={row.shield} />
                    </td>
                    <td className="px-6 py-4">
                      <CompareCell value={row.cloaked} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Final CTA (orange gradient) ── */}
      <section className="bg-gradient-to-br from-[#F97316] to-[#EA6B0F] py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-7 h-7 text-white" fill="white" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white font-serif leading-tight mb-4">
            Ready to shield every signup?
          </h2>
          <p className="text-white/75 text-base mb-8">
            Install in seconds. Free with any Shield plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#F97316] font-semibold px-7 py-4 rounded-full hover:bg-white/90 transition-colors text-sm shadow-lg"
            >
              Install for Chrome
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/50 text-white font-semibold px-7 py-4 rounded-full hover:border-white transition-colors text-sm"
            >
              Install for Firefox
            </a>
          </div>
          <p className="text-white/50 text-xs mt-5">Also available for Safari and Edge</p>
        </motion.div>
      </section>

      <MarketingFooter />
    </div>
  );
}
