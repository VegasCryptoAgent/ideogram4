'use client'

import { useState } from 'react'
import { Mail, Plus, Trash2, Copy, ToggleLeft, ToggleRight, ExternalLink, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface EmailAlias {
  id: string
  alias: string
  label: string
  forwardTo: string
  isActive: boolean
  emailsReceived: number
  spamBlocked: number
  createdAt: string
}

const mockAliases: EmailAlias[] = [
  {
    id: '1',
    alias: 'shopping+abc123@shield.app',
    label: 'Shopping',
    forwardTo: 'user@gmail.com',
    isActive: true,
    emailsReceived: 47,
    spamBlocked: 12,
    createdAt: '2024-10-15',
  },
  {
    id: '2',
    alias: 'newsletters+def456@shield.app',
    label: 'Newsletters',
    forwardTo: 'user@gmail.com',
    isActive: true,
    emailsReceived: 103,
    spamBlocked: 31,
    createdAt: '2024-11-01',
  },
  {
    id: '3',
    alias: 'banking+ghi789@shield.app',
    label: 'Banking',
    forwardTo: 'user@gmail.com',
    isActive: true,
    emailsReceived: 8,
    spamBlocked: 0,
    createdAt: '2024-11-20',
  },
  {
    id: '4',
    alias: 'social+jkl012@shield.app',
    label: 'Social Media',
    forwardTo: 'user@gmail.com',
    isActive: false,
    emailsReceived: 215,
    spamBlocked: 88,
    createdAt: '2024-09-05',
  },
]

export default function EmailPage() {
  const [aliases, setAliases] = useState<EmailAlias[]>(mockAliases)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newForwardTo, setNewForwardTo] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const totalEmails = aliases.reduce((sum, a) => sum + a.emailsReceived, 0)
  const totalSpamBlocked = aliases.reduce((sum, a) => sum + a.spamBlocked, 0)
  const activeAliases = aliases.filter((a) => a.isActive).length

  function handleCopy(alias: string, id: string) {
    navigator.clipboard.writeText(alias)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function handleToggle(id: string) {
    setAliases((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    )
  }

  function handleDelete(id: string) {
    setAliases((prev) => prev.filter((a) => a.id !== id))
  }

  async function handleCreate() {
    if (!newLabel.trim() || !newForwardTo.trim()) return
    setIsCreating(true)
    await new Promise((r) => setTimeout(r, 1200))
    const slug = newLabel.toLowerCase().replace(/[^a-z0-9]/g, '')
    const rand = Math.random().toString(36).slice(2, 8)
    const newAlias: EmailAlias = {
      id: Date.now().toString(),
      alias: `${slug}+${rand}@shield.app`,
      label: newLabel,
      forwardTo: newForwardTo,
      isActive: true,
      emailsReceived: 0,
      spamBlocked: 0,
      createdAt: new Date().toISOString().split('T')[0],
    }
    setAliases((prev) => [newAlias, ...prev])
    setNewLabel('')
    setNewForwardTo('')
    setIsCreating(false)
    setIsCreateOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Email Aliases</h1>
          <p className="text-zinc-400 mt-1">
            Use disposable email addresses to protect your real inbox.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Alias
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle>Create Email Alias</DialogTitle>
              <DialogDescription className="text-zinc-400">
                We'll generate a unique address that forwards to your real email.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Label (what it's for)</Label>
                <Input
                  placeholder="e.g. Shopping, Banking, Newsletters"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Forward emails to</Label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={newForwardTo}
                  onChange={(e) => setNewForwardTo(e.target.value)}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              {newLabel && (
                <div className="bg-violet-950/40 border border-violet-800/40 rounded-lg p-3 text-sm text-violet-300">
                  Your alias will look like:{' '}
                  <span className="font-mono font-medium">
                    {newLabel.toLowerCase().replace(/[^a-z0-9]/g, '')}+abc123@shield.app
                  </span>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isCreating || !newLabel.trim() || !newForwardTo.trim()}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {isCreating ? 'Creating...' : 'Create Alias'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-violet-500/20">
              <Mail className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Active Aliases</p>
              <p className="text-2xl font-bold text-white">{activeAliases}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/20">
              <ExternalLink className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Emails Forwarded</p>
              <p className="text-2xl font-bold text-white">{totalEmails}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/20">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Spam Blocked</p>
              <p className="text-2xl font-bold text-white">{totalSpamBlocked}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info banner */}
      <div className="bg-violet-950/30 border border-violet-700/30 rounded-xl p-4 flex gap-3 items-start">
        <Shield className="w-5 h-5 text-violet-400 mt-0.5 shrink-0" />
        <div className="text-sm text-zinc-300">
          <span className="font-semibold text-violet-300">How it works: </span>
          When you give a website your alias instead of your real email, we forward the mail to you. If
          you ever start getting spam from that alias, just disable or delete it — your real email stays
          clean.
        </div>
      </div>

      {/* Alias list */}
      <div className="space-y-3">
        {aliases.length === 0 && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-16 text-center">
              <Mail className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400">No aliases yet. Create your first one above.</p>
            </CardContent>
          </Card>
        )}
        {aliases.map((alias) => (
          <Card
            key={alias.id}
            className={`bg-white/5 border-white/10 transition-opacity ${
              alias.isActive ? '' : 'opacity-60'
            }`}
          >
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{alias.label}</span>
                    <Badge
                      variant={alias.isActive ? 'default' : 'secondary'}
                      className={
                        alias.isActive
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-zinc-700 text-zinc-400'
                      }
                    >
                      {alias.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-violet-300 font-mono truncate">
                      {alias.alias}
                    </code>
                    <button
                      onClick={() => handleCopy(alias.alias, alias.id)}
                      className="text-zinc-500 hover:text-zinc-300 shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {copiedId === alias.id && (
                      <span className="text-xs text-green-400">Copied!</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Forwards to: {alias.forwardTo} · Created {alias.createdAt}
                  </p>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{alias.emailsReceived}</p>
                    <p className="text-xs text-zinc-500">received</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-red-400">{alias.spamBlocked}</p>
                    <p className="text-xs text-zinc-500">blocked</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={alias.isActive}
                      onCheckedChange={() => handleToggle(alias.id)}
                    />
                    <button
                      onClick={() => handleDelete(alias.id)}
                      className="text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
