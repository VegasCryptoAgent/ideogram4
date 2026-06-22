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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VirtualNumber {
  id: string;
  number: string;
  label: string;
  active: boolean;
  forwarding: string;
  callsReceived: number;
  spamBlocked: number;
  created: string;
  type: "voip" | "esim";
}

interface CallLogEntry {
  id: string;
  number: string;
  from: string;
  time: string;
  duration: string;
  status: "blocked" | "connected" | "screened";
  aiNote?: string;
}

type InterceptionStep = "ringing" | "analyzing" | "result";

interface CallGuardSettings {
  blockUnknown: boolean;
  screenRobocalls: boolean;
  requireCallerId: boolean;
  voicemailTranscription: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_NUMBERS: VirtualNumber[] = [
  {
    id: "1",
    number: "+1 (555) 234-5678",
    label: "Online Shopping",
    active: true,
    forwarding: "+1 (555) 999-0001",
    callsReceived: 24,
    spamBlocked: 18,
    created: "Dec 15, 2024",
    type: "voip",
  },
  {
    id: "2",
    number: "+1 (555) 876-5432",
    label: "Work Signups",
    active: true,
    forwarding: "+1 (555) 999-0001",
    callsReceived: 8,
    spamBlocked: 3,
    created: "Jan 2, 2025",
    type: "esim",
  },
  {
    id: "3",
    number: "+1 (555) 111-9876",
    label: "Medical",
    active: false,
    forwarding: "+1 (555) 999-0001",
    callsReceived: 2,
    spamBlocked: 0,
    created: "Jan 10, 2025",
    type: "voip",
  },
];

const CALL_LOG: CallLogEntry[] = [
  {
    id: "1",
    number: "+1 (555) 234-5678",
    from: "+1 (702) 555-0182",
    time: "Today 2:34 PM",
    duration: "0s",
    status: "blocked",
    aiNote: "Robocall pattern",
  },
  {
    id: "2",
    number: "+1 (555) 234-5678",
    from: "Amazon",
    time: "Today 11:20 AM",
    duration: "2m 14s",
    status: "connected",
  },
  {
    id: "3",
    number: "+1 (555) 876-5432",
    from: "Unknown",
    time: "Yesterday 4:45 PM",
    duration: "0s",
    status: "screened",
    aiNote: "No caller ID",
  },
  {
    id: "4",
    number: "+1 (555) 234-5678",
    from: "CVS Pharmacy",
    time: "Jan 14 3:12 PM",
    duration: "1m 05s",
    status: "connected",
  },
  {
    id: "5",
    number: "+1 (555) 876-5432",
    from: "Telemarketer",
    time: "Jan 13 9:00 AM",
    duration: "0s",
    status: "blocked",
    aiNote: "Known spam number",
  },
  {
    id: "6",
    number: "+1 (555) 111-9876",
    from: "+1 (800) 555-9999",
    time: "Jan 12 1:11 PM",
    duration: "0s",
    status: "blocked",
    aiNote: "Robocall pattern",
  },
];

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
  const [numbers, setNumbers] = useState<VirtualNumber[]>(MOCK_NUMBERS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newAreaCode, setNewAreaCode] = useState("");
  const [newForward, setNewForward] = useState("");
  const [newNumberType, setNewNumberType] = useState<"voip" | "esim">("voip");

  const [interceptionStepIdx, setInterceptionStepIdx] = useState(0);
  const [callGuardSettings, setCallGuardSettings] =
    useState<CallGuardSettings>({
      blockUnknown: true,
      screenRobocalls: true,
      requireCallerId: false,
      voicemailTranscription: true,
    });

