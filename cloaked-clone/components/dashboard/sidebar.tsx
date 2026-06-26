"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  LayoutDashboard,
  Scan,
  Database,
  Phone,
  Mail,
  AlertOctagon,
  ShieldAlert,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Wand2,
  CreditCard,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/scanner", icon: Scan, label: "Scanner", badge: "New" },
  { href: "/brokers", icon: Database, label: "Data Brokers" },
  { href: "/phone", icon: Phone, label: "Virtual Numbers" },
  { href: "/email", icon: Mail, label: "Email Aliases" },
  { href: "/autocloak", icon: Wand2, label: "AutoCloak", badge: "AI" },
  { href: "/spam", icon: AlertOctagon, label: "Spam Filter" },
  { href: "/breach", icon: ShieldAlert, label: "Breach Monitor", badge: "!" },
  { href: "/cards", icon: CreditCard, label: "Virtual Cards" },
  { href: "/passwords", icon: KeyRound, label: "Password Manager" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative flex flex-col h-full bg-[#141410] flex-shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 h-16 border-b border-white/10 flex-shrink-0">
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
          <Shield className="w-6 h-6 text-white" fill="currentColor" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="text-lg font-bold text-white font-serif whitespace-nowrap overflow-hidden"
            >
              Shield
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ href, icon: Icon, label, badge }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative",
                active
                  ? "bg-[#F97316] text-white"
                  : "text-white/50 hover:text-white hover:bg-white/8"
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", active ? "text-white" : "text-white/40 group-hover:text-white/70")} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    transition={{ duration: 0.15 }}
                    className="flex-1 whitespace-nowrap overflow-hidden flex items-center justify-between"
                  >
                    {label}
                    {badge && (
                      <span
                        className={cn(
                          "text-xs px-1.5 py-0.5 rounded-full font-semibold",
                          active
                            ? "bg-white/20 text-white"
                            : badge === "!"
                            ? "bg-red-500/20 text-red-400"
                            : badge === "New" || badge === "AI"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-white/10 text-white/40"
                        )}
                      >
                        {badge}
                      </span>
                    )}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Collapsed badge indicator */}
              {collapsed && badge === "!" && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Plan Badge */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-3 mb-3 bg-[#F97316]/15 border border-[#F97316]/20 rounded-xl p-3"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Zap className="w-4 h-4 text-[#F97316]" />
              <span className="text-xs font-semibold text-[#F97316]">Pro Plan</span>
            </div>
            <div className="text-xs text-white/40">AI Call Guard · AutoCloak · Cards</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 bg-[#141410] border border-white/10 rounded-full flex items-center justify-center hover:bg-[#1E1E1A] transition-colors z-10"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-white/60" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 text-white/60" />
        )}
      </button>
    </motion.aside>
  );
}
