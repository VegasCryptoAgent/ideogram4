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

type BrokerStage =
  | "scanning"
  | "found"
  | "submitted"
  | "processing"
  | "removed"
  | "monitoring";

interface Broker {
  id: string;
  name: string;
  category: string;
  stage: BrokerStage;
  dateFound: string;
  dateRemoved?: string;
  recordsFound: number;
  url: string;
  lastChecked?: string;
  nextScan?: string;
}

// ─── Mock Data (25 brokers) ───────────────────────────────────────────────────

const MOCK_BROKERS: Broker[] = [
  { id: "1",  name: "Spokeo",             category: "People Search",    stage: "removed",    dateFound: "Dec 15, 2024", dateRemoved: "Dec 22, 2024", recordsFound: 3,  url: "spokeo.com" },
  { id: "2",  name: "WhitePages",         category: "People Search",    stage: "removed",    dateFound: "Dec 15, 2024", dateRemoved: "Dec 28, 2024", recordsFound: 2,  url: "whitepages.com" },
  { id: "3",  name: "BeenVerified",       category: "Background Check", stage: "removed",    dateFound: "Dec 15, 2024", dateRemoved: "Jan 5, 2025",  recordsFound: 1,  url: "beenverified.com" },
  { id: "4",  name: "TruthFinder",        category: "Background Check", stage: "processing", dateFound: "Jan 8, 2025",  recordsFound: 2,             url: "truthfinder.com" },
  { id: "5",  name: "Radaris",            category: "People Search",    stage: "submitted",  dateFound: "Jan 8, 2025",  recordsFound: 1,             url: "radaris.com" },
  { id: "6",  name: "FastPeopleSearch",   category: "People Search",    stage: "found",      dateFound: "Jan 15, 2025", recordsFound: 4,             url: "fastpeoplesearch.com" },
  { id: "7",  name: "Intelius",           category: "Background Check", stage: "found",      dateFound: "Jan 15, 2025", recordsFound: 1,             url: "intelius.com" },
  { id: "8",  name: "MyLife",             category: "Reputation",       stage: "monitoring", dateFound: "Nov 20, 2024", dateRemoved: "Dec 1, 2024",  recordsFound: 1,  url: "mylife.com",       lastChecked: "3 days ago", nextScan: "27 days" },
  { id: "9",  name: "Pipl",              category: "Identity",          stage: "removed",    dateFound: "Dec 15, 2024", dateRemoved: "Jan 2, 2025",  recordsFound: 2,  url: "pipl.com" },
  { id: "10", name: "ZabaSearch",         category: "People Search",    stage: "removed",    dateFound: "Dec 15, 2024", dateRemoved: "Jan 10, 2025", recordsFound: 1,  url: "zabasearch.com" },
  { id: "11", name: "PeopleSmart",        category: "People Search",    stage: "monitoring", dateFound: "Nov 20, 2024", dateRemoved: "Nov 30, 2024", recordsFound: 2,  url: "peoplesmart.com",  lastChecked: "1 day ago",  nextScan: "29 days" },
  { id: "12", name: "Instant Checkmate",  category: "Background Check", stage: "submitted",  dateFound: "Jan 8, 2025",  recordsFound: 1,             url: "instantcheckmate.com" },
  { id: "13", name: "Acxiom",            category: "Data Aggregator",   stage: "removed",    dateFound: "Dec 10, 2024", dateRemoved: "Jan 3, 2025",  recordsFound: 5,  url: "acxiom.com" },
  { id: "14", name: "LexisNexis",         category: "Data Aggregator",  stage: "monitoring", dateFound: "Nov 15, 2024", dateRemoved: "Dec 5, 2024",  recordsFound: 3,  url: "lexisnexis.com",   lastChecked: "5 days ago", nextScan: "25 days" },
  { id: "15", name: "PeopleFinder",       category: "People Search",    stage: "removed",    dateFound: "Dec 15, 2024", dateRemoved: "Jan 8, 2025",  recordsFound: 2,  url: "peoplefinder.com" },
  { id: "16", name: "PeekYou",            category: "People Search",    stage: "submitted",  dateFound: "Jan 12, 2025", recordsFound: 1,             url: "peekyou.com" },
  { id: "17", name: "US Search",          category: "People Search",    stage: "removed",    dateFound: "Dec 15, 2024", dateRemoved: "Jan 15, 2025", recordsFound: 2,  url: "ussearch.com" },
  { id: "18", name: "CheckPeople",        category: "Background Check", stage: "processing", dateFound: "Jan 9, 2025",  recordsFound: 1,             url: "checkpeople.com" },
  { id: "19", name: "Nuwber",             category: "People Search",    stage: "found",      dateFound: "Jan 17, 2025", recordsFound: 3,             url: "nuwber.com" },
  { id: "20", name: "Arrest.org",         category: "Public Records",   stage: "submitted",  dateFound: "Jan 10, 2025", recordsFound: 1,             url: "arrest.org" },
  { id: "21", name: "Epsilon",            category: "Data Aggregator",  stage: "removed",    dateFound: "Dec 12, 2024", dateRemoved: "Jan 12, 2025", recordsFound: 4,  url: "epsilon.com" },
  { id: "22", name: "CoreLogic",          category: "Data Aggregator",  stage: "monitoring", dateFound: "Nov 18, 2024", dateRemoved: "Dec 8, 2024",  recordsFound: 2,  url: "corelogic.com",    lastChecked: "2 days ago", nextScan: "28 days" },
  { id: "23", name: "Data.com",           category: "Data Aggregator",  stage: "removed",    dateFound: "Dec 15, 2024", dateRemoved: "Jan 6, 2025",  recordsFound: 1,  url: "data.com" },
  { id: "24", name: "Equifax Marketing",  category: "Data Aggregator",  stage: "processing", dateFound: "Jan 14, 2025", recordsFound: 2,             url: "equifaxmarketing.com" },
  { id: "25", name: "PeopleSurfer",       category: "People Search",    stage: "found",      dateFound: "Jan 18, 2025", recordsFound: 2,             url: "peoplesurfer.com" },
];

