"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Menu, X, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Features", href: "/features" },
  {
    label: "Resources",
    href: "#",
    children: [
      { label: "Blog", href: "/blog" },
      { label: "Opt-Out Guides", href: "/opt-out-guides" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  { label: "Pricing", href: "/plans" },
  { label: "About", href: "/about" },
];

export default function MarketingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Top announcement bar */}
      <div className="bg-[#1A1A14] text-white text-sm text-center py-2.5 px-4">
        Shield raises $375M — privacy protection for everyone.{" "}
        <Link href="/sign-up" className="text-[#F97316] font-semibold hover:underline">
          Get started free →
        </Link>
      </div>

      <nav className="bg-[#F5F2EC] border-b border-[#D4CFC5] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Shield className="w-6 h-6 text-[#1A1A14]" fill="currentColor" />
            <span className="text-lg font-bold text-[#1A1A14] font-serif">Shield</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {NAV.map((item) =>
              item.children ? (
                <div key={item.label} className="relative">
                  <button
                    onClick={() => setResourcesOpen(!resourcesOpen)}
                    className="flex items-center gap-1 text-sm text-[#1A1A14]/65 hover:text-[#1A1A14] transition-colors font-medium"
                  >
                    {item.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${resourcesOpen ? "rotate-180" : ""}`} />
                  </button>
                  {resourcesOpen && (
                    <div
                      className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#E5E0D5] py-1 z-50"
                      onMouseLeave={() => setResourcesOpen(false)}
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setResourcesOpen(false)}
                          className="block px-4 py-2.5 text-sm text-[#1A1A14]/70 hover:text-[#1A1A14] hover:bg-[#F5F2EC] transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "text-[#1A1A14]"
                      : "text-[#1A1A14]/65 hover:text-[#1A1A14]"
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-[#1A1A14]/65 hover:text-[#1A1A14] transition-colors px-3 py-2 border border-[#1A1A14]/20 rounded-full hover:border-[#1A1A14]/40"
            >
              Login
            </Link>
            <Link
              href="/sign-up"
              className="text-sm font-semibold bg-[#F97316] text-white px-5 py-2.5 rounded-full hover:bg-[#EA6B0F] transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-[#1A1A14]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-[#F5F2EC] border-t border-[#D4CFC5] px-4 pb-4">
            {NAV.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <div className="py-3 text-sm font-semibold text-[#1A1A14]/50 border-b border-[#D4CFC5] uppercase tracking-wide text-xs">
                    {item.label}
                  </div>
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className="block py-2.5 pl-3 text-sm text-[#1A1A14]/70 border-b border-[#D4CFC5]"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 text-sm font-medium text-[#1A1A14]/70 border-b border-[#D4CFC5] last:border-0"
                >
                  {item.label}
                </Link>
              )
            )}
            <div className="flex gap-3 pt-4">
              <Link
                href="/sign-in"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center py-2.5 border border-[#1A1A14]/25 rounded-full text-sm font-medium text-[#1A1A14]"
              >
                Login
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center py-2.5 bg-[#F97316] text-white rounded-full text-sm font-semibold"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
