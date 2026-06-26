"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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

interface ScanJob {
  id: string
  status: string
  totalBrokers: number
  scanned: number
  found: number
  removed: number
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  progressPercent?: number
}

interface UserProfile {
  firstName?: string | null
  lastName?: string | null
  dateOfBirth?: string | null
  email?: string | null
  realPhones?: string[]
}

function formatDuration(start: string | null, end: string | null) {
  if (!start) return '—'
  const ms = new Date(end ?? Date.now()).getTime() - new Date(start).getTime()
  const mins = Math.round(ms / 60000)
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ScannerPage() {
  const [latestJob, setLatestJob] = useState<ScanJob | null>(null)
  const [history, setHistory] = useState<ScanJob[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [showMasked, setShowMasked] = useState(false)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const fetchLatest = useCallback(async () => {
    const res = await fetch('/api/scan').catch(() => null)
    if (!res?.ok) return null
    const json = await res.json()
    const job: ScanJob | null = json?.data?.job ?? null
    setLatestJob(job)
    return job
  }, [])

  const fetchHistory = useCallback(async () => {
    const res = await fetch('/api/scan?all=true').catch(() => null)
    if (!res?.ok) return
    const json = await res.json()
    setHistory(json?.data?.jobs ?? [])
  }, [])

  const fetchProfile = useCallback(async () => {
    const res = await fetch('/api/user/profile').catch(() => null)
    if (!res?.ok) return
    const json = await res.json()
    setProfile(json?.data ?? json)
  }, [])

  const startPolling = useCallback(() => {
    if (pollRef.current) return
    pollRef.current = setInterval(async () => {
      const job = await fetchLatest()
      if (!job || (job.status !== 'pending' && job.status !== 'running')) {
        clearInterval(pollRef.current!)
        pollRef.current = null
        fetchHistory()
      }
    }, 3000)
  }, [fetchLatest, fetchHistory])

  useEffect(() => {
    Promise.all([fetchLatest(), fetchHistory(), fetchProfile()])
  }, [fetchLatest, fetchHistory, fetchProfile])

  useEffect(() => {
    if (latestJob?.status === 'pending' || latestJob?.status === 'running') {
      startPolling()
    }
    return () => {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    }
  }, [latestJob?.status, startPolling])

  const profileIncomplete = profile !== null && !profile.firstName && !profile.lastName

  const startScan = async () => {
    if (profileIncomplete) {
      setError('Please add your name in Settings before scanning — it\'s required to search broker databases.')
      return
    }
    setStarting(true)
    setError(null)
    try {
      const res = await fetch('/api/scan', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) {
        setError(json?.error ?? 'Failed to start scan')
        return
      }
      await fetchLatest()
      startPolling()
    } finally {
      setStarting(false)
    }
  }

  const isScanning = latestJob?.status === 'pending' || latestJob?.status === 'running'
  const scanComplete = latestJob?.status === 'completed'
  const progress = latestJob?.progressPercent ?? (isScanning && latestJob?.totalBrokers
    ? Math.round((latestJob.scanned / latestJob.totalBrokers) * 100)
    : 0)

  // Personal info rows from real profile
  const personalInfoRows = profile ? [
    { label: 'Full Name', value: [profile.firstName, profile.lastName].filter(Boolean).join(' ') || '—', masked: false },
    { label: 'Date of Birth', value: profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }) : '—', masked: true },
    { label: 'Primary Phone', value: profile.realPhones?.[0] ?? '—', masked: true },
    { label: 'Email', value: profile.email ?? '—', masked: false },
  ] : []

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
            {!isScanning && !scanComplete && (
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
                    We'll search 75+ data broker sites for your personal information and automatically request removal from any sites that have your data.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-4">
                    {["75+ broker sites", "Auto opt-out", "Weekly monitoring"].map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                  {profileIncomplete && (
                    <div className="flex items-center gap-2 text-sm text-amber-400 mb-3 p-3 bg-amber-400/10 rounded-xl border border-amber-400/20">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>Your name is missing. <a href="/settings" className="underline">Add it in Settings</a> so we can search broker databases for your records.</span>
                    </div>
                  )}
                  {error && !profileIncomplete && (
                    <div className="flex items-center gap-2 text-sm text-amber-400 mb-3">
                      <AlertTriangle className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                  <Button onClick={startScan} size="lg" disabled={starting || profileIncomplete}>
                    {starting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                    {starting ? 'Starting…' : 'Start Full Scan'}
                  </Button>
                </div>
              </motion.div>
            )}

            {isScanning && (
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
                    <span className="font-semibold">
                      {latestJob?.status === 'pending' ? 'Queued — starting soon…' : 'Scanning in progress…'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {(latestJob?.found ?? 0) > 0 && (
                      <Badge variant="warning" className="text-xs">
                        {latestJob!.found} found
                      </Badge>
                    )}
                    <span className="text-sm text-white/40">{progress}%</span>
                  </div>
                </div>

                <Progress value={progress} className="mb-4" />

                <div className="flex gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-1.5 text-white/40">
                    <Database className="w-4 h-4" />
                    {latestJob?.scanned ?? 0} / {latestJob?.totalBrokers ?? '…'} checked
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    {latestJob?.found ?? 0} listings found
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
                      We scanned {latestJob?.totalBrokers ?? 0} data brokers and found{" "}
                      <strong className="text-white">{latestJob?.found ?? 0} listings</strong>. Opt-out requests have been submitted automatically.
                    </p>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={startScan} disabled={starting}>
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
      {profile && (
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
              {personalInfoRows.map(({ label, value, masked }) => (
                <div key={label} className="bg-white/3 rounded-xl p-3">
                  <div className="text-xs text-white/40 mb-1">{label}</div>
                  <div className="text-sm font-medium text-white">
                    {masked && !showMasked
                      ? value.replace(/[0-9a-zA-Z@.]/g, '•').slice(0, 12) + (value.length > 4 ? value.slice(-4) : '')
                      : value}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <a href="/settings">Update Information</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Scan History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-white/40" />
            Scan History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">
              No scan history yet. Run your first scan above.
            </p>
          ) : (
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
                  {history.map((scan) => (
                    <tr key={scan.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                      <td className="py-3 px-2 text-white/70">{formatDate(scan.createdAt)}</td>
                      <td className="py-3 px-2 text-white/50 hidden sm:table-cell">{scan.totalBrokers || '—'}</td>
                      <td className="py-3 px-2">
                        <span className={scan.found > 0 ? "text-amber-400" : "text-white/40"}>{scan.found}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-green-400">{scan.removed}</span>
                      </td>
                      <td className="py-3 px-2 text-white/40 hidden md:table-cell">
                        {formatDuration(scan.startedAt, scan.completedAt)}
                      </td>
                      <td className="py-3 px-2">
                        <Badge
                          variant={scan.status === 'completed' ? 'success' : scan.status === 'running' ? 'secondary' : 'warning'}
                          className="text-xs capitalize"
                        >
                          {scan.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
