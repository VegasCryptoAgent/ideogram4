"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Shield,
  AlertTriangle,
  Download,
  User,
  Phone,
  ChevronRight,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Shape returned by GET /api/email-aliases (matches Prisma EmailAlias model) */
interface ApiEmailAlias {
  id: string;
  alias: string;
  label: string | null;
  forwardTo: string;
  isActive: boolean;
  spamBlocked: number;      // Prisma field name
  emailsReceived: number;   // Prisma field name
  createdAt: string;
  updatedAt: string;
}

/** UI-facing shape (mapped from API) */
interface EmailAlias {
  id: string;
  alias: string;
  label: string;
  forwardTo: string;
  isActive: boolean;
  emailsReceived: number;
  spamBlocked: number;
  createdAt: string;
  source: string;
  compromised: boolean;
  spamRate: number;
  lastEmail: string;
}

interface Identity {
  id: string;
  name: string;
  emailAlias: string;
  phoneAlias: string | null;
  avatarColor: string;
  totalEmails: number;
  spamRate: number;
  status: "active" | "compromised" | "paused";
}

// ─── Mapping helpers ──────────────────────────────────────────────────────────

function mapApiAlias(a: ApiEmailAlias): EmailAlias {
  const spamRate = Math.round(
    (a.spamBlocked / Math.max(a.emailsReceived, 1)) * 100
  );
  return {
    id: a.id,
    alias: a.alias,
    label: a.label ?? "Untitled",
    forwardTo: a.forwardTo ?? "",
    isActive: a.isActive,
    emailsReceived: a.emailsReceived,
    spamBlocked: a.spamBlocked,
    createdAt: a.createdAt.split("T")[0],
    source: a.label ?? "Unknown",
    compromised: a.spamBlocked > a.emailsReceived * 0.6,
    spamRate,
    lastEmail: a.updatedAt
      ? new Date(a.updatedAt).toLocaleDateString()
      : "Never",
  };
}

// ─── Static mock identities (identities have no API yet) ─────────────────────

