'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
  ArrowRight,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Breach {
  id: string
  name: string
  domain: string
  breachDate: string
  addedDate: string
  dataExposed: string[]
  severity: 'critical' | 'high' | 'medium' | 'low'
  description: string
  isRead: boolean
  recordCount: number
}

interface MonitoredType {
  type: string
  icon: string
  status: 'monitored' | 'exposed' | 'alert'
  exposures: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MONITORED_TYPES: MonitoredType[] = [
  { type: 'Email Address',       icon: '📧', status: 'monitored', exposures: 3 },
  { type: 'Password Hash',       icon: '🔐', status: 'exposed',   exposures: 2 },
  { type: 'Social Security No.', icon: '🪪', status: 'alert',     exposures: 1 },
  { type: 'Phone Number',        icon: '📱', status: 'monitored', exposures: 1 },
  { type: 'Home Address',        icon: '🏠', status: 'monitored', exposures: 0 },
  { type: 'Date of Birth',       icon: '📅', status: 'monitored', exposures: 0 },
  { type: "Driver's License",    icon: '🚗', status: 'monitored', exposures: 0 },
  { type: 'Passport Number',     icon: '✈️',  status: 'monitored', exposures: 0 },
  { type: 'Credit Card BIN',     icon: '💳', status: 'monitored', exposures: 0 },
  { type: 'Bank Account',        icon: '🏦', status: 'monitored', exposures: 0 },
  { type: 'Crypto Wallet',       icon: '₿',  status: 'monitored', exposures: 0 },
  { type: 'Medical Record ID',   icon: '🏥', status: 'monitored', exposures: 0 },
  { type: 'Username',            icon: '👤', status: 'exposed',   exposures: 4 },
  { type: 'IP Address',          icon: '🌐', status: 'monitored', exposures: 0 },
  { type: 'Security Questions',  icon: '❓', status: 'monitored', exposures: 0 },
]

const MOCK_BREACHES: Breach[] = [
  {
    id: '1',
    name: 'DataBrokerHub',
    domain: 'databrokerhub.com',
    breachDate: '2024-08-15',
    addedDate: '2024-09-01',
    dataExposed: ['Email', 'Password Hash', 'Phone', 'Name', 'Address'],
    severity: 'critical',
    description:
      'DataBrokerHub suffered a major breach exposing the full database of 340 million records including hashed passwords, email addresses, and physical addresses.',
    isRead: false,
    recordCount: 340000000,
  },
  {
    id: '2',
    name: 'ShopEasy',
    domain: 'shopeasy.com',
    breachDate: '2024-03-22',
    addedDate: '2024-04-10',
    dataExposed: ['Email', 'Name', 'Purchase History'],
    severity: 'medium',
    description:
      'Online retailer ShopEasy had customer order data exposed due to a misconfigured S3 bucket. No passwords were included.',
    isRead: true,
    recordCount: 4200000,
  },
  {
    id: '3',
    name: 'SocialConnect',
    domain: 'socialconnect.io',
    breachDate: '2023-11-05',
    addedDate: '2023-12-01',
    dataExposed: ['Email', 'Username', 'IP Address', 'Bio'],
    severity: 'low',
    description:
      'Social platform SocialConnect leaked user profile data including email addresses and bios via a public API endpoint.',
    isRead: true,
    recordCount: 890000,
  },
  {
    id: '4',
    name: 'NationalCredit360',
    domain: 'nationalcredit360.com',
    breachDate: '2025-01-11',
    addedDate: '2025-02-03',
    dataExposed: ['SSN', 'Name', 'Date of Birth', 'Address', 'Credit Card', 'Email'],
    severity: 'critical',
    description:
      'NationalCredit360 suffered a catastrophic breach exposing the full PII of 92 million US consumers including Social Security Numbers, full names, dates of birth, home addresses, and partial credit card data. This breach is classified as CRITICAL — immediate action required.',
    isRead: false,
    recordCount: 92000000,
  },
]

const severityConfig = {
  critical: { label: 'Critical', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  high:     { label: 'High',     color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  medium:   { label: 'Medium',   color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  low:      { label: 'Low',      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
}

const dataTypeColors: Record<string, string> = {
  SSN:                 'bg-red-950 text-red-200 border-red-800',
  'Password Hash':     'bg-red-900/60 text-red-200 border-red-700/50',
  Password:            'bg-red-900/40 text-red-300 border-red-700/30',
  Email:               'bg-blue-900/40 text-blue-300 border-blue-700/30',
  Phone:               'bg-purple-900/40 text-purple-300 border-purple-700/30',
  Name:                'bg-zinc-800 text-zinc-300 border-zinc-700',
  Address:             'bg-orange-900/40 text-orange-300 border-orange-700/30',
  'Credit Card':       'bg-rose-900/60 text-rose-200 border-rose-700/50',
  'Date of Birth':     'bg-amber-900/40 text-amber-300 border-amber-700/30',
  Username:            'bg-cyan-900/40 text-cyan-300 border-cyan-700/30',
  'IP Address':        'bg-teal-900/40 text-teal-300 border-teal-700/30',
  "Driver's License":  'bg-lime-900/40 text-lime-300 border-lime-700/30',
  Passport:            'bg-sky-900/40 text-sky-300 border-sky-700/30',
  'Crypto Wallet':     'bg-yellow-900/40 text-yellow-300 border-yellow-700/30',
  'Medical Record':    'bg-pink-900/40 text-pink-300 border-pink-700/30',
  'Security Questions':'bg-indigo-900/40 text-indigo-300 border-indigo-700/30',
  default:             'bg-zinc-800 text-zinc-400 border-zinc-700',
}

// ─── SSN Wizard steps data ────────────────────────────────────────────────────

interface WizardStep {
  title: string
  subtitle: string
  body: React.ReactNode
}

function buildWizardSteps(openWizard: () => void): WizardStep[] {
  void openWizard
  return [
    {
      title: 'Freeze your credit',
      subtitle: 'Stop new accounts from being opened in your name.',
      body: (
        <div className="space-y-4">
          <p className="text-sm text-zinc-300 leading-relaxed">
            A credit freeze prevents lenders from accessing your credit report, making it nearly
            impossible for identity thieves to open new accounts in your name. It is free and does
            not affect your credit score.
          </p>
          <div className="space-y-2">
            {[
              { name: 'Equifax',    url: 'https://www.equifax.com/personal/credit-report-services/credit-freeze/', cls: 'bg-red-600 hover:bg-red-700' },
              { name: 'TransUnion', url: 'https://www.transunion.com/credit-freeze',                               cls: 'bg-blue-600 hover:bg-blue-700' },
              { name: 'Experian',   url: 'https://www.experian.com/freeze/center.html',                           cls: 'bg-orange-600 hover:bg-orange-700' },
            ].map((bureau) => (
              <a
                key={bureau.name}
                href={bureau.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-white text-sm font-medium ${bureau.cls} transition-colors`}
              >
                <span>Freeze at {bureau.name}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'File an FTC identity theft report',
      subtitle: 'Create your official legal record.',
      body: (
        <div className="space-y-4">
          <p className="text-sm text-zinc-300 leading-relaxed">
            Filing a report at IdentityTheft.gov creates an official FTC identity theft report.
            This gives you legal rights to remove fraudulent accounts, place extended fraud alerts,
            and dispute charges. It takes about 10 minutes.
          </p>
          <a
            href="https://www.identitytheft.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors"
          >
            <span>File at IdentityTheft.gov</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      ),
    },
    {
      title: 'Enable 2FA on critical accounts',
      subtitle: 'Lock down your most important logins.',
      body: (
        <div className="space-y-3">
          <p className="text-sm text-zinc-300 leading-relaxed">
            With your SSN exposed, attackers may try to access financial and email accounts. Enable
            two-factor authentication (preferably an authenticator app, not SMS) on these
            immediately:
          </p>
          {[
            'Banking accounts',
            'Primary email',
            'Social media',
            'Investment accounts',
            'Government portals (IRS, SSA.gov)',
          ].map((acct) => (
            <div key={acct} className="flex items-center gap-3 text-sm text-zinc-300">
              <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
              {acct}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Review your credit report',
      subtitle: "Look for accounts you didn't open.",
      body: (
        <div className="space-y-4">
          <p className="text-sm text-zinc-300 leading-relaxed">
            Check all three credit bureaus for accounts, loans, or inquiries you do not recognize.
            You are entitled to free weekly reports at AnnualCreditReport.com.
          </p>
          <a
            href="https://www.annualcreditreport.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-green-700 hover:bg-green-800 text-white text-sm font-medium transition-colors"
          >
            <span>Get free credit report</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      ),
    },
    {
      title: 'File your insurance claim',
      subtitle: 'Your Shield plan covers up to $1M.',
      body: (
        <div className="space-y-4">
          <div className="bg-violet-600/20 border border-violet-500/30 rounded-lg p-4">
            <p className="text-sm font-semibold text-violet-300 mb-1">
              Your Shield plan includes $1M identity theft insurance
            </p>
            <p className="text-xs text-zinc-400">
              Covers legal fees, lost wages, and expenses related to restoring your identity.
            </p>
          </div>
          <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white">
            Start Insurance Claim
          </Button>
          <p className="text-xs text-zinc-500 text-center">
            Questions? Call{' '}
            <span className="text-white font-medium">1-800-SHIELD-1</span>{' '}
            (Mon–Fri 8am–8pm ET)
          </p>
        </div>
      ),
    },
  ]
}

// ─── SSN Remediation Wizard Component ────────────────────────────────────────

function SSNWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0)
  const [completed, setCompleted] = useState<boolean[]>([false, false, false, false, false])
  const steps = buildWizardSteps(onClose)
  const current = steps[step]
  const isLastStep = step === steps.length - 1

  function markComplete() {
    const next = [...completed]
    next[step] = true
    setCompleted(next)
    if (isLastStep) {
      onClose()
    } else {
      setStep((s) => s + 1)
    }
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
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full max-w-lg bg-zinc-900 border border-red-800/50 rounded-2xl overflow-hidden shadow-2xl shadow-red-950/40"
      >
        {/* Header */}
        <div className="bg-red-950/60 border-b border-red-800/40 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="font-semibold text-white text-sm">SSN Breach Remediation Guide</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-5 pb-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500">
              Step {step + 1} of {steps.length}
            </span>
            <span className="text-xs text-zinc-500">
              {completed.filter(Boolean).length} of {steps.length} completed
            </span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full"
              initial={false}
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
          {/* Step dots */}
          <div className="flex justify-between mt-3 gap-2">
            {steps.map((s, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                title={s.title}
                className={`flex-1 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                  completed[i]
                    ? 'bg-green-700/60 text-green-300 border border-green-600/40'
                    : i === step
                    ? 'bg-red-700/60 text-red-200 border border-red-600/40'
                    : 'bg-zinc-800 text-zinc-600 hover:bg-zinc-700 border border-transparent'
                }`}
              >
                {completed[i] ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="px-6 py-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18 }}
            >
              <h2 className="text-lg font-bold text-white mb-1">{current.title}</h2>
              <p className="text-sm text-zinc-400 mb-5">{current.subtitle}</p>
              {current.body}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="text-zinc-500 hover:text-zinc-300"
          >
            Back
          </Button>
          <Button
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold"
            onClick={markComplete}
          >
            {isLastStep ? 'Finish & Close' : 'Mark Complete & Continue'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// Maps a BreachAlert from DB to the Breach UI type
function mapApiBreach(a: {
  id: string
  breachName: string
  breachDate: string | null
  dataExposed: string[]
  isRead: boolean
  sourceUrl: string | null
  createdAt: string
}): Breach {
  const exposed = a.dataExposed ?? []
  const severity: Breach['severity'] =
    exposed.some((d) => /ssn|social security|password/i.test(d)) ? 'critical' :
    exposed.length >= 4 ? 'high' :
    exposed.length >= 2 ? 'medium' : 'low'

  return {
    id: a.id,
    name: a.breachName,
    domain: a.sourceUrl?.replace(/^https?:\/\/[^/]+\/[^#]+#?/, '') ?? a.breachName.toLowerCase(),
    breachDate: a.breachDate ? a.breachDate.split('T')[0] : 'Unknown',
    addedDate: a.createdAt.split('T')[0],
    dataExposed: exposed,
    severity,
    description: `Your data was found in the ${a.breachName} breach. Exposed: ${exposed.join(', ')}.`,
    isRead: a.isRead,
    recordCount: 0,
  }
}

export default function BreachPage() {
  const [breaches, setBreaches] = useState<Breach[]>([])
  const [loading, setLoading] = useState(true)
  const [isChecking, setIsChecking] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [wizardOpen, setWizardOpen] = useState(false)

  const fetchBreaches = useCallback(async () => {
    try {
      const res = await fetch('/api/breach')
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      const raw: any[] = json.data ?? []
      setBreaches(raw.map(mapApiBreach))
    } catch {
      setBreaches([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBreaches() }, [fetchBreaches])

  const unread = breaches.filter((b) => !b.isRead).length
  const hasSsnAlert = breaches.some((b) =>
    b.dataExposed.some((d) => /ssn|social security/i.test(d))
  )

  async function handleCheck() {
    setIsChecking(true)
    try {
      const res = await fetch('/api/breach', { method: 'POST' })
      const json = await res.json()
      const raw: any[] = json.data ?? []
      if (raw.length > 0) setBreaches(raw.map(mapApiBreach))
    } catch {
      // keep existing
    } finally {
      setIsChecking(false)
    }
  }

  async function markRead(id: string) {
    setBreaches((prev) => prev.map((b) => (b.id === id ? { ...b, isRead: true } : b)))
    await fetch(`/api/breach/${id}`, { method: 'PATCH', body: JSON.stringify({ isRead: true }), headers: { 'Content-Type': 'application/json' } })
  }

  return (
    <div className="space-y-8">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Breach Monitor</h1>
          <p className="text-zinc-400 mt-1">
            Real-time dark web surveillance across 15 data types.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {hasSsnAlert && (
            <motion.button
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              onClick={() => setWizardOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-red-950/50"
            >
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-400 animate-ping" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500" />
              <AlertTriangle className="w-4 h-4" />
              SSN ALERT — Take Action
            </motion.button>
          )}
          <Button
            onClick={handleCheck}
            disabled={isChecking}
            className="bg-violet-600 hover:bg-violet-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Check Now'}
          </Button>
        </div>
      </div>

      {/* ── Unread alert banner ── */}
      {unread > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-950/40 border border-red-700/40 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-red-300">
              {unread} new {unread === 1 ? 'breach' : 'breaches'} detected
            </p>
            <p className="text-sm text-red-400/80 mt-0.5">
              Your data was found in {unread} new breach{unread !== 1 ? 'es' : ''}. Review and take action.
            </p>
          </div>
        </motion.div>
      )}

      {/* ── What We Monitor grid ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-violet-400" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            What We Monitor
          </h2>
          <span className="text-xs text-zinc-500">15 data types across the dark web</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {MONITORED_TYPES.map((item) => {
            const isAlert = item.status === 'alert'
            const isExposed = item.exposures > 0 && !isAlert
            const baseCls =
              'relative rounded-xl p-3 border flex flex-col items-start gap-1.5 transition-all'
            const tileCls = isAlert
              ? `${baseCls} bg-red-950/60 border-red-700/50`
              : isExposed
              ? `${baseCls} bg-orange-950/40 border-orange-700/40`
              : `${baseCls} bg-white/[0.03] border-white/[0.07] hover:border-white/15`

            return (
              <div key={item.type} className={tileCls}>
                {isAlert && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                )}
                <span className="text-xl leading-none">{item.icon}</span>
                <span
                  className={`text-xs font-medium leading-tight ${
                    isAlert
                      ? 'text-red-300'
                      : isExposed
                      ? 'text-orange-300'
                      : 'text-zinc-300'
                  }`}
                >
                  {item.type}
                </span>
                {item.exposures > 0 ? (
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                      isAlert
                        ? 'bg-red-500/30 text-red-300'
                        : 'bg-orange-500/20 text-orange-300'
                    }`}
                  >
                    {item.exposures} breach{item.exposures !== 1 ? 'es' : ''}
                  </span>
                ) : (
                  <span className="text-xs text-zinc-600">Secure</span>
                )}
                {isAlert && (
                  <button
                    onClick={() => setWizardOpen(true)}
                    className="mt-0.5 text-xs text-red-400 hover:text-red-300 font-semibold underline underline-offset-2"
                  >
                    View alert
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Breach incidents list ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            Breach Incidents
          </h2>
          <span className="text-xs text-zinc-500">{breaches.length} total</span>
        </div>

        {breaches.length === 0 && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-16 text-center">
              <ShieldCheck className="w-14 h-14 text-green-500 mx-auto mb-3" />
              <p className="text-lg font-semibold text-white">No breaches found</p>
              <p className="text-zinc-400 mt-1">
                Your email has not appeared in any known data breaches.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {breaches.map((breach, idx) => {
            const sev = severityConfig[breach.severity]
            const isExpanded = expandedId === breach.id
            const hasSsnExposure = breach.dataExposed.includes('SSN')

            return (
              <motion.div
                key={breach.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  className={`bg-white/5 border transition-all ${
                    hasSsnExposure && !breach.isRead
                      ? 'border-red-700/60 shadow-lg shadow-red-950/20'
                      : !breach.isRead
                      ? 'border-red-800/40'
                      : 'border-white/10'
                  }`}
                >
                  <CardContent className="p-5">
                    {/* Row */}
                    <div
                      className="flex items-start gap-4 cursor-pointer"
                      onClick={() => {
                        setExpandedId(isExpanded ? null : breach.id)
                        if (!breach.isRead) markRead(breach.id)
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {!breach.isRead && (
                            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse" />
                          )}
                          <span className="font-semibold text-white">{breach.name}</span>
                          <Badge className={sev.color}>{sev.label}</Badge>
                          {hasSsnExposure && (
                            <Badge className="bg-red-500/25 text-red-300 border-red-500/40 animate-pulse text-xs">
                              SSN EXPOSED
                            </Badge>
                          )}
                          <span className="text-xs text-zinc-500">
                            {formatCount(breach.recordCount)} records
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400">
                          {breach.domain} · Breached {breach.breachDate} · Reported{' '}
                          {breach.addedDate}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {breach.dataExposed.map((dt) => (
                            <span
                              key={dt}
                              className={`text-xs px-2 py-0.5 rounded border ${
                                dataTypeColors[dt] ?? dataTypeColors.default
                              }`}
                            >
                              {dt}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button className="text-zinc-500 hover:text-zinc-300 shrink-0 mt-1">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Expanded panel */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                            <p className="text-sm text-zinc-300">{breach.description}</p>

                            {/* SSN callout */}
                            {hasSsnExposure && (
                              <div className="bg-red-950/50 border border-red-700/40 rounded-lg p-4 space-y-3">
                                <p className="text-sm font-semibold text-red-300 flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4" />
                                  Your SSN was exposed — immediate action required
                                </p>
                                <p className="text-xs text-red-400/80">
                                  Social Security Number exposure is the most severe form of
                                  identity theft risk. Follow our 5-step remediation wizard.
                                </p>
                                <Button
                                  size="sm"
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setWizardOpen(true)
                                  }}
                                >
                                  Open Remediation Wizard
                                  <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                              </div>
                            )}

                            {/* Action list */}
                            <div>
                              <p className="text-sm font-semibold text-white mb-2">
                                What you should do:
                              </p>
                              <ul className="space-y-1.5">
                                {breach.dataExposed.includes('Password Hash') && (
                                  <li className="text-sm text-zinc-300 flex items-start gap-2">
                                    <span className="text-red-400 mt-0.5">•</span>
                                    Your hashed password was exposed — change it everywhere you
                                    reuse it immediately.
                                  </li>
                                )}
                                {breach.dataExposed.includes('Password') && (
                                  <li className="text-sm text-zinc-300 flex items-start gap-2">
                                    <span className="text-red-400 mt-0.5">•</span>
                                    Change your password for {breach.name} and anywhere you reuse
                                    it.
                                  </li>
                                )}
                                {breach.dataExposed.includes('Email') && (
                                  <li className="text-sm text-zinc-300 flex items-start gap-2">
                                    <span className="text-orange-400 mt-0.5">•</span>
                                    Watch for phishing emails targeting your address.
                                  </li>
                                )}
                                {breach.dataExposed.includes('Phone') && (
                                  <li className="text-sm text-zinc-300 flex items-start gap-2">
                                    <span className="text-yellow-400 mt-0.5">•</span>
                                    Be cautious of suspicious calls and SMS — your number is
                                    exposed.
                                  </li>
                                )}
                                {(breach.dataExposed.includes('Address') ||
                                  breach.dataExposed.includes('Name')) && (
                                  <li className="text-sm text-zinc-300 flex items-start gap-2">
                                    <span className="text-blue-400 mt-0.5">•</span>
                                    Your personal details may appear on data broker sites. Run a
                                    new broker scan.
                                  </li>
                                )}
                                {breach.dataExposed.includes('Credit Card') && (
                                  <li className="text-sm text-zinc-300 flex items-start gap-2">
                                    <span className="text-rose-400 mt-0.5">•</span>
                                    Monitor card statements for unauthorized charges and request a
                                    new card number.
                                  </li>
                                )}
                                <li className="text-sm text-zinc-300 flex items-start gap-2">
                                  <span className="text-violet-400 mt-0.5">•</span>
                                  Enable two-factor authentication on all important accounts.
                                </li>
                              </ul>
                            </div>
                            <a
                              href={`https://${breach.domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300"
                            >
                              Visit {breach.domain}
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* ── SSN Wizard overlay ── */}
      <AnimatePresence>
        {wizardOpen && <SSNWizard onClose={() => setWizardOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}
