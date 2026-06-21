import { Shield } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#E8E3D9]">

      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col w-[460px] flex-shrink-0 bg-[#141410] p-12">
        <Link href="/" className="flex items-center gap-2 mb-16">
          <Shield className="w-6 h-6 text-white" fill="currentColor" />
          <span className="text-xl font-bold text-white font-serif">Shield</span>
        </Link>

        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight font-serif">
            Your info shouldn't be currency for scammers.
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-14">
            Shield finds and removes your personal data from 200+ data broker sites — and keeps it off, automatically.
          </p>

          <div className="space-y-6">
            {[
              { stat: "200+", label: "Data broker sites monitored" },
              { stat: "47",   label: "Average listings found per person" },
              { stat: "94%",  label: "Removal success rate" },
              { stat: "7–14", label: "Days for most removals to complete" },
            ].map(({ stat, label }) => (
              <div key={stat} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#F97316]/15 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-black text-[#F97316]">{stat}</span>
                </div>
                <span className="text-white/55 text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1E1E1A] border border-[#2C2C26] rounded-xl p-5 mt-8">
          <p className="text-white/55 text-sm italic leading-relaxed">
            "Within 3 weeks, Shield had removed my data from 58 sites. The spam calls dropped by 80%."
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-6 h-6 bg-[#F97316]/20 rounded-full flex items-center justify-center text-xs font-bold text-[#F97316]">
              SM
            </div>
            <span className="text-xs text-white/35">Sarah M. — Marketing Manager</span>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <Shield className="w-6 h-6 text-[#1A1A14]" fill="currentColor" />
            <span className="text-lg font-bold text-[#1A1A14] font-serif">Shield</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
