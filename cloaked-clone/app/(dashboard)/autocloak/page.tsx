"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Wand2,
  Zap,
  Mail,
  MonitorSmartphone,
  Globe,
  Search,
  ChevronRight,
  Trash2,
  Clipboard,
  Check,
  X,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface SiteEntry {
  id: string
  name: string
  category: string
  enabled: boolean
}

const SITES_DATA: SiteEntry[] = [
  // SHOPPING
  { id: "amazon", name: "Amazon", category: "SHOPPING", enabled: true },
  { id: "ebay", name: "eBay", category: "SHOPPING", enabled: false },
  { id: "etsy", name: "Etsy", category: "SHOPPING", enabled: false },
  { id: "walmart", name: "Walmart", category: "SHOPPING", enabled: false },
  { id: "target", name: "Target", category: "SHOPPING", enabled: false },
  { id: "bestbuy", name: "Best Buy", category: "SHOPPING", enabled: false },
  { id: "wayfair", name: "Wayfair", category: "SHOPPING", enabled: false },
  { id: "chewy", name: "Chewy", category: "SHOPPING", enabled: false },
  { id: "nike", name: "Nike", category: "SHOPPING", enabled: false },
  { id: "adidas", name: "Adidas", category: "SHOPPING", enabled: false },
  { id: "asos", name: "ASOS", category: "SHOPPING", enabled: false },
  { id: "shein", name: "Shein", category: "SHOPPING", enabled: false },
  // STREAMING
  { id: "netflix", name: "Netflix", category: "STREAMING", enabled: true },
  { id: "hulu", name: "Hulu", category: "STREAMING", enabled: false },
  { id: "disneyplus", name: "Disney+", category: "STREAMING", enabled: false },
  { id: "hbomax", name: "HBO Max", category: "STREAMING", enabled: false },
  { id: "spotify", name: "Spotify", category: "STREAMING", enabled: true },
  { id: "appletv", name: "Apple TV+", category: "STREAMING", enabled: false },
  { id: "peacock", name: "Peacock", category: "STREAMING", enabled: false },
  { id: "paramount", name: "Paramount+", category: "STREAMING", enabled: false },
  // SOCIAL
  { id: "instagram", name: "Instagram", category: "SOCIAL", enabled: true },
  { id: "tiktok", name: "TikTok", category: "SOCIAL", enabled: false },
  { id: "twitter", name: "Twitter/X", category: "SOCIAL", enabled: false },
  { id: "linkedin", name: "LinkedIn", category: "SOCIAL", enabled: true },
  { id: "facebook", name: "Facebook", category: "SOCIAL", enabled: false },
  { id: "reddit", name: "Reddit", category: "SOCIAL", enabled: false },
  { id: "pinterest", name: "Pinterest", category: "SOCIAL", enabled: false },
  { id: "snapchat", name: "Snapchat", category: "SOCIAL", enabled: false },
  // FOOD DELIVERY
  { id: "doordash", name: "DoorDash", category: "FOOD DELIVERY", enabled: false },
  { id: "ubereats", name: "Uber Eats", category: "FOOD DELIVERY", enabled: false },
  { id: "grubhub", name: "Grubhub", category: "FOOD DELIVERY", enabled: false },
  { id: "instacart", name: "Instacart", category: "FOOD DELIVERY", enabled: false },
  { id: "postmates", name: "Postmates", category: "FOOD DELIVERY", enabled: false },
  { id: "caviar", name: "Caviar", category: "FOOD DELIVERY", enabled: false },
  // TRAVEL
  { id: "airbnb", name: "Airbnb", category: "TRAVEL", enabled: true },
  { id: "booking", name: "Booking.com", category: "TRAVEL", enabled: false },
  { id: "expedia", name: "Expedia", category: "TRAVEL", enabled: false },
  { id: "hotels", name: "Hotels.com", category: "TRAVEL", enabled: false },
  { id: "kayak", name: "Kayak", category: "TRAVEL", enabled: false },
  { id: "delta", name: "Delta", category: "TRAVEL", enabled: false },
  { id: "united", name: "United", category: "TRAVEL", enabled: false },
  { id: "southwest", name: "Southwest", category: "TRAVEL", enabled: false },
  // FINANCE
  { id: "mint", name: "Mint", category: "FINANCE", enabled: false },
  { id: "creditkarma", name: "Credit Karma", category: "FINANCE", enabled: false },
  { id: "nerdwallet", name: "NerdWallet", category: "FINANCE", enabled: false },
  { id: "personalcapital", name: "Personal Capital", category: "FINANCE", enabled: false },
  { id: "acorns", name: "Acorns", category: "FINANCE", enabled: false },
  { id: "robinhood", name: "Robinhood", category: "FINANCE", enabled: false },
  // NEWS
  { id: "nyt", name: "NYT", category: "NEWS", enabled: false },
  { id: "washpost", name: "Washington Post", category: "NEWS", enabled: false },
  { id: "wsj", name: "WSJ", category: "NEWS", enabled: false },
  { id: "atlantic", name: "The Atlantic", category: "NEWS", enabled: false },
  { id: "medium", name: "Medium", category: "NEWS", enabled: false },
  { id: "substack", name: "Substack", category: "NEWS", enabled: false },
  { id: "politico", name: "Politico", category: "NEWS", enabled: false },
  { id: "bloomberg", name: "Bloomberg", category: "NEWS", enabled: false },
  // DATING
  { id: "tinder", name: "Tinder", category: "DATING", enabled: false },
  { id: "bumble", name: "Bumble", category: "DATING", enabled: false },
  { id: "hinge", name: "Hinge", category: "DATING", enabled: false },
  { id: "okcupid", name: "OkCupid", category: "DATING", enabled: false },
  // OTHER
  { id: "dropbox", name: "Dropbox", category: "OTHER", enabled: false },
  { id: "zoom", name: "Zoom", category: "OTHER", enabled: false },
  { id: "slack", name: "Slack", category: "OTHER", enabled: true },
  { id: "github", name: "GitHub", category: "OTHER", enabled: true },
  { id: "notion", name: "Notion", category: "OTHER", enabled: true },
  { id: "figma", name: "Figma", category: "OTHER", enabled: false },
  { id: "canva", name: "Canva", category: "OTHER", enabled: false },
  { id: "duolingo", name: "Duolingo", category: "OTHER", enabled: false },
  { id: "headspace", name: "Headspace", category: "OTHER", enabled: false },
  { id: "calm", name: "Calm", category: "OTHER", enabled: false },
]

