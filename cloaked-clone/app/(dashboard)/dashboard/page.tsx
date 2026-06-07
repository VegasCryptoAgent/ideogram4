"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Database,
  CheckCircle,
  Clock,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Scan,
  Phone,
  Mail,
  ArrowRight,
  Calendar,
  Activity,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import PrivacyScore from "@/components/dashboard/privacy-score";
import StatCard from "@/components/dashboard/stat-card";
import Link from "next/link";

const REMOVAL_DATA = [
  { month: "Aug", found: 12, removed: 8 },
  { month: "Sep", found: 18, removed: 15 },
  { month: "Oct", found: 22, removed: 19 },
  { month: "Nov", found: 15, removed: 14 },
  { month: "Dec", found: 10, removed: 10 },
  { month: "Jan", found: 7, removed: 6 },
];

const RECENT_ACTIVITY = [
  { id: 1, type: "removed", broker: "Spokeo", time: "2 minutes ago", color: "text-green-400" },
  { id: 2, type: "removed", broker: "WhitePages", time: "15 minutes ago", color: "text-green-400" },
  { id: 3, type: "found", broker: "FastPeopleSearch", time: "1 hour ago", color: "text-amber-400" },
  { id: 4, type: "removed", broker: "BeenVerified", time: "3 hours ago", color: "text-green-400" },
  { id: 5, type: "breach", broker: "LinkedIn Data Breach", time: "Yesterday", color: "text-red-400" },
];

const QUICK_ACTIONS = [
  { icon: Scan, label: "Run Scan Now", description: "Scan 200+ brokers", href: "/scanner", color: "from-violet-600 to-indigo-700" },
  { icon: Phone, label: "Add Virtual Number", description: "Get a new phone number", href: "/phone", color: "from-blue-600 to-cyan-700" },
  { icon: Mail, label: "Create Email Alias", description: "Add an email alias", href: "/email", color: "from-emerald-600 to-teal-700" },
];

const activityIcons = {
  removed: <CheckCircle className="w-4 h-4 text-green-400" />,
  found: <AlertTriangle className="w-4 h-4 text-amber-400" />,
  breach: <AlertTriangle className="w-4 h-4 text-red-400" />,
};

const activityLabels = {
  removed: "Removed from",
  found: "Found on",
  breach: "Breach detected:",
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [nextScanHours, setNextScanHours] = useState(71);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNextScanHours((h) => (h > 0 ? h - 1 : 168));
    }, 3600000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-xl font-bold mb-1">Good morning, Jane 👋</h2>
          <p className="text-white/50 text-sm">
            Your last scan completed <strong className="text-white">6 hours ago</strong>. Next weekly scan in{" "}
            <strong className="text-white">{nextScanHours}h</strong>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2">
            <span className="status-dot-green" />
            Protection Active
          </div>
          <Button size="sm" asChild>
            <Link href="/scanner">
              <Scan className="w-4 h-4 mr-1.5" />
              Scan Now
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Breach Alert */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-red-300">Active Breach Alert</div>
            <div className="text-xs text-red-400/70">Your email was found in a LinkedIn breach (2024). Action recommended.</div>
          </div>
        </div>
        <Button variant="destructive" size="sm" asChild>
          <Link href="/breach">View Details</Link>
        </Button>
      </motion.div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Database}
          label="Brokers Found"
          value="47"
          trend={-12}
          trendLabel="from initial scan"
          color="red"
          loading={loading}
        />
        <StatCard
          icon={Clock}
          label="Removals In Progress"
          value="8"
          color="amber"
          loading={loading}
        />
        <StatCard
          icon={CheckCircle}
          label="Removals Complete"
          value="39"
          trend={5}
          trendLabel="this week"
          color="green"
          loading={loading}
        />
        <StatCard
          icon={Shield}
          label="Protected Since"
          value="47 days"
          color="violet"
          loading={loading}
        />
      </div>

      {/* Privacy Score + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Privacy Score Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Privacy Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <PrivacyScore score={72} size="lg" />
            <div className="w-full mt-6 space-y-3">
              {[
                { label: "Broker Removals", value: 83, color: "bg-violet-600" },
                { label: "Breach Safety", value: 60, color: "bg-amber-500" },
                { label: "Contact Shield", value: 90, color: "bg-green-500" },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                    <span>{label}</span>
                    <span>{value}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs">View all</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {RECENT_ACTIVITY.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-3 bg-white/3 hover:bg-white/5 rounded-xl transition-colors"
              >
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                  {activityIcons[activity.type as keyof typeof activityIcons]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white/80 truncate">
                    <span className="text-white/40">{activityLabels[activity.type as keyof typeof activityLabels]}</span>{" "}
                    {activity.broker}
                  </div>
                  <div className="text-xs text-white/30">{activity.time}</div>
                </div>
                <Badge
                  variant={
                    activity.type === "removed"
                      ? "success"
                      : activity.type === "breach"
                      ? "destructive"
                      : "warning"
                  }
                  className="text-xs flex-shrink-0"
                >
                  {activity.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Removal Progress Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-400" />
              Removal Progress
            </CardTitle>
            <Badge variant="secondary" className="text-xs">Last 6 months</Badge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={REMOVAL_DATA} barSize={12} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,15,20,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    color: "white",
                    fontSize: 12,
                  }}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Bar dataKey="found" fill="rgba(239,68,68,0.5)" radius={[4, 4, 0, 0]} name="Found" />
                <Bar dataKey="removed" fill="rgba(124,58,237,0.8)" radius={[4, 4, 0, 0]} name="Removed" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-white/40">
                <div className="w-3 h-3 rounded bg-red-500/50" /> Found
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/40">
                <div className="w-3 h-3 rounded bg-violet-600/80" /> Removed
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {QUICK_ACTIONS.map(({ icon: Icon, label, description, href, color }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 p-3 glass-card rounded-xl hover:bg-white/8 transition-all group"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-xs text-white/40">{description}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
              </Link>
            ))}

            {/* Next scan */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-xs text-white/40 mb-2">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Next scheduled scan
                </span>
                <span className="text-white/60 font-medium">{nextScanHours}h</span>
              </div>
              <Progress value={((168 - nextScanHours) / 168) * 100} className="h-1.5" />
              <div className="text-xs text-white/30 mt-1">Weekly scan · Pro Plan</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