// ─── Stage system ─────────────────────────────────────────────────────────────

const STAGE_ORDER: BrokerStage[] = ["found", "submitted", "processing", "removed"];

const STAGE_CONFIG: Record<
  BrokerStage,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  scanning:   { label: "Scanning",    color: "text-zinc-400",   icon: RefreshCw },
  found:      { label: "Found",       color: "text-red-400",    icon: AlertCircle },
  submitted:  { label: "Submitted",   color: "text-amber-400",  icon: Clock },
  processing: { label: "Processing",  color: "text-blue-400",   icon: Clock },
  removed:    { label: "Removed",     color: "text-green-400",  icon: CheckCircle },
  monitoring: { label: "Monitoring",  color: "text-violet-400", icon: Eye },
};

// Maps stage to a "legacy status" for tab filtering convenience
function stageToTab(stage: BrokerStage): string {
  if (stage === "found") return "Found";
  if (stage === "submitted" || stage === "processing") return "Removal Requested";
  if (stage === "removed") return "Removed";
  if (stage === "monitoring") return "Monitoring";
  return "All";
}

const TABS = ["All", "Found", "Removal Requested", "Removed", "Monitoring"] as const;

// ─── Progress Dots Component ──────────────────────────────────────────────────

function StageProgressBar({ stage }: { stage: BrokerStage }) {
  const steps: { key: BrokerStage; label: string }[] = [
    { key: "found",     label: "Scan" },
    { key: "submitted", label: "Found" },
    { key: "removed",   label: "Submitted" },
    { key: "monitoring",label: "Removed" },
  ];

  // Determine how many steps are complete
  const stageRank: Record<BrokerStage, number> = {
    scanning:   0,
    found:      1,
    submitted:  2,
    processing: 2,
    removed:    3,
    monitoring: 4,
  };
  const rank = stageRank[stage];

  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => {
        const filled = rank > i;
        const active = rank === i + 1;
        return (
          <React.Fragment key={s.key}>
            <div
              title={s.label}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                filled || active
                  ? stage === "monitoring"
                    ? "bg-violet-500"
                    : stage === "removed" || filled
                    ? "bg-green-500"
                    : "bg-amber-500"
                  : "bg-zinc-700"
              }`}
            />
            {i < steps.length - 1 && (
              <div
                className={`h-px w-3 ${
                  filled ? "bg-green-600" : "bg-zinc-700"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Removal Certificate Modal ────────────────────────────────────────────────

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

  function handlePrint() {
    window.print();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 16 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Close */}
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Certificate body */}
        <div className="px-8 pb-6">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 mb-3">
              <span className="text-2xl font-serif font-bold text-violet-300">S</span>
            </div>
            <div className="text-xs text-zinc-500 tracking-widest uppercase">Shield Privacy</div>
          </div>

          {/* Headline */}
          <div className="text-center border-y border-white/10 py-4 mb-5">
            <p className="text-xs text-zinc-500 tracking-widest uppercase mb-1">Official</p>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Data Removal Certificate
            </h2>
          </div>

          {/* Fields */}
          <div className="space-y-3 mb-5">
            {[
              { label: "Certificate ID",    value: certId },
              { label: "Broker Name",       value: broker.name },
              { label: "Your Name",         value: "James Reeves" },
              { label: "Removal Date",      value: broker.dateRemoved ?? "—" },
              { label: "Records Removed",   value: `${broker.recordsFound} listing${broker.recordsFound !== 1 ? "s" : ""}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-start gap-4">
                <span className="text-xs text-zinc-500 shrink-0">{label}</span>
                <span className="text-sm text-white font-medium text-right">{value}</span>
              </div>
            ))}
            <div className="flex justify-between items-start gap-4">
              <span className="text-xs text-zinc-500 shrink-0">Verification</span>
              <span className="text-xs text-zinc-400 font-mono text-right break-all">
                sha256:{hash.slice(0, 32)}...
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-zinc-400 text-center leading-relaxed border border-white/8 rounded-lg p-4 mb-5">
            This certificate confirms that Shield Privacy successfully submitted and confirmed
            removal of your personal data from the above data broker.
          </p>

          {/* Download */}
          <Button
            className="w-full bg-violet-600 hover:bg-violet-700 text-white mb-3"
            onClick={handlePrint}
          >
            <Download className="w-4 h-4 mr-2" />
            Download as PDF
          </Button>

          {/* Footer */}
          <p className="text-xs text-zinc-600 text-center">
            Shield Privacy — BBB A+ Rated — SOC 2 Certified
          </p>
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
  const [certificateBrokerId, setCertificateBrokerId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return MOCK_BROKERS.filter((b) => {
      const tabLabel = stageToTab(b.stage);
      const matchesTab = activeTab === "All" || tabLabel === activeTab;
      const matchesSearch =
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.url.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || b.category === category;
      return matchesTab && matchesSearch && matchesCategory;
    });
  }, [activeTab, search, category]);

  const categories = Array.from(new Set(MOCK_BROKERS.map((b) => b.category)));

  // Pipeline counts
  const pipelineCounts = {
    found:      MOCK_BROKERS.filter((b) => b.stage === "found").length,
    submitted:  MOCK_BROKERS.filter((b) => b.stage === "submitted" || b.stage === "processing").length,
    removed:    MOCK_BROKERS.filter((b) => b.stage === "removed").length,
    monitoring: MOCK_BROKERS.filter((b) => b.stage === "monitoring").length,
  };

  const tabCounts: Record<string, number> = {
    All: MOCK_BROKERS.length,
    Found: pipelineCounts.found,
    "Removal Requested": pipelineCounts.submitted,
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

  const certBroker = certificateBrokerId
    ? MOCK_BROKERS.find((b) => b.id === certificateBrokerId) ?? null
    : null;

  return (
    <div className="space-y-6">
      {/* ── Speed callout ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 px-5 py-4 rounded-xl border border-orange-600/40 bg-orange-950/30"
      >
        <Zap className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-orange-300">
            Shield removes your data 3x faster than Cloaked
          </p>
          <p className="text-xs text-orange-400/70 mt-0.5">
            Average 5 business days vs 3–4 weeks. Your data, gone faster.
          </p>
        </div>
      </motion.div>

      {/* ── Pipeline Visualization ── */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {[
              { label: "Found",      count: pipelineCounts.found,      color: "text-red-400",    bar: "bg-red-500" },
              { label: "Requested",  count: pipelineCounts.submitted,   color: "text-amber-400",  bar: "bg-amber-500" },
              { label: "Removed",    count: pipelineCounts.removed,     color: "text-green-400",  bar: "bg-green-500" },
              { label: "Monitoring", count: pipelineCounts.monitoring,  color: "text-violet-400", bar: "bg-violet-500" },
            ].map(({ label, count, color, bar }, i, arr) => (
              <React.Fragment key={label}>
                <div className="flex-1 text-center">
                  <div className={`text-2xl font-black mb-1 ${color}`}>{count}</div>
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
                  <th className="text-left p-4 text-white/40 font-medium text-xs uppercase tracking-wider hidden md:table-cell">
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
                    const cfg = STAGE_CONFIG[broker.stage];
                    const StatusIcon = cfg.icon;
                    const isMonitoring = broker.stage === "monitoring";
                    const isRemoved = broker.stage === "removed";
                    const isFound = broker.stage === "found";
                    const isPending =
                      broker.stage === "submitted" || broker.stage === "processing";

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
                          <td className="p-4 hidden md:table-cell">
                            <StageProgressBar stage={broker.stage} />
                          </td>
                          <td className="p-4 text-sm text-white/40 hidden md:table-cell">
                            {broker.dateFound}
                          </td>
                          <td className="p-4 text-sm text-white/40 hidden lg:table-cell">
                            {broker.dateRemoved ?? (
                              <span className="text-white/20">—</span>
                            )}
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
                                  {broker.stage === "processing" ? "Processing" : "Pending"}
                                </Button>
                              )}
                              {(isRemoved || isMonitoring) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs whitespace-nowrap border-green-700/40 text-green-400 hover:bg-green-950/40 hover:text-green-300"
                                  onClick={() => setCertificateBrokerId(broker.id)}
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  Certificate
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
          <CertificateModal
            broker={certBroker}
            onClose={() => setCertificateBrokerId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