  // Cycle the interception animation every 6 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setInterceptionStepIdx((prev) => (prev + 1) % INTERCEPTION_STEPS.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const copyNumber = useCallback((id: string, number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const toggleNumber = useCallback((id: string) => {
    setNumbers((prev) =>
      prev.map((n) => (n.id === id ? { ...n, active: !n.active } : n))
    );
  }, []);

  const addNumber = useCallback(() => {
    const newNum: VirtualNumber = {
      id: String(numbers.length + 1),
      number: `+1 (${newAreaCode || "555"}) ${Math.floor(
        100 + Math.random() * 900
      )}-${Math.floor(1000 + Math.random() * 9000)}`,
      label: newLabel || "New Number",
      active: true,
      forwarding: newForward || "",
      callsReceived: 0,
      spamBlocked: 0,
      created: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      type: newNumberType,
    };
    setNumbers((prev) => [...prev, newNum]);
    setShowAddModal(false);
    setNewLabel("");
    setNewAreaCode("");
    setNewForward("");
    setNewNumberType("voip");
  }, [numbers.length, newAreaCode, newLabel, newForward, newNumberType]);

  const totalSpamBlocked = numbers.reduce((sum, n) => sum + n.spamBlocked, 0);
  const totalCallsReceived = numbers.reduce(
    (sum, n) => sum + n.callsReceived,
    0
  );

  const currentStep = INTERCEPTION_STEPS[interceptionStepIdx];

  return (
    <div className="space-y-6">
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Virtual Numbers",
            value: numbers.length,
            icon: Phone,
            color: "text-violet-400",
          },
          {
            label: "Active Numbers",
            value: numbers.filter((n) => n.active).length,
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
              {
                value: "247",
                label: "Calls screened this month",
                icon: Eye,
              },
              { value: "94%", label: "Spam blocked", icon: Shield },
              {
                value: "0",
                label: "Robocalls reached you",
                icon: PhoneMissed,
              },
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

      {numbers.length === 0 ? (
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
          {numbers.map((num) => (
            <motion.div
              key={num.id}
              layout
              className={`glass-card rounded-2xl p-5 border transition-all ${
                num.active ? "border-white/10" : "border-white/5 opacity-60"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        num.active ? "bg-violet-600/20" : "bg-white/5"
                      }`}
                    >
                      <Phone
                        className={`w-5 h-5 ${
                          num.active ? "text-violet-400" : "text-white/30"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-mono font-bold text-lg">
                          {num.number}
                        </div>
                        {num.type === "esim" ? (
                          <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                            eSIM
                          </Badge>
                        ) : (
                          <Badge className="bg-white/10 text-white/50 border-white/10 text-xs">
                            VoIP
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-white/40">{num.label}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-white/40 ml-13">
                    <span className="flex items-center gap-1">
                      <ArrowRight className="w-3 h-3" />
                      Forwarding to {num.forwarding || "not set"}
                    </span>
                    <span className="flex items-center gap-1">
                      <PhoneIncoming className="w-3 h-3" />
                      {num.callsReceived} calls
                    </span>
                    <span className="flex items-center gap-1 text-red-400/60">
                      <AlertOctagon className="w-3 h-3" />
                      {num.spamBlocked} blocked
                    </span>
                    <span>Created {num.created}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => copyNumber(num.id, num.number)}
                    className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Copy number"
                  >
                    {copiedId === num.id ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <Button variant="ghost" size="icon-sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Switch
                    checked={num.active}
                    onCheckedChange={() => toggleNumber(num.id)}
                  />
                </div>
              </div>
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
          <span className="font-semibold text-white">{numbers.length}/3</span>{" "}
          virtual numbers on Pro plan
        </div>
        <Button variant="outline" size="sm">
          Upgrade for more
        </Button>
      </div>

      {/* ── Call Log ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Call Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {["Number", "From", "Time", "Duration", "Status", "AI Note"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left py-3 px-3 text-white/40 text-xs font-medium uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {CALL_LOG.map((call) => (
                  <tr
                    key={call.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors"
                  >
                    <td className="py-3 px-3 text-white/60 font-mono text-xs">
                      {call.number}
                    </td>
                    <td className="py-3 px-3 text-white/70">{call.from}</td>
                    <td className="py-3 px-3 text-white/40">{call.time}</td>
                    <td className="py-3 px-3 text-white/40">{call.duration}</td>
                    <td className="py-3 px-3">
                      {call.status === "blocked" && (
                        <Badge variant="destructive" className="text-xs">
                          <ShieldOff className="w-3 h-3 mr-1" />
                          Blocked
                        </Badge>
                      )}
                      {call.status === "connected" && (
                        <Badge variant="success" className="text-xs">
                          <PhoneIncoming className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      )}
                      {call.status === "screened" && (
                        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                          <Bot className="w-3 h-3 mr-1" />
                          Screened
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {call.aiNote ? (
                        <span className="text-xs text-white/40 flex items-center gap-1">
                          <Bot className="w-3 h-3 text-violet-400 shrink-0" />
                          {call.aiNote}
                        </span>
                      ) : (
                        <span className="text-xs text-white/20">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  {newNumberType === "esim"
                    ? "Add eSIM Number"
                    : "Add VoIP Number"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
