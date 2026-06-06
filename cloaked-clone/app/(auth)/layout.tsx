import { Shield } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Background */}
      <div className="fixed inset-0 bg-mesh pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      {/* Left Branding Panel */}
      <div className="hidden lg:flex flex-col w-[480px] flex-shrink-0 relative bg-gradient-to-br from-violet-950/80 to-indigo-950/80 border-r border-white/10 p-12">
        <div className="flex-1 flex flex-col">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-glow">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Shielded</span>
          </Link>

          {/* Value props */}
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
              Your privacy deserves
              <br />
              <span className="gradient-text">real protection</span>
            </h1>
            <p className="text-white/50 text-sm leading-relaxed mb-12">
              Join thousands who have reclaimed their privacy. We automatically remove
              your data from 200+ data broker sites and keep it off — for good.
            </p>

            <div className="space-y-5">
              {[
                { stat: "200+", label: "Data broker sites monitored" },
                { stat: "47", label: "Average listings found per user" },
                { stat: "94%", label: "Removal success rate" },
                { stat: "7-14", label: "Days for most removals to complete" },
              ].map(({ stat, label }) => (
                <div key={stat} className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-violet-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-black text-violet-300">{stat}</span>
                  </div>
                  <span className="text-white/60 text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom quote */}
          <div className="glass-card rounded-xl p-5 mt-8">
            <p className="text-white/60 text-sm italic">
              "Within 3 weeks, Shielded had removed my data from 58 sites. The spam calls dropped by 80%."
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-6 h-6 bg-violet-600/30 rounded-full flex items-center justify-center text-xs font-bold text-violet-300">
                SM
              </div>
              <span className="text-xs text-white/40">Sarah M. — Marketing Manager</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-glow">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Shielded</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
