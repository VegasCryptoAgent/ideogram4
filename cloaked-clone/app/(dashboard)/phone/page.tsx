"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Plus,
  Shield,
  ShieldOff,
  PhoneIncoming,
  Settings,
  Copy,
  Check,
  X,
  AlertOctagon,
  ArrowRight,
  Zap,
  Bot,
  PhoneMissed,
  UserX,
  Wifi,
  CreditCard,
  Lock,
  ChevronRight,
  Radio,
  Mic,
  Eye,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useSession } from "next-auth/react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VirtualPhone {
  id: string;
  number: string;
  label: string | null;
  isActive: boolean;
  callsReceived: number;
  smsReceived: number;
  spamBlocked: number;
  forwardTo: string | null;
  createdAt: string;
  _count: { callLogs: number };
}

interface CallLogEntry {
  id: string;
  from: string;
  to: string;
  duration: number | null;
  status: string;
  isSpam: boolean;
  spamScore: number | null;
  transcript: string | null;
  createdAt: string;
}

type InterceptionStep = "ringing" | "analyzing" | "result";

interface CallGuardSettings {
  blockUnknown: boolean;
  screenRobocalls: boolean;
  requireCallerId: boolean;
  voicemailTranscription: boolean;
}

// ─── Interception animation steps ─────────────────────────────────────────────

