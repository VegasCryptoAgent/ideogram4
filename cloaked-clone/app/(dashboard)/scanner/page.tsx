"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scan,
  ShieldCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  Lock,
  Database,
  Loader2,
  Eye,
  EyeOff,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const BROKERS = [
  "Spokeo", "WhitePages", "BeenVerified", "Intelius", "PeopleFinder",
  "Radaris", "MyLife", "PeopleSmart", "TruthFinder", "Instant Checkmate",
  "ZabaSearch", "Pipl", "FastPeopleSearch", "USSearch", "PeopleLooker",
  "Acxiom", "LexisNexis", "Epsilon", "Oracle Data Cloud", "Equifax",
  "Experian", "TransUnion", "DataLogix", "FullContact", "Clearbit",
];

const SCAN_HISTORY = [
  {
    id: "1",
    date: "Jan 15, 2025",
    brokersScanned: 204,
    found: 7,
    removed: 5,
    status: "complete",
    duration: "2h 14m",
  },
  {
    id: "2",
    date: "Jan 8, 2025",
    brokersScanned: 204,
    found: 12,
    removed: 12,
    status: "complete",
    duration: "2h 08m",
  },
  {
    id: "3",
    date: "Jan 1, 2025",
    brokersScanned: 200,
    found: 18,
    removed: 15,
    status: "complete",
    duration: "1h 58m",
  },
  {
    id: "4",
    date: "Dec 25, 2024",
    brokersScanned: 198,
    found: 22,
    removed: 19,
    status: "complete",
    duration: "2h 22m",
  },
];

const PERSONAL_INFO = [
  { label: "Full Name", value: "Jane Doe", masked: false },
  { label: "Date of Birth", value: "••/••/1990", masked: true },
  { label: "Primary Phone", value: "+1 (555) •••-••48", masked: true },
  { label: "Email", value: "jane@example.com", masked: false },
  { label: "Current Address", value: "123 Main St, ••••••, CA", masked: true },
  { label: "Previous Addresses", value: "2 addresses on file", masked: false },
];

