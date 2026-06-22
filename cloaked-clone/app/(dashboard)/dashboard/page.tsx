"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Database,
  CheckCircle,
  Clock,
  Shield,
  AlertTriangle,
  Scan,
  Phone,
  Mail,
  ArrowRight,
  TrendingUp,
  Plus,
  Eye,
  EyeOff,
  Zap,
  Lock,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";
import StatCard from "@/components/dashboard/stat-card";
import PrivacyScore from "@/components/dashboard/privacy-score";

const REMOVAL_DATA = [
  { month: "Aug", found: 12, removed: 8 },
  { month: "Sep", found: 18, removed: 15 },
  { month: "Oct", found: 22, removed: 19 },
  { month: "Nov", found: 15, removed: 14 },
  { month: "Dec", found: 10, removed: 10 },
  { month: "Jan", found: 7,  removed: 6  },
];

const RECENT_ACTIVITY = [
  { id: 1, type: "removed", broker: "Spokeo",               time: "2 minutes ago"  },
  { id: 2, type: "removed", broker: "WhitePages",           time: "15 minutes ago" },
  { id: 3, type: "found",   broker: "FastPeopleSearch",     time: "1 hour ago"     },
  { id: 4, type: "removed", broker: "BeenVerified",         time: "3 hours ago"    },
  { id: 5, type: "breach",  broker: "LinkedIn Data Breach", time: "Yesterday"      },
];

const IDENTITIES = [
  { label: "Shopping alias",    email: "shop.j4k2@shield.email",  phone: "+1 (555) 821-4422", active: true,  emailCount: 24, callCount: 0  },
  { label: "Newsletter alias",  email: "news.9xm1@shield.email",  phone: null,                active: true,  emailCount: 87, callCount: 0  },
  { label: "Work contacts",     email: "work.3pt7@shield.email",  phone: "+1 (555) 307-8891", active: true,  emailCount: 12, callCount: 5  },
];

const QUICK_ACTIONS = [
  { icon: Scan,  label: "Run Scan Now",        description: "Scan 400+ brokers",       href: "/scanner" },
  { icon: Phone, label: "Add Virtual Number",  description: "Get a masked phone",       href: "/phone"   },
  { icon: Mail,  label: "Create Email Alias",  description: "Add a new identity",       href: "/email"   },
];