const INTERCEPTION_STEPS: Array<{
  step: InterceptionStep;
  label: string;
  sublabel: string;
  color: string;
}> = [
  {
    step: "ringing",
    label: "Incoming call from +1 (702) 555-0182",
    sublabel: "Shield intercepted the call before it reached you",
    color: "text-blue-400",
  },
  {
    step: "analyzing",
    label: "Analyzing caller...",
    sublabel:
      "Checking against 47M known spam numbers... Robocall detected",
    color: "text-yellow-400",
  },
  {
    step: "result",
    label: "BLOCKED — Saved you from answering",
    sublabel: "Call permanently silenced. You were never disturbed.",
    color: "text-green-400",
  },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function PhonePage() {
  const { data: session } = useSession();
  const [phones, setPhones] = useState<VirtualPhone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingNumber, setAddingNumber] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newAreaCode, setNewAreaCode] = useState("");
  const [newForward, setNewForward] = useState("");
  const [newNumberType, setNewNumberType] = useState<"voip" | "esim">("voip");

  const [selectedPhoneId, setSelectedPhoneId] = useState<string | null>(null);
  const [callLogs, setCallLogs] = useState<CallLogEntry[]>([]);
  const [callLogsLoading, setCallLogsLoading] = useState(false);

  const [interceptionStepIdx, setInterceptionStepIdx] = useState(0);
  const [spamStats, setSpamStats] = useState({ callsScreened: 0, spamBlockRate: 0, robocallsReached: 0 });

  useEffect(() => {
    fetch('/api/spam/stats')
      .then(r => r.json())
      .then(json => {
        const s = json.data?.summary ?? {}
        setSpamStats({
          callsScreened: s.totalCallsReceived ?? 0,
          spamBlockRate: s.callBlockRate ?? 0,
          robocallsReached: Math.max(0, (s.totalCallsReceived ?? 0) - (s.totalSpamCallsBlocked ?? 0)),
        })
      }).catch(() => {})
  }, [])

  const [callGuardSettings, setCallGuardSettings] =
    useState<CallGuardSettings>({
      blockUnknown: true,
      screenRobocalls: true,
      requireCallerId: false,
      voicemailTranscription: true,
    });

  // ── Fetch phones from API ──────────────────────────────────────────────────

  const fetchPhones = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/phone");
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Failed to load virtual numbers");
      }
      const json = await res.json();
      setPhones(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load virtual numbers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchPhones();
  }, [session, fetchPhones]);

  // ── Cycle the interception animation every 6 seconds ──────────────────────

  useEffect(() => {
    const id = setInterval(() => {
      setInterceptionStepIdx((prev) => (prev + 1) % INTERCEPTION_STEPS.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  // ── Copy to clipboard ─────────────────────────────────────────────────────

  const copyNumber = useCallback((id: string, number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  // ── Toggle active via PATCH ───────────────────────────────────────────────

  const toggleNumber = useCallback(async (id: string, currentActive: boolean) => {
    // Optimistic update
    setPhones((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !currentActive } : p))
    );
    try {
      const res = await fetch(`/api/phone/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (!res.ok) {
        // Revert on failure
        setPhones((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isActive: currentActive } : p))
        );
      }
    } catch {
      setPhones((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: currentActive } : p))
      );
    }
  }, []);

  // ── Delete phone ──────────────────────────────────────────────────────────

  const deletePhone = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/phone/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPhones((prev) => prev.filter((p) => p.id !== id));
        if (selectedPhoneId === id) {
          setSelectedPhoneId(null);
          setCallLogs([]);
        }
      }
    } catch (err) {
      console.error("Failed to delete phone", err);
    }
  }, [selectedPhoneId]);

  // ── Add number via POST ───────────────────────────────────────────────────

  const addNumber = useCallback(async () => {
    setAddingNumber(true);
    try {
      const res = await fetch("/api/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          areaCode: newAreaCode || "415",
          label: newLabel || undefined,
          forwardTo: newForward || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error ?? "Failed to add number");
        return;
      }
      // Refetch to get the full object with _count
      await fetchPhones();
      setShowAddModal(false);
      setNewLabel("");
      setNewAreaCode("");
      setNewForward("");
      setNewNumberType("voip");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add number");
    } finally {
      setAddingNumber(false);
    }
  }, [newAreaCode, newLabel, newForward, fetchPhones]);

  // ── Fetch call logs for a phone ───────────────────────────────────────────

  const fetchCallLogs = useCallback(async (phoneId: string) => {
    setCallLogsLoading(true);
    try {
      const res = await fetch(`/api/phone/${phoneId}/calls`);
      if (res.ok) {
        const json = await res.json();
        setCallLogs(json.data?.items ?? []);
      }
    } catch (err) {
      console.error("Failed to fetch call logs", err);
    } finally {
      setCallLogsLoading(false);
    }
  }, []);

  const handleSelectPhone = useCallback((phoneId: string) => {
    if (selectedPhoneId === phoneId) {
      setSelectedPhoneId(null);
      setCallLogs([]);
    } else {
      setSelectedPhoneId(phoneId);
      fetchCallLogs(phoneId);
    }
  }, [selectedPhoneId, fetchCallLogs]);

  // ── Derived stats ─────────────────────────────────────────────────────────

  const totalSpamBlocked = phones.reduce((sum, p) => sum + p.spamBlocked, 0);
  const totalCallsReceived = phones.reduce((sum, p) => sum + p.callsReceived, 0);

  const currentStep = INTERCEPTION_STEPS[interceptionStepIdx];

  // ── Loading / error states ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-white/40">
        <div className="text-center space-y-3">
          <Phone className="w-10 h-10 mx-auto animate-pulse" />
          <p className="text-sm">Loading your virtual numbers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <AlertOctagon className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load</h3>
            <p className="text-white/40 text-sm mb-6">{error}</p>
            <Button onClick={fetchPhones}>Try again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Virtual Numbers",
            value: phones.length,
            icon: Phone,
            color: "text-violet-400",
          },
          {
            label: "Active Numbers",
            value: phones.filter((p) => p.isActive).length,
            icon: Shield,
            color: "text-green-400",
          },
          {
            label: "Calls Received",
            value: totalCallsReceived,
            icon: PhoneIncoming,
            color: "text-blue-400",
          },
          {
            label: "Spam Blocked",
            value: totalSpamBlocked,
            icon: AlertOctagon,
            color: "text-red-400",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="glass-card rounded-2xl p-5 border border-white/10"
          >
            <Icon className={`w-5 h-5 ${color} mb-3`} />
            <div className="text-2xl font-black mb-1">{value}</div>
            <div className="text-xs text-white/40">{label}</div>
          </div>
        ))}
      </div>

      {/* ── AI Call Guard ── */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-green-500/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-60" />
            </div>
            <span className="font-semibold text-white">Call Guard Active</span>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
              AI Screening ON
            </Badge>
          </div>
          <span className="text-xs text-white/40">
            AI is screening all incoming calls
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Live interception visual */}
          <div className="rounded-xl border border-white/10 bg-black/30 p-5">
            <div className="text-xs text-white/30 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Radio className="w-3 h-3" />
              Live interception
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={interceptionStepIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="flex items-start gap-4"
              >
                {/* Animated icon */}
                <div className="shrink-0 mt-1">
                  {currentStep.step === "ringing" && (
                    <motion.div
                      animate={{ rotate: [0, -12, 12, -12, 12, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        repeatDelay: 1.4,
                      }}
                      className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center"
                    >
                      <Phone className="w-5 h-5 text-blue-400" />
                    </motion.div>
                  )}
                  {currentStep.step === "analyzing" && (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center"
                    >
                      <Bot className="w-5 h-5 text-yellow-400" />
                    </motion.div>
                  )}
                  {currentStep.step === "result" && (
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <ShieldOff className="w-5 h-5 text-green-400" />
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm mb-1 ${currentStep.color}`}>
                    {currentStep.label}
                  </p>
                  <p className="text-xs text-white/50 leading-relaxed">
                    {currentStep.sublabel}
                  </p>

                  {/* Step progress dots */}
                  <div className="flex gap-1.5 mt-3">
                    {INTERCEPTION_STEPS.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 rounded-full transition-all duration-500 ${
                          i === interceptionStepIdx
                            ? "w-6 bg-green-400"
                            : i < interceptionStepIdx
                            ? "w-2 bg-white/30"
                            : "w-2 bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Status pill */}
                <div className="shrink-0">
                  {currentStep.step === "ringing" && (
                    <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-1 rounded-full">
                      Intercepted
                    </span>
                  )}
                  {currentStep.step === "analyzing" && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2 py-1 rounded-full animate-pulse">
                      Scanning...
                    </span>
                  )}
                  {currentStep.step === "result" && (
                    <span className="text-xs bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-1 rounded-full">
                      Protected
                    </span>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Call Guard stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: String(spamStats.callsScreened), label: "Calls screened", icon: Eye },
              { value: `${spamStats.spamBlockRate}%`, label: "Spam blocked", icon: Shield },
              { value: String(spamStats.robocallsReached), label: "Robocalls reached you", icon: PhoneMissed },
            ].map(({ value, label, icon: Icon }) => (
              <div
                key={label}
                className="text-center rounded-xl bg-white/5 border border-white/10 p-4"
              >
                <Icon className="w-4 h-4 text-green-400 mx-auto mb-2" />
                <div className="text-xl font-black text-white mb-0.5">
                  {value}
                </div>
                <div className="text-xs text-white/40 leading-snug">{label}</div>
              </div>
            ))}
          </div>

          {/* Call Guard settings */}
          <div>
            <div className="text-xs text-white/30 uppercase tracking-widest mb-3">
              Call Guard Settings
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  {
                    key: "blockUnknown" as const,
                    label: "Block unknown callers",
                    icon: UserX,
                  },
                  {
                    key: "screenRobocalls" as const,
                    label: "Screen robocalls",
                    icon: Bot,
                  },
                  {
                    key: "requireCallerId" as const,
                    label: "Require caller ID",
                    icon: Eye,
                  },
                  {
                    key: "voicemailTranscription" as const,
                    label: "Voicemail transcription",
                    icon: Mic,
                  },
                ]
              ).map(({ key, label, icon: Icon }) => (
                <div
                  key={key}
                  className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/10"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-white/40" />
                    <span className="text-sm text-white/70">{label}</span>
                  </div>
                  <Switch
                    checked={callGuardSettings[key]}
                    onCheckedChange={(v) =>
                      setCallGuardSettings((prev) => ({ ...prev, [key]: v }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Virtual Numbers header ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your Virtual Numbers</h2>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Number
        </Button>
      </div>

      {phones.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Phone className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No virtual numbers yet
            </h3>
            <p className="text-white/40 text-sm mb-6">
              Add your first virtual number to start protecting your real
              number.
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Your First Number
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {phones.map((phone) => (
            <motion.div
              key={phone.id}
              layout
              className={`glass-card rounded-2xl p-5 border transition-all ${
                phone.isActive ? "border-white/10" : "border-white/5 opacity-60"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        phone.isActive ? "bg-violet-600/20" : "bg-white/5"
                      }`}
                    >
                      <Phone
                        className={`w-5 h-5 ${
                          phone.isActive ? "text-violet-400" : "text-white/30"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-mono font-bold text-lg">
                          {phone.number}
                        </div>
                        <Badge className="bg-white/10 text-white/50 border-white/10 text-xs">
                          VoIP
                        </Badge>
                      </div>
                      <div className="text-sm text-white/40">
                        {phone.label || "No label"}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-white/40 ml-13">
                    <span className="flex items-center gap-1">
                      <ArrowRight className="w-3 h-3" />
                      Forwarding to {phone.forwardTo || "not set"}
                    </span>
                    <span className="flex items-center gap-1">
                      <PhoneIncoming className="w-3 h-3" />
                      {phone.callsReceived} calls
                    </span>
                    <span className="flex items-center gap-1 text-red-400/60">
                      <AlertOctagon className="w-3 h-3" />
                      {phone.spamBlocked} blocked
                    </span>
                    <span>
                      Created{" "}
                      {new Date(phone.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => copyNumber(phone.id, phone.number)}
                    className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Copy number"
                  >
                    {copiedId === phone.id ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleSelectPhone(phone.id)}
                    className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="View call log"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deletePhone(phone.id)}
                    className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete number"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Switch
                    checked={phone.isActive}
                    onCheckedChange={() => toggleNumber(phone.id, phone.isActive)}
                  />
                </div>
              </div>

              {/* ── Expanded call log for this phone ── */}
              <AnimatePresence>
                {selectedPhoneId === phone.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="text-xs text-white/30 uppercase tracking-widest mb-3">
                        Call Log
                      </div>
                      {callLogsLoading ? (
                        <p className="text-sm text-white/40 py-4 text-center">
                          Loading call log...
                        </p>
                      ) : callLogs.length === 0 ? (
                        <p className="text-sm text-white/40 py-4 text-center">
                          No calls recorded yet
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {callLogs.map((call) => (
                            <div
                              key={call.id}
                              className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/10"
                            >
                              <div className="flex items-center gap-3">
                                <div className="text-sm text-white/70">
                                  {call.from}
                                </div>
                                <div className="text-xs text-white/30">
                                  {new Date(call.createdAt).toLocaleString()}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {call.duration != null && (
                                  <span className="text-xs text-white/40">
                                    {call.duration}s
                                  </span>
                                )}
                                {call.isSpam ? (
                                  <Badge variant="destructive" className="text-xs">
                                    <ShieldOff className="w-3 h-3 mr-1" />
                                    Spam
                                  </Badge>
                                ) : (
                                  <Badge variant="success" className="text-xs">
                                    <PhoneIncoming className="w-3 h-3 mr-1" />
                                    {call.status}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── eSIM Upgrade card ── */}
      <div className="relative rounded-2xl p-px overflow-hidden">
        {/* orange gradient border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 opacity-60" />
        <div className="relative rounded-2xl bg-zinc-900 p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-bold text-white">
                  Upgrade to eSIM Numbers
                </h3>
                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                  Premium
                </Badge>
              </div>
              <p className="text-sm text-white/60 mb-4 leading-relaxed">
                Standard VoIP numbers are rejected by banks, Uber, and
                financial apps. eSIM numbers are carrier-grade and work
                everywhere your real SIM does.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { icon: CreditCard, text: "Works with banking apps" },
                  { icon: Check, text: "SMS verification for any service" },
                  { icon: Wifi, text: "Cannot be detected as VoIP" },
                  { icon: Lock, text: "Locked to your device" },
                ].map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-2 text-sm text-white/70"
                  >
                    <Icon className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
            <div className="shrink-0 sm:pt-1">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white border-0">
                Upgrade to eSIM
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Plan info ── */}
      <div className="bg-violet-600/10 border border-violet-500/20 rounded-xl p-4 flex items-center justify-between">
        <div className="text-sm text-white/60">
          <span className="font-semibold text-white">{phones.length}/3</span>{" "}
          virtual numbers on Pro plan
        </div>
        <Button variant="outline" size="sm">
          Upgrade for more
        </Button>
      </div>

      {/* ── Add Number Modal ── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) =>
              e.target === e.currentTarget && setShowAddModal(false)
            }
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Add Virtual Number</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* VoIP vs eSIM type selector */}
              <div className="mb-5">
                <Label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
                  Number Type
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setNewNumberType("voip")}
                    className={`rounded-xl p-3 border text-left transition-all ${
                      newNumberType === "voip"
                        ? "border-violet-500/60 bg-violet-500/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <Wifi className="w-4 h-4 text-violet-400 mb-1" />
                    <div className="font-semibold text-sm text-white">VoIP</div>
                    <div className="text-xs text-white/40 mt-0.5">
                      Free — internet-based
                    </div>
                    <div className="text-xs text-white/30 mt-1">
                      May not work with banks
                    </div>
                  </button>
                  <button
                    onClick={() => setNewNumberType("esim")}
                    className={`rounded-xl p-3 border text-left transition-all ${
                      newNumberType === "esim"
                        ? "border-orange-500/60 bg-orange-500/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <Zap className="w-4 h-4 text-orange-400 mb-1" />
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm text-white">
                        eSIM
                      </span>
                      <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs py-0">
                        Premium
                      </Badge>
                    </div>
                    <div className="text-xs text-white/40 mt-0.5">
                      Carrier-grade number
                    </div>
                    <div className="text-xs text-orange-300/70 mt-1">
                      Works everywhere
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Label</Label>
                  <Input
                    className="mt-1.5"
                    placeholder="e.g. Online Shopping, Medical..."
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Preferred Area Code (optional)</Label>
                  <Input
                    className="mt-1.5"
                    placeholder="e.g. 415, 212, 312"
                    maxLength={3}
                    value={newAreaCode}
                    onChange={(e) =>
                      setNewAreaCode(e.target.value.replace(/\D/g, ""))
                    }
                  />
                </div>
                <div>
                  <Label>Forward calls to (your real number)</Label>
                  <Input
                    className="mt-1.5"
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                    value={newForward}
                    onChange={(e) => setNewForward(e.target.value)}
                  />
                </div>

                <div className="bg-white/5 rounded-xl p-3 text-xs text-white/40">
                  {newNumberType === "voip"
                    ? "VoIP numbers are free and work for most services. Calls are screened by Call Guard before reaching you."
                    : "eSIM numbers are carrier-grade and indistinguishable from real SIM numbers. Works with Uber, banks, and financial apps."}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddModal(false)}
                  disabled={addingNumber}
                >
                  Cancel
                </Button>
                <Button
                  className={`flex-1 ${
                    newNumberType === "esim"
                      ? "bg-orange-500 hover:bg-orange-600 border-0"
                      : ""
                  }`}
                  onClick={addNumber}
                  disabled={addingNumber}
                >
                  {addingNumber ? (
                    "Requesting number..."
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-1.5" />
                      {newNumberType === "esim"
                        ? "Add eSIM Number"
                        : "Add VoIP Number"}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
