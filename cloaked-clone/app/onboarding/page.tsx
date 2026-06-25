'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  User,
  Scan,
  Phone,
  Mail,
  Check,
  ArrowRight,
  ChevronRight,
  Lock,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BROKERS = [
  'Spokeo', 'Whitepages', 'BeenVerified', 'Intelius', 'MyLife',
  'TruthFinder', 'Radaris', 'PeopleFinder', 'PeekYou', 'Pipl',
  'Acxiom', 'LexisNexis', 'ZabaSearch', 'AnyWho', 'Addresses.com',
  'FamilyTreeNow', 'Instant Checkmate', 'US Search', 'PublicRecords360',
  'CheckThem', 'ClustrMaps', 'PrivateEye', 'Homy', 'VoterRecords',
]

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma',
  'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming',
]

const TOTAL_BROKERS = 76

// ---------------------------------------------------------------------------
// Slide animation variants
// ---------------------------------------------------------------------------

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 60 : -60,
    opacity: 0,
  }),
}

const transition = { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const }

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === current ? 24 : 8,
            backgroundColor: i === current ? '#7C3AED' : i < current ? '#5B21B6' : 'rgba(255,255,255,0.15)',
          }}
          transition={{ duration: 0.3 }}
          className="h-2 rounded-full"
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 1: Personal Info
// ---------------------------------------------------------------------------

interface PersonalInfo {
  firstName: string
  lastName: string
  dob: string
  phone: string
  city: string
  state: string
}

