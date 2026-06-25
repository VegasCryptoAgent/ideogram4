"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Plus,
  Shield,
  Snowflake,
  Trash2,
  Eye,
  EyeOff,
  X,
  Zap,
  Lock,
  CheckCircle,
  XCircle,
  Copy,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  status: "approved" | "blocked";
}

interface VirtualCard {
  id: string;
  nickname: string;
  lastFour: string;
  merchant: string | null;
  type: "merchant-locked" | "multi-use" | "single-use";
  limit: number;
  spent: number;
  status: "active" | "frozen" | "expired";
  createdAt: string;
  color: string;
  transactions: Transaction[];
}

// ─── New card reveal data (pan+cvv only available at creation time) ───────────

interface NewCardDetails {
  pan: string
  cvv: string
  expMonth: string
  expYear: string
  nickname: string
}

// ─── Color Helpers ─────────────────────────────────────────────────────────

const COLOR_GRADIENTS: Record<string, string> = {
  blue: "from-blue-600 to-blue-900",
  purple: "from-purple-600 to-purple-900",
  green: "from-green-600 to-green-900",
  red: "from-red-600 to-red-900",
  gray: "from-zinc-600 to-zinc-800",
};

const TYPE_BADGE_COLORS: Record<VirtualCard["type"], string> = {
  "merchant-locked": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "multi-use": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "single-use": "bg-orange-500/20 text-orange-300 border-orange-500/30",
};

