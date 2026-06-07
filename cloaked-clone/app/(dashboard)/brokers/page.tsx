"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  ChevronDown,
  Database,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
}

const MOCK_BROKERS: Broker[] = [
  { id: "1", name: "Spokeo", category: "People Search", status: "removed", dateFound: "Dec 15, 2024", dateRemoved: "Dec 22, 2024", recordsFound: 3, url: "spokeo.com" },
  { id: "2", name: "WhitePages", category: "People Search", status: "removed", dateFound: "Dec 15, 2024", dateRemoved: "Dec 28, 2024", recordsFound: 2, url: "whitepages.com" },
  { id: "3", name: "BeenVerified", category: "Background Check", status: "removed", dateFound: "Dec 15, 2024", dateRemoved: "Jan 5, 2025", recordsFound: 1, url: "beenverified.com" },
  { id: "4", name: "TruthFinder", category: "Background Check", status: "requested", dateFound: "Jan 8, 2025", recordsFound: 2, url: "truthfinder.com" },
  { id: "5", name: "Radaris", category: "People Search", status: "requested", dateFound: "Jan 8, 2025", recordsFound: 1, url: "radaris.com" },
  { id: "6", name: "FastPeopleSearch", category: "People Search", status: "found", dateFound: "Jan 15, 2025", recordsFound: 4, url: "fastpeoplesearch.com" },
  { id: "7", name: "Intelius", category: "Background Check", status: "found", dateFound: "Jan 15, 2025", recordsFound: 1, url: "intelius.com" },
  { id: "8", name: "MyLife", category: "Reputation", status: "monitoring", dateFound: "Nov 20, 2024", dateRemoved: "Dec 1, 2024", recordsFound: 1, url: "mylife.com" },
  { id: "9", name: "Pipl", category: "Identity", status: "removed", dateFound: "Dec 15, 2024", dateRemoved: "Jan 2, 2025", recordsFound: 2, url: "pipl.com" },
  { id: "10", name: "ZabaSearch", category: "People Search", status: "removed", dateFound: "Dec 15, 2024", dateRemoved: "Jan 10, 2025", recordsFound: 1, url: "zabasearch.com" },
  { id: "11", name: "PeopleSmart", category: "People Search", status: "monitoring", dateFound: "Nov 20, 2024", dateRemoved: "Nov 30, 2024", recordsFound: 2, url: "peoplesmart.com" },
  { id: "12", name: "Instant Checkmate", category: "Background Check", status: "requested", dateFound: "Jan 8, 2025", recordsFound: 1, url: "instantcheckmate.com" },
];

const STATUS_CONFIG = {
  found: { label: "Found", badge: "destructive" as const, icon: AlertCircle, color: "text-red-400" },
  requested: { label: "Removal Requested", badge: "warning" as const, icon: Clock, color: "text-amber-400" },
  removed: { label: "Removed", badge: "success" as const, icon: CheckCircle, color: "text-green-400" },
  monitoring: { label: "Monitoring", badge: "default" as const, icon: Eye, color: "text-violet-400" },
};

const TABS = ["All", "Found", "Removal Requested", "Removed", "Monitoring"] as const;

const PIPELINE = [
  { label: "Found", count: 2, color: "bg-red-500" },
  { label: "Requested", count: 3, color: "bg-amber-500" },
  { label: "Removed", count: 6, color: "bg-green-500" },
  { label: "Monitoring", count: 2, color: "bg-violet-500" },
];

export default function BrokersPage() {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return MOCK_BROKERS.filter((b) => {
      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Found" && b.status === "found") ||
        (activeTab === "Removal Requested" && b.status === "requested") ||
        (activeTab === "Removed" && b.status === "removed") ||
        (activeTab === "Monitoring" && b.status === "monitoring");
      const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.url.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || b.category === category;
      return matchesTab && matchesSearch && matchesCategory;
    });
  }, [activeTab, search, category]);

  const categories = Array.from(new Set(MOCK_BROKERS.map((b) => b.category)));

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((b) => b.id)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Pipeline Visualization */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {PIPELINE.map(({ label, count, color }, i) => (
              <React.Fragment key={label}>
                <div className="flex-1 text-center">
                  <div className={`text-2xl font-black mb-1 ${color.replace("bg-", "text-")}`}>{count}</div>
                  <div className="text-xs text-white/40">{label}</div>
                  <div className={`h-1 rounded-full mt-2 ${color}`} />
                </div>
                {i < PIPELINE.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-white/20 flex-shrink-0 hidden sm:block" />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
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
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const count = MOCK_BROKERS.filter((b) =>
            tab === "All" ? true :
            tab === "Found" ? b.status === "found" :
            tab === "Removal Requested" ? b.status === "requested" :
            tab === "Removed" ? b.status === "removed" :
            b.status === "monitoring"
          ).length;
          return (
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
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab ? "bg-violet-600/30 text-violet-300" : "bg-white/10 text-white/30"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between glass-card rounded-xl p-4 border border-violet-500/20"
        >
          <span className="text-sm text-white/70">{selected.size} broker{selected.size !== 1 ? "s" : ""} selected</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setSelected(new Set())}>Clear</Button>
            <Button size="sm">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Request Removal
            </Button>
          </div>
        </motion.div>
      )}

      {/* Broker Grid */}
      <Card>
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
                  <th className="text-left p-4 text-white/40 font-medium text-xs uppercase tracking-wider">Broker</th>
                  <th className="text-left p-4 text-white/40 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th className="text-left p-4 text-white/40 font-medium text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left p-4 text-white/40 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Date Found</th>
                  <th className="text-left p-4 text-white/40 font-medium text-xs uppercase tracking-wider hidden lg:table-cell">Date Removed</th>
                  <th className="text-left p-4 text-white/40 font-medium text-xs uppercase tracking-wider">Records</th>
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
                    const config = STATUS_CONFIG[broker.status];
                    const StatusIcon = config.icon;
                    return (
                      <tr
                        key={broker.id}
                        className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors"
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selected.has(broker.id)}
                            onChange={() => toggleSelect(broker.id)}
                            className="w-4 h-4 rounded border-white/20 bg-white/5 accent-violet-600 cursor-pointer"
                          />
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-sm">{broker.name}</div>
                          <div className="text-xs text-white/30">{broker.url}</div>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <Badge variant="secondary" className="text-xs">{broker.category}</Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <StatusIcon className={`w-3.5 h-3.5 ${config.color}`} />
                            <Badge variant={config.badge} className="text-xs">{config.label}</Badge>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-white/40 hidden md:table-cell">{broker.dateFound}</td>
                        <td className="p-4 text-sm text-white/40 hidden lg:table-cell">
                          {broker.dateRemoved || <span className="text-white/20">—</span>}
                        </td>
                        <td className="p-4 text-sm text-white/60">{broker.recordsFound}</td>
                        <td className="p-4">
                          {broker.status === "found" && (
                            <Button size="sm" className="text-xs">Request Removal</Button>
                          )}
                          {broker.status === "requested" && (
                            <Button size="sm" variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />Pending
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