function Step1({
  onNext,
  info,
  setInfo,
}: {
  onNext: () => void
  info: PersonalInfo
  setInfo: (v: PersonalInfo) => void
}) {
  const valid = info.firstName.trim() && info.lastName.trim()

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/15 ring-1 ring-violet-500/25 flex items-center justify-center">
            <User className="w-7 h-7 text-violet-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Secure Your Identity</h2>
        <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
          Tell us a bit about yourself so we can find where your personal data is exposed.
        </p>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-4">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-white/70 text-xs font-medium">First Name *</Label>
            <Input
              value={info.firstName}
              onChange={e => setInfo({ ...info, firstName: e.target.value })}
              placeholder="Jane"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-violet-500/50 focus:ring-violet-500/20"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-white/70 text-xs font-medium">Last Name *</Label>
            <Input
              value={info.lastName}
              onChange={e => setInfo({ ...info, lastName: e.target.value })}
              placeholder="Smith"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-violet-500/50 focus:ring-violet-500/20"
            />
          </div>
        </div>

        {/* DOB */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-white/70 text-xs font-medium">Date of Birth</Label>
          <Input
            type="date"
            value={info.dob}
            onChange={e => setInfo({ ...info, dob: e.target.value })}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-violet-500/50 focus:ring-violet-500/20 [color-scheme:dark]"
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-white/70 text-xs font-medium">Primary Phone Number</Label>
          <Input
            type="tel"
            value={info.phone}
            onChange={e => setInfo({ ...info, phone: e.target.value })}
            placeholder="(555) 000-0000"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-violet-500/50 focus:ring-violet-500/20"
          />
          <p className="text-white/30 text-xs leading-relaxed">
            We use this to find your listings on data broker sites — we never call you or share this.
          </p>
        </div>

        {/* City + State */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-white/70 text-xs font-medium">City</Label>
            <Input
              value={info.city}
              onChange={e => setInfo({ ...info, city: e.target.value })}
              placeholder="San Francisco"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-violet-500/50 focus:ring-violet-500/20"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-white/70 text-xs font-medium">State</Label>
            <Select value={info.state} onValueChange={v => setInfo({ ...info, state: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-violet-500/50 focus:ring-violet-500/20">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent className="bg-[#12121a] border-white/10 text-white max-h-48 overflow-y-auto">
                {US_STATES.map(s => (
                  <SelectItem
                    key={s}
                    value={s}
                    className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                  >
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Privacy notice */}
      <div className="flex items-start gap-2.5 bg-violet-500/8 border border-violet-500/15 rounded-lg px-4 py-3">
        <Lock className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
        <p className="text-violet-300/80 text-xs leading-relaxed">
          Your data is AES-256 encrypted and never sold. Ever.
        </p>
      </div>

      {/* CTA */}
      <Button
        onClick={onNext}
        disabled={!valid}
        className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-semibold h-11 text-sm"
      >
        Start Scan
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 2: Live Scan
// ---------------------------------------------------------------------------

function Step2({ onNext }: { onNext: () => void }) {
  const [progress, setProgress] = useState(0)
  const [scanned, setScanned] = useState(0)
  const [total, setTotal] = useState(TOTAL_BROKERS)
  const [currentBroker, setCurrentBroker] = useState(BROKERS[0])
  const [brokerIdx, setBrokerIdx] = useState(0)
  const [done, setDone] = useState(false)
  const [foundCount, setFoundCount] = useState(0)

  // Poll real scan status from the server
  useEffect(() => {
    let stopped = false

    async function poll() {
      try {
        const res = await fetch('/api/scan/status')
        if (!res.ok || stopped) return
        const json = await res.json() as { data: { status: string; progressPercent: number; scanned: number; total: number; found: number } | null }
        const data = json.data
        if (!data || stopped) return

        setFoundCount(data.found ?? 0)
        setScanned(data.scanned ?? 0)
        if ((data.total ?? 0) > 0) setTotal(data.total)

        if (data.status === 'completed' || data.status === 'failed') {
          setProgress(100)
          setScanned(data.total || TOTAL_BROKERS)
          setDone(true)
          return
        }
        setProgress(data.progressPercent ?? 0)
      } catch {
        // Network error — keep polling
      }
    }

    void poll()
    const intervalId = setInterval(poll, 2000)
    return () => {
      stopped = true
      clearInterval(intervalId)
    }
  }, [])

  // Visual: cycle through broker names while scan runs
  useEffect(() => {
    if (done) return
    const interval = setInterval(() => {
      setBrokerIdx(prev => {
        const next = (prev + 1) % BROKERS.length
        setCurrentBroker(BROKERS[next])
        return next
      })
    }, 500)
    return () => clearInterval(interval)
  }, [done])

  // Auto-advance 2 s after scan completes
  useEffect(() => {
    if (!done) return
    const t = setTimeout(onNext, 2000)
    return () => clearTimeout(t)
  }, [done, onNext])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/15 ring-1 ring-violet-500/25 flex items-center justify-center">
              <Scan className="w-7 h-7 text-violet-400" />
            </div>
            {!done && (
              <motion.div
                className="absolute inset-0 rounded-2xl ring-1 ring-violet-400/40"
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {done ? 'Scan Complete' : 'Running Your First Scan'}
        </h2>
        <p className="text-white/50 text-sm">
          {done
            ? `We checked ${total} data broker sites.`
            : 'Searching data broker databases for your information…'}
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-white/40">
          <motion.span
            key={currentBroker}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono"
          >
            {done ? 'All sites checked' : `Scanning ${currentBroker}…`}
          </motion.span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2 bg-white/5 [&>div]:bg-gradient-to-r [&>div]:from-violet-600 [&>div]:to-purple-500" />
        <div className="flex items-center justify-between text-xs text-white/30">
          <span>Scanned: {scanned} / {total}</span>
          {!done && (
            <span className="flex items-center gap-1">
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                ●
              </motion.span>
              Live
            </span>
          )}
        </div>
      </div>

      {/* Live broker scroll list */}
      <div className="bg-white/3 border border-white/5 rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${done ? 'bg-green-400' : 'bg-violet-400 animate-pulse'}`} />
          <span className="text-xs text-white/40 font-mono">
            {done ? 'Scan finished' : 'Scanning…'}
          </span>
        </div>
        <div className="px-4 py-3 h-36 overflow-hidden relative">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={brokerIdx}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.25 }}
              className="text-sm font-mono text-violet-300"
            >
              {done ? (
                <span className="text-green-400">✓ Scan complete</span>
              ) : (
                `› Checking ${currentBroker}...`
              )}
            </motion.div>
          </AnimatePresence>
          {/* Faint past entries */}
          <div className="mt-2 flex flex-col gap-1">
            {BROKERS.slice(Math.max(0, brokerIdx - 4), brokerIdx).reverse().map((b, i) => (
              <div key={b} className="text-xs font-mono text-white/20" style={{ opacity: 0.35 - i * 0.07 }}>
                ✓ {b}
              </div>
            ))}
          </div>
          {/* Fade overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0d0d15] to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Results when done */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/8 border border-green-500/20 rounded-xl px-5 py-4 flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-green-300 font-semibold text-sm mb-0.5">
                Found on {foundCount} sites
              </p>
              <p className="text-green-300/60 text-xs leading-relaxed">
                We&apos;re preparing removal requests for {foundCount} data brokers. Continuing setup…
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!done && (
        <p className="text-center text-white/20 text-xs">
          This usually takes about 8 seconds
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 3: Set Up Your Shield
// ---------------------------------------------------------------------------

function Step3({ onNext }: { onNext: () => void }) {
  const [areaCode, setAreaCode] = useState('')
  const [virtualNumber, setVirtualNumber] = useState<string | null>(null)
  const [numLoading, setNumLoading] = useState(false)
  const [numError, setNumError] = useState<string | null>(null)

  const [aliasLabel, setAliasLabel] = useState('')
  const [emailAlias, setEmailAlias] = useState<string | null>(null)
  const [aliasLoading, setAliasLoading] = useState(false)
  const [aliasError, setAliasError] = useState<string | null>(null)

  async function handleGetNumber() {
    setNumLoading(true)
    setNumError(null)
    const stripped = areaCode.replace(/\D/g, '').slice(0, 3)
    const ac = stripped.length === 3 ? stripped : stripped.length > 0 ? stripped.padEnd(3, '0') : '415'
    try {
      const res = await fetch('/api/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ areaCode: ac }),
      })
      const json = await res.json() as { data?: { number?: string }; error?: string }
      if (!res.ok) {
        setNumError(json.error ?? 'Failed to create phone number')
      } else {
        setVirtualNumber(json.data?.number ?? 'Number created')
      }
    } catch {
      setNumError('Network error — please try again')
    } finally {
      setNumLoading(false)
    }
  }

  async function handleCreateAlias() {
    setAliasLoading(true)
    setAliasError(null)
    const label = aliasLabel.trim() || 'me'
    try {
      const res = await fetch('/api/email-aliases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label }),
      })
      const json = await res.json() as { data?: { alias?: string }; error?: string }
      if (!res.ok) {
        setAliasError(json.error ?? 'Failed to create email alias')
      } else {
        setEmailAlias(json.data?.alias ?? 'Alias created')
      }
    } catch {
      setAliasError('Network error — please try again')
    } finally {
      setAliasLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/15 ring-1 ring-violet-500/25 flex items-center justify-center">
            <Shield className="w-7 h-7 text-violet-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Set Up Your Shield</h2>
        <p className="text-white/50 text-sm leading-relaxed">
          Create a virtual number and email alias to protect your real contact info.
        </p>
      </div>

      {/* Two cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Virtual phone number */}
        <div className="rounded-xl border border-white/8 bg-white/3 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
              <Phone className="w-4 h-4 text-violet-400" />
            </div>
            <span className="text-sm font-semibold text-white">Virtual Phone Number</span>
          </div>

          {virtualNumber ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-500/8 border border-green-500/20 rounded-lg px-4 py-3 text-center"
            >
              <p className="text-green-300 font-mono font-semibold text-lg">{virtualNumber}</p>
              <p className="text-green-300/50 text-xs mt-1">Your virtual number is ready</p>
            </motion.div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <Label className="text-white/50 text-xs">Area Code (optional)</Label>
                <Input
                  value={areaCode}
                  onChange={e => setAreaCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="555"
                  maxLength={3}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-violet-500/50 font-mono"
                />
              </div>
              {numError && (
                <p className="text-red-400 text-xs">{numError}</p>
              )}
              <Button
                onClick={() => { void handleGetNumber() }}
                disabled={numLoading}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white text-sm h-9 disabled:opacity-60"
              >
                {numLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  'Get My Number'
                )}
              </Button>
            </>
          )}
        </div>

        {/* Email alias */}
        <div className="rounded-xl border border-white/8 bg-white/3 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
              <Mail className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-sm font-semibold text-white">Email Alias</span>
          </div>

          {emailAlias ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-500/8 border border-green-500/20 rounded-lg px-4 py-3 text-center"
            >
              <p className="text-green-300 font-mono font-semibold text-sm break-all">{emailAlias}</p>
              <p className="text-green-300/50 text-xs mt-1">Your alias is active</p>
            </motion.div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <Label className="text-white/50 text-xs">Label (e.g. shopping, signups)</Label>
                <Input
                  value={aliasLabel}
                  onChange={e => setAliasLabel(e.target.value)}
                  placeholder="shopping"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-violet-500/50"
                />
              </div>
              {aliasError && (
                <p className="text-red-400 text-xs">{aliasError}</p>
              )}
              <Button
                onClick={() => { void handleCreateAlias() }}
                disabled={aliasLoading}
                className="w-full bg-purple-700 hover:bg-purple-600 text-white text-sm h-9 disabled:opacity-60"
              >
                {aliasLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  'Create Alias'
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Skip note */}
      <p className="text-center text-white/25 text-xs">
        You can skip this and set up numbers & aliases later in Settings.
      </p>

      {/* Continue */}
      <Button
        onClick={onNext}
        className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold h-11 text-sm"
      >
        Continue
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 4: Success
// ---------------------------------------------------------------------------

function Step4() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center gap-6 text-center relative overflow-hidden">
      {/* Confetti dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: [
                '#7C3AED', '#A78BFA', '#6D28D9', '#8B5CF6',
                '#4C1D95', '#DDD6FE', '#C4B5FD',
              ][i % 7],
            }}
            initial={{ y: -20, opacity: 0, scale: 0 }}
            animate={{
              y: [null, Math.random() * 200 + 50],
              opacity: [0, 1, 0],
              scale: [0, 1, 0.5],
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: Math.random() * 2 + 1.5,
              delay: Math.random() * 0.8,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Animated shield */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="relative"
      >
        <div className="w-24 h-24 rounded-full bg-green-500/15 ring-1 ring-green-500/25 flex items-center justify-center">
          <Shield className="w-12 h-12 text-green-400" />
        </div>
        {/* Check overlay */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center ring-2 ring-[#0a0a0f]"
        >
          <Check className="w-4 h-4 text-white font-bold" strokeWidth={3} />
        </motion.div>
        {/* Glow */}
        <div className="absolute inset-0 rounded-full bg-green-500/10 blur-2xl scale-150" />
      </motion.div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-3xl font-bold text-white mb-2">You&apos;re Protected!</h2>
        <p className="text-white/50 text-sm leading-relaxed max-w-xs mx-auto">
          Shielded is actively monitoring and removing your data from the web.
        </p>
      </motion.div>

      {/* Summary stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="grid grid-cols-3 gap-4 w-full"
      >
        {[
          { icon: Shield, value: '76', label: 'Brokers monitored' },
          { icon: Check, value: '✓', label: 'Removal requests sent' },
          { icon: Sparkles, value: '7d', label: 'Scan schedule' },
        ].map(({ icon: Icon, value, label }) => (
          <div
            key={label}
            className="rounded-xl border border-white/5 bg-white/3 p-4 flex flex-col items-center gap-1.5"
          >
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center mb-1">
              <Icon className="w-4 h-4 text-violet-400" />
            </div>
            <span className="text-lg font-bold text-white">{value}</span>
            <span className="text-white/40 text-xs text-center leading-tight">{label}</span>
          </div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full"
      >
        <Button
          onClick={() => router.push('/dashboard')}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold h-12 text-base"
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main wizard component
// ---------------------------------------------------------------------------

const STEP_TITLES = [
  'Secure Your Identity',
  'Running Your First Scan',
  'Set Up Your Shield',
  "You're Protected!",
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    dob: '',
    phone: '',
    city: '',
    state: '',
  })

  function goNext() {
    setDirection(1)
    setStep(s => Math.min(s + 1, 3))
  }

  return (
    <div className="w-full max-w-lg">
      {/* Step indicator */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <StepDots current={step} total={4} />
        <p className="text-white/30 text-xs">
          Step {step + 1} of 4 — {STEP_TITLES[step]}
        </p>
      </div>

      {/* Card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-[#0d0d15] shadow-2xl shadow-black/50">
        {/* Top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

        <div className="p-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            >
              {step === 0 && (
                <Step1
                  onNext={goNext}
                  info={personalInfo}
                  setInfo={setPersonalInfo}
                />
              )}
              {step === 1 && <Step2 onNext={goNext} />}
              {step === 2 && <Step3 onNext={goNext} />}
              {step === 3 && <Step4 />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-center text-white/15 text-xs mt-6">
        By continuing you agree to Shielded&apos;s{' '}
        <span className="underline underline-offset-2 cursor-pointer hover:text-white/30 transition-colors">
          Terms
        </span>{' '}
        and{' '}
        <span className="underline underline-offset-2 cursor-pointer hover:text-white/30 transition-colors">
          Privacy Policy
        </span>
      </p>
    </div>
  )
}
