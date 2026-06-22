"use client";

import React, { useState, useMemo } from "react";
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
  Zap,
  Download,
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

type BrokerStatus = "found" | "requested" | "removed" | "monitoring";

interface Broker {
  id: string;
  name: string;
  category: string;
  status: BrokerStatus;
  dateFound: string;
  dateRemoved?: string;
  recordsFound: number;
  url: string;
  lastChecked?: string;
  nextScan?: string;
}

// ─── Mock Data (25 brokers) ───────────────────────────────────────────────────

const MOCK_BROKERS: Broker[] = [
  { id: "1",  name: "Spokeo",            category: "People Search",    status: "removed",    dateFound: "Dec 15, 2024", dateRemoved: "Dec 22, 2024", recordsFound: 3,  url: "spokeo.com" },
  { id: "2",  name: "WhitePages",        category: "People Search",    status: "removed",    dateFound: "Dec 15, 2024", dateRemoved: "Dec 28, 2024", recordsFound: 2,  url: "whitepages.com" },
  { id: "3",  name: "BeenVerified",      category: "Background Check", status: "removed",    dateFound: "Dec 15, 2024", dateRemoved: "Jan 5, 2025",  recordsFound: 1,  url: "beenverified.com" },
  { id: "4",  name: "TruthFinder",       category: "Background Check", status: "requested",  dateFound: "Jan 8, 2025",  recordsFound: 2,             url: "truthfinder.com" },
  { id: "5",  name: "Radaris",           category: "People Search",    status: "requested",  dateFound: "Jan 8, 2025",  recordsFound: 1,             url: "radaris.com" },
  { id: "6",  name: "FastPeopleSearch",  category: "People Search",    status: "found",      dateFound: "Jan 15, 2025", recordsFound: 4,             url: "fastpeoplesearch.com" },
  { id: "7",  name: "Intelius",          category: "Background Check", status: "found",      dateFound: "Jan 15, 2025", recordsFound: 1,             url: "intelius.com" },
  { id: "8",  name: "MyLife",            category: "Reputation",       status: "monitoring", dateFound: "Nov 20, 2024", dateRemoved: "Dec 1, 2024",  recordsFound: 1,  url: "mylife.com",            lastChecked: "3 days ago", nextScan: "27 days" },
  { id: "9",  name: "Pipl",             category: "Identity",          status: "removed",    dateFound: "Dec 15, 2024", dateRemoved: "Jan 2, 2025",  recordsFound: 2,  url: "pipl.com" },
  { id: "10", name: "ZabaSearch",        category: "People Search",    status: "removed",    dateFound: "Dec 15, 2024", dateRemoved: "Jan 10, 2025", recordsFound: 1,  url: "zabasearch.com" },
  { id: "11", name: "PeopleSmart",       category: "People Search",    status: "monitoring", dateFound: "Nov 20, 2024", dateRemoved: "Nov 30, 2024", recordsFound: 2,  url: "peoplesmart.com",       lastChecked: "1 day ago",  nextScan: "29 days" },
  { id: "12", name: "Instant Checkmate", category: "Background Check", status: "requested",  dateFound: "Jan 8, 2025",  recordsFound: 1,             url: "instantcheckmate.com" },
  { id: "13", name: "Acxiom",           category: "Marketing",         status: "removed",    dateFound: "Nov 20, 2024", dateRemoved: "Dec 10, 2024", recordsFound: 5,  url: "acxiom.com" },
  { id: "14", name: "LexisNexis",        category: "Identity",         status: "requested",  dateFound: "Jan 8, 2025",  recordsFound: 3,             url: "lexisnexis.com" },
  { id: "15", name: "PeopleFinder",      category: "People Search",    status: "found",      dateFound: "Jan 15, 2025", recordsFound: 2,             url: "peoplefinder.com" },
  { id: "16", name: "PeekYou",           category: "People Search",    status: "removed",    dateFound: "Dec 15, 2024", dateRemoved: "Jan 3, 2025",  recordsFound: 1,  url: "peekyou.com" },
  { id: "17", name: "US Search",         category: "People Search",    status: "monitoring", dateFound: "Nov 20, 2024", dateRemoved: "Nov 30, 2024", recordsFound: 1,  url: "ussearch.com",          lastChecked: "2 days ago", nextScan: "28 days" },
  { id: "18", name: "CheckPeople",       category: "Background Check", status: "removed",    dateFound: "Dec 15, 2024", dateRemoved: "Dec 29, 2024", recordsFound: 2,  url: "checkpeople.com" },
  { id: "19", name: "Nuwber",            category: "People Search",    status: "requested",  dateFound: "Jan 8, 2025",  recordsFound: 1,             url: "nuwber.com" },
  { id: "20", name: "Epsilon",           category: "Marketing",        status: "found",      dateFound: "Jan 15, 2025", recordsFound: 4,             url: "epsilon.com" },
  { id: "21", name: "CoreLogic",         category: "Financial",        status: "requested",  dateFound: "Jan 8, 2025",  recordsFound: 2,             url: "corelogic.com" },
  { id: "22", name: "Data.com",          category: "Marketing",        status: "removed",    dateFound: "Nov 20, 2024", dateRemoved: "Dec 5, 2024",  recordsFound: 1,  url: "data.com" },
  { id: "23", name: "Arrest.org",        category: "Background Check", status: "removed",    dateFound: "Dec 15, 2024", dateRemoved: "Jan 8, 2025",  recordsFound: 1,  url: "arrest.org" },
  { id: "24", name: "TowerData",         category: "Marketing",        status: "monitoring", dateFound: "Nov 20, 2024", dateRemoved: "Dec 1, 2024",  recordsFound: 3,  url: "towerdata.com",         lastChecked: "4 days ago", nextScan: "26 days" },
  { id: "25", name: "Equifax Marketing", category: "Financial",        status: "removed",    dateFound: "Nov 20, 2024", dateRemoved: "Dec 20, 2024", recordsFound: 2,  url: "equifax.com" },
];

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  BrokerStatus,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  found:      { label: "Found",             color: "text-red-400",    icon: AlertCircle },
  requested:  { label: "Removal Requested", color: "text-amber-400",  icon: Clock },
  removed:    { label: "Removed",           color: "text-green-400",  icon: CheckCircle },
  monitoring: { label: "Monitoring",        color: "text-violet-400", icon: Eye },
};

