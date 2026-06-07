"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: number; // positive = up, negative = down, 0 = flat
  trendLabel?: string;
  color?: "violet" | "green" | "red" | "amber" | "blue";
  loading?: boolean;
}

const colorMap = {
  violet: {
    border: "border-violet-500/20",
    iconBg: "bg-violet-600/20",
    iconColor: "text-violet-400",
    glow: "shadow-[0_0_20px_rgba(139,92,246,0.1)]",
  },
  green: {
    border: "border-green-500/20",
    iconBg: "bg-green-600/20",
    iconColor: "text-green-400",
    glow: "shadow-[0_0_20px_rgba(34,197,94,0.1)]",
  },
  red: {
    border: "border-red-500/20",
    iconBg: "bg-red-600/20",
    iconColor: "text-red-400",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.1)]",
  },
  amber: {
    border: "border-amber-500/20",
    iconBg: "bg-amber-600/20",
    iconColor: "text-amber-400",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.1)]",
  },
  blue: {
    border: "border-blue-500/20",
    iconBg: "bg-blue-600/20",
    iconColor: "text-blue-400",
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.1)]",
  },
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel,
  color = "violet",
  loading = false,
}: StatCardProps) {
  const colors = colorMap[color];

  if (loading) {
    return (
      <div className={cn("glass-card rounded-2xl p-5 border", colors.border)}>
        <div className="skeleton h-10 w-10 rounded-xl mb-4" />
        <div className="skeleton h-4 w-20 mb-2" />
        <div className="skeleton h-8 w-16" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "glass-card rounded-2xl p-5 border transition-all hover:bg-white/8",
        colors.border,
        colors.glow
      )}
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", colors.iconBg)}>
        <Icon className={cn("w-5 h-5", colors.iconColor)} />
      </div>
      <div className="text-white/50 text-sm mb-1">{label}</div>
      <div className="text-3xl font-black text-white">{value}</div>
      {trend !== undefined && (
        <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium",
          trend > 0 ? "text-green-400" : trend < 0 ? "text-red-400" : "text-white/30"
        )}>
          {trend > 0 ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : trend < 0 ? (
            <TrendingDown className="w-3.5 h-3.5" />
          ) : (
            <Minus className="w-3.5 h-3.5" />
          )}
          {trendLabel || (trend !== 0 ? `${Math.abs(trend)}% vs last week` : "No change")}
        </div>
      )}
    </motion.div>
  );
}
