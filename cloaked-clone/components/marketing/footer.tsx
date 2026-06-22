"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield } from "lucide-react";

const FOOTER_LINKS = [
  {
    heading: "Product",
    links: [
      { label: "Pricing", href: "/plans" },
      { label: "Features", href: "/features" },
      { label: "Scan", href: "/#scan" },
      { label: "Trust & Security", href: "/trust" },
      { label: "Status", href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Affiliates", href: "/affiliate-program" },
      { label: "Contact", href: "/contact-us" },
      { label: "Careers", href: "#" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    heading: "Download",
    links: [
      { label: "App Store", href: "#" },
      { label: "Play Store", href: "#" },
      { label: "Chrome Extension", href: "#" },
      { label: "Whitepaper", href: "#" },
    ],
  },
  {
    heading: "Connect",
    links: [
      { label: "Instagram", href: "#" },
      { label: "TikTok", href: "#" },
      { label: "YouTube", href: "#" },
      { label: "Facebook", href: "#" },
      { label: "LinkedIn", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Prohibited Use Policy", href: "#" },
    ],
  },
];

export default function MarketingFooter() {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-[#0E0E0A] border-t border-white/6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Newsletter */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-white/8">
          <Link href="/" className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-white" fill="currentColor" />
            <span className="text-white font-bold font-serif text-lg">Shield</span>
          </Link>
          <div className="flex-1 max-w-lg">
            <h3 className="text-white font-semibold mb-3">Stay up to date on features and releases.</h3>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 bg-white/8 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/35 outline-none focus:border-white/35 transition-colors"
              />
              <button
                onClick={() => setEmail("")}
                className="bg-[#F97316] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#EA6B0F] transition-colors"
              >
                Subscribe
              </button>
            </div>
            <p className="text-white/25 text-xs mt-2">
              You agree with our Privacy Policy and consent to receive updates from Shield.
            </p>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-10 border-b border-white/8">
          {FOOTER_LINKS.map(({ heading, links }) => (
            <div key={heading}>
              <div className="text-white/55 text-xs font-semibold mb-3 uppercase tracking-wide">
                {heading}
              </div>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-white/30 text-xs hover:text-white/60 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-white/25 text-xs">
            <Shield className="w-3 h-3" />
            <span>© 2026 Shield. All rights reserved.</span>
          </div>
          <p className="text-white/20 text-xs text-center">
            Currently available in 🇺🇸 and 🇨🇦. Email privacy@shield.id to opt out of the data exposure scan.
          </p>
        </div>
      </div>
    </footer>
  );
}
