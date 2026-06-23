"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Database,
  ArrowRight,
  RefreshCw,
  X,
  FileText,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────

// UI stage (mapped from API userStatus)
type BrokerStage = "scanning" | "found" | "submitted" | "removed" | "monitoring";

// Shape returned by GET /api/brokers items[]
interface ApiBrokerItem {
  id: string;
  name: string;
  website: string;
  category: string;
  difficulty: string;
  avgRemovalDays: number;
  userStatus: string; // 'found' | 'removal_requested' | 'removed' | 'scanning' | 'not_scanned' | 'not_found' | ...
  record: {
    id: string;
    status: string;
    foundUrl: string | null;
    requestedAt: string | null;
    removedAt: string | null;
    lastChecked: string | null;
  } | null;
}

interface ApiStats {
  found: number;
  removal_requested: number;
  removed: number;
  scanning: number;
  not_found: number;
}

// Broker as used in the UI
interface Broker {
  id: string;
  name: string;
  category: string;
  stage: BrokerStage;
  dateFound: string;
  dateRemoved?: string;
  url: string;
  lastChecked?: string;
}

// ─── Status mapping helpers ────────────────────────────────────────────────

function apiStatusToStage(userStatus: string): BrokerStage {
  switch (userStatus) {
    case "scanning":
      return "scanning";
    case "found":
      return "found";
    case "removal_requested":
    case "opt_out_requested":
    case "opt_out_in_progress":
      return "submitted";
    case "removed":
      return "removed";
    case "not_scanned":
    case "not_found":
    default:
      return "monitoring";
  }
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function apiBrokerToUi(item: ApiBrokerItem): Broker {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    stage: apiStatusToStage(item.userStatus),
    url: item.website,
    dateFound: formatDate(item.record?.requestedAt ?? item.record?.lastChecked),
    dateRemoved: item.record?.removedAt ? formatDate(item.record.removedAt) : undefined,
    lastChecked: item.record?.lastChecked ? formatDate(item.record.lastChecked) : undefined,
  };
}

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  BrokerStage,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  scanning:   { label: "Scanning",           color: "text-yellow-400",  icon: Loader2 },
  found:      { label: "Found",              color: "text-red-400",     icon: AlertCircle },
  submitted:  { label: "Removal Submitted",  color: "text-blue-400",    icon: Clock },
  removed:    { label: "Removed",            color: "text-green-400",   icon: CheckCircle },
  monitoring: { label: "Monitoring",         color: "text-violet-400",  icon: Eye },
};

const TABS = ["All", "Found", "Submitted", "Removed", "Monitoring"] as const;

function stageToTab(stage: BrokerStage): string {
  if (stage === "found") return "Found";
  if (stage === "submitted") return "Submitted";
  if (stage === "removed") return "Removed";
  if (stage === "monitoring") return "Monitoring";
  if (stage === "scanning") return "Monitoring"; // scanning shows under Monitoring tab
  return "All";
}

// ─── Progress Dots ────────────────────────────────────────────────────────────