const activityStyle = {
  removed: { dot: "bg-green-500", label: "Removed from", badge: "bg-green-100 text-green-700" },
  found:   { dot: "bg-amber-500", label: "Found on",     badge: "bg-amber-100 text-amber-700"  },
  breach:  { dot: "bg-red-500",   label: "Breach:",      badge: "bg-red-100 text-red-700"       },
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [showEmails, setShowEmails] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#141410] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-xl font-bold text-white mb-1 font-serif">Good morning 👋</h2>
          <p className="text-white/50 text-sm">
            Your last scan completed <strong className="text-white">6 hours ago</strong>. Next weekly scan in <strong className="text-white">71h</strong>.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Protection Active
          </div>
          <Link href="/scanner" className="bg-[#F97316] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#EA6B0F] transition-colors flex items-center gap-1.5">
            <Scan className="w-4 h-4" /> Scan Now
          </Link>
        </div>
      </motion.div>

      {/* Breach Alert */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <div className="text-sm font-semibold text-red-700">Active Breach Alert</div>
            <div className="text-xs text-red-500/80">Your email was found in a LinkedIn breach (2024). Action recommended.</div>
          </div>
        </div>
        <Link href="/breach" className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors whitespace-nowrap flex-shrink-0">
          View Details
        </Link>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Database}    label="Brokers Found"        value="47"      trend={-12} trendLabel="from initial scan" color="red"    loading={loading} />
        <StatCard icon={Clock}       label="Removals In Progress" value="8"                                                  color="amber"  loading={loading} />
        <StatCard icon={CheckCircle} label="Removals Complete"    value="39"      trend={5}   trendLabel="this week"         color="green"  loading={loading} />
        <StatCard icon={Shield}      label="Protected Since"      value="47 days"                                            color="orange" loading={loading} />
      </div>

      {/* Privacy Score + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Privacy Score */}
        <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 flex flex-col items-center">
          <h3 className="text-sm font-semibold text-[#1A1A14] mb-4 self-start">Privacy Score</h3>
          <PrivacyScore score={72} size="lg" />
          <div className="w-full mt-5 space-y-3">
            {[
              { label: "Broker Removals", value: 83, color: "bg-[#F97316]" },
              { label: "Breach Safety",   value: 60, color: "bg-amber-400"  },
              { label: "Contact Shield",  value: 90, color: "bg-green-500"  },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between text-xs text-[#1A1A14]/50 mb-1">
                  <span>{label}</span><span>{value}%</span>
                </div>
                <div className="h-1.5 bg-[#E8E3D9] rounded-full">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E0D5] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1A1A14]">Recent Activity</h3>
            <button className="text-xs text-[#F97316] hover:underline">View all</button>
          </div>
          <div className="space-y-2">
            {RECENT_ACTIVITY.map((a) => {
              const s = activityStyle[a.type as keyof typeof activityStyle];
              return (
                <div key={a.id} className="flex items-center gap-3 p-3 hover:bg-[#F5F2EC] rounded-xl transition-colors">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-[#1A1A14]/50">{s.label} </span>
                    <span className="text-sm font-medium text-[#1A1A14]">{a.broker}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-[#1A1A14]/30">{a.time}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.badge}`}>{a.type}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Identities */}
      <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-[#1A1A14]">Your Identities</h3>
            <p className="text-xs text-[#1A1A14]/40 mt-0.5">Masked aliases routing to your real inbox</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEmails(!showEmails)}
              className="p-1.5 text-[#1A1A14]/30 hover:text-[#1A1A14]/60 transition-colors"
              title={showEmails ? "Hide" : "Show"}
            >
              {showEmails ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <Link
              href="/email"
              className="flex items-center gap-1.5 bg-[#F97316] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#EA6B0F] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New Identity
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {IDENTITIES.map((id) => (
            <div key={id.label} className="border border-[#E5E0D5] rounded-xl p-4 hover:border-[#F97316]/30 hover:bg-[#FDEEDE]/10 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs font-semibold text-[#1A1A14] mb-0.5">{id.label}</div>
                  <div className={`text-xs ${id.active ? "text-green-500" : "text-[#1A1A14]/30"} flex items-center gap-1`}>
                    <span className={`w-1 h-1 rounded-full ${id.active ? "bg-green-500" : "bg-[#1A1A14]/30"}`} />
                    {id.active ? "Active" : "Paused"}
                  </div>
                </div>
                <div className="w-8 h-8 bg-[#F97316]/10 rounded-lg flex items-center justify-center group-hover:bg-[#F97316]/20 transition-colors">
                  <Lock className="w-4 h-4 text-[#F97316]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-[#1A1A14]/30 flex-shrink-0" />
                  <span className="text-xs text-[#1A1A14]/60 font-mono truncate">
                    {showEmails ? id.email : "••••••@shield.email"}
                  </span>
                </div>
                {id.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-[#1A1A14]/30 flex-shrink-0" />
                    <span className="text-xs text-[#1A1A14]/60 font-mono">
                      {showEmails ? id.phone : "+1 (555) •••-••••"}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-[#E5E0D5] flex gap-3 text-xs text-[#1A1A14]/40">
                <span>{id.emailCount} emails</span>
                {id.phone && <span>{id.callCount} calls</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E0D5] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1A1A14] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#F97316]" /> Removal Progress
            </h3>
            <span className="text-xs bg-[#E8E3D9] text-[#1A1A14]/50 px-2.5 py-1 rounded-full">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={REMOVAL_DATA} barSize={10} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D5" />
              <XAxis dataKey="month" tick={{ fill: "#1A1A1440", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#1A1A1440", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #E5E0D5", borderRadius: 12, color: "#1A1A14", fontSize: 12 }}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <Bar dataKey="found"   fill="#FCA5A5" radius={[4, 4, 0, 0]} name="Found"   />
              <Bar dataKey="removed" fill="#F97316" radius={[4, 4, 0, 0]} name="Removed" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-[#1A1A14]/40"><div className="w-3 h-3 rounded bg-red-200" /> Found</div>
            <div className="flex items-center gap-1.5 text-xs text-[#1A1A14]/40"><div className="w-3 h-3 rounded bg-[#F97316]" /> Removed</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6">
          <h3 className="text-sm font-semibold text-[#1A1A14] mb-4">Quick Actions</h3>
          <div className="space-y-2 mb-5">
            {QUICK_ACTIONS.map(({ icon: Icon, label, description, href }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 p-3 border border-[#E5E0D5] rounded-xl hover:border-[#F97316]/30 hover:bg-[#FDEEDE]/30 transition-all group"
              >
                <div className="w-9 h-9 bg-[#F97316]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#F97316]/20 transition-colors">
                  <Icon className="w-[18px] h-[18px] text-[#F97316]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#1A1A14]">{label}</div>
                  <div className="text-xs text-[#1A1A14]/40">{description}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#1A1A14]/20 group-hover:text-[#F97316] transition-colors" />
              </Link>
            ))}
          </div>

          {/* Upgrade prompt */}
          <div className="bg-[#141410] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-[#F97316]" />
              <span className="text-xs font-semibold text-white">Pro Plan Active</span>
            </div>
            <p className="text-xs text-white/40 mb-3">Weekly scans · 400+ brokers · Call guard</p>
            <Link href="/settings" className="text-xs text-[#F97316] hover:underline font-medium flex items-center gap-1">
              Manage plan <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