export default function ScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentBroker, setCurrentBroker] = useState("");
  const [brokerIndex, setBrokerIndex] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [foundCount, setFoundCount] = useState(0);
  const [showMasked, setShowMasked] = useState(false);
  const scanRef = useRef<NodeJS.Timeout | null>(null);

  const startScan = () => {
    setScanning(true);
    setScanProgress(0);
    setScanComplete(false);
    setFoundCount(0);
    setBrokerIndex(0);
  };

  useEffect(() => {
    if (!scanning) return;

    const totalBrokers = BROKERS.length;
    let current = 0;

    const tick = setInterval(() => {
      current++;
      const progress = Math.min((current / (totalBrokers * 2)) * 100, 100);
      setScanProgress(progress);
      setBrokerIndex((i) => (i + 1) % BROKERS.length);
      setCurrentBroker(BROKERS[current % BROKERS.length]);

      // Occasionally find something
      if (current % 7 === 0) {
        setFoundCount((c) => c + 1);
      }

      if (progress >= 100) {
        clearInterval(tick);
        setScanning(false);
        setScanComplete(true);
      }
    }, 100);

    return () => clearInterval(tick);
  }, [scanning]);

  return (
    <div className="space-y-6">
      {/* Scan Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-violet-400" />
            Identity Scanner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {!scanning && !scanComplete && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col sm:flex-row items-center gap-6 py-4"
              >
                <div className="w-24 h-24 bg-violet-600/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-12 h-12 text-violet-400" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-semibold mb-2">Ready to scan</h3>
                  <p className="text-white/50 text-sm mb-4">
                    We'll search 204 data broker sites for your personal information and automatically request removal from any sites that have your data.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-4">
                    {["204 broker sites", "~2 hour scan", "Auto opt-out", "Weekly monitoring"].map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                  <Button onClick={startScan} size="lg">
                    <Play className="w-4 h-4 mr-2" />
                    Start Full Scan
                  </Button>
                </div>
              </motion.div>
            )}

            {scanning && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                    <span className="font-semibold">Scanning in progress...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {foundCount > 0 && (
                      <Badge variant="warning" className="text-xs">
                        {foundCount} found
                      </Badge>
                    )}
                    <span className="text-sm text-white/40">{Math.round(scanProgress)}%</span>
                  </div>
                </div>

                <Progress value={scanProgress} className="mb-4" />

                <div className="bg-black/30 rounded-xl p-4 font-mono text-xs text-white/50 space-y-1 max-h-32 overflow-hidden">
                  <div className="text-green-400">→ Scanning {currentBroker || "initializing"}...</div>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="opacity-40">
                      ✓ {BROKERS[(brokerIndex + i + 1) % BROKERS.length]} — checked
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-1.5 text-white/40">
                    <Database className="w-4 h-4" />
                    {Math.round(scanProgress * 2.04)} / 204 checked
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    {foundCount} listings found
                  </div>
                </div>
              </motion.div>
            )}

            {scanComplete && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4"
              >
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-24 h-24 bg-green-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-12 h-12 text-green-400" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-semibold mb-2">Scan Complete</h3>
                    <p className="text-white/50 text-sm mb-4">
                      We scanned 204 data brokers and found{" "}
                      <strong className="text-white">{foundCount} listings</strong>. Opt-out requests have been submitted automatically.
                    </p>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={startScan}>
                        <Scan className="w-4 h-4 mr-2" />
                        Scan Again
                      </Button>
                      <Button asChild>
                        <a href="/brokers">View Results</a>
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Personal Info Being Scanned */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-4 h-4 text-violet-400" />
            Information We're Scanning For
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMasked(!showMasked)}
            className="text-xs"
          >
            {showMasked ? (
              <><EyeOff className="w-3.5 h-3.5 mr-1.5" />Hide</>
            ) : (
              <><Eye className="w-3.5 h-3.5 mr-1.5" />Show</>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="bg-violet-600/10 border border-violet-500/20 rounded-xl p-4 mb-4 flex gap-3">
            <ShieldCheck className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-violet-300/80">
              This data is AES-256 encrypted and only used to search for your listings. It is never sold or shared.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PERSONAL_INFO.map(({ label, value, masked }) => (
              <div key={label} className="bg-white/3 rounded-xl p-3">
                <div className="text-xs text-white/40 mb-1">{label}</div>
                <div className="text-sm font-medium text-white">
                  {masked && !showMasked ? value : value.replace(/•/g, "*")}
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-4" asChild>
            <a href="/settings">Update Information</a>
          </Button>
        </CardContent>
      </Card>

      {/* Scan History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-white/40" />
            Scan History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-2 text-white/40 font-medium text-xs uppercase tracking-wider">Date</th>
                  <th className="text-left py-3 px-2 text-white/40 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Sites Scanned</th>
                  <th className="text-left py-3 px-2 text-white/40 font-medium text-xs uppercase tracking-wider">Found</th>
                  <th className="text-left py-3 px-2 text-white/40 font-medium text-xs uppercase tracking-wider">Removed</th>
                  <th className="text-left py-3 px-2 text-white/40 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Duration</th>
                  <th className="text-left py-3 px-2 text-white/40 font-medium text-xs uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {SCAN_HISTORY.map((scan) => (
                  <tr key={scan.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                    <td className="py-3 px-2 text-white/70">{scan.date}</td>
                    <td className="py-3 px-2 text-white/50 hidden sm:table-cell">{scan.brokersScanned}</td>
                    <td className="py-3 px-2">
                      <span className={scan.found > 0 ? "text-amber-400" : "text-white/40"}>{scan.found}</span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-green-400">{scan.removed}</span>
                    </td>
                    <td className="py-3 px-2 text-white/40 hidden md:table-cell">{scan.duration}</td>
                    <td className="py-3 px-2">
                      <Badge variant="success" className="text-xs">Complete</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* How We Protect Your Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How We Protect Your Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Lock, title: "AES-256 Encryption", desc: "All your personal information is encrypted at rest and in transit." },
              { icon: Eye, title: "Zero Data Sharing", desc: "We never sell, share, or use your data for any purpose other than finding and removing your listings." },
              { icon: ShieldCheck, title: "GDPR & CCPA Compliant", desc: "You have full control over your data. Delete it at any time from your settings." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/3 rounded-xl p-4">
                <Icon className="w-5 h-5 text-violet-400 mb-3" />
                <h4 className="text-sm font-semibold mb-1.5">{title}</h4>
                <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
