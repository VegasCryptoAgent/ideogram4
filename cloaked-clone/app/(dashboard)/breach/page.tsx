'use client'

import { useState } from 'react'
import { AlertTriangle, ShieldCheck, RefreshCw, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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

const mockBreaches: Breach[] = [
  {
    id: '1',
    name: 'DataBrokerHub',
    domain: 'databrokerhub.com',
    breachDate: '2024-08-15',
    addedDate: '2024-09-01',
    dataExposed: ['Email', 'Password', 'Phone', 'Name', 'Address'],
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
]

const severityConfig = {
  critical: { label: 'Critical', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  high: { label: 'High', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  medium: { label: 'Medium', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  low: { label: 'Low', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
}

const dataTypeColors: Record<string, string> = {
  Password: 'bg-red-900/40 text-red-300 border-red-700/30',
  Email: 'bg-blue-900/40 text-blue-300 border-blue-700/30',
  Phone: 'bg-purple-900/40 text-purple-300 border-purple-700/30',
  Name: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  Address: 'bg-orange-900/40 text-orange-300 border-orange-700/30',
  'Credit Card': 'bg-red-900/60 text-red-200 border-red-700/50',
  SSN: 'bg-red-950 text-red-200 border-red-800',
  default: 'bg-zinc-800 text-zinc-400 border-zinc-700',
}

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

export default function BreachPage() {
  const [breaches, setBreaches] = useState<Breach[]>(mockBreaches)
  const [isChecking, setIsChecking] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>('1')

  const unread = breaches.filter((b) => !b.isRead).length
  const critical = breaches.filter((b) => b.severity === 'critical').length

  async function handleCheck() {
    setIsChecking(true)
    await new Promise((r) => setTimeout(r, 2500))
    setIsChecking(false)
  }

  function markRead(id: string) {
    setBreaches((prev) => prev.map((b) => (b.id === id ? { ...b, isRead: true } : b)))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Breach Monitor</h1>
          <p className="text-zinc-400 mt-1">
            We check if your email appears in known data breaches.
          </p>
        </div>
        <Button
          onClick={handleCheck}
          disabled={isChecking}
          className="bg-violet-600 hover:bg-violet-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? 'Checking...' : 'Check Now'}
        </Button>
      </div>

      {/* Summary */}
      {unread > 0 && (
        <div className="bg-red-950/40 border border-red-700/40 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-red-300">
              {unread} new {unread === 1 ? 'breach' : 'breaches'} detected
            </p>
            <p className="text-sm text-red-400/80 mt-0.5">
              Your data was found in {unread} new breach{unread !== 1 ? 'es' : ''}. Review the details below and take action.
            </p>
          </div>
        </div>
      )}

      {breaches.length === 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-16 text-center">
            <ShieldCheck className="w-14 h-14 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-semibold text-white">No breaches found</p>
            <p className="text-zinc-400 mt-1">Your email hasn't appeared in any known data breaches.</p>
          </CardContent>
        </Card>
      )}

      {/* Breach list */}
      <div className="space-y-4">
        {breaches.map((breach) => {
          const sev = severityConfig[breach.severity]
          const isExpanded = expandedId === breach.id
          return (
            <Card
              key={breach.id}
              className={`bg-white/5 border-white/10 transition-all ${
                !breach.isRead ? 'border-red-800/40' : ''
              }`}
            >
              <CardContent className="p-5">
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
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                      )}
                      <span className="font-semibold text-white">{breach.name}</span>
                      <Badge className={sev.color}>{sev.label}</Badge>
                      <span className="text-xs text-zinc-500">{formatCount(breach.recordCount)} records</span>
                    </div>
                    <p className="text-sm text-zinc-400">
                      {breach.domain} · Breached {breach.breachDate} · Reported {breach.addedDate}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {breach.dataExposed.map((dt) => (
                        <span
                          key={dt}
                          className={`text-xs px-2 py-0.5 rounded border ${
                            dataTypeColors[dt] || dataTypeColors.default
                          }`}
                        >
                          {dt}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button className="text-zinc-500 hover:text-zinc-300 shrink-0 mt-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                    <p className="text-sm text-zinc-300">{breach.description}</p>
                    <div>
                      <p className="text-sm font-semibold text-white mb-2">What you should do:</p>
                      <ul className="space-y-1.5">
                        {breach.dataExposed.includes('Password') && (
                          <li className="text-sm text-zinc-300 flex items-start gap-2">
                            <span className="text-red-400 mt-0.5">•</span>
                            Change your password for {breach.name} and anywhere you reuse it.
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
                            Be cautious of suspicious calls and SMS — your number is exposed.
                          </li>
                        )}
                        {(breach.dataExposed.includes('Address') || breach.dataExposed.includes('Name')) && (
                          <li className="text-sm text-zinc-300 flex items-start gap-2">
                            <span className="text-blue-400 mt-0.5">•</span>
                            Your personal details may appear on data broker sites. Run a new scan.
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
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