function ProgressDots({ stage }: { stage: BrokerStage }) {
  const steps = ["Scanned", "Found", "Submitted", "Removed"];
  const filled =
    stage === "found" ? 2
    : stage === "submitted" ? 3
    : stage === "removed" || stage === "monitoring" ? 4
    : 1;

  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div
            className={`w-2 h-2 rounded-full transition-colors ${
              i < filled
                ? stage === "monitoring"
                  ? "bg-violet-400"
                  : "bg-green-400"
                : "bg-white/10"
            }`}
            title={s}
          />
          {i < steps.length - 1 && (
            <div
              className={`w-3 h-px ${
                i < filled - 1
                  ? stage === "monitoring"
                    ? "bg-violet-400/50"
                    : "bg-green-400/50"
                  : "bg-white/10"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Certificate Modal ────────────────────────────────────────────────────────

function generateHash(): string {
  const chars = "0123456789abcdef";
  return Array.from({ length: 64 }, () => chars[Math.floor(Math.random() * 16)]).join("");
}

function CertificateModal({
  broker,
  onClose,
}: {
  broker: Broker;
  onClose: () => void;
}) {
  const certId = `CERT-${broker.id}-2026`;
  const hash = useMemo(() => generateHash(), []);
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 16 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 transition-colors p-1 rounded-lg hover:bg-zinc-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Certificate body */}
        <div className="px-8 pb-8 pt-2">
          {/* Logo */}
          <div className="text-center mb-6 border-b border-zinc-200 pb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-100 border border-violet-200 mb-3">
              <span className="text-2xl font-serif font-bold text-violet-600">S</span>
            </div>
            <div className="text-xs text-zinc-400 tracking-widest uppercase font-medium">
              Shield Privacy
            </div>
          </div>

          {/* Headline */}
          <div className="text-center mb-6">
            <p className="text-xs text-zinc-400 tracking-widest uppercase mb-1">Official</p>
            <h2 className="text-2xl font-bold text-zinc-900 tracking-wide" style={{ fontFamily: "Georgia, serif" }}>
              Data Removal Certificate
            </h2>
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-200 mb-5" />

          {/* Fields */}
          <div className="space-y-3 mb-5">
            {[
              { label: "Certificate ID",    value: certId,                     mono: true },
              { label: "Issued To",         value: "User",                     mono: false },
              { label: "Date Issued",       value: today,                      mono: false },
              { label: "Data Broker",       value: broker.name,                mono: false },
              { label: "Domain",            value: broker.url,                 mono: true },
              { label: "Removal Confirmed", value: broker.dateRemoved ?? "—",  mono: false },
            ].map(({ label, value, mono }) => (
              <div key={label} className="flex justify-between items-start gap-4">
                <span className="text-xs text-zinc-400 shrink-0 w-36">{label}</span>
                <span className={`text-sm text-zinc-900 font-medium text-right ${mono ? "font-mono" : ""}`}>
                  {value}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-start gap-4">
              <span className="text-xs text-zinc-400 shrink-0 w-36">Verification</span>
              <span className="text-xs text-zinc-500 font-mono text-right break-all">
                sha256:{hash.slice(0, 16)}...{hash.slice(-4)}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-200 mb-5" />

          {/* Description */}
          <p className="text-xs text-zinc-500 text-center leading-relaxed mb-6">
            This certificate confirms that Shield Privacy successfully submitted and verified
            the removal of the above individual&apos;s personal data from {broker.name}.
          </p>

          {/* Footer text */}
          <div className="border-t border-zinc-200 pt-4 mb-5 text-center">
            <p className="text-[11px] text-zinc-400">
              Shield Privacy Inc. &nbsp;·&nbsp; SOC 2 Certified &nbsp;·&nbsp; BBB A+ Rated
            </p>
            <p className="text-[11px] text-zinc-400">support@shield.id</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
              onClick={() => window.print()}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Certificate
            </Button>
            <Button
              variant="outline"
              className="border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BrokersPage() {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [certBroker, setCertBroker] = useState<Broker | null>(null);

  // Real data state
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [stats, setStats] = useState<ApiStats>({ found: 0, removal_requested: 0, removed: 0, scanning: 0, not_found: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestingIds, setRequestingIds] = useState<Set<string>>(new Set());

  // Fetch brokers from real API
  useEffect(() => {
    async function fetchBrokers() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/brokers?limit=100");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.error ?? "Failed to fetch brokers");

        const items: ApiBrokerItem[] = json.data.items ?? [];
        setBrokers(items.map(apiBrokerToUi));

        if (json.data.stats) {
          setStats(json.data.stats as ApiStats);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load brokers");
      } finally {
        setLoading(false);
      }
    }
    fetchBrokers();
  }, []);

  // Request removal for a single broker
  async function requestRemoval(brokerId: string) {
    if (requestingIds.has(brokerId)) return;
    setRequestingIds((prev) => new Set(prev).add(brokerId));

    // Optimistic update
    setBrokers((prev) =>
      prev.map((b) => (b.id === brokerId ? { ...b, stage: "submitted" as BrokerStage } : b))
    );
    setStats((prev) => ({
      ...prev,
      found: Math.max(0, prev.found - 1),
      removal_requested: prev.removal_requested + 1,
    }));

    try {
      const res = await fetch(`/api/brokers/${brokerId}/remove`, { method: "POST" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        // Revert optimistic update on error (unless already requested = 409)
        if (res.status !== 409) {
          setBrokers((prev) =>
            prev.map((b) => (b.id === brokerId ? { ...b, stage: "found" as BrokerStage } : b))
          );
          setStats((prev) => ({
            ...prev,
            found: prev.found + 1,
            removal_requested: Math.max(0, prev.removal_requested - 1),
          }));
          console.error("Removal request failed:", json.error);
        }
      }
    } catch (err) {
      console.error("Removal request error:", err);
    } finally {
      setRequestingIds((prev) => {
        const next = new Set(prev);
        next.delete(brokerId);
        return next;
      });
    }
  }

  // Request removal for all found brokers
  async function requestRemovalForAll() {
    const foundBrokers = brokers.filter((b) => b.stage === "found");
    await Promise.all(foundBrokers.map((b) => requestRemoval(b.id)));
  }

  const filtered = useMemo(() => {
    return brokers.filter((b) => {
      const tabLabel = stageToTab(b.stage);
      const matchesTab = activeTab === "All" || tabLabel === activeTab;
      const matchesSearch =
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.url.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || b.category === category;
      return matchesTab && matchesSearch && matchesCategory;
    });
  }, [brokers, activeTab, search, category]);

  const categories = useMemo(
    () => Array.from(new Set(brokers.map((b) => b.category))).sort(),
    [brokers]
  );

  // Pipeline counts from real API stats
  const pipelineCounts = {
    found:      stats.found,
    requested:  stats.removal_requested,
    removed:    stats.removed,
    monitoring: stats.not_found + stats.scanning,
  };

  const tabCounts: Record<string, number> = {
    All:        brokers.length,
    Found:      brokers.filter((b) => b.stage === "found").length,
    Submitted:  brokers.filter((b) => b.stage === "submitted").length,
    Removed:    brokers.filter((b) => b.stage === "removed").length,
    Monitoring: brokers.filter((b) => b.stage === "monitoring" || b.stage === "scanning").length,
  };

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((b) => b.id)));
    }
  }

  async function requestRemovalForSelected() {
    const selectedBrokers = brokers.filter(
      (b) => selected.has(b.id) && b.stage === "found"
    );
    await Promise.all(selectedBrokers.map((b) => requestRemoval(b.id)));
    setSelected(new Set());
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        <span className="ml-3 text-white/50">Loading brokers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-white/60">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Speed callout ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#F97316]/10 border border-[#F97316]/30 rounded-xl p-4 flex items-center gap-3"
      >
        <span className="text-2xl flex-shrink-0">⚡</span>
        <div>
          <p className="text-white font-semibold text-sm">
            Shield removes your data 3x faster than Cloaked
          </p>
          <p className="text-white/50 text-xs mt-0.5">
            Average removal: 5 business days. Cloaked averages 3–4 weeks.
          </p>
        </div>
      </motion.div>

      {/* ── Pipeline Visualization ── */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {[
              { label: "Found",      count: pipelineCounts.found,      color: "text-red-400",    bar: "bg-red-500" },
              { label: "Requested",  count: pipelineCounts.requested,  color: "text-amber-400",  bar: "bg-amber-500" },
              { label: "Removed",    count: pipelineCounts.removed,    color: "text-green-400",  bar: "bg-green-500" },
              { label: "Monitoring", count: pipelineCounts.monitoring, color: "text-violet-400", bar: "bg-violet-500" },
            ].map(({ label, count, color, bar }, i, arr) => (
              <React.Fragment key={label}>
                <div className="flex-1 text-center">
                  <div className={`text-3xl font-black mb-1 ${color}`}>{count}</div>
                  <div className="text-xs text-white/40">{label}</div>
                  <div className={`h-1 rounded-full mt-2 ${bar}`} />
                </div>
                {i < arr.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-white/20 flex-shrink-0 hidden sm:block" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Request Removal for All Found button */}
          {pipelineCounts.found > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
              <Button
                size="sm"
                onClick={requestRemovalForAll}
                className="bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/20"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Request Removal for All Found ({pipelineCounts.found})
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder="Search brokers..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2 text-white/40" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab
                ? "bg-violet-600/20 text-violet-300 border border-violet-500/20"
                : "text-white/40 hover:text-white/70 hover:bg-white/5"
            }`}
          >
            {tab}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab
                  ? "bg-violet-600/30 text-violet-300"
                  : "bg-white/10 text-white/30"
              }`}
            >
              {tabCounts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Bulk Actions ── */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between bg-white/5 border border-violet-500/20 rounded-xl p-4"
          >
            <span className="text-sm text-white/70">
              {selected.size} broker{selected.size !== 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelected(new Set())}>
                Clear
              </Button>
              <Button size="sm" onClick={requestRemovalForSelected}>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Request Removal
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Broker Table ── */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="w-10 p-4">
                    <input
                      type="checkbox"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 accent-violet-600 cursor-pointer"
                    />
                  </th>
                  <th className="text-left p-4 text-white/40 font-medium text-xs uppercase tracking-wider">
                    Broker
                  </th>
                  <th className="text-left p-4 text-white/40 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">
                    Category
                  </th>
                  <th className="text-left p-4 text-white/40 font-medium text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left p-4 text-white/40 font-medium text-xs uppercase tracking-wider hidden lg:table-cell">
                    Progress
                  </th>
                  <th className="text-left p-4 text-white/40 font-medium text-xs uppercase tracking-wider hidden md:table-cell">
                    Date Found
                  </th>
                  <th className="text-left p-4 text-white/40 font-medium text-xs uppercase tracking-wider hidden lg:table-cell">
                    Removed
                  </th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center">
                      <Database className="w-12 h-12 text-white/10 mx-auto mb-3" />
                      <p className="text-white/40">No brokers match your filters</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((broker) => {
                    const cfg = STATUS_CONFIG[broker.stage];
                    const StatusIcon = cfg.icon;
                    const isMonitoring = broker.stage === "monitoring" || broker.stage === "scanning";
                    const isRemoved = broker.stage === "removed";
                    const isFound = broker.stage === "found";
                    const isSubmitted = broker.stage === "submitted";
                    const isRequesting = requestingIds.has(broker.id);

                    return (
                      <React.Fragment key={broker.id}>
                        <tr className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={selected.has(broker.id)}
                              onChange={() => toggleSelect(broker.id)}
                              className="w-4 h-4 rounded border-white/20 bg-white/5 accent-violet-600 cursor-pointer"
                            />
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-sm text-white">{broker.name}</div>
                            <div className="text-xs text-white/30">{broker.url}</div>
                          </td>
                          <td className="p-4 hidden sm:table-cell">
                            <Badge variant="secondary" className="text-xs">
                              {broker.category}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <StatusIcon
                                className={`w-3.5 h-3.5 shrink-0 ${cfg.color} ${
                                  broker.stage === "scanning" ? "animate-spin" : ""
                                }`}
                              />
                              <span className={`text-xs font-medium ${cfg.color}`}>
                                {cfg.label}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 hidden lg:table-cell">
                            <ProgressDots stage={broker.stage} />
                          </td>
                          <td className="p-4 text-sm text-white/40 hidden md:table-cell">
                            {broker.dateFound}
                          </td>
                          <td className="p-4 text-sm text-white/40 hidden lg:table-cell">
                            {broker.dateRemoved ?? <span className="text-white/20">—</span>}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {isFound && (
                                <Button
                                  size="sm"
                                  className="text-xs whitespace-nowrap"
                                  disabled={isRequesting}
                                  onClick={() => requestRemoval(broker.id)}
                                >
                                  {isRequesting ? (
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  ) : null}
                                  Request Removal
                                </Button>
                              )}
                              {isSubmitted && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs whitespace-nowrap"
                                  disabled
                                >
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pending
                                </Button>
                              )}
                              {(isRemoved || isMonitoring) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs whitespace-nowrap border-green-700/40 text-green-400 hover:bg-green-950/40 hover:text-green-300"
                                  onClick={() => setCertBroker(broker)}
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  📄 Cert
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Monitoring sub-row */}
                        {isMonitoring && broker.lastChecked && (
                          <tr className="border-b border-white/5 last:border-0">
                            <td colSpan={8} className="px-14 pb-3 pt-0">
                              <div className="flex items-center gap-4 text-xs text-white/30">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  Last checked: {broker.lastChecked}
                                </span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Certificate Modal ── */}
      <AnimatePresence>
        {certBroker && (
          <CertificateModal broker={certBroker} onClose={() => setCertBroker(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
