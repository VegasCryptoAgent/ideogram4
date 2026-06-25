'use client'

import { useState, useEffect } from 'react'
import {
  User, Lock, Bell, CreditCard, Trash2, Download, Eye, EyeOff, Check,
  AlertTriangle, HelpCircle, MessageCircle, Mail, Phone, ChevronDown,
  Shield, FileText, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]

// ── FAQ Item for Support tab ──────────────────────────────────────────────────
function SupportFaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-sm font-medium text-zinc-300 pr-4">{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-zinc-500 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-zinc-400 leading-relaxed border-t border-white/10 pt-4">
          {a}
        </div>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const [saved, setSaved] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null)
  const [checkoutCanceled, setCheckoutCanceled] = useState(false)

  // Billing state (fetched from /api/subscription)
  const [planName, setPlanName] = useState('Free')
  const [planPrice, setPlanPrice] = useState('')
  const [nextBillingDate, setNextBillingDate] = useState('—')
  const [cardOnFile, setCardOnFile] = useState('—')
  const [phoneUsage, setPhoneUsage] = useState('—')
  const [aliasUsage, setAliasUsage] = useState('—')

  const loadSubscription = () => {
    fetch('/api/subscription')
      .then((r) => r.json())
      .then((json) => {
        const d = json.data ?? json
        setPlanName(d.planName ?? 'Free')
        if (d.stripe?.currentPeriodEnd) {
          setNextBillingDate(new Date(d.stripe.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }))
        } else {
          setNextBillingDate('—')
        }
        if (d.usage) {
          const phones = d.limits?.virtualPhones
          const aliases = d.limits?.emailAliases
          setPhoneUsage(`${d.usage.virtualPhones ?? 0} of ${phones === -1 ? 'unlimited' : (phones ?? 0)} used`)
          setAliasUsage(`${d.usage.emailAliases ?? 0} of ${aliases === -1 ? 'unlimited' : (aliases ?? 0)} used`)
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    // Detect post-checkout redirect params
    const params = new URLSearchParams(window.location.search)
    const success = params.get('success')
    const canceled = params.get('canceled')
    const plan = params.get('plan')
    const tab = params.get('tab')

    if (success === 'true') {
      setCheckoutSuccess(plan ?? 'your plan')
      // Sync subscription from Stripe then refresh display
      fetch('/api/subscription/sync', { method: 'POST' })
        .finally(() => loadSubscription())
      // Clean URL without reload
      const clean = `${window.location.pathname}${tab ? `?tab=${tab}` : ''}`
      window.history.replaceState({}, '', clean)
    } else if (canceled === 'true') {
      setCheckoutCanceled(true)
      const clean = `${window.location.pathname}${tab ? `?tab=${tab}` : ''}`
      window.history.replaceState({}, '', clean)
    }

    loadSubscription()
    loadProfile()
  }, [])

  // Profile state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [dob, setDob] = useState('')
  const [phones, setPhones] = useState<string[]>([])
  const [newPhone, setNewPhone] = useState('')
  const [profileLoading, setProfileLoading] = useState(true)

  // Addresses
  const [addresses, setAddresses] = useState<{ id: string; street: string; city: string; state: string; zip: string }[]>([])

  const loadProfile = () => {
    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((json) => {
        const d = json.data ?? json
        if (d.firstName) setFirstName(d.firstName)
        else if (d.name) setFirstName(d.name.split(' ')[0] ?? '')
        if (d.lastName) setLastName(d.lastName)
        else if (d.name) setLastName(d.name.split(' ').slice(1).join(' ') ?? '')
        if (d.email) setEmail(d.email)
        if (d.dateOfBirth) setDob(new Date(d.dateOfBirth).toISOString().split('T')[0])
        if (d.realPhones?.length) setPhones(d.realPhones)
        if (d.addresses?.length) setAddresses(
          d.addresses.map((a: { id: string; street?: string; addressLine1?: string; city: string; state: string; zipCode?: string; zip?: string }) => ({
            id: a.id,
            street: a.street ?? a.addressLine1 ?? '',
            city: a.city,
            state: a.state,
            zip: a.zipCode ?? a.zip ?? '',
          }))
        )
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false))
  }

  // Notifications
  const [emailNotifs, setEmailNotifs] = useState({
    brokerFound: true, removalConfirmed: true, breachAlert: true, weeklyDigest: true, scanComplete: false,
  })
  const [smsNotifs, setSmsNotifs] = useState({
    brokerFound: false, breachAlert: true,
  })

  // Cancel subscription flow
  const [cancelStep, setCancelStep] = useState<0 | 1 | 2 | 3>(0)
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelUnderstood, setCancelUnderstood] = useState(false)

  function saveSection(section: string) {
    setSaved(section)
    setTimeout(() => setSaved(null), 2500)
  }

  function addPhone() {
    if (!newPhone.trim()) return
    setPhones((p) => [...p, newPhone.trim()])
    setNewPhone('')
  }

  function downloadInvoice(date: string, amount: string) {
    const content = `SHIELD PRIVACY, INC.\nInvoice\n\nDate: ${date}\nDescription: Shield Premium Subscription\nAmount: ${amount}\nStatus: Paid\n\nThank you for being a Shield member.\nsupport@shield.id`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `shield-invoice-${date.replace(/\s/g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function exportAliasesCSV() {
    const res = await fetch('/api/email-aliases')
    const json = await res.json()
    const aliases: { alias: string; label?: string; createdAt: string }[] = json.data?.items ?? json.items ?? []
    const rows = aliases.map((a) => `${a.alias},${a.label ?? ''},${email},${a.createdAt?.split('T')[0] ?? ''},0`)
    const csvData = `alias,label,forwarding,created,emails_received\n${rows.join('\n')}\n`
    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'shield-aliases.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  async function exportAliasesJSON() {
    const res = await fetch('/api/email-aliases')
    const json = await res.json()
    const aliases: { alias: string; label?: string; createdAt: string }[] = json.data?.items ?? json.items ?? []
    const jsonData = JSON.stringify({
      exported: new Date().toISOString(),
      account: email,
      aliases: aliases.map((a) => ({ alias: a.alias, label: a.label ?? '', forwarding: email, created: a.createdAt?.split('T')[0] ?? '' })),
    }, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'shield-aliases.json'; a.click()
    URL.revokeObjectURL(url)
  }

  function openCancel() {
    setCancelStep(1)
    setCancelReason('')
    setCancelUnderstood(false)
    setIsCancelOpen(true)
  }

  function closeCancelDialog() {
    setIsCancelOpen(false)
    setCancelStep(0)
  }

  const [billingHistory, setBillingHistory] = useState<{ date: string; description: string; amount: string; status: string }[]>([])
  useEffect(() => {
    // Load invoices from Stripe via subscription portal data
    fetch('/api/subscription')
      .then(r => r.json())
      .then(json => {
        const d = json.data ?? json
        if (d.stripe?.currentPeriodStart && d.planName) {
          const price = d.planName === 'Starter' ? '$4.99' : d.planName === 'Pro' ? '$9.99' : d.planName === 'Ultimate' ? '$19.99' : ''
          if (price) {
            const start = new Date(d.stripe.currentPeriodStart)
            setBillingHistory([
              { date: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), description: `Shield ${d.planName}`, amount: price, status: 'Paid' },
            ])
          }
        }
      }).catch(() => {})
  }, [])

  const CANCEL_REASONS = [
    'Too expensive',
    'Not using it enough',
    'Missing features I need',
    'Found an alternative',
    'Other',
  ]

  const SUPPORT_FAQS = [
    {
      q: 'How do I get a refund?',
      a: 'Contact us within 30 days of purchase. We offer a full, no-questions-asked money-back guarantee. Refunds are processed by a human agent within 3 business days.',
    },
    {
      q: 'What happens when I cancel?',
      a: 'All aliases are disabled within 24 hours of cancellation. Your forwarding stops immediately. All your personal data is permanently deleted from our servers within 30 days.',
    },
    {
      q: 'Can I change my plan?',
      a: 'Yes — upgrade or downgrade anytime in Settings > Plan & Billing. Changes take effect at the next billing cycle.',
    },
    {
      q: 'Do my aliases work after cancellation?',
      a: 'No. Unlike some competitors, Shield immediately stops all alias forwarding upon cancellation. All aliases are permanently disabled within 24 hours.',
    },
    {
      q: 'Is there a family plan?',
      a: 'Yes — Family ($14.99/mo, up to 5 people) and Couple ($12.99/mo, 2 people). Both plans include a shared dashboard and combined alias pool.',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-zinc-400 mt-1">Manage your account, security, and preferences.</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="bg-white/5 border border-white/10 flex-wrap h-auto gap-1">
          <TabsTrigger value="profile" className="data-[state=active]:bg-violet-600">
            <User className="w-4 h-4 mr-1.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-violet-600">
            <Lock className="w-4 h-4 mr-1.5" /> Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-violet-600">
            <Bell className="w-4 h-4 mr-1.5" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="subscription" className="data-[state=active]:bg-violet-600">
            <CreditCard className="w-4 h-4 mr-1.5" /> Plan &amp; Billing
          </TabsTrigger>
          <TabsTrigger value="privacy" className="data-[state=active]:bg-violet-600">
            <Shield className="w-4 h-4 mr-1.5" /> Privacy
          </TabsTrigger>
          <TabsTrigger value="support" className="data-[state=active]:bg-violet-600">
            <HelpCircle className="w-4 h-4 mr-1.5" /> Support
          </TabsTrigger>
        </TabsList>

        {/* ── PROFILE ─────────────────────────────────────────────────────────── */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Personal Information</CardTitle>
              <CardDescription className="text-zinc-400">
                This information is used to find your listings on data broker sites. It is stored encrypted and never sold.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>First Name</Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="bg-zinc-800 border-zinc-700" />
                </div>
                <div className="space-y-1.5">
                  <Label>Last Name</Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-zinc-800 border-zinc-700" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Email Address</Label>
                <Input value={email} disabled className="bg-zinc-900 border-zinc-800 text-zinc-500" />
                <p className="text-xs text-zinc-600">Email cannot be changed. Contact support if needed.</p>
              </div>
              <div className="space-y-1.5">
                <Label>Date of Birth</Label>
                <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="bg-zinc-800 border-zinc-700" />
              </div>
              <div className="space-y-2">
                <Label>Phone Numbers</Label>
                {phones.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={p} readOnly className="bg-zinc-900 border-zinc-800 text-zinc-300" />
                    <Button size="icon" variant="ghost" onClick={() => setPhones((prev) => prev.filter((_, idx) => idx !== i))}>
                      <Trash2 className="w-4 h-4 text-zinc-500 hover:text-red-400" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input placeholder="+1 (555) 000-0000" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="bg-zinc-800 border-zinc-700" />
                  <Button onClick={addPhone} variant="outline" className="border-zinc-700 hover:bg-zinc-800">Add</Button>
                </div>
              </div>
              <Button onClick={async () => {
                try {
                  const res = await fetch('/api/user/profile', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ firstName, lastName, dateOfBirth: dob || null, realPhones: phones }),
                  })
                  if (res.ok) saveSection('profile')
                  else alert('Failed to save profile. Please try again.')
                } catch { alert('Failed to save profile. Please try again.') }
              }} className="bg-violet-600 hover:bg-violet-700">
                {saved === 'profile' ? <><Check className="w-4 h-4 mr-2" /> Saved!</> : 'Save Profile'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Addresses</CardTitle>
              <CardDescription className="text-zinc-400">We scan these addresses on data broker sites.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg bg-white/5">
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-xs">Street</Label>
                    <Input value={addr.street} onChange={(e) => setAddresses((prev) => prev.map((a) => a.id === addr.id ? { ...a, street: e.target.value } : a))} className="bg-zinc-800 border-zinc-700 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">City</Label>
                    <Input value={addr.city} onChange={(e) => setAddresses((prev) => prev.map((a) => a.id === addr.id ? { ...a, city: e.target.value } : a))} className="bg-zinc-800 border-zinc-700 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">State</Label>
                    <Select value={addr.state} onValueChange={(v) => setAddresses((prev) => prev.map((a) => a.id === addr.id ? { ...a, state: v } : a))}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 max-h-48">
                        {US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800 w-full" onClick={() => setAddresses((prev) => [...prev, { id: Date.now().toString(), street: '', city: '', state: 'TX', zip: '' }])}>
                + Add Address
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SECURITY ────────────────────────────────────────────────────────── */}
        <TabsContent value="security" className="mt-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <Label>Current Password</Label>
                <div className="relative">
                  <Input type={showPassword ? 'text' : 'password'} className="bg-zinc-800 border-zinc-700 pr-10" />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>New Password</Label>
                <div className="relative">
                  <Input type={showNewPassword ? 'text' : 'password'} className="bg-zinc-800 border-zinc-700 pr-10" />
                  <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300">
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Confirm New Password</Label>
                <Input type="password" className="bg-zinc-800 border-zinc-700" />
              </div>
              <Button onClick={() => saveSection('password')} className="bg-violet-600 hover:bg-violet-700">
                {saved === 'password' ? <><Check className="w-4 h-4 mr-2" /> Updated!</> : 'Update Password'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── NOTIFICATIONS ───────────────────────────────────────────────────── */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Email Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries({
                brokerFound: 'New data broker listing found',
                removalConfirmed: 'Removal confirmed from a broker',
                breachAlert: 'Data breach affecting your email',
                weeklyDigest: 'Weekly privacy digest',
                scanComplete: 'Scan complete summary',
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <p className="text-sm text-zinc-300">{label}</p>
                  <Switch
                    checked={emailNotifs[key as keyof typeof emailNotifs]}
                    onCheckedChange={(v) => setEmailNotifs((prev) => ({ ...prev, [key]: v }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">SMS Notifications</CardTitle>
              <CardDescription className="text-zinc-400">Text alerts for urgent events only.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries({
                brokerFound: 'New data broker listing found',
                breachAlert: 'Data breach affecting your email (urgent)',
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <p className="text-sm text-zinc-300">{label}</p>
                  <Switch
                    checked={smsNotifs[key as keyof typeof smsNotifs]}
                    onCheckedChange={(v) => setSmsNotifs((prev) => ({ ...prev, [key]: v }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
          <Button onClick={() => saveSection('notifs')} className="bg-violet-600 hover:bg-violet-700">
            {saved === 'notifs' ? <><Check className="w-4 h-4 mr-2" /> Saved!</> : 'Save Preferences'}
          </Button>
        </TabsContent>

        {/* ── PLAN & BILLING ──────────────────────────────────────────────────── */}
        <TabsContent value="subscription" className="mt-6 space-y-6">

          {/* Post-checkout banners */}
          {checkoutSuccess && (
            <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
              <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-green-300 font-medium">Subscription activated!</p>
                <p className="text-green-400/80 text-sm mt-0.5">
                  Your <span className="capitalize">{checkoutSuccess}</span> plan is now active. Your 14-day trial has started.
                </p>
              </div>
              <button onClick={() => setCheckoutSuccess(null)} className="ml-auto text-green-500/60 hover:text-green-400">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {checkoutCanceled && (
            <div className="flex items-start gap-3 bg-zinc-700/40 border border-white/10 rounded-xl px-4 py-3">
              <AlertTriangle className="w-5 h-5 text-zinc-400 mt-0.5 flex-shrink-0" />
              <p className="text-zinc-300 text-sm">Checkout was canceled. Your plan was not changed.</p>
              <button onClick={() => setCheckoutCanceled(false)} className="ml-auto text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Current plan */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Current Plan</CardTitle>
                <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 px-3 py-1">
                  {planName}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">
                  {planName === 'Starter' ? '$4.99' : planName === 'Pro' ? '$9.99' : planName === 'Ultimate' ? '$19.99' : planPrice || '—'}
                </span>
                {planName !== 'Free' && <span className="text-zinc-400 text-sm">/ month</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {[
                  ['Weekly scans', '✓'],
                  ['200+ brokers covered', '✓'],
                  ['Virtual phone numbers', phoneUsage],
                  ['Email aliases', aliasUsage],
                  ['Breach monitoring', '✓'],
                  ['Password manager', '✓'],
                ].map(([label, val]) => (
                  <div key={label as string} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-zinc-400">{label}</span>
                    <span className="text-white font-medium">{val}</span>
                  </div>
                ))}
              </div>

              <Separator className="bg-white/10" />

              {/* Next billing + card on file */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Next billing date</p>
                  <p className="text-white font-semibold">{nextBillingDate}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Card on file</p>
                    <p className="text-white font-semibold">{cardOnFile}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-zinc-700 hover:bg-zinc-800 text-xs"
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/subscription/portal', { method: 'POST' })
                        const d = await res.json()
                        const url = d.data?.url ?? d.url
                        if (url) window.open(url, '_blank')
                        else alert(d.data?.error ?? d.error ?? 'Could not open billing portal.')
                      } catch {
                        alert('Failed to open billing portal. Please try again.')
                      }
                    }}
                  >
                    Manage
                  </Button>
                </div>
              </div>

              {/* Plan upgrade options */}
              <div className="space-y-3">
                <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">Change plan</p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { planId: 'starter', label: 'Starter', price: '$4.99/mo' },
                    { planId: 'pro',     label: 'Pro',     price: '$9.99/mo' },
                    { planId: 'ultimate',label: 'Ultimate',price: '$19.99/mo' },
                  ].map(({ planId, label, price }) => (
                    <Button
                      key={planId}
                      variant="outline"
                      className="border-zinc-700 hover:bg-zinc-800 gap-2"
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/subscription/create', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ planId }),
                          })
                          const json = await res.json()
                          const url = json.data?.url ?? json.url
                          if (url) window.location.href = url
                          else alert(json.data?.error ?? json.error ?? 'Could not start checkout. Ensure Stripe price IDs are configured in Railway.')
                        } catch {
                          alert('Failed to connect to billing. Please try again.')
                        }
                      }}
                    >
                      {label}
                      <Badge className="bg-zinc-700 text-zinc-300 text-xs ml-1">{price}</Badge>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator className="bg-white/10" />

              <button
                onClick={openCancel}
                className="text-sm text-zinc-500 hover:text-red-400 transition-colors underline underline-offset-2"
              >
                Cancel subscription
              </button>
            </CardContent>
          </Card>

          {/* Billing history */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Billing History</CardTitle>
              <CardDescription className="text-zinc-400">Your recent invoices.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2 text-zinc-500 font-medium">Date</th>
                      <th className="text-left py-2 text-zinc-500 font-medium">Description</th>
                      <th className="text-left py-2 text-zinc-500 font-medium">Amount</th>
                      <th className="text-left py-2 text-zinc-500 font-medium">Status</th>
                      <th className="text-left py-2 text-zinc-500 font-medium">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingHistory.length === 0 ? (
                      <tr><td colSpan={5} className="py-6 text-center text-zinc-500 text-sm">No billing history yet.</td></tr>
                    ) : billingHistory.map((row) => (
                      <tr key={row.date} className="border-b border-white/5 last:border-0">
                        <td className="py-3 text-zinc-300">{row.date}</td>
                        <td className="py-3 text-zinc-300">{row.description}</td>
                        <td className="py-3 text-white font-medium">{row.amount}</td>
                        <td className="py-3">
                          <Badge className="bg-green-500/15 text-green-400 border-green-500/20 text-xs">
                            {row.status}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => downloadInvoice(row.date, row.amount)}
                            className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span className="text-xs">Download</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Cancellation multi-step dialog */}
          <Dialog open={isCancelOpen} onOpenChange={(open) => { if (!open) closeCancelDialog() }}>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
              {/* Step 1: What you'll lose */}
              {cancelStep === 1 && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-white text-xl">Before you go...</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                      Cancelling Shield means losing access to all of these protections.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    {[
                      'Unlimited email aliases — all will stop forwarding',
                      'Active data broker removals — requests stop immediately',
                      'Virtual phone numbers — calls and texts will stop routing',
                      'Dark web & SSN monitoring alerts',
                      'Spam call blocking via Call Guard',
                      'Password manager vault access',
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-zinc-300">{item}</span>
                      </div>
                    ))}
                  </div>
                  <DialogFooter className="gap-2 sm:gap-2">
                    <Button variant="ghost" onClick={closeCancelDialog} className="text-zinc-400 hover:text-white">
                      Keep my plan
                    </Button>
                    <Button
                      className="bg-zinc-700 hover:bg-zinc-600 text-white"
                      onClick={() => setCancelStep(2)}
                    >
                      Continue cancelling
                    </Button>
                  </DialogFooter>
                </>
              )}

              {/* Step 2: Why are you leaving? */}
              {cancelStep === 2 && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-white text-xl">Why are you leaving?</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                      Your feedback helps us improve Shield for everyone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2 py-2">
                    {CANCEL_REASONS.map((reason) => (
                      <label
                        key={reason}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          cancelReason === reason
                            ? 'border-violet-500/50 bg-violet-500/10'
                            : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                        }`}
                      >
                        <input
                          type="radio"
                          name="cancel-reason"
                          value={reason}
                          checked={cancelReason === reason}
                          onChange={() => setCancelReason(reason)}
                          className="accent-violet-500"
                        />
                        <span className="text-sm text-zinc-300">{reason}</span>
                      </label>
                    ))}
                  </div>
                  <DialogFooter className="gap-2 sm:gap-2">
                    <Button variant="ghost" onClick={() => setCancelStep(1)} className="text-zinc-400 hover:text-white">
                      Back
                    </Button>
                    <Button
                      className="bg-zinc-700 hover:bg-zinc-600 text-white"
                      disabled={!cancelReason}
                      onClick={() => setCancelStep(3)}
                    >
                      Continue
                    </Button>
                  </DialogFooter>
                </>
              )}

              {/* Step 3: Data deletion confirmation */}
              {cancelStep === 3 && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-white text-xl">Your data will be deleted</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                      Here's exactly what happens when you cancel Shield.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    {[
                      'All aliases will be permanently disabled within 24 hours',
                      'Your forwarding will stop immediately upon cancellation',
                      'All your data will be deleted within 30 days',
                      'You will NOT continue to receive calls/texts through Shield after cancellation',
                      'You can export your data before cancelling',
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-zinc-300">{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cancelUnderstood}
                        onChange={(e) => setCancelUnderstood(e.target.checked)}
                        className="mt-0.5 accent-red-500"
                      />
                      <span className="text-sm text-zinc-400">
                        I understand my aliases will be disabled and my data will be permanently deleted.
                      </span>
                    </label>
                  </div>

                  <DialogFooter className="gap-2 sm:gap-2">
                    <Button variant="ghost" onClick={() => setCancelStep(2)} className="text-zinc-400 hover:text-white">
                      Back
                    </Button>
                    <Button
                      className="bg-red-700 hover:bg-red-600 text-white disabled:opacity-40"
                      disabled={!cancelUnderstood}
                      onClick={closeCancelDialog}
                    >
                      Confirm Cancellation
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ── PRIVACY ─────────────────────────────────────────────────────────── */}
        <TabsContent value="privacy" className="mt-6 space-y-6">

          {/* Data Export */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Data Export</CardTitle>
              <CardDescription className="text-zinc-400">
                Download a copy of all your data stored in Shield.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                <Download className="w-4 h-4 mr-2" />
                Download My Data
              </Button>
            </CardContent>
          </Card>

          {/* Alias Data Portability — NEW */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Export Your Aliases</CardTitle>
              <CardDescription className="text-zinc-400">
                Download all your email aliases, phone numbers, and activity data as CSV or JSON.
                You own your data — take it with you.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="border-zinc-700 hover:bg-zinc-800"
                onClick={exportAliasesCSV}
              >
                <Download className="w-4 h-4 mr-2" />
                Export as CSV
              </Button>
              <Button
                variant="outline"
                className="border-zinc-700 hover:bg-zinc-800"
                onClick={exportAliasesJSON}
              >
                <Download className="w-4 h-4 mr-2" />
                Export as JSON
              </Button>
            </CardContent>
          </Card>

          {/* Shield Data Commitments — NEW */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                Shield's Data Commitments
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Our ironclad privacy promises to you — in plain language.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                'We never sell your data to third parties',
                'We never monetize your usage data',
                'All aliases stop working immediately upon cancellation',
                'Your data is permanently deleted within 30 days of cancellation',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-400" strokeWidth={2.5} />
                  </div>
                  <span className="text-sm text-zinc-300">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Delete Account */}
          <Card className="bg-red-950/20 border-red-900/30">
            <CardHeader>
              <CardTitle className="text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Delete Account
              </CardTitle>
              <CardDescription className="text-red-400/70">
                Permanently delete your account, cancel your subscription, release all virtual phone numbers,
                and erase all your data from Shield servers. This cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="bg-red-700 hover:bg-red-600">
                    Delete My Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-red-400">Delete Account</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                      This will permanently delete all your data. Type{' '}
                      <strong className="text-white">DELETE</strong> to confirm.
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    placeholder="Type DELETE to confirm"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    className="bg-zinc-800 border-zinc-700"
                  />
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                    <Button
                      variant="destructive"
                      disabled={deleteConfirm !== 'DELETE'}
                      className="bg-red-700 hover:bg-red-600 disabled:opacity-40"
                    >
                      Permanently Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SUPPORT ─────────────────────────────────────────────────────────── */}
        <TabsContent value="support" className="mt-6 space-y-6">

          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-white">Real humans. Not chatbots.</h2>
              <Badge className="bg-green-500/15 text-green-400 border-green-500/25 text-xs px-2.5 py-1">
                24/7 Human Support
              </Badge>
            </div>
            <p className="text-zinc-400 text-sm">
              Every Shield support interaction is handled by a real person. No AI bots, no scripts.
            </p>
          </div>

          {/* Support channel cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Live Chat */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-5 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Live Chat</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Real support agents available Mon–Sun, 8am–10pm ET. Avg response: under 3 minutes.
                  </p>
                </div>
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm">
                  Start Chat
                </Button>
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-5 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Email</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    support@shield.id — We reply within 2 hours. Every ticket is handled by a real human agent.
                  </p>
                </div>
                <a href="mailto:support@shield.id">
                  <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 text-sm">
                    Send Email
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* Phone */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-5 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Phone</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    1-800-SHIELD-1 — Mon–Fri 9am–6pm ET. Speak directly to a support agent.
                  </p>
                </div>
                <a href="tel:18007443531">
                  <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 text-sm">
                    Call Now
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Guarantee box */}
          <div className="bg-green-500/10 border border-green-500/25 rounded-xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-green-400" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-white font-semibold mb-1">30-day money-back guarantee</p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                No questions asked. Full refund processed within 3 business days by a real human agent.
                Contact us anytime within 30 days of your purchase.
              </p>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h3 className="text-white font-semibold mb-3">Frequently Asked Questions</h3>
            <div className="space-y-2">
              {SUPPORT_FAQS.map((faq) => (
                <SupportFaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