const TYPE_LABELS: Record<VirtualCard["type"], string> = {
  "merchant-locked": "Merchant Locked",
  "multi-use": "Multi-Use",
  "single-use": "Single-Use",
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function SpendingBar({ spent, limit }: { spent: number; limit: number }) {
  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const barColor =
    pct > 80 ? "bg-red-500" : pct > 50 ? "bg-yellow-500" : "bg-green-500";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-zinc-400">
        <span>${spent.toFixed(2)} spent</span>
        <span>${limit} limit</span>
      </div>
      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Visual Credit Card ───────────────────────────────────────────────────────

function CreditCardVisual({
  card,
  size = "normal",
}: {
  card: VirtualCard;
  size?: "normal" | "large";
}) {
  const gradient = COLOR_GRADIENTS[card.color] ?? "from-zinc-600 to-zinc-800";
  const isLarge = size === "large";

  return (
    <div
      className={`relative bg-gradient-to-br ${gradient} rounded-2xl overflow-hidden select-none cursor-pointer
        ${isLarge ? "w-full max-w-xs mx-auto" : "w-full"}`}
      style={{ aspectRatio: "1.586 / 1" }}
    >
      {/* Watermark shield */}
      <div className="absolute bottom-0 right-0 p-3 pointer-events-none">
        <Shield className="text-white/10" style={{ width: isLarge ? 80 : 60, height: isLarge ? 80 : 60 }} />
      </div>

      {/* Card content */}
      <div className="absolute inset-0 flex flex-col justify-between p-4">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <span className={`border border-white/20 bg-white/10 text-white/70 rounded px-2 py-0.5 ${isLarge ? "text-xs" : "text-[10px]"} font-medium`}>
            {TYPE_LABELS[card.type]}
          </span>
          <span className={`font-bold tracking-widest text-white ${isLarge ? "text-sm" : "text-xs"}`} style={{ fontVariant: "small-caps" }}>
            SHIELD
          </span>
        </div>

        {/* Middle — card number */}
        <div>
          <div className={`font-mono text-white font-bold tracking-widest ${isLarge ? "text-xl" : "text-base"}`}>
            •••• •••• •••• {card.lastFour}
          </div>
          <div className={`text-white/60 mt-1 ${isLarge ? "text-sm" : "text-xs"} truncate`}>
            {card.nickname}
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-white/40" style={{ fontSize: isLarge ? 9 : 8 }}>VALID THRU</div>
            <div className={`font-mono text-white font-semibold ${isLarge ? "text-sm" : "text-xs"}`}>
              ••/••
            </div>
          </div>
        </div>
      </div>

      {/* Frozen overlay */}
      {card.status === "frozen" && (
        <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
          <Snowflake className={`text-blue-300 ${isLarge ? "w-10 h-10" : "w-7 h-7"}`} />
          <span className={`text-blue-200 font-bold tracking-widest ${isLarge ? "text-base" : "text-xs"}`}>
            FROZEN
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Card Detail Modal ────────────────────────────────────────────────────────

function CardDetailModal({
  card,
  onClose,
  onToggleFreeze,
  onDelete,
}: {
  card: VirtualCard;
  onClose: () => void;
  onToggleFreeze: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const handleDelete = () => {
    if (window.confirm(`Delete card "${card.nickname}"? This cannot be undone.`)) {
      onDelete(card.id);
      onClose();
    }
  };

  const maskedNumber = `•••• •••• •••• ${card.lastFour}`;

  return (
    <motion.div
      key="card-detail-overlay"
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
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <h2 className="text-lg font-bold">{card.nickname}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Card visual */}
          <div className="max-w-[260px] mx-auto">
            <CreditCardVisual card={card} size="large" />
          </div>

          {/* Card details */}
          <div className="bg-white/5 rounded-xl p-4 space-y-3">
            {/* Card number */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-zinc-500 mb-0.5">Card Number</div>
                <div className="font-mono text-sm text-white">{maskedNumber}</div>
              </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* Security note — Privacy.com only exposes full PAN/CVV at creation */}
            <div className="flex items-start gap-2 text-xs text-zinc-400 leading-relaxed">
              <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-zinc-500" />
              <span>
                For your security, the full card number, CVV, and expiry are shown only once when the
                card is created. Use this card in your browser extension or autofill, or create a new
                card if you need the full details again.
              </span>
            </div>
          </div>

          {/* Spending */}
          <SpendingBar spent={card.spent} limit={card.limit} />

          {/* Transaction history */}
          {card.transactions.length > 0 ? (
            <div>
              <div className="text-sm font-semibold mb-3 text-zinc-300">Transaction History</div>
              <div className="rounded-xl overflow-hidden border border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/5 text-zinc-500 text-xs">
                      <th className="px-3 py-2 text-left font-medium">Merchant</th>
                      <th className="px-3 py-2 text-right font-medium">Amount</th>
                      <th className="px-3 py-2 text-left font-medium">Date</th>
                      <th className="px-3 py-2 text-right font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {card.transactions.map((tx, idx) => (
                      <tr
                        key={tx.id}
                        className={idx % 2 === 0 ? "bg-white/[0.02]" : ""}
                      >
                        <td className="px-3 py-2.5 text-white">{tx.merchant}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-white">
                          ${tx.amount.toFixed(2)}
                        </td>
                        <td className="px-3 py-2.5 text-zinc-400 text-xs">{tx.date}</td>
                        <td className="px-3 py-2.5 text-right">
                          {tx.status === "approved" ? (
                            <span className="inline-flex items-center gap-1 text-green-400 text-xs font-medium">
                              <CheckCircle className="w-3 h-3" />
                              Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-400 text-xs font-medium">
                              <XCircle className="w-3 h-3" />
                              Blocked
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-zinc-500 text-sm">No transactions yet.</div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 text-white"
              onClick={() => onToggleFreeze(card.id)}
            >
              {card.status === "frozen" ? (
                <>
                  <Shield className="w-4 h-4 mr-1.5 text-green-400" />
                  Unfreeze Card
                </>
              ) : (
                <>
                  <Snowflake className="w-4 h-4 mr-1.5 text-blue-400" />
                  Freeze Card
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete Card
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Create Card Modal ────────────────────────────────────────────────────────

const COLOR_OPTIONS = [
  { key: "blue", label: "Blue", swatch: "bg-gradient-to-br from-blue-600 to-blue-900" },
  { key: "purple", label: "Purple", swatch: "bg-gradient-to-br from-purple-600 to-purple-900" },
  { key: "green", label: "Green", swatch: "bg-gradient-to-br from-green-600 to-green-900" },
  { key: "red", label: "Red", swatch: "bg-gradient-to-br from-red-600 to-red-900" },
];

function CreateCardModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: { nickname: string; type: VirtualCard["type"]; limit: number; hostname?: string; color: string }) => Promise<void>;
}) {
  const [nickname, setNickname] = useState("");
  const [cardType, setCardType] = useState<VirtualCard["type"]>("merchant-locked");
  const [merchantName, setMerchantName] = useState("");
  const [limit, setLimit] = useState("50");
  const [autoFreeze, setAutoFreeze] = useState(false);
  const [selectedColor, setSelectedColor] = useState("blue");
  const [submitting, setSubmitting] = useState(false);

  // Suppress unused var lint
  void autoFreeze;

  const previewCard: VirtualCard = {
    id: "preview",
    nickname: nickname || "New Card",
    lastFour: "0000",
    merchant: cardType === "merchant-locked" ? merchantName || "Any" : null,
    type: cardType,
    limit: parseFloat(limit) || 50,
    spent: 0,
    status: "active",
    createdAt: new Date().toISOString().split("T")[0],
    color: selectedColor,
    transactions: [],
  };

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      await onSubmit({
        nickname: nickname || "New Card",
        type: cardType,
        limit: parseFloat(limit) || 50,
        hostname: cardType === "merchant-locked" && merchantName ? merchantName : undefined,
        color: selectedColor,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      key="create-overlay"
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
        className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/10">
          <h2 className="text-lg font-bold">Create Virtual Card</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Live preview */}
          <div className="max-w-[220px] mx-auto">
            <CreditCardVisual card={previewCard} size="normal" />
          </div>

          {/* Color picker */}
          <div>
            <Label className="text-xs text-zinc-400 mb-2 block">Card Color</Label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setSelectedColor(c.key)}
                  className={`w-10 h-10 rounded-xl ${c.swatch} transition-all ${
                    selectedColor === c.key
                      ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Nickname */}
          <div>
            <Label className="text-xs text-zinc-400 mb-1.5 block">Card Nickname</Label>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Amazon Shopping"
              className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600"
            />
          </div>

          {/* Card type */}
          <div>
            <Label className="text-xs text-zinc-400 mb-2 block">Card Type</Label>
            <div className="flex gap-2">
              {(["merchant-locked", "multi-use", "single-use"] as VirtualCard["type"][]).map((t) => (
                <button
                  key={t}
                  onClick={() => setCardType(t)}
                  className={`flex-1 text-xs rounded-xl py-2 px-1 border transition-all font-medium ${
                    cardType === t
                      ? "bg-white/15 border-white/30 text-white"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                  }`}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Merchant name (conditional) */}
          <AnimatePresence>
            {cardType === "merchant-locked" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Label className="text-xs text-zinc-400 mb-1.5 block">Merchant Name</Label>
                <Input
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  placeholder="e.g. Amazon"
                  className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Spending limit */}
          <div>
            <Label className="text-xs text-zinc-400 mb-1.5 block">
              {cardType === "single-use" ? "Per-Use Limit" : "Monthly Limit"}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
              <Input
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="50"
                className="bg-white/5 border-white/10 text-white pl-7 placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* Auto-freeze toggle */}
          <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/10">
            <div>
              <div className="text-sm font-medium text-white">Auto-freeze after limit</div>
              <div className="text-xs text-zinc-500 mt-0.5">Automatically freeze when spending limit is reached</div>
            </div>
            <Switch
              checked={autoFreeze}
              onCheckedChange={setAutoFreeze}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-5">
          <Button
            variant="outline"
            className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 text-white"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button className="flex-1 bg-white text-black hover:bg-white/90 font-semibold" onClick={handleCreate} disabled={submitting}>
            <CreditCard className="w-4 h-4 mr-1.5" />
            {submitting ? "Creating…" : "Create Card"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── New Card Reveal Modal ────────────────────────────────────────────────────

function NewCardRevealModal({
  details,
  onClose,
}: {
  details: NewCardDetails
  onClose: () => void
}) {
  const [revealPan, setRevealPan] = useState(false)
  const [revealCvv, setRevealCvv] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const exp = `${details.expMonth}/${String(details.expYear).slice(-2)}`

  return (
    <motion.div
      key="new-card-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">Card Created!</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{details.nickname}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-start gap-3 bg-amber-950/40 border border-amber-700/40 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300 leading-relaxed">
              Save these details now — the full card number will not be shown again.
            </p>
          </div>

          {/* Card Number */}
          <div className="bg-white/5 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-zinc-500 mb-0.5">Card Number</div>
                <div className="font-mono text-sm text-white">
                  {revealPan ? details.pan : `•••• •••• •••• ${details.pan.slice(-4)}`}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setRevealPan((v) => !v)}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
                >
                  {revealPan ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => copy(details.pan, 'pan')}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied === 'pan' ? 'Copied!' : ''}
                </button>
              </div>
            </div>

            <div className="h-px bg-white/5" />

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-zinc-500 mb-0.5">CVV</div>
                <div className="font-mono text-sm text-white">{revealCvv ? details.cvv : '•••'}</div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setRevealCvv((v) => !v)}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
                >
                  {revealCvv ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => copy(details.cvv, 'cvv')}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied === 'cvv' ? 'Copied!' : ''}
                </button>
              </div>
            </div>

            <div className="h-px bg-white/5" />

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-zinc-500 mb-0.5">Expiry</div>
                <div className="font-mono text-sm text-white">{exp}</div>
              </div>
              <button
                onClick={() => copy(exp, 'exp')}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied === 'exp' ? 'Copied!' : ''}
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            Done — I&apos;ve saved my card details
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CardsPage() {
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<VirtualCard | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCardDetails, setNewCardDetails] = useState<NewCardDetails | null>(null);

  const mapApiCard = (c: any): VirtualCard => ({
    id: c.id,
    nickname: c.nickname ?? `Card •••• ${c.lastFour}`,
    type: (c.type ?? 'multi-use') as VirtualCard['type'],
    lastFour: c.lastFour,
    status: (c.frozen ? 'frozen' : 'active') as VirtualCard['status'],
    limit: c.spendLimit ? c.spendLimit / 100 : 0,
    spent: 0,
    merchant: c.hostname ?? null,
    transactions: [],
    color: c.color ?? 'blue',
    createdAt: new Date().toISOString().split('T')[0],
  });

  const fetchCards = useCallback(async () => {
    try {
      const res = await fetch('/api/cards')
      if (!res.ok) return
      const json = await res.json()
      const raw: any[] = json.data ?? []
      setCards(raw.map(mapApiCard))
    } catch { /* leave empty */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCards() }, [fetchCards])

  const totalSpent = cards.reduce((s, c) => s + c.spent, 0);
  const blockedCount = cards.reduce(
    (s, c) => s + c.transactions.filter((t) => t.status === "blocked").length,
    0
  );
  const activeCount = cards.filter((c) => c.status === "active").length;

  const toggleFreeze = (id: string) => {
    const card = cards.find((c) => c.id === id)
    const nowFrozen = card?.status !== 'frozen'
    setCards((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: nowFrozen ? 'frozen' : 'active' } : c
      )
    );
    setSelectedCard((prev) =>
      prev && prev.id === id ? { ...prev, status: nowFrozen ? 'frozen' : 'active' } : prev
    );
    fetch('/api/cards', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId: id, frozen: nowFrozen }),
    }).catch(() => {})
  };

  const deleteCard = async (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    if (selectedCard?.id === id) setSelectedCard(null);
    await fetch(`/api/cards/${id}`, { method: 'DELETE' }).catch(() => {})
  };

  const handleCreateCard = async (data: {
    nickname: string;
    type: VirtualCard['type'];
    limit: number;
    hostname?: string;
    color: string;
  }) => {
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: data.nickname,
          type: data.type,
          spendLimit: data.limit,
          hostname: data.hostname,
          color: data.color,
        }),
      })
      if (!res.ok) throw new Error('Failed to create card')
      const json = await res.json()
      const c = json.data
      setCards((prev) => [mapApiCard(c), ...prev])
      if (c.pan) {
        setNewCardDetails({
          pan: c.pan,
          cvv: c.cvv ?? '•••',
          expMonth: String(c.expMonth ?? '').padStart(2, '0'),
          expYear: String(c.expYear ?? ''),
          nickname: c.nickname ?? data.nickname,
        })
      }
    } catch (err) {
      console.error('[CreateCard]', err)
      throw err
    }
  };

  // Keep selectedCard in sync with cards array mutations
  const syncedSelectedCard = selectedCard
    ? cards.find((c) => c.id === selectedCard.id) ?? null
    : null;

  return (
    <div className="space-y-6">
      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Cards",
            value: cards.length,
            icon: CreditCard,
            color: "text-violet-400",
          },
          {
            label: "Spent This Month",
            value: `$${totalSpent.toFixed(2)}`,
            icon: Zap,
            color: "text-blue-400",
          },
          {
            label: "Blocked Transactions",
            value: blockedCount,
            icon: XCircle,
            color: "text-red-400",
          },
          {
            label: "Active Cards",
            value: activeCount,
            icon: Shield,
            color: "text-green-400",
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

      {/* ── Header row ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your Virtual Cards</h2>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Create Virtual Card
        </Button>
      </div>

      {/* ── Cards Grid ── */}
      {loading ? (
        <Card className="border-white/10 bg-white/5">
          <CardContent className="py-16 text-center">
            <CreditCard className="w-16 h-16 text-white/10 mx-auto mb-4 animate-pulse" />
            <p className="text-zinc-500 text-sm">Loading your cards…</p>
          </CardContent>
        </Card>
      ) : cards.length === 0 ? (
        <Card className="border-white/10 bg-white/5">
          <CardContent className="py-16 text-center">
            <CreditCard className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No virtual cards yet</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Create your first virtual card to start protecting your real payment info.
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Create Your First Card
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              layout
              className="glass-card rounded-2xl border border-white/10 overflow-hidden flex flex-col"
            >
              {/* Clickable card visual */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => setSelectedCard(card)}
                title="Click to view card details"
              >
                <CreditCardVisual card={card} size="normal" />
              </div>

              {/* Card info */}
              <div className="px-4 pb-4 space-y-3 flex-1 flex flex-col justify-between">
                {/* Name + type badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-white text-sm leading-snug">
                      {card.nickname}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      •••• {card.lastFour}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${TYPE_BADGE_COLORS[card.type]}`}
                  >
                    {TYPE_LABELS[card.type]}
                  </span>
                </div>

                {/* Spending bar */}
                <SpendingBar spent={card.spent} limit={card.limit} />

                {/* Merchant lock badge */}
                {card.type === "merchant-locked" && card.merchant && (
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-blue-400 flex-shrink-0" />
                    <span className="text-xs text-blue-300">
                      Locked to {card.merchant}
                    </span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-8 text-xs border-white/10 bg-white/5 hover:bg-white/10 text-white"
                    onClick={() => toggleFreeze(card.id)}
                  >
                    {card.status === "frozen" ? (
                      <>
                        <Shield className="w-3 h-3 mr-1 text-green-400" />
                        Unfreeze
                      </>
                    ) : (
                      <>
                        <Snowflake className="w-3 h-3 mr-1 text-blue-400" />
                        Freeze
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete card "${card.nickname}"? This cannot be undone.`
                        )
                      ) {
                        deleteCard(card.id);
                      }
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Why Shield callout ── */}
      <div className="bg-orange-950/30 border border-orange-700/30 rounded-xl p-4 flex gap-4">
        <div className="flex-shrink-0 mt-0.5">
          <Zap className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <div className="font-bold text-white text-sm mb-1">
            Virtual cards available now — no waitlist
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Unlike Cloaked Pay — which has been stuck behind a waitlist since launch — Shield virtual
            cards are available immediately with your Premium subscription. Create unlimited
            merchant-locked, multi-use, and single-use cards with real spending controls.
          </p>
        </div>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {syncedSelectedCard && (
          <CardDetailModal
            card={syncedSelectedCard}
            onClose={() => setSelectedCard(null)}
            onToggleFreeze={toggleFreeze}
            onDelete={deleteCard}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateModal && (
          <CreateCardModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateCard}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {newCardDetails && (
          <NewCardRevealModal
            details={newCardDetails}
            onClose={() => setNewCardDetails(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
