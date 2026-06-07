"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Plus,
  Shield,
  ShieldOff,
  PhoneOff,
  PhoneIncoming,
  Settings,
  Copy,
  Check,
  X,
  AlertOctagon,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface VirtualNumber {
  id: string;
  number: string;
  label: string;
  active: boolean;
  forwarding: string;
  callsReceived: number;
  spamBlocked: number;
  created: string;
}

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
  },
];

const CALL_LOG = [
  { id: "1", number: "+1 (555) 234-5678", from: "Unknown", time: "Today 2:34 PM", duration: "0s", blocked: true },
  { id: "2", number: "+1 (555) 234-5678", from: "Amazon", time: "Today 11:20 AM", duration: "2m 14s", blocked: false },
  { id: "3", number: "+1 (555) 876-5432", from: "Unknown", time: "Yesterday 4:45 PM", duration: "0s", blocked: true },
  { id: "4", number: "+1 (555) 234-5678", from: "CVS Pharmacy", time: "Jan 14 3:12 PM", duration: "1m 05s", blocked: false },
  { id: "5", number: "+1 (555) 876-5432", from: "Robocall", time: "Jan 13 9:00 AM", duration: "0s", blocked: true },
];

export default function PhonePage() {
  const [numbers, setNumbers] = useState(MOCK_NUMBERS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newAreaCode, setNewAreaCode] = useState("");
  const [newForward, setNewForward] = useState("");

  const copyNumber = (id: string, number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleNumber = (id: string) => {
    setNumbers((prev) =>
      prev.map((n) => (n.id === id ? { ...n, active: !n.active } : n))
    );
  };

  const addNumber = () => {
    const newNum: VirtualNumber = {
      id: String(numbers.length + 1),
      number: `+1 (${newAreaCode || "555"}) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      label: newLabel || "New Number",
      active: true,
      forwarding: newForward || "",
      callsReceived: 0,
      spamBlocked: 0,
      created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    setNumbers((prev) => [...prev, newNum]);
    setShowAddModal(false);
    setNewLabel("");
    setNewAreaCode("");
    setNewForward("");
  };

  const totalSpamBlocked = numbers.reduce((sum, n) => sum + n.spamBlocked, 0);
  const totalCallsReceived = numbers.reduce((sum, n) => sum + n.callsReceived, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Virtual Numbers", value: numbers.length, icon: Phone, color: "text-violet-400" },
          { label: "Active Numbers", value: numbers.filter((n) => n.active).length, icon: Shield, color: "text-green-400" },
          { label: "Calls Received", value: totalCallsReceived, icon: PhoneIncoming, color: "text-blue-400" },
          { label: "Spam Blocked", value: totalSpamBlocked, icon: AlertOctagon, color: "text-red-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card rounded-2xl p-5 border border-white/10">
            <Icon className={`w-5 h-5 ${color} mb-3`} />
            <div className="text-2xl font-black mb-1">{value}</div>
            <div className="text-xs text-white/40">{label}</div>
          </div>
        ))}
      </div>

      {/* Numbers List */}
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
            <h3 className="text-lg font-semibold mb-2">No virtual numbers yet</h3>
            <p className="text-white/40 text-sm mb-6">Add your first virtual number to start protecting your real number.</p>
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
                {/* Number info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      num.active ? "bg-violet-600/20" : "bg-white/5"
                    }`}>
                      <Phone className={`w-5 h-5 ${num.active ? "text-violet-400" : "text-white/30"}`} />
                    </div>
                    <div>
                      <div className="font-mono font-bold text-lg">{num.number}</div>
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

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => copyNumber(num.id, num.number)}
                    className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Copy number"
                  >
                    {copiedId === num.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
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

      {/* Plan info */}
      <div className="bg-violet-600/10 border border-violet-500/20 rounded-xl p-4 flex items-center justify-between">
        <div className="text-sm text-white/60">
          <span className="font-semibold text-white">{numbers.length}/3</span> virtual numbers on Pro plan
        </div>
        <Button variant="outline" size="sm">Upgrade for more</Button>
      </div>

      {/* Call Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Call Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {["Number", "From", "Time", "Duration", "Status"].map((h) => (
                    <th key={h} className="text-left py-3 px-3 text-white/40 text-xs font-medium uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CALL_LOG.map((call) => (
                  <tr key={call.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                    <td className="py-3 px-3 text-white/60 font-mono text-xs">{call.number}</td>
                    <td className="py-3 px-3 text-white/70">{call.from}</td>
                    <td className="py-3 px-3 text-white/40">{call.time}</td>
                    <td className="py-3 px-3 text-white/40">{call.duration}</td>
                    <td className="py-3 px-3">
                      {call.blocked ? (
                        <Badge variant="destructive" className="text-xs">
                          <ShieldOff className="w-3 h-3 mr-1" />Blocked
                        </Badge>
                      ) : (
                        <Badge variant="success" className="text-xs">
                          <PhoneIncoming className="w-3 h-3 mr-1" />Connected
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Number Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Add Virtual Number</h3>
                <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
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
                    onChange={(e) => setNewAreaCode(e.target.value.replace(/\D/g, ""))}
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
                  Calls to your virtual number will be screened for spam, then forwarded to your real number. Your real number stays private.
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={addNumber}>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Number
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
