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
  Loader2,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";
import StatCard from "@/components/dashboard/stat-card";
import PrivacyScore from "@/components/dashboard/privacy-score";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BrokerStats {
  found: number;
  removal_requested: number;
  removed: number;
  scanning: number;
  not_found: number;
}

interface BreachAlert {
  id: string;
  breachName: string;
  dataExposed: string[];
  isRead: boolean;
  createdAt: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface EmailAlias {
  id: string;
  alias: string;
  label: string | null;
  isActive: boolean;
  emailsReceived: number;
}

interface VirtualPhone {
  id: string;
  number: string;
  label: string | null;
  isActive: boolean;
  callsReceived: number;
}

interface ScanStatus {
  status: string;
  completedAt: string | null;
  createdAt: string;
}

const QUICK_ACTIONS = [
  { icon: Scan,  label: "Run Scan Now",       description: "Scan 75+ brokers",   href: "/scanner" },
  { icon: Phone, label: "Add Virtual Number", description: "Get a masked phone",  href: "/phone"   },
  { icon: Mail,  label: "Create Email Alias", description: "Add a new identity",  href: "/email"   },
];

const activityStyle: Record<string, { dot: string; label: string; badge: string }> = {
  removed:        { dot: "bg-green-500", label: "Removed from", badge: "bg-green-100 text-green-700" },
  found:          { dot: "bg-amber-500", label: "Found on",     badge: "bg-amber-100 text-amber-700"  },
  breach:         { dot: "bg-red-500",   label: "Breach:",      badge: "bg-red-100 text-red-700"       },
  scan_complete:  { dot: "bg-blue-500",  label: "Scan:",        badge: "bg-blue-100 text-blue-700"     },
  removal_requested: { dot: "bg-violet-500", label: "Requested from", badge: "bg-violet-100 text-violet-700" },
};

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const time = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return name ? `${time}, ${name}` : time;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)   return `${days} day${days !== 1 ? "s" : ""} ago`;
  return new Date(dateStr).toLocaleDateString();
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [showEmails, setShowEmails] = useState(true);

  // Real data state
  const [brokerStats, setBrokerStats]     = useState<BrokerStats | null>(null);
  const [privacyScore, setPrivacyScore]   = useState<number>(0);
  const [breaches, setBreaches]           = useState<BreachAlert[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [aliases, setAliases]             = useState<EmailAlias[]>([]);
  const [phones, setPhones]               = useState<VirtualPhone[]>([]);
  const [lastScan, setLastScan]           = useState<ScanStatus | null>(null);
  const [planName, setPlanName]           = useState("Free");
  const [removalData, setRemovalData]     = useState<{ month: string; found: number; removed: number }[]>([]);
  const [firstName, setFirstName]         = useState<string>("");

  useEffect(() => {
    async function loadAll() {
      const results = await Promise.allSettled([
        fetch("/api/brokers/stats").then((r) => r.json()),
        fetch("/api/user/privacy-score").then((r) => r.json()),
        fetch("/api/breach").then((r) => r.json()),
        fetch("/api/notifications").then((r) => r.json()),
        fetch("/api/email-aliases").then((r) => r.json()),
        fetch("/api/phone").then((r) => r.json()),
        fetch("/api/scan").then((r) => r.json()),
        fetch("/api/subscription").then((r) => r.json()),
        fetch("/api/scan/history?limit=6").then((r) => r.json()),
        fetch("/api/user/profile").then((r) => r.json()),
      ]);

      // Broker stats
      if (results[0].status === "fulfilled") {
        const d = results[0].value?.data ?? results[0].value;
        if (d) setBrokerStats(d);
      }

      // Privacy score
      if (results[1].status === "fulfilled") {
        const d = results[1].value?.data ?? results[1].value;
        if (d?.score != null) setPrivacyScore(d.score);
        else if (typeof d === "number") setPrivacyScore(d);
      }

      // Breach alerts
      if (results[2].status === "fulfilled") {
        const d = results[2].value?.data;
        if (Array.isArray(d)) setBreaches(d);
      }

      // Notifications → recent activity
      if (results[3].status === "fulfilled") {
        const d = results[3].value?.data;
        const arr = Array.isArray(d) ? d : (d?.items ?? []);
        if (Array.isArray(arr)) setNotifications(arr.slice(0, 5));
      }

      // Email aliases
      if (results[4].status === "fulfilled") {
        const raw4 = results[4].value;
        const arr4 = Array.isArray(raw4) ? raw4 : (raw4?.data ?? []);
        if (Array.isArray(arr4)) setAliases(arr4.slice(0, 3));
      }

      // Virtual phones
      if (results[5].status === "fulfilled") {
        const d = results[5].value?.data;
        if (Array.isArray(d)) setPhones(d.slice(0, 3));
      }

      // Last scan
      if (results[6].status === "fulfilled") {
        const d = results[6].value?.data?.job;
        if (d) setLastScan(d);
      }

      // Subscription / plan name
      if (results[7].status === "fulfilled") {
        const d = results[7].value?.data ?? results[7].value;
        if (d?.planName) setPlanName(d.planName);
      }

      // User profile — first name for greeting
      if (results[9].status === "fulfilled") {
        const d = results[9].value?.data ?? results[9].value;
        if (d?.firstName) setFirstName(d.firstName);
      }

      // Removal trend chart — built from real scan history
      if (results[8].status === "fulfilled") {
        const items = results[8].value?.data?.items ?? [];
        if (Array.isArray(items) && items.length > 0) {
          const points = [...items]
            .reverse()
            .map((job: { createdAt: string; found: number; removed: number }) => ({
              month: new Date(job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              found: job.found ?? 0,
              removed: job.removed ?? 0,
            }));
          setRemovalData(points);
        }
      }

      setLoading(false);
    }

    loadAll();
  }, []);

  // Derived values
  const brokersFound   = brokerStats?.found ?? 0;
  const inProgress     = brokerStats?.removal_requested ?? 0;
  const removed        = brokerStats?.removed ?? 0;
  const activeBreaches = breaches.filter((b) => !b.isRead);
  const topBreach      = activeBreaches[0] ?? null;

  // Scan timing text
  let scanText = "No scan data yet.";
  if (lastScan?.completedAt) {
    scanText = `Last scan completed ${timeAgo(lastScan.completedAt)}.`;
  } else if (lastScan?.createdAt) {
    scanText = `Scan started ${timeAgo(lastScan.createdAt)}.`;
  }

  // Build identities from real aliases + phones
  const identities = aliases.map((a, i) => ({
    label:      a.label ?? `Identity ${i + 1}`,
    email:      a.alias,
    phone:      phones[i]?.number ?? null,
    active:     a.isActive,
    emailCount: a.emailsReceived,
    callCount:  phones[i]?.callsReceived ?? 0,
  }));

  // Build activity feed from notifications
  const activityFeed = notifications.map((n, i) => ({
    id:     i,
    type:   n.type in activityStyle ? n.type : "found",
    broker: n.title,
    time:   timeAgo(n.createdAt),
  }));

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#141410] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-xl font-bold text-white mb-1 font-serif">{getGreeting(firstName)} 👋</h2>
          <p className="text-white/50 text-sm">
            {loading ? (
              <span className="inline-flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Loading...</span>
            ) : scanText}
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

      {/* Breach Alert — only shown when real active breach exists */}
      {topBreach && (
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
              <div className="text-sm font-semibold text-red-700">
                Active Breach Alert — {activeBreaches.length} unresolved
              </div>
              <div className="text-xs text-red-500/80">
                Your data was found in <strong>{topBreach.breachName}</strong>.{" "}
                {topBreach.dataExposed.slice(0, 3).join(", ")} exposed. Action recommended.
              </div>
            </div>
          </div>
          <Link href="/breach" className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors whitespace-nowrap flex-shrink-0">
            View Details
          </Link>
        </motion.div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Database}    label="Brokers Found"        value={loading ? "—" : String(brokersFound)}                                             color="red"    loading={loading} />
        <StatCard icon={Clock}       label="Removals In Progress" value={loading ? "—" : String(inProgress)}                                               color="amber"  loading={loading} />
        <StatCard icon={CheckCircle} label="Removals Complete"    value={loading ? "—" : String(removed)}                                                  color="green"  loading={loading} />
        <StatCard icon={Shield}      label="Privacy Score"        value={loading ? "—" : String(privacyScore)} trendLabel="out of 100"                     color="orange" loading={loading} />
      </div>

      {/* Privacy Score + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Privacy Score */}
        <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 flex flex-col items-center">
          <h3 className="text-sm font-semibold text-[#1A1A14] mb-4 self-start">Privacy Score</h3>
          <PrivacyScore score={privacyScore} size="lg" />
          <div className="w-full mt-5 space-y-3">
            {[
              { label: "Broker Removals", value: brokerStats ? Math.round((removed / Math.max(brokersFound + removed, 1)) * 100) : 0, color: "bg-[#F97316]" },
              { label: "Breach Safety",   value: breaches.length === 0 ? 100 : Math.max(0, 100 - breaches.length * 15),              color: "bg-amber-400"  },
              { label: "Contact Shield",  value: Math.min(100, (aliases.length + phones.length) * 30),                                color: "bg-green-500"  },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between text-xs text-[#1A1A14]/50 mb-1">
                  <span>{label}</span><span>{value}%</span>
                </div>
                <div className="h-1.5 bg-[#E8E3D9] rounded-full">
                  <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E0D5] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1A1A14]">Recent Activity</h3>
            <Link href="/brokers" className="text-xs text-[#F97316] hover:underline">View all</Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10 text-[#1A1A14]/30">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading activity…
            </div>
          ) : activityFeed.length > 0 ? (
            <div className="space-y-2">
              {activityFeed.map((a) => {
                const s = activityStyle[a.type] ?? activityStyle.found;
                return (
                  <div key={a.id} className="flex items-center gap-3 p-3 hover:bg-[#F5F2EC] rounded-xl transition-colors">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-[#1A1A14]/50">{s.label} </span>
                      <span className="text-sm font-medium text-[#1A1A14]">{a.broker}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-[#1A1A14]/30">{a.time}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.badge}`}>{a.type.replace(/_/g, " ")}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-[#1A1A14]/30 text-sm">
              No recent activity yet. <Link href="/scanner" className="text-[#F97316] hover:underline">Run a scan</Link> to get started.
            </div>
          )}
        </div>
      </div>

      {/* Identities */}
      <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-[#1A1A14]">Your Identities</h3>
            <p className="text-xs text-[#1A1A14]/40 mt-0.5">
              {aliases.length > 0
                ? `${aliases.length} alias${aliases.length !== 1 ? "es" : ""} · ${phones.length} virtual number${phones.length !== 1 ? "s" : ""}`
                : "Masked aliases routing to your real inbox"}
            </p>
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

        {loading ? (
          <div className="flex items-center justify-center py-8 text-[#1A1A14]/30">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading identities…
          </div>
        ) : identities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {identities.map((id) => (
              <div key={id.email} className="border border-[#E5E0D5] rounded-xl p-4 hover:border-[#F97316]/30 hover:bg-[#FDEEDE]/10 transition-all group">
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
        ) : (
          <div className="text-center py-8 text-[#1A1A14]/40 text-sm">
            No aliases yet.{" "}
            <Link href="/email" className="text-[#F97316] hover:underline">Create your first alias →</Link>
          </div>
        )}
      </div>

      {/* Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Removal Progress Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E0D5] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1A1A14] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#F97316]" /> Removal Progress
            </h3>
            <span className="text-xs bg-[#E8E3D9] text-[#1A1A14]/50 px-2.5 py-1 rounded-full">Recent scans</span>
          </div>
          {removalData.length === 0 ? (
            <div className="flex items-center justify-center h-[180px] text-sm text-[#1A1A14]/40 text-center px-4">
              Run a scan to start tracking found vs. removed listings over time.
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={removalData} barSize={10} barGap={3}>
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
            </>
          )}
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

          {/* Plan badge */}
          <div className="bg-[#141410] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-[#F97316]" />
              <span className="text-xs font-semibold text-white">{planName} Plan Active</span>
            </div>
            <p className="text-xs text-white/40 mb-3">Weekly scans · 75+ brokers · Call guard</p>
            <Link href="/settings" className="text-xs text-[#F97316] hover:underline font-medium flex items-center gap-1">
              Manage plan <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