interface ActivityEntry {
  id: string
  site: string
  alias: string
  created: string
  emailsBlocked: number
  active: boolean
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const diff = Date.now() - then
  const day = 24 * 60 * 60 * 1000
  if (diff < day) return "today"
  const days = Math.floor(diff / day)
  if (days === 1) return "1 day ago"
  if (days < 7) return `${days} days ago`
  if (days < 14) return "1 week ago"
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 60) return "1 month ago"
  return `${Math.floor(days / 30)} months ago`
}

const CATEGORY_ORDER = [
  "SHOPPING",
  "STREAMING",
  "SOCIAL",
  "FOOD DELIVERY",
  "TRAVEL",
  "FINANCE",
  "NEWS",
  "DATING",
  "OTHER",
]

const CATEGORY_COLORS: Record<string, string> = {
  SHOPPING: "bg-blue-500/20 text-blue-300",
  STREAMING: "bg-purple-500/20 text-purple-300",
  SOCIAL: "bg-pink-500/20 text-pink-300",
  "FOOD DELIVERY": "bg-orange-500/20 text-orange-300",
  TRAVEL: "bg-cyan-500/20 text-cyan-300",
  FINANCE: "bg-green-500/20 text-green-300",
  NEWS: "bg-yellow-500/20 text-yellow-300",
  DATING: "bg-red-500/20 text-red-300",
  OTHER: "bg-zinc-500/20 text-zinc-300",
}

