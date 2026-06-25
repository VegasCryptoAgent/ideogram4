"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeyRound,
  Plus,
  Search,
  Eye,
  EyeOff,
  Copy,
  Check,
  Trash2,
  Shield,
  Lock,
  AlertTriangle,
  RefreshCw,
  Key,
  Users,
  Star,
  Clock,
  ExternalLink,
  ChevronDown,
  X,
  Zap,
  Fingerprint,
  UserPlus,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PasswordEntry {
  id: string;
  site: string;
  url: string;
  username: string;
  password: string;
  strength: "strong" | "medium" | "weak";
  hasTotp: boolean;
  totpSecret?: string;
  lastUpdated: string;
  tags: string[];
  sharedVault?: string;
  notes?: string;
  breached?: boolean;
}

interface SharedVault {
  id: string;
  name: string;
  members: { name: string; color: string; initials: string }[];
  itemCount: number;
  createdAt: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PASSWORDS: PasswordEntry[] = [
  {
    id: "1",
    site: "Google",
    url: "google.com",
    username: "jreeves@gmail.com",
    password: "Xk9#mP2qLr",
    strength: "strong",
    hasTotp: true,
    lastUpdated: "2 days ago",
    tags: ["personal", "email"],
    notes: "Primary Google account. Recovery email set to backup@gmail.com.",
  },
  {
    id: "2",
    site: "Amazon",
    url: "amazon.com",
    username: "jreeves@gmail.com",
    password: "Tr4&nB8wQz",
    strength: "strong",
    hasTotp: false,
    lastUpdated: "1 week ago",
    tags: ["shopping"],
    notes: "Prime membership active. Default card ending in 4821.",
  },
  {
    id: "3",
    site: "Netflix",
    url: "netflix.com",
    username: "jreeves@gmail.com",
    password: "movie2024",
    strength: "weak",
    hasTotp: false,
    lastUpdated: "3 months ago",
    tags: ["streaming"],
    breached: true,
    notes: "Shared with family. Password needs urgent update.",
  },
  {
    id: "4",
    site: "Chase Bank",
    url: "chase.com",
    username: "jreeves@gmail.com",
    password: "Vy7!kLp3Wm",
    strength: "strong",
    hasTotp: true,
    lastUpdated: "5 days ago",
    tags: ["banking", "finance"],
    notes: "Online banking. Remember to update every 90 days.",
  },
  {
    id: "5",
    site: "GitHub",
    url: "github.com",
    username: "jreeves",
    password: "Dev#2024!",
    strength: "medium",
    hasTotp: true,
    lastUpdated: "2 weeks ago",
    tags: ["work", "dev"],
    sharedVault: "Work Vault",
    notes: "Personal access tokens stored separately in vault.",
  },
  {
    id: "6",
    site: "Twitter/X",
    url: "x.com",
    username: "@jreeves",
    password: "twitter123",
    strength: "weak",
    hasTotp: false,
    lastUpdated: "4 months ago",
    tags: ["social"],
    breached: true,
    notes: "Linked to phone number for recovery.",
  },
  {
    id: "7",
    site: "LinkedIn",
    url: "linkedin.com",
    username: "jreeves@gmail.com",
    password: "Lk8@pWr2Yz",
    strength: "strong",
    hasTotp: false,
    lastUpdated: "1 month ago",
    tags: ["professional"],
  },
  {
    id: "8",
    site: "Dropbox",
    url: "dropbox.com",
    username: "jreeves@gmail.com",
    password: "Drop#Secure1!",
    strength: "strong",
    hasTotp: false,
    lastUpdated: "3 weeks ago",
    tags: ["storage", "work"],
    sharedVault: "Work Vault",
    notes: "Business plan. 2TB storage.",
  },
];

const MOCK_VAULTS: SharedVault[] = [
  {
    id: "1",
    name: "Family Vault",
    members: [
      { name: "Jane Reeves", color: "bg-purple-500", initials: "JR" },
      { name: "Mark Reeves", color: "bg-blue-500", initials: "MR" },
      { name: "Mom", color: "bg-pink-500", initials: "MO" },
    ],
    itemCount: 12,
    createdAt: "Jan 2026",
  },
  {
    id: "2",
    name: "Work Vault",
    members: [{ name: "Team", color: "bg-green-500", initials: "TM" }],
    itemCount: 5,
    createdAt: "Mar 2026",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SITE_COLORS: Record<string, string> = {
  Google: "bg-red-500",
  Amazon: "bg-orange-500",
  Netflix: "bg-red-700",
  "Chase Bank": "bg-blue-800",
  GitHub: "bg-zinc-600",
  "Twitter/X": "bg-sky-500",
  LinkedIn: "bg-blue-600",
  Dropbox: "bg-blue-500",
};

function getSiteColor(site: string): string {
  return SITE_COLORS[site] ?? "bg-violet-600";
}

function getPasswordStrength(pwd: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 2) return { score, label: "Fair", color: "bg-orange-500" };
  if (score <= 3) return { score, label: "Good", color: "bg-yellow-500" };
  return { score, label: "Strong", color: "bg-green-500" };
}

function generateRandomCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ─── Strength Badge ───────────────────────────────────────────────────────────

function StrengthBadge({ strength }: { strength: PasswordEntry["strength"] }) {
  if (strength === "strong")
    return (
      <span className="inline-flex items-center text-xs font-medium text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-2 py-0.5">
        Strong
      </span>
    );
  if (strength === "medium")
    return (
      <span className="inline-flex items-center text-xs font-medium text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-2 py-0.5">
        Medium
      </span>
    );
  return (
    <span className="inline-flex items-center text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5">
      Weak
    </span>
  );
}

// ─── TOTP Cell ────────────────────────────────────────────────────────────────

function TotpCell({ entryId }: { entryId: string }) {
  const [code, setCode] = useState(() => generateRandomCode());
  const [seconds, setSeconds] = useState(() => 30 - (Math.floor(Date.now() / 1000) % 30));

  useEffect(() => {
    const interval = setInterval(() => {
      const secs = 30 - (Math.floor(Date.now() / 1000) % 30);
      setSeconds(secs);
      if (secs === 30) {
        setCode(generateRandomCode());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const radius = 8;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - seconds / 30);
  const isLow = seconds <= 10;
  const formatted = code.slice(0, 3) + " " + code.slice(3);

  return (
    <div className="flex items-center gap-1.5">
      <span className={`font-mono text-sm font-bold tracking-widest ${isLow ? "text-orange-400" : "text-green-400"}`}>
        {formatted}
      </span>
      <svg width="20" height="20" className="rotate-[-90deg] flex-shrink-0">
        <circle cx="10" cy="10" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
        <circle
          cx="10"
          cy="10"
          r={radius}
          fill="none"
          stroke={isLow ? "#f97316" : "#22c55e"}
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <span className="text-[10px] text-zinc-500">{seconds}s</span>
    </div>
  );
}

// ─── Password Health Score ────────────────────────────────────────────────────

function PasswordHealthScore({ weakPasswords }: { weakPasswords: PasswordEntry[] }) {
  const score = 78;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - score / 100);

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-white">Password Health Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Circular ring */}
          <div className="flex-shrink-0 flex flex-col items-center gap-1">
            <svg width="140" height="140">
              <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="#F97316"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
              />
              <text x="70" y="62" textAnchor="middle" fill="white" fontSize="30" fontWeight="bold" fontFamily="inherit">
                {score}
              </text>
              <text x="70" y="82" textAnchor="middle" fill="#a1a1aa" fontSize="13" fontFamily="inherit">
                /100
              </text>
            </svg>
            <span className="text-sm font-semibold text-orange-400">Good</span>
          </div>

          {/* Issues */}
          <div className="flex-1 space-y-3 w-full">
            <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-sm text-white">3 weak passwords</span>
              </div>
              <button className="text-xs text-red-400 hover:text-red-300 font-medium underline underline-offset-2 transition-colors">
                Update
              </button>
            </div>
            <div className="flex items-center justify-between bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <span className="text-sm text-white">2 reused passwords</span>
              </div>
              <button className="text-xs text-orange-400 hover:text-orange-300 font-medium underline underline-offset-2 transition-colors">
                Fix
              </button>
            </div>
            <p className="text-xs text-zinc-500 px-1">
              3 weak · 2 reused — fix these to reach{" "}
              <span className="text-green-400 font-medium">95+</span>
            </p>
          </div>
        </div>

        {/* Weak passwords list */}
        <div>
          <div className="text-sm font-medium text-zinc-300 mb-2">Weak Passwords to Update</div>
          <div className="space-y-2">
            {weakPasswords.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full ${getSiteColor(p.site)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                  >
                    {p.site[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{p.site}</div>
                    <div className="text-xs text-zinc-500">{p.url}</div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 hover:text-orange-300"
                >
                  Update
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Create Vault Dialog ──────────────────────────────────────────────────────

function CreateVaultDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Create New Vault</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <Label className="text-xs text-zinc-400 mb-1.5 block">Vault Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Family Vault"
              className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600"
            />
          </div>
          <div>
            <Label className="text-xs text-zinc-400 mb-1.5 block">Invite by Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@example.com"
              className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600"
            />
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-5">
          <Button
            variant="outline"
            className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 text-white"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-semibold"
            onClick={onClose}
          >
            <Users className="w-4 h-4 mr-1.5" />
            Create Vault
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Yubikey Dialog ───────────────────────────────────────────────────────────

function YubikeyDialog({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Pulsing animation */}
        <div className="relative flex items-center justify-center w-24 h-24 mx-auto mb-6">
          <motion.div
            className="absolute w-24 h-24 rounded-full bg-orange-500/20"
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute w-16 h-16 rounded-full bg-orange-500/30"
            animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0.1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          />
          <div className="w-12 h-12 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
            <Key className="w-6 h-6 text-orange-400" />
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-2">Insert Your YubiKey</h3>
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          Insert your YubiKey into a USB port and press the button when prompted. Your key will be registered to this account.
        </p>
        <Button
          variant="outline"
          className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white"
          onClick={onClose}
        >
          Cancel
        </Button>
      </motion.div>
    </motion.div>
  );
}

// ─── Add Password Modal ───────────────────────────────────────────────────────

function AddPasswordModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (entry: PasswordEntry) => void;
}) {
  const [newSite, setNewSite] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newTags, setNewTags] = useState("");
  const [enable2FA, setEnable2FA] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [genLength, setGenLength] = useState(16);
  const [genUppercase, setGenUppercase] = useState(true);
  const [genLowercase, setGenLowercase] = useState(true);
  const [genNumbers, setGenNumbers] = useState(true);
  const [genSymbols, setGenSymbols] = useState(false);
  const [generatedCopied, setGeneratedCopied] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");

  const pwStrength = getPasswordStrength(newPassword);

  const buildAndGenerate = useCallback(() => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const nums = "0123456789";
    const syms = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
    let charset = "";
    if (genUppercase) charset += upper;
    if (genLowercase) charset += lower;
    if (genNumbers) charset += nums;
    if (genSymbols) charset += syms;
    if (!charset) charset = lower + nums;
    let result = "";
    for (let i = 0; i < genLength; i++) {
      result += charset[Math.floor(Math.random() * charset.length)];
    }
    setGeneratedPassword(result);
  }, [genUppercase, genLowercase, genNumbers, genSymbols, genLength]);

  function useThisPassword() {
    setNewPassword(generatedPassword);
    setShowGenerator(false);
  }

  function handleCopyGenerated() {
    navigator.clipboard.writeText(generatedPassword).catch(() => {});
    setGeneratedCopied(true);
    setTimeout(() => setGeneratedCopied(false), 1500);
  }

  function handleSave() {
    if (!newSite.trim() || !newUsername.trim()) return;
    const strengthMap: Record<string, PasswordEntry["strength"]> = {
      Weak: "weak",
      Fair: "weak",
      Good: "medium",
      Strong: "strong",
    };
    const entry: PasswordEntry = {
      id: String(Date.now()),
      site: newSite.trim(),
      url: newUrl.trim() || newSite.toLowerCase().replace(/\s+/g, "") + ".com",
      username: newUsername.trim(),
      password: newPassword,
      strength: strengthMap[pwStrength.label] ?? "weak",
      hasTotp: enable2FA,
      lastUpdated: "Just now",
      tags: newTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      notes: newNotes.trim() || undefined,
    };
    onSave(entry);
    onClose();
  }

  function toggleOption(val: boolean, setter: (v: boolean) => void, others: boolean[]) {
    if (val && others.every((o) => !o)) return;
    setter(!val);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Add New Password</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[78vh] overflow-y-auto">
          {/* Site Name */}
          <div>
            <Label className="text-xs text-zinc-400 mb-1.5 block">Site / App Name</Label>
            <Input
              value={newSite}
              onChange={(e) => setNewSite(e.target.value)}
              placeholder="e.g. Google"
              className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600"
            />
          </div>

          {/* URL */}
          <div>
            <Label className="text-xs text-zinc-400 mb-1.5 block">URL</Label>
            <Input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="e.g. google.com"
              className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600"
            />
          </div>

          {/* Username */}
          <div>
            <Label className="text-xs text-zinc-400 mb-1.5 block">Username / Email</Label>
            <Input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="you@example.com"
              className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600"
            />
          </div>

          {/* Password */}
          <div>
            <Label className="text-xs text-zinc-400 mb-1.5 block">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter or generate a password"
                className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength meter */}
            {newPassword.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        i < pwStrength.score ? pwStrength.color : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
                <div
                  className={`text-xs font-medium ${
                    pwStrength.label === "Strong"
                      ? "text-green-400"
                      : pwStrength.label === "Good"
                      ? "text-yellow-400"
                      : pwStrength.label === "Fair"
                      ? "text-orange-400"
                      : "text-red-400"
                  }`}
                >
                  {pwStrength.label}
                </div>
              </div>
            )}
          </div>

          {/* Generator toggle */}
          <div>
            <button
              onClick={() => {
                setShowGenerator((v) => !v);
                if (!showGenerator) buildAndGenerate();
              }}
              className="flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {showGenerator ? "Hide" : "Generate"} Password
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform ${showGenerator ? "rotate-90" : ""}`}
              />
            </button>
          </div>

          {/* Generator panel */}
          <AnimatePresence>
            {showGenerator && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
                  {/* Generated password display */}
                  <div className="bg-zinc-800 rounded-lg px-4 py-3 font-mono text-sm text-white text-center break-all min-h-[44px] flex items-center justify-center">
                    {generatedPassword || <span className="text-zinc-500">Click Generate</span>}
                  </div>

                  {/* Length slider */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-xs text-zinc-400">Length</Label>
                      <span className="text-xs font-mono text-white bg-white/10 rounded px-2 py-0.5">
                        {genLength}
                      </span>
                    </div>
                    <Slider
                      min={8}
                      max={32}
                      step={1}
                      value={[genLength]}
                      onValueChange={(v) => setGenLength(v[0])}
                    />
                  </div>

                  {/* Character options */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Uppercase (A-Z)", val: genUppercase, set: setGenUppercase, others: [genLowercase, genNumbers, genSymbols] },
                      { label: "Lowercase (a-z)", val: genLowercase, set: setGenLowercase, others: [genUppercase, genNumbers, genSymbols] },
                      { label: "Numbers (0-9)", val: genNumbers, set: setGenNumbers, others: [genUppercase, genLowercase, genSymbols] },
                      { label: "Symbols (!@#)", val: genSymbols, set: setGenSymbols, others: [genUppercase, genLowercase, genNumbers] },
                    ].map(({ label, val, set, others }) => (
                      <button
                        key={label}
                        onClick={() => toggleOption(val, set, others)}
                        className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 border transition-all text-left ${
                          val
                            ? "bg-violet-600/20 border-violet-500/40 text-violet-300"
                            : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
                            val ? "bg-violet-600 border-violet-500" : "border-white/20"
                          }`}
                        >
                          {val && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={buildAndGenerate}
                      className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                      Regenerate
                    </Button>
                    <Button
                      size="sm"
                      onClick={useThisPassword}
                      disabled={!generatedPassword}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
                    >
                      <Check className="w-3.5 h-3.5 mr-1.5" />
                      Use This Password
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyGenerated}
                      disabled={!generatedPassword}
                      className="border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs px-3"
                    >
                      {generatedCopied ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notes */}
          <div>
            <Label className="text-xs text-zinc-400 mb-1.5 block">Notes (optional)</Label>
            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Recovery codes, security questions..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          {/* Tags */}
          <div>
            <Label className="text-xs text-zinc-400 mb-1.5 block">Tags (comma-separated)</Label>
            <Input
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="work, finance, personal"
              className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600"
            />
          </div>

          {/* Enable 2FA */}
          <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/10">
            <div>
              <div className="text-sm font-medium text-white">Enable 2FA</div>
              <div className="text-xs text-zinc-500 mt-0.5">Store a TOTP authenticator code</div>
            </div>
            <Switch checked={enable2FA} onCheckedChange={setEnable2FA} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-5 pt-4 border-t border-white/10">
          <Button
            variant="outline"
            className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 text-white"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            onClick={handleSave}
          >
            <KeyRound className="w-4 h-4 mr-1.5" />
            Save Password
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Password Row ─────────────────────────────────────────────────────────────

function PasswordRow({
  entry,
  index,
  copiedId,
  onCopy,
  onDelete,
}: {
  entry: PasswordEntry;
  index: number;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Site */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full ${getSiteColor(entry.site)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
            >
              {entry.site[0]}
            </div>
            <div>
              <div className="font-medium text-white text-sm flex items-center gap-2">
                {entry.site}
                {entry.breached && (
                  <span className="inline-flex items-center text-[10px] font-bold text-red-400 bg-red-500/15 border border-red-500/30 rounded-full px-1.5 py-0.5">
                    BREACHED
                  </span>
                )}
              </div>
              <div className="text-xs text-zinc-600">{entry.url}</div>
            </div>
          </div>
        </td>

        {/* Username */}
        <td className="px-4 py-3 hidden sm:table-cell">
          <span className="text-zinc-400 font-mono text-xs">{entry.username}</span>
        </td>

        {/* Password */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <span className="font-mono text-sm text-white">
              {revealed ? entry.password : "••••••••••"}
            </span>
            <button
              onClick={() => setRevealed((v) => !v)}
              className="text-zinc-500 hover:text-white transition-colors flex-shrink-0"
            >
              {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </td>

        {/* Strength */}
        <td className="px-4 py-3 hidden md:table-cell">
          <StrengthBadge strength={entry.strength} />
        </td>

        {/* TOTP */}
        <td className="px-4 py-3 hidden lg:table-cell">
          {entry.hasTotp ? (
            <TotpCell entryId={entry.id} />
          ) : (
            <span className="text-zinc-600 text-xs">—</span>
          )}
        </td>

        {/* Updated */}
        <td className="px-4 py-3 hidden xl:table-cell">
          <span className="text-zinc-500 text-xs">{entry.lastUpdated}</span>
        </td>

        {/* Actions */}
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              title="Copy username"
              onClick={() => onCopy(entry.username, `user-${entry.id}`)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
            >
              {copiedId === `user-${entry.id}` ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Users className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              title="Copy password"
              onClick={() => onCopy(entry.password, `pw-${entry.id}`)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
            >
              {copiedId === `pw-${entry.id}` ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
            <a
              href={`https://${entry.url}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Open site"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              title="Delete"
              onClick={() => onDelete(entry.id)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <ChevronDown
              className={`w-4 h-4 text-zinc-600 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </div>
        </td>
      </motion.tr>

      {/* Expanded row */}
      <AnimatePresence>
        {expanded && (
          <tr>
            <td colSpan={7} className="px-4 pb-4 pt-0">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3">
                  {entry.notes && (
                    <div>
                      <div className="text-xs font-medium text-zinc-500 mb-1">Notes</div>
                      <p className="text-sm text-zinc-300">{entry.notes}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <div className="text-xs font-medium text-zinc-500 mb-1">Tags</div>
                      <div className="flex flex-wrap gap-1.5">
                        {entry.tags.length > 0 ? (
                          entry.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-white/10 text-zinc-300 rounded-full px-2 py-0.5"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-zinc-600">No tags</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-zinc-500 mb-1">Last Updated</div>
                      <div className="text-sm text-zinc-300">{entry.lastUpdated}</div>
                    </div>
                    {entry.sharedVault && (
                      <div>
                        <div className="text-xs font-medium text-zinc-500 mb-1">Shared Vault</div>
                        <div className="text-sm text-violet-400">{entry.sharedVault}</div>
                      </div>
                    )}
                  </div>
                  <div className="pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs border-white/10 bg-white/5 hover:bg-white/10 text-white"
                    >
                      Edit Password
                    </Button>
                  </div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function mapApiEntry(e: {
  id: string; site: string; url?: string | null; username: string;
  password?: string; encryptedPassword?: string; strength: string; hasTotp: boolean;
  totpSecret?: string | null; tags: string[]; notes?: string | null;
  breached: boolean; sharedVaultId?: string | null; updatedAt: string;
}): PasswordEntry {
  return {
    id: e.id,
    site: e.site,
    url: e.url ?? e.site.toLowerCase().replace(/\s/g, '') + '.com',
    username: e.username,
    password: e.password ?? e.encryptedPassword ?? '',
    strength: (e.strength as PasswordEntry['strength']) ?? 'medium',
    hasTotp: e.hasTotp,
    lastUpdated: new Date(e.updatedAt).toLocaleDateString(),
    tags: e.tags ?? [],
    notes: e.notes ?? undefined,
    breached: e.breached,
    sharedVault: e.sharedVaultId ?? undefined,
  }
}

export default function PasswordsPage() {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [vaults] = useState<SharedVault[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateVault, setShowCreateVault] = useState(false);
  const [showYubikey, setShowYubikey] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [passwordsLoading, setPasswordsLoading] = useState(true);

  const fetchPasswords = useCallback(async () => {
    try {
      const res = await fetch('/api/passwords')
      if (!res.ok) return
      const json = await res.json()
      const raw: any[] = json.data?.items ?? json.data ?? []
      setPasswords(raw.map(mapApiEntry))
    } catch { /* leave empty */ } finally {
      setPasswordsLoading(false)
    }
  }, [])

  useEffect(() => { fetchPasswords() }, [fetchPasswords])

  const filteredPasswords = passwords.filter(
    (p) =>
      p.site.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const weakPasswords = passwords.filter((p) => p.strength === "weak");

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  async function handleDelete(id: string) {
    setPasswords((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/passwords/${id}`, { method: 'DELETE' }).catch(() => {})
  }

  async function handleAddPassword(entry: PasswordEntry) {
    setPasswords((prev) => [entry, ...prev]);
    await fetch('/api/passwords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site: entry.site,
        url: entry.url,
        username: entry.username,
        encryptedPassword: entry.password,
        strength: entry.strength,
        hasTotp: entry.hasTotp,
        tags: entry.tags,
        notes: entry.notes,
      }),
    }).catch(() => {})
  }

  const totalCount = passwords.length;
  const weakCount = passwords.filter((p) => p.strength === "weak").length;
  const reusedCount = 0;
  const totpCount = passwords.filter((p) => p.hasTotp).length;

  return (
    <div className="space-y-6">
      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Passwords", value: totalCount, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", icon: KeyRound },
          { label: "Weak Passwords", value: weakCount, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: AlertTriangle, clickable: true },
          { label: "Reused Passwords", value: reusedCount, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", icon: RefreshCw, clickable: true },
          { label: "2FA Codes Stored", value: totpCount, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", icon: Shield },
        ].map(({ label, value, color, bg, icon: Icon, clickable }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-5 border bg-white/5 border-white/10 ${clickable ? "cursor-pointer hover:bg-white/[0.08] transition-colors" : ""}`}
          >
            <Icon className={`w-5 h-5 ${color} mb-3`} />
            <div className={`text-2xl font-black mb-1 ${color}`}>{value}</div>
            <div className="text-xs text-white/40">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="vault">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="vault">All Passwords</TabsTrigger>
            <TabsTrigger value="shared">Shared Vaults</TabsTrigger>
            <TabsTrigger value="keys">Security Keys</TabsTrigger>
          </TabsList>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Password
          </Button>
        </div>

        {/* ── Tab 1: All Passwords ── */}
        <TabsContent value="vault" className="space-y-6">
          {/* Health Score */}
          <PasswordHealthScore weakPasswords={weakPasswords} />

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search passwords by site or username..."
              className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 pl-10"
            />
          </div>

          {/* Password Table */}
          <Card className="border-white/10 bg-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Site</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Username</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Password</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">Strength</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden lg:table-cell">2FA Code</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden xl:table-cell">Updated</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPasswords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                        No passwords match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredPasswords.map((entry, idx) => (
                      <PasswordRow
                        key={entry.id}
                        entry={entry}
                        index={idx}
                        copiedId={copiedId}
                        onCopy={handleCopy}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ── Tab 2: Shared Vaults ── */}
        <TabsContent value="shared" className="space-y-6">
          {/* Competitive callout */}
          <div className="bg-green-950/30 border border-green-700/30 rounded-xl p-4 flex gap-3">
            <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-300">
                Shield shared vaults beat Cloaked — they have no shared vault feature at all.
              </p>
              <p className="text-xs text-green-400/60 mt-0.5">
                Share passwords securely with family or teammates. Granular permissions, zero-knowledge encryption.
              </p>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Your Shared Vaults</h2>
            <Button
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
              onClick={() => setShowCreateVault(true)}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create New Vault
            </Button>
          </div>

          {/* Vault cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vaults.map((vault, vi) => {
              const gradients = [
                "from-violet-600/20 to-violet-900/10 border-violet-500/30",
                "from-blue-600/20 to-blue-900/10 border-blue-500/30",
              ];
              const iconColors = ["text-violet-400", "text-blue-400"];
              const iconBgs = ["bg-violet-600/30", "bg-blue-600/30"];
              const btnColors = ["bg-violet-600 hover:bg-violet-700", "bg-blue-600 hover:bg-blue-700"];

              return (
                <motion.div
                  key={vault.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: vi * 0.08 }}
                  className={`bg-gradient-to-br ${gradients[vi % gradients.length]} border rounded-2xl p-5 space-y-4`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-white text-base">{vault.name}</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="inline-flex items-center text-xs font-medium text-zinc-400 bg-white/10 rounded-full px-2.5 py-0.5">
                          {vault.itemCount} items
                        </span>
                        <span className="text-xs text-zinc-500">Created {vault.createdAt}</span>
                      </div>
                    </div>
                    <div className={`w-10 h-10 rounded-xl ${iconBgs[vi % iconBgs.length]} flex items-center justify-center`}>
                      <Shield className={`w-5 h-5 ${iconColors[vi % iconColors.length]}`} />
                    </div>
                  </div>

                  {/* Members */}
                  <div>
                    <div className="text-xs text-zinc-500 mb-2">Members</div>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {vault.members.map((member) => (
                          <div
                            key={member.name}
                            className={`w-8 h-8 rounded-full ${member.color} border-2 border-zinc-900 flex items-center justify-center text-white text-[10px] font-bold`}
                            title={member.name}
                          >
                            {member.initials}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-zinc-400">
                        {vault.members.map((m) => m.name).join(", ")}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      className={`flex-1 text-xs font-semibold text-white ${btnColors[vi % btnColors.length]}`}
                    >
                      Open Vault
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                      Manage Members
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Tab 3: Security Keys ── */}
        <TabsContent value="keys" className="space-y-6">
          {/* Competitive callout */}
          <div className="bg-orange-950/30 border border-orange-700/30 rounded-xl p-4 flex gap-3">
            <Zap className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-orange-300">
                Shield supports hardware security keys — Cloaked does not.
              </p>
              <p className="text-xs text-orange-400/60 mt-0.5">
                Register a YubiKey or passkey for phishing-resistant authentication no other privacy app can match.
              </p>
            </div>
          </div>

          {/* Empty state */}
          <Card className="border-white/10 bg-white/5">
            <CardContent className="py-14 flex flex-col items-center text-center">
              <Shield className="w-16 h-16 text-zinc-600 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No hardware keys registered</h3>
              <p className="text-sm text-zinc-400 max-w-sm mb-8 leading-relaxed">
                Add a hardware key for phishing-resistant authentication that keeps your accounts safe even if your password is compromised.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-white font-semibold"
                  onClick={() => setShowYubikey(true)}
                >
                  <Key className="w-4 h-4 mr-1.5" />
                  Register YubiKey
                </Button>
                <Button
                  variant="outline"
                  className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
                >
                  <Fingerprint className="w-4 h-4 mr-1.5" />
                  Add Passkey
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-white/10 bg-white/5">
              <CardContent className="p-5 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                  <Key className="w-5 h-5 text-orange-400" />
                </div>
                <h4 className="font-bold text-white">YubiKey</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Physical hardware key required to log in. The most secure authentication method available. Works even without internet.
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-green-400" />
                  </div>
                  <span className="text-xs text-zinc-400">FIDO2 / WebAuthn / U2F</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-green-400" />
                  </div>
                  <span className="text-xs text-zinc-400">Phishing-proof by design</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5">
              <CardContent className="p-5 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                  <Fingerprint className="w-5 h-5 text-violet-400" />
                </div>
                <h4 className="font-bold text-white">Passkey</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Uses your device's built-in biometric authenticator — Face ID or fingerprint. No password needed, no phishing possible.
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-green-400" />
                  </div>
                  <span className="text-xs text-zinc-400">Apple / Google / Windows Hello</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-green-400" />
                  </div>
                  <span className="text-xs text-zinc-400">Synced across your devices</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Supported keys */}
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-white">Supported Security Keys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "YubiKey 5 Series",
                  "YubiKey Bio Series",
                  "Google Titan Key",
                  "Apple Passkeys (Face ID / Touch ID)",
                  "Windows Hello",
                  "FIDO2 Compatible Keys",
                ].map((key) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    </div>
                    <span className="text-sm text-white font-medium">{key}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showAddModal && (
          <AddPasswordModal onClose={() => setShowAddModal(false)} onSave={handleAddPassword} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateVault && <CreateVaultDialog onClose={() => setShowCreateVault(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showYubikey && <YubikeyDialog onClose={() => setShowYubikey(false)} />}
      </AnimatePresence>
    </div>
  );
}
