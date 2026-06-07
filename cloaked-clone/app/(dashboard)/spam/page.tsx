'use client'

import { useState } from 'react'
import { Shield, ShieldOff, Phone, Mail, Plus, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const recentBlocked = [
  { id: '1', from: '+1 (800) 555-0192', type: 'call', reason: 'Known robocall', blockedAt: '2 hours ago' },
  { id: '2', from: 'spam@deals4you.net', type: 'email', reason: 'Spam pattern', blockedAt: '5 hours ago' },
  { id: '3', from: '+1 (900) 123-4567', type: 'call', reason: 'Premium rate number', blockedAt: '1 day ago' },
  { id: '4', from: 'noreply@phishing-site.com', type: 'email', reason: 'Phishing detected', blockedAt: '1 day ago' },
  { id: '5', from: '+1 (844) 987-6543', type: 'call', reason: 'Telemarketer', blockedAt: '2 days ago' },
]

export default function SpamPage() {
  const [blockUnknown, setBlockUnknown] = useState(false)
  const [blockRobocalls, setBlockRobocalls] = useState(true)
  const [sensitivity, setSensitivity] = useState([50])
  const [whitelist, setWhitelist] = useState(['+1 (555) 234-5678', 'doctor@myhealth.com'])
  const [blacklist, setBlacklist] = useState(['+1 (800) 555-9999'])
  const [newWhitelistItem, setNewWhitelistItem] = useState('')
  const [newBlacklistItem, setNewBlacklistItem] = useState('')

  const sensitivityLabel =
    sensitivity[0] <= 33 ? 'Low' : sensitivity[0] <= 66 ? 'Medium' : 'High'
  const sensitivityDesc =
    sensitivity[0] <= 33
      ? 'Only blocks confirmed spam. May let some spam through.'
      : sensitivity[0] <= 66
      ? 'Balanced filtering. Recommended for most users.'
      : 'Aggressive filtering. May occasionally block legitimate contacts.'

  function addToWhitelist() {
    if (!newWhitelistItem.trim()) return
    setWhitelist((prev) => [...prev, newWhitelistItem.trim()])
    setNewWhitelistItem('')
  }

  function addToBlacklist() {
    if (!newBlacklistItem.trim()) return
    setBlacklist((prev) => [...prev, newBlacklistItem.trim()])
    setNewBlacklistItem('')
  }

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
              <p className="text-2xl font-bold text-white">247</p>
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
              <p className="text-2xl font-bold text-white">131</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/20">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">This Month</p>
              <p className="text-2xl font-bold text-white">38</p>
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
              <Switch checked={blockUnknown} onCheckedChange={setBlockUnknown} />
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
              <Switch checked={blockRobocalls} onCheckedChange={setBlockRobocalls} />
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
                onValueChange={setSensitivity}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-zinc-500">{sensitivityDesc}</p>
            </div>
            <Button className="w-full bg-violet-600 hover:bg-violet-700">Save Settings</Button>
          </CardContent>
        </Card>

        {/* Recent Blocked */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Recently Blocked</CardTitle>
            <CardDescription className="text-zinc-400">
              Last 5 blocked calls and emails.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentBlocked.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
              >
                <div
                  className={`p-2 rounded-lg ${
                    item.type === 'call' ? 'bg-red-500/20' : 'bg-orange-500/20'
                  }`}
                >
                  {item.type === 'call' ? (
                    <Phone className="w-4 h-4 text-red-400" />
                  ) : (
                    <Mail className="w-4 h-4 text-orange-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{item.from}</p>
                  <p className="text-xs text-zinc-500">{item.reason}</p>
                </div>
                <span className="text-xs text-zinc-600 shrink-0">{item.blockedAt}</span>
              </div>
            ))}
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
                      onClick={() => setWhitelist((prev) => prev.filter((i) => i !== item))}
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
                      onClick={() => setBlacklist((prev) => prev.filter((i) => i !== item))}
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