export default function AutoCloakPage() {
  const [extensionInstalled, setExtensionInstalled] = useState(false)
  const [sites, setSites] = useState<SiteEntry[]>(SITES_DATA)
  const [searchQuery, setSearchQuery] = useState("")
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Load user's saved autocloak preferences
  useEffect(() => {
    fetch('/api/autocloak')
      .then(r => r.json())
      .then(json => {
        const saved: { site: string; enabled: boolean }[] = json.data?.settings ?? []
        if (saved.length > 0) {
          const savedMap = Object.fromEntries(saved.map(s => [s.site, s.enabled]))
          setSites(prev => prev.map(s => ({
            ...s,
            enabled: savedMap[s.name] !== undefined ? savedMap[s.name] : s.enabled
          })))
        }
      })
      .catch(() => {})
  }, [])

  // Load real activity from the user's email aliases (AutoCloak-created aliases)
  useEffect(() => {
    fetch('/api/email-aliases')
      .then(r => r.json())
      .then(json => {
        const raw: {
          id: string; alias: string; label?: string | null;
          spamBlocked?: number; isActive?: boolean; createdAt: string
        }[] = json.data?.items ?? json.data ?? json.items ?? []
        setActivityLog(raw.map(a => ({
          id: a.id,
          site: a.label || a.alias.split('@')[0],
          alias: a.alias,
          created: relativeTime(a.createdAt),
          emailsBlocked: a.spamBlocked ?? 0,
          active: a.isActive ?? true,
        })))
      })
      .catch(() => {})
  }, [])

  const enabledCount = sites.filter((s) => s.enabled).length
  const totalEmailsBlocked = activityLog.reduce((sum, entry) => sum + entry.emailsBlocked, 0)
  const totalAliases = activityLog.length

  const filteredSites = sites.filter(
    (site) =>
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const groupedSites = CATEGORY_ORDER.reduce<Record<string, SiteEntry[]>>((acc, category) => {
    const categorySites = filteredSites.filter((s) => s.category === category)
    if (categorySites.length > 0) {
      acc[category] = categorySites
    }
    return acc
  }, {})

  const toggleSite = (id: string) => {
    setSites((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
      const changed = updated.find((s) => s.id === id)
      if (changed) {
        fetch('/api/autocloak', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ site: changed.name, enabled: changed.enabled }),
        }).catch(() => {})
      }
      return updated
    })
  }

  const deleteActivityEntry = (id: string) => {
    setActivityLog((prev) => prev.filter((entry) => entry.id !== id))
    fetch(`/api/email-aliases/${id}`, { method: 'DELETE' }).catch(() => {})
  }

  const copyAlias = async (alias: string, id: string) => {
    try {
      await navigator.clipboard.writeText(alias)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">AutoCloak</h1>
          <p className="text-zinc-400 mt-1">AI-powered alias creation for any website</p>
        </div>
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <AnimatePresence mode="wait">
            {extensionInstalled ? (
              <motion.div
                key="installed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5"
              >
                <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
                <span className="text-sm font-medium text-green-400">Extension Installed ✓</span>
              </motion.div>
            ) : (
              <motion.div
                key="not-installed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => setExtensionInstalled(true)}
                >
                  Install Extension →
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          <span
            className="cursor-pointer text-xs text-zinc-600 hover:text-zinc-500 transition-colors"
            onClick={() => setExtensionInstalled((prev) => !prev)}
          >
            {extensionInstalled ? "Simulate not installed" : "Simulate installed"}
          </span>
        </div>
      </div>

      {/* How It Works Banner */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-white">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                <MonitorSmartphone className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-0.5">Step 1</p>
                <p className="text-sm font-medium text-white">Browse to any signup form</p>
              </div>
            </div>

            <ChevronRight className="hidden sm:block h-5 w-5 text-zinc-600 flex-shrink-0" />
            <div className="sm:hidden h-4 w-px bg-zinc-700" />

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/20 text-yellow-400">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-0.5">Step 2</p>
                <p className="text-sm font-medium text-white">AutoCloak detects the form</p>
              </div>
            </div>

            <ChevronRight className="hidden sm:block h-5 w-5 text-zinc-600 flex-shrink-0" />
            <div className="sm:hidden h-4 w-px bg-zinc-700" />

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20 text-green-400">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-0.5">Step 3</p>
                <p className="text-sm font-medium text-white">A unique alias is created automatically</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Sites Supported", value: "100+", icon: Globe, color: "text-blue-400" },
          { label: "Aliases Auto-Created", value: totalAliases.toString(), icon: Wand2, color: "text-purple-400" },
          { label: "Emails Intercepted", value: totalEmailsBlocked.toString(), icon: Mail, color: "text-green-400" },
          { label: "Sites Enabled", value: enabledCount.toString(), icon: Shield, color: "text-orange-400" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
          >
            <Card className="border-white/10 bg-white/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-zinc-400">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Supported Sites Section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-white">Supported Sites</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              placeholder="Search sites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-white/20"
            />
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {Object.entries(groupedSites).map(([category, categorySites]) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{category}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {categorySites.map((site) => (
                  <motion.div
                    key={site.id}
                    layout
                    className={`flex flex-col gap-2 rounded-xl border p-3 transition-colors duration-150 ${
                      site.enabled
                        ? "border-green-500/30 bg-green-500/5 hover:bg-green-500/8"
                        : "border-white/10 bg-white/5 hover:bg-white/8"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{site.name}</p>
                        <span
                          className={`inline-block mt-0.5 rounded px-1.5 py-0.5 text-xs font-medium ${
                            CATEGORY_COLORS[site.category] ?? "bg-zinc-500/20 text-zinc-300"
                          }`}
                        >
                          {site.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor={`site-${site.id}`}
                        className="cursor-pointer text-xs text-zinc-400"
                      >
                        {site.enabled ? "On" : "Off"}
                      </Label>
                      <Switch
                        id={`site-${site.id}`}
                        checked={site.enabled}
                        onCheckedChange={() => toggleSite(site.id)}
                        className="scale-90"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {Object.keys(groupedSites).length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="mb-3 h-10 w-10 text-zinc-600" />
            <p className="text-zinc-400">No sites match &ldquo;{searchQuery}&rdquo;</p>
            <button
              className="mt-2 text-sm text-zinc-500 underline hover:text-zinc-400"
              onClick={() => setSearchQuery("")}
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Activity Log */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Recent AutoCloak Activity</h2>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Site
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Alias Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Emails Blocked
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {activityLog.map((entry) => (
                    <motion.tr
                      key={entry.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-b border-white/5 transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-white">{entry.site}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs text-zinc-300">
                            {entry.alias}
                          </code>
                          <button
                            onClick={() => copyAlias(entry.alias, entry.id)}
                            className="flex-shrink-0 rounded p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
                            title="Copy alias"
                          >
                            {copiedId === entry.id ? (
                              <Check className="h-3.5 w-3.5 text-green-400" />
                            ) : (
                              <Clipboard className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-zinc-400">{entry.created}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-white">{entry.emailsBlocked}</span>
                      </td>
                      <td className="px-4 py-3">
                        {entry.active ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-2.5 py-1 text-xs font-medium text-green-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-500/15 px-2.5 py-1 text-xs font-medium text-zinc-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                            Paused
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => deleteActivityEntry(entry.id)}
                          className="rounded p-1.5 text-zinc-600 transition-colors hover:bg-red-500/10 hover:text-red-400"
                          title="Delete entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {activityLog.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Mail className="mb-3 h-10 w-10 text-zinc-700" />
              <p className="text-sm text-zinc-500">No activity yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Extension Install Card (shown only when not installed) */}
      <AnimatePresence>
        {!extensionInstalled && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden border-white/10 bg-white/5">
              <CardContent className="p-6">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
                  {/* Text content */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Install the Shield Extension</h3>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed text-zinc-400">
                      AutoCloak works automatically once the extension is installed. It detects signup forms and creates
                      unique aliases instantly — no copy-pasting required.
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        className="bg-[#F97316] hover:bg-orange-600 text-white gap-2"
                        onClick={() => setExtensionInstalled(true)}
                      >
                        <Globe className="h-4 w-4" />
                        Add to Chrome
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10 gap-2"
                      >
                        <Globe className="h-4 w-4" />
                        Add to Firefox
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10 gap-2"
                      >
                        <Globe className="h-4 w-4" />
                        Add to Safari
                      </Button>
                    </div>
                  </div>

                  {/* Browser mockup */}
                  <div className="flex-shrink-0 w-full lg:w-80">
                    {/* Browser chrome */}
                    <div className="overflow-hidden rounded-xl border border-white/20 shadow-2xl">
                      {/* Browser toolbar */}
                      <div className="flex items-center gap-2 border-b border-black/20 bg-zinc-700 px-3 py-2">
                        <div className="flex gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                          <div className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
                        </div>
                        <div className="mx-auto flex-1 rounded-md bg-zinc-600 px-3 py-1 text-center text-xs text-zinc-400">
                          signup.example.com
                        </div>
                        <div className="flex h-5 w-5 items-center justify-center rounded text-zinc-400">
                          <Shield className="h-3.5 w-3.5 text-orange-400" />
                        </div>
                      </div>

                      {/* Page content */}
                      <div className="bg-white p-5">
                        <div className="mb-4 text-center">
                          <p className="text-sm font-semibold text-gray-800">Create your account</p>
                          <p className="text-xs text-gray-500">Sign up to get started</p>
                        </div>

                        {/* Name field */}
                        <div className="mb-3">
                          <label className="mb-1 block text-xs font-medium text-gray-600">Full name</label>
                          <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400">
                            Jane Smith
                          </div>
                        </div>

                        {/* Email field with AutoCloak overlay */}
                        <div className="mb-3">
                          <label className="mb-1 block text-xs font-medium text-gray-600">Email address</label>
                          <div className="relative">
                            <div className="rounded-md border-2 border-orange-400 bg-orange-50 px-3 py-2 text-sm text-gray-400">
                              Email address
                            </div>
                            {/* AutoCloak tooltip */}
                            <div className="absolute -top-10 left-0 right-0 z-10 flex items-center gap-2 rounded-lg border border-orange-200 bg-white px-3 py-1.5 shadow-lg">
                              <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 flex-shrink-0 rounded-full bg-green-400 shadow-[0_0_4px_rgba(74,222,128,0.8)]" />
                                <span className="text-xs font-medium text-gray-700">
                                  AutoCloak will create an alias
                                </span>
                              </div>
                              <div className="ml-auto">
                                <Shield className="h-3.5 w-3.5 text-orange-500" />
                              </div>
                            </div>
                            {/* Arrow pointing down */}
                            <div className="absolute -top-1.5 left-4 h-2.5 w-2.5 rotate-45 border-b border-r border-orange-200 bg-white" />
                          </div>
                        </div>

                        {/* Submit button */}
                        <div className="mt-4 rounded-md bg-gray-800 py-2 text-center text-sm font-medium text-white">
                          Create Account
                        </div>
                      </div>
                    </div>

                    <p className="mt-2 text-center text-xs text-zinc-600">
                      AutoCloak automatically intercepts form fields
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