const TABS = ["All", "Found", "Removal Requested", "Removed", "Monitoring"] as const;

function statusToTab(status: BrokerStatus): string {
  if (status === "found") return "Found";
  if (status === "requested") return "Removal Requested";
  if (status === "removed") return "Removed";
  if (status === "monitoring") return "Monitoring";
  return "All";
}

// ─── Progress Dots ────────────────────────────────────────────────────────────

function ProgressDots({ status }: { status: BrokerStatus }) {
  const steps = ["Scanned", "Found", "Submitted", "Removed"];
  const filled =
    status === "found" ? 2
    : status === "requested" ? 3
    : status === "removed" || status === "monitoring" ? 4
    : 1;

  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div
            className={`w-2 h-2 rounded-full transition-colors ${
              i < filled
                ? status === "monitoring"
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
                  ? status === "monitoring"
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
              { label: "Certificate ID",   value: certId,                                     mono: true },
              { label: "Issued To",        value: "James Reeves",                             mono: false },
              { label: "Date Issued",      value: today,                                      mono: false },
              { label: "Data Broker",      value: broker.name,                                mono: false },
              { label: "Domain",           value: broker.url,                                 mono: true },
              { label: "Records Removed",  value: `${broker.recordsFound} record${broker.recordsFound !== 1 ? "s" : ""}`, mono: false },
              { label: "Removal Confirmed", value: broker.dateRemoved ?? "—",                 mono: false },
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

  const filtered = useMemo(() => {
    return MOCK_BROKERS.filter((b) => {
      const tabLabel = statusToTab(b.status);
      const matchesTab = activeTab === "All" || tabLabel === activeTab;
      const matchesSearch =
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.url.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || b.category === category;
      return matchesTab && matchesSearch && matchesCategory;
    });
  }, [activeTab, search, category]);

  const categories = Array.from(new Set(MOCK_BROKERS.map((b) => b.category))).sort();

  // Pipeline counts
  const pipelineCounts = {
    found:      MOCK_BROKERS.filter((b) => b.status === "found").length,
    requested:  MOCK_BROKERS.filter((b) => b.status === "requested").length,
    removed:    MOCK_BROKERS.filter((b) => b.status === "removed").length,
    monitoring: MOCK_BROKERS.filter((b) => b.status === "monitoring").length,
  };

  const tabCounts: Record<string, number> = {
    All: MOCK_BROKERS.length,
    Found: pipelineCounts.found,
    "Removal Requested": pipelineCounts.requested,
    Removed: pipelineCounts.removed,
    Monitoring: pipelineCounts.monitoring,
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
              <Button size="sm">
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
                  <th className="text-left p-4 text-white/40 font-medium text-xs uppercase tracking-wider">
                    Recs
                  </th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center">
                      <Database className="w-12 h-12 text-white/10 mx-auto mb-3" />
                      <p className="text-white/40">No brokers match your filters</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((broker) => {
                    const cfg = STATUS_CONFIG[broker.status];
                    const StatusIcon = cfg.icon;
                    const isMonitoring = broker.status === "monitoring";
                    const isRemoved = broker.status === "removed";
                    const isFound = broker.status === "found";
                    const isPending = broker.status === "requested";

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
                              <StatusIcon className={`w-3.5 h-3.5 shrink-0 ${cfg.color}`} />
                              <span className={`text-xs font-medium ${cfg.color}`}>
                                {cfg.label}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 hidden lg:table-cell">
                            <ProgressDots status={broker.status} />
                          </td>
                          <td className="p-4 text-sm text-white/40 hidden md:table-cell">
                            {broker.dateFound}
                          </td>
                          <td className="p-4 text-sm text-white/40 hidden lg:table-cell">
                            {broker.dateRemoved ?? <span className="text-white/20">—</span>}
                          </td>
                          <td className="p-4 text-sm text-white/60">{broker.recordsFound}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {isFound && (
                                <Button size="sm" className="text-xs whitespace-nowrap">
                                  Request Removal
                                </Button>
                              )}
                              {isPending && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs whitespace-nowrap"
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
                            <td colSpan={9} className="px-14 pb-3 pt-0">
                              <div className="flex items-center gap-4 text-xs text-white/30">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  Last checked: {broker.lastChecked}
                                </span>
                                <span>·</span>
                                <span>Next scan in: {broker.nextScan}</span>
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
