"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  color?: "orange" | "green" | "red" | "amber" | "blue";
  loading?: boolean;
}

const colorMap = {
  orange: { iconBg: "bg-[#F97316]/10", iconColor: "text-[#F97316]" },
  green:  { iconBg: "bg-green-100",    iconColor: "text-green-600"  },
  red:    { iconBg: "bg-red-100",      iconColor: "text-red-500"    },
  amber:  { iconBg: "bg-amber-100",    iconColor: "text-amber-600"  },
  blue:   { iconBg: "bg-blue-100",     iconColor: "text-blue-600"   },
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel,
  color = "orange",
  loading = false,
}: StatCardProps) {
  const colors = colorMap[color] ?? colorMap.orange;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-[#E5E0D5]">
        <div className="animate-pulse">
          <div className="h-10 w-10 rounded-xl bg-[#E8E3D9] mb-4" />
          <div className="h-4 w-20 bg-[#E8E3D9] rounded mb-2" />
          <div className="h-8 w-16 bg-[#E8E3D9] rounded" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl p-5 border border-[#E5E0D5] hover:border-[#D4CFC5] transition-colors"
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", colors.iconBg)}>
        <Icon className={cn("w-5 h-5", colors.iconColor)} />
      </div>
      <div className="text-[#1A1A14]/50 text-sm mb-1">{label}</div>
      <div className="text-3xl font-black text-[#1A1A14]">{value}</div>
      {trend !== undefined && (
        <div className={cn(
          "flex items-center gap-1 mt-2 text-xs font-medium",
          trend > 0 ? "text-green-600" : trend < 0 ? "text-red-500" : "text-[#1A1A14]/30"
        )}>
          {trend > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : trend < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
          {trendLabel || (trend !== 0 ? `${Math.abs(trend)}% vs last week` : "No change")}
        </div>
      )}
    </motion.div>
  );
}
