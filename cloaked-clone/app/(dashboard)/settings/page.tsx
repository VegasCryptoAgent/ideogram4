'use client'

import { useState } from 'react'
import { User, Lock, Bell, CreditCard, Trash2, Download, Eye, EyeOff, Check, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]

export default function SettingsPage() {
  const [saved, setSaved] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // Profile state
  const [firstName, setFirstName] = useState('James')
  const [lastName, setLastName] = useState('Reeves')
  const [email] = useState('jreeves@gmail.com')
  const [dob, setDob] = useState('1985-06-14')
  const [phones, setPhones] = useState(['+1 (555) 867-5309'])
  const [newPhone, setNewPhone] = useState('')

  // Addresses
  const [addresses, setAddresses] = useState([
    { id: '1', street: '123 Main St', city: 'Austin', state: 'TX', zip: '78701' },
  ])

  // Notifications
  const [emailNotifs, setEmailNotifs] = useState({
    brokerFound: true, removalConfirmed: true, breachAlert: true, weeklyDigest: true, scanComplete: false,
  })
  const [smsNotifs, setSmsNotifs] = useState({
    brokerFound: false, breachAlert: true,
  })

  function saveSection(section: string) {
    setSaved(section)
    setTimeout(() => setSaved(null), 2500)
  }

  function addPhone() {
    if (!newPhone.trim()) return
    setPhones((p) => [...p, newPhone.trim()])
    setNewPhone('')
  }

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
            <CreditCard className="w-4 h-4 mr-1.5" /> Subscription
          </TabsTrigger>
          <TabsTrigger value="privacy" className="data-[state=active]:bg-violet-600">
            <Trash2 className="w-4 h-4 mr-1.5" /> Privacy
          </TabsTrigger>
        </TabsList>

        {/* PROFILE */}
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
              <Button onClick={() => saveSection('profile')} className="bg-violet-600 hover:bg-violet-700">
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

        {/* SECURITY */}
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

        {/* NOTIFICATIONS */}
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

        {/* SUBSCRIPTION */}
        <TabsContent value="subscription" className="mt-6 space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Current Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-base px-3 py-1">
                  Pro
                </Badge>
                <span className="text-zinc-400">$9.99 / month</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Weekly scans', '✓'],
                  ['200+ brokers', '✓'],
                  ['3 virtual phones', '1 of 3 used'],
                  ['20 email aliases', '4 of 20 used'],
                  ['Breach monitoring', '✓'],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-zinc-400">{label}</span>
                    <span className="text-white">{val}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                  Manage Billing
                </Button>
                <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-950/30">
                  Cancel Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PRIVACY */}
        <TabsContent value="privacy" className="mt-6 space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Data Export</CardTitle>
              <CardDescription className="text-zinc-400">
                Download a copy of all your data stored in Shielded.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                <Download className="w-4 h-4 mr-2" />
                Download My Data
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-red-950/20 border-red-900/30">
            <CardHeader>
              <CardTitle className="text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Delete Account
              </CardTitle>
              <CardDescription className="text-red-400/70">
                Permanently delete your account, cancel your subscription, release all virtual phone numbers, and erase all your data from Shielded servers. This cannot be undone.
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
                      This will permanently delete all your data. Type <strong className="text-white">DELETE</strong> to confirm.
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
      </Tabs>
    </div>
  )
}
