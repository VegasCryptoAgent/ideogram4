'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Shield, ShieldOff, Phone, Mail, Plus, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Suppress unused import lint
void ShieldOff

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function sensitivityToSlider(s: string) {
  return s === 'low' ? 16 : s === 'high' ? 83 : 50
}

function sliderToSensitivity(v: number): 'low' | 'medium' | 'high' {
  return v <= 33 ? 'low' : v <= 66 ? 'medium' : 'high'
}

export default function SpamPage() {
  const [blockUnknown, setBlockUnknown] = useState(false)
  const [blockRobocalls, setBlockRobocalls] = useState(true)
  const [sensitivity, setSensitivity] = useState([50])
  const [whitelist, setWhitelist] = useState<string[]>([])
  const [blacklist, setBlacklist] = useState<string[]>([])
  const [newWhitelistItem, setNewWhitelistItem] = useState('')
  const [newBlacklistItem, setNewBlacklistItem] = useState('')
  const [stats, setStats] = useState({ totalSpamCallsBlocked: 0, totalSpamEmailsBlocked: 0, totalBlocked: 0 })
  const [recentBlocked, setRecentBlocked] = useState<{ id: string; from: string; type: 'call' | 'email'; reason: string; blockedAt: string }[]>([])
  const [saving, setSaving] = useState(false)
  const sensitivityTimer = useRef<NodeJS.Timeout | null>(null)

  const fetchAll = useCallback(async () => {
    const [settingsRes, statsRes] = await Promise.allSettled([
      fetch('/api/spam/settings').then((r) => r.json()),
      fetch('/api/spam/stats').then((r) => r.json()),
    ])

    if (settingsRes.status === 'fulfilled') {
      const d = settingsRes.value?.data ?? settingsRes.value
      if (d) {
        setBlockUnknown(d.blockUnknownCallers ?? false)
        setBlockRobocalls(d.blockRobocalls ?? true)
        setSensitivity([sensitivityToSlider(d.spamSensitivity ?? 'medium')])
        setWhitelist(d.whitelist ?? [])
        setBlacklist(d.blacklist ?? [])
      }
    }

    if (statsRes.status === 'fulfilled') {
      const d = statsRes.value?.data ?? statsRes.value
      if (d?.summary) setStats(d.summary)
      if (d?.recentBlocked?.calls) {
        setRecentBlocked(
          d.recentBlocked.calls.slice(0, 5).map((c: any) => ({
            id: c.id,
            from: c.from,
            type: 'call' as const,
            reason: c.spamScore != null ? `Spam score ${Math.round(c.spamScore * 100)}%` : 'Spam detected',
            blockedAt: timeAgo(c.createdAt),
          }))
        )
      }
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function saveSettings(patch: Partial<{ blockUnknownCallers: boolean; blockRobocalls: boolean; spamSensitivity: string }>) {
    setSaving(true)
    await fetch('/api/spam/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    }).catch(() => {})
    setSaving(false)
  }

  function handleBlockUnknown(v: boolean) {
    setBlockUnknown(v)
    saveSettings({ blockUnknownCallers: v })
  }

  function handleBlockRobocalls(v: boolean) {
    setBlockRobocalls(v)
    saveSettings({ blockRobocalls: v })
  }

  function handleSensitivityChange(v: number[]) {
    setSensitivity(v)
    if (sensitivityTimer.current) clearTimeout(sensitivityTimer.current)
    sensitivityTimer.current = setTimeout(() => {
      saveSettings({ spamSensitivity: sliderToSensitivity(v[0]) })
    }, 800)
  }

  async function addToWhitelist() {
    const contact = newWhitelistItem.trim()
    if (!contact || whitelist.includes(contact)) return
    setWhitelist((prev) => [...prev, contact])
    setNewWhitelistItem('')
    await fetch('/api/spam/whitelist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact }),
    }).catch(() => {})
  }

  async function removeFromWhitelist(contact: string) {
    setWhitelist((prev) => prev.filter((i) => i !== contact))
    await fetch('/api/spam/whitelist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact }),
    }).catch(() => {})
  }

  async function addToBlacklist() {
    const contact = newBlacklistItem.trim()
    if (!contact || blacklist.includes(contact)) return
    setBlacklist((prev) => [...prev, contact])
    setNewBlacklistItem('')
    await fetch('/api/spam/blacklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact }),
    }).catch(() => {})
  }

  async function removeFromBlacklist(contact: string) {
    setBlacklist((prev) => prev.filter((i) => i !== contact))
    await fetch('/api/spam/blacklist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact }),
    }).catch(() => {})
  }

  const sensitivityLabel = sensitivity[0] <= 33 ? 'Low' : sensitivity[0] <= 66 ? 'Medium' : 'High'
  const sensitivityDesc =
    sensitivity[0] <= 33
      ? 'Only blocks confirmed spam. May let some spam through.'
      : sensitivity[0] <= 66
      ? 'Balanced filtering. Recommended for most users.'
      : 'Aggressive filtering. May occasionally block legitimate contacts.'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Spam Filter</h1>
        <p className="text-zinc-400 mt-1">
          Control how aggressively we filter spam calls and messages.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-500/20">
              <Phone className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Calls Blocked</p>
              <p className="text-2xl font-bold text-white">{stats.totalSpamCallsBlocked}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-orange-500/20">
              <Mail className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Emails Blocked</p>
              <p className="text-2xl font-bold text-white">{stats.totalSpamEmailsBlocked}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/20">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Total Blocked</p>
              <p className="text-2xl font-bold text-white">{stats.totalBlocked}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Filter Settings */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Filter Settings</CardTitle>
            <CardDescription className="text-zinc-400">
              Configure how spam filtering behaves.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Block Unknown Callers</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Block all calls not in your contacts
                </p>
              </div>
              <Switch checked={blockUnknown} onCheckedChange={handleBlockUnknown} />
            </div>
            {blockUnknown && (
              <div className="bg-yellow-950/30 border border-yellow-700/30 rounded-lg p-3 flex gap-2 text-xs text-yellow-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                This will block ALL unknown numbers, including important calls from new contacts,
                doctors, or businesses. Add trusted numbers to your whitelist.
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Block Robocalls</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Auto-detect and block automated callers
                </p>
              </div>
              <Switch checked={blockRobocalls} onCheckedChange={handleBlockRobocalls} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">Spam Sensitivity</p>
                <Badge
                  className={
                    sensitivityLabel === 'Low'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      : sensitivityLabel === 'Medium'
                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }
                >
                  {sensitivityLabel}
                </Badge>
              </div>
              <Slider
                value={sensitivity}
                onValueChange={handleSensitivityChange}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-zinc-500">{sensitivityDesc}</p>
            </div>
            {saving && <p className="text-xs text-zinc-500">Saving…</p>}
          </CardContent>
        </Card>

        {/* Recent Blocked */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Recently Blocked</CardTitle>
            <CardDescription className="text-zinc-400">
              Last blocked spam calls detected on your virtual numbers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentBlocked.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-8">
                No blocked calls yet — spam logs will appear here once your virtual numbers receive calls.
              </p>
            ) : (
              recentBlocked.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                >
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <Phone className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.from}</p>
                    <p className="text-xs text-zinc-500">{item.reason}</p>
                  </div>
                  <span className="text-xs text-zinc-600 shrink-0">{item.blockedAt}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Whitelist / Blacklist */}
      <Tabs defaultValue="whitelist">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="whitelist" className="data-[state=active]:bg-violet-600">
            Whitelist ({whitelist.length})
          </TabsTrigger>
          <TabsTrigger value="blacklist" className="data-[state=active]:bg-violet-600">
            Blacklist ({blacklist.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="whitelist" className="mt-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-base">Always Allow</CardTitle>
              <CardDescription className="text-zinc-400">
                These numbers and emails will never be blocked, regardless of sensitivity settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Phone number or email address"
                  value={newWhitelistItem}
                  onChange={(e) => setNewWhitelistItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addToWhitelist()}
                  className="bg-zinc-800 border-zinc-700"
                />
                <Button onClick={addToWhitelist} size="icon" className="bg-violet-600 hover:bg-violet-700">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {whitelist.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between p-3 rounded-lg bg-green-950/20 border border-green-800/20"
                  >
                    <span className="text-sm text-white">{item}</span>
                    <button
                      onClick={() => removeFromWhitelist(item)}
                      className="text-zinc-600 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {whitelist.length === 0 && (
                  <p className="text-sm text-zinc-500 text-center py-4">No whitelisted contacts.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blacklist" className="mt-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-base">Always Block</CardTitle>
              <CardDescription className="text-zinc-400">
                These numbers and emails will always be blocked.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Phone number or email address"
                  value={newBlacklistItem}
                  onChange={(e) => setNewBlacklistItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addToBlacklist()}
                  className="bg-zinc-800 border-zinc-700"
                />
                <Button onClick={addToBlacklist} size="icon" className="bg-violet-600 hover:bg-violet-700">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {blacklist.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between p-3 rounded-lg bg-red-950/20 border border-red-800/20"
                  >
                    <span className="text-sm text-white">{item}</span>
                    <button
                      onClick={() => removeFromBlacklist(item)}
                      className="text-zinc-600 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {blacklist.length === 0 && (
                  <p className="text-sm text-zinc-500 text-center py-4">No blacklisted contacts.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