const MOCK_IDENTITIES: Identity[] = [
  {
    id: "1",
    name: "Shopping Identity",
    emailAlias: "shield-jane@shield.app",
    phoneAlias: "+1 (555) 234-5678",
    avatarColor: "bg-blue-500",
    totalEmails: 109,
    spamRate: 26,
    status: "active",
  },
  {
    id: "2",
    name: "Newsletter Identity",
    emailAlias: "news-anon@shield.app",
    phoneAlias: null,
    avatarColor: "bg-purple-500",
    totalEmails: 103,
    spamRate: 30,
    status: "active",
  },
  {
    id: "3",
    name: "Work Contacts",
    emailAlias: "work-pro@shield.app",
    phoneAlias: "+1 (555) 876-5432",
    avatarColor: "bg-green-500",
    totalEmails: 8,
    spamRate: 0,
    status: "active",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function spamBarColor(rate: number): string {
  if (rate < 30) return "bg-green-500";
  if (rate < 60) return "bg-yellow-500";
  return "bg-red-500";
}

function spamTextColor(rate: number): string {
  if (rate < 30) return "text-green-400";
  if (rate < 60) return "text-yellow-400";
  return "text-red-400";
}

function statusBadge(status: Identity["status"]) {
  if (status === "active")
    return (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
        Active
      </Badge>
    );
  if (status === "compromised")
    return (
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
        Compromised
      </Badge>
    );
  return (
    <Badge className="bg-zinc-700 text-zinc-400 text-xs">Paused</Badge>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function EmailPage() {
  const { data: session } = useSession();

  const [aliases, setAliases] = useState<EmailAlias[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [identities, setIdentities] = useState<Identity[]>(MOCK_IDENTITIES);

  // Create alias dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newForwardTo, setNewForwardTo] = useState("");
  const [newSource, setNewSource] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Create identity dialog
  const [isIdentityOpen, setIsIdentityOpen] = useState(false);
  const [newIdentityName, setNewIdentityName] = useState("");
  const [newIdentityPhone, setNewIdentityPhone] = useState("");

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ── Fetch aliases from real API ──
  const fetchAliases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/email-aliases");
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
      const json = await res.json();
      const raw: ApiEmailAlias[] = json.data ?? json;
      setAliases(raw.map(mapApiAlias));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load aliases");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAliases();
  }, [fetchAliases]);

  // ── Derived stats ──
  const totalEmails = aliases.reduce((s, a) => s + a.emailsReceived, 0);
  const totalSpamBlocked = aliases.reduce((s, a) => s + a.spamBlocked, 0);
  const activeAliases = aliases.filter((a) => a.isActive).length;
  const compromisedCount = aliases.filter((a) => a.compromised).length;

  // ── Handlers ──
  const handleCopy = useCallback((alias: string, id: string) => {
    navigator.clipboard.writeText(alias);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleToggle = useCallback(async (id: string) => {
    const current = aliases.find((a) => a.id === id);
    if (!current) return;

    // Optimistic update
    setAliases((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );

    try {
      const res = await fetch(`/api/email-aliases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current.isActive }),
      });
      if (!res.ok) {
        // Revert on failure
        setAliases((prev) =>
          prev.map((a) => (a.id === id ? { ...a, isActive: current.isActive } : a))
        );
      }
    } catch {
      // Revert on error
      setAliases((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isActive: current.isActive } : a))
      );
    }
  }, [aliases]);

  const handleDelete = useCallback(async (id: string) => {
    // Optimistic removal
    const previous = aliases.find((a) => a.id === id);
    setAliases((prev) => prev.filter((a) => a.id !== id));

    try {
      const res = await fetch(`/api/email-aliases/${id}`, {
        method: "DELETE",
      });
      if (!res.ok && previous) {
        // Revert on failure
        setAliases((prev) => [previous, ...prev]);
      }
    } catch {
      if (previous) {
        setAliases((prev) => [previous, ...prev]);
      }
    }
  }, [aliases]);

  const handleCreate = useCallback(async () => {
    if (!newLabel.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/email-aliases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: newLabel.trim(),
          forwardTo: newForwardTo.trim() || undefined,
          forSite: newSource.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
      const json = await res.json();
      const created: ApiEmailAlias = json.data ?? json;
      setAliases((prev) => [mapApiAlias(created), ...prev]);
      setNewLabel("");
      setNewForwardTo("");
      setNewSource("");
      setIsCreateOpen(false);
    } catch (err) {
      // Surface error inline — keep dialog open so user can retry
      alert(err instanceof Error ? err.message : "Failed to create alias");
    } finally {
      setIsCreating(false);
    }
  }, [newLabel, newForwardTo, newSource]);

  const handleCreateIdentity = useCallback(() => {
    if (!newIdentityName.trim()) return;
    const slug = newIdentityName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-green-500",
      "bg-pink-500",
      "bg-amber-500",
      "bg-cyan-500",
    ];
    const newId: Identity = {
      id: Date.now().toString(),
      name: newIdentityName,
      emailAlias: `${slug}@shield.app`,
      phoneAlias: newIdentityPhone || null,
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
      totalEmails: 0,
      spamRate: 0,
      status: "active",
    };
    setIdentities((prev) => [...prev, newId]);
    setNewIdentityName("");
    setNewIdentityPhone("");
    setIsIdentityOpen(false);
  }, [newIdentityName, newIdentityPhone]);

  // ── Export CSV ──
  const handleExportCSV = useCallback(() => {
    const header = [
      "Alias",
      "Label",
      "Forward To",
      "Source",
      "Active",
      "Emails Received",
      "Spam Blocked",
      "Spam Rate %",
      "Compromised",
      "Created",
    ].join(",");
    const rows = aliases.map((a) =>
      [
        a.alias,
        a.label,
        a.forwardTo,
        a.source,
        a.isActive ? "Yes" : "No",
        a.emailsReceived,
        a.spamBlocked,
        a.spamRate,
        a.compromised ? "Yes" : "No",
        a.createdAt,
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shield-email-aliases.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [aliases]);

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Email Aliases</h1>
          <p className="text-zinc-400 mt-1">
            Use disposable email addresses to protect your real inbox.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="hidden sm:flex"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </Button>

          {/* Create Alias dialog */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-violet-600 hover:bg-violet-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Alias
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
              <DialogHeader>
                <DialogTitle>Create Email Alias</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  We'll generate a unique address that forwards to your real
                  email.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>Label (what it's for)</Label>
                  <Input
                    placeholder="e.g. Shopping, Banking, Newsletters"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Which site is this for?</Label>
                  <Input
                    placeholder="e.g. Amazon, Netflix, a random forum..."
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Forward emails to</Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={newForwardTo}
                    onChange={(e) => setNewForwardTo(e.target.value)}
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
                {newLabel && (
                  <div className="bg-violet-950/40 border border-violet-800/40 rounded-lg p-3 text-sm text-violet-300">
                    Your alias will look like:{" "}
                    <span className="font-mono font-medium">
                      {newLabel.toLowerCase().replace(/[^a-z0-9]/g, "")}
                      +abc123@shield.app
                    </span>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={isCreating || !newLabel.trim()}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Alias"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Active Aliases",
            value: activeAliases,
            icon: Mail,
            color: "text-violet-400",
            bg: "bg-violet-500/20",
          },
          {
            label: "Emails Forwarded",
            value: totalEmails,
            icon: ExternalLink,
            color: "text-blue-400",
            bg: "bg-blue-500/20",
          },
          {
            label: "Spam Blocked",
            value: totalSpamBlocked,
            icon: Shield,
            color: "text-green-400",
            bg: "bg-green-500/20",
          },
          {
            label: "Compromised",
            value: compromisedCount,
            icon: AlertTriangle,
            color: "text-red-400",
            bg: "bg-red-500/20",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="bg-white/5 border-white/10">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-sm text-zinc-400">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Identities section ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Your Identities
            </h2>
            <p className="text-sm text-zinc-400 mt-0.5">
              Personas that bundle an email alias, phone number, and name
            </p>
          </div>

          {/* Create Identity dialog */}
          <Dialog open={isIdentityOpen} onOpenChange={setIsIdentityOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1.5" />
                Create Identity
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
              <DialogHeader>
                <DialogTitle>Create Identity</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Bundle an email alias and optional phone number under one
                  persona.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>Identity name</Label>
                  <Input
                    placeholder="e.g. Shopping Jane, Work Pro..."
                    value={newIdentityName}
                    onChange={(e) => setNewIdentityName(e.target.value)}
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Link a virtual number (optional)</Label>
                  <Input
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                    value={newIdentityPhone}
                    onChange={(e) => setNewIdentityPhone(e.target.value)}
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
                {newIdentityName && (
                  <div className="bg-violet-950/40 border border-violet-800/40 rounded-lg p-3 text-sm text-violet-300">
                    Email alias:{" "}
                    <span className="font-mono font-medium">
                      {newIdentityName
                        .toLowerCase()
                        .replace(/[^a-z0-9]/g, "-")}
                      @shield.app
                    </span>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setIsIdentityOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateIdentity}
                  disabled={!newIdentityName.trim()}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  Create Identity
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {identities.map((identity) => (
            <motion.div
              key={identity.id}
              layout
              className="glass-card rounded-2xl p-5 border border-white/10"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-xl ${identity.avatarColor} flex items-center justify-center shrink-0`}
                >
                  <User className="w-5 h-5 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">
                      {identity.name}
                    </span>
                    {statusBadge(identity.status)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-violet-300 font-mono truncate">
                      <Mail className="w-3 h-3 shrink-0 text-white/30" />
                      {identity.emailAlias}
                    </div>
                    {identity.phoneAlias ? (
                      <div className="flex items-center gap-1.5 text-xs text-white/50 font-mono">
                        <Phone className="w-3 h-3 shrink-0 text-white/30" />
                        {identity.phoneAlias}
                      </div>
                    ) : (
                      <div className="text-xs text-white/30">No phone linked</div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10">
                    <div>
                      <div className="text-xs text-white/30">Emails</div>
                      <div className="text-sm font-semibold text-white">
                        {identity.totalEmails}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-white/30">Spam rate</div>
                      <div
                        className={`text-sm font-semibold ${spamTextColor(
                          identity.spamRate
                        )}`}
                      >
                        {identity.spamRate}%
                      </div>
                    </div>
                    <button className="ml-auto text-white/30 hover:text-white transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Info banner ── */}
      <div className="bg-violet-950/30 border border-violet-700/30 rounded-xl p-4 flex gap-3 items-start">
        <Shield className="w-5 h-5 text-violet-400 mt-0.5 shrink-0" />
        <div className="text-sm text-zinc-300">
          <span className="font-semibold text-violet-300">How it works: </span>
          When you give a site your alias instead of your real email, we forward
          mail to you. If spam starts arriving, disable or delete the alias —
          your real email stays clean.
        </div>
      </div>

      {/* ── Alias list ── */}
      <div className="space-y-3">
        {/* Loading state */}
        {loading && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-16 text-center">
              <Loader2 className="w-10 h-10 text-violet-400 mx-auto mb-3 animate-spin" />
              <p className="text-zinc-400">Loading your aliases…</p>
            </CardContent>
          </Card>
        )}

        {/* Error state */}
        {!loading && error && (
          <Card className="bg-white/5 border-red-500/30">
            <CardContent className="py-10 text-center">
              <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="text-red-300 mb-4">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchAliases}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!loading && !error && aliases.length === 0 && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-16 text-center">
              <Mail className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400">
                No aliases yet. Create your first one above.
              </p>
            </CardContent>
          </Card>
        )}

        <AnimatePresence>
          {aliases.map((alias) => (
            <motion.div
              key={alias.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className={`bg-white/5 border transition-opacity ${
                  alias.compromised
                    ? "border-red-500/40"
                    : "border-white/10"
                } ${alias.isActive ? "" : "opacity-60"}`}
              >
                <CardContent className="p-5 space-y-3">
                  {/* Compromised alert */}
                  {alias.compromised && (
                    <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-300 leading-relaxed">
                        This alias has been sold.{" "}
                        <span className="font-semibold">{alias.spamRate}%</span>{" "}
                        of emails are spam. Delete it to stop the leak.
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Label row */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">
                          {alias.label}
                        </span>
                        {alias.compromised ? (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                            COMPROMISED
                          </Badge>
                        ) : (
                          <Badge
                            className={
                              alias.isActive
                                ? "bg-green-500/20 text-green-400 border-green-500/30 text-xs"
                                : "bg-zinc-700 text-zinc-400 text-xs"
                            }
                          >
                            {alias.isActive ? "Active" : "Inactive"}
                          </Badge>
                        )}
                        <span className="text-xs text-white/30 ml-auto">
                          {alias.lastEmail}
                        </span>
                      </div>

                      {/* Alias address */}
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm text-violet-300 font-mono truncate">
                          {alias.alias}
                        </code>
                        <button
                          onClick={() => handleCopy(alias.alias, alias.id)}
                          className="text-zinc-500 hover:text-zinc-300 shrink-0"
                        >
                          {copiedId === alias.id ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {copiedId === alias.id && (
                          <span className="text-xs text-green-400">Copied!</span>
                        )}
                      </div>

                      {/* Source field */}
                      <div className="flex items-center gap-1 text-xs text-zinc-500 mb-2">
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        Given to:{" "}
                        <span className="text-zinc-400 font-medium">
                          {alias.source}
                        </span>
                        &nbsp;·&nbsp; Forwards to {alias.forwardTo || "—"}
                      </div>

                      {/* Spam rate bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${spamBarColor(
                              alias.spamRate
                            )}`}
                            style={{ width: `${alias.spamRate}%` }}
                          />
                        </div>
                        <span
                          className={`text-xs font-medium shrink-0 ${spamTextColor(
                            alias.spamRate
                          )}`}
                        >
                          {alias.spamRate}% spam
                        </span>
                      </div>
                    </div>

                    {/* Stats + controls */}
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">
                          {alias.emailsReceived}
                        </p>
                        <p className="text-xs text-zinc-500">received</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-red-400">
                          {alias.spamBlocked}
                        </p>
                        <p className="text-xs text-zinc-500">blocked</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={alias.isActive}
                          onCheckedChange={() => handleToggle(alias.id)}
                        />
                        <button
                          onClick={() => handleDelete(alias.id)}
                          className="text-zinc-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Mobile export button */}
      <div className="sm:hidden">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleExportCSV}
        >
          <Download className="w-4 h-4 mr-1.5" />
          Export aliases (CSV)
        </Button>
      </div>
    </div>
  );
}
