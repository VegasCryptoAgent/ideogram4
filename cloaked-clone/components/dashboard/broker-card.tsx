'use client';

/**
 * BrokerCard — displays a single data broker record with its current status,
 * removal timeline, and an action button.
 *
 * Props:
 *   record      — BrokerRecord including the nested broker object.
 *   onRequestRemoval — Callback when "Request Removal" is clicked.
 */

import { useState } from 'react';
import { Shield, ExternalLink, Clock, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { cn, formatRelativeTime, formatDate } from '../../lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BrokerStatus =
  | 'scanning'
  | 'found'
  | 'removal_requested'
  | 'removed'
  | 'not_found'
  | 'monitoring';

export interface BrokerRecord {
  id: string;
  status: BrokerStatus;
  foundUrl: string | null;
  requestedAt: Date | string | null;
  removedAt: Date | string | null;
  lastChecked: Date | string;
  broker: {
    id: string;
    name: string;
    website: string;
    category: string;
    optOutUrl: string | null;
    difficulty: string;
    avgRemovalDays: number;
  };
}

interface BrokerCardProps {
  record: BrokerRecord;
  onRequestRemoval?: (recordId: string) => Promise<void>;
  className?: string;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  BrokerStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  scanning: {
    label: 'Scanning',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/20',
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  found: {
    label: 'Found',
    color: 'text-red-400',
    bg: 'bg-red-400/10 border-red-400/20',
    icon: <AlertCircle className="h-3 w-3" />,
  },
  removal_requested: {
    label: 'Removal Requested',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/20',
    icon: <Clock className="h-3 w-3" />,
  },
  removed: {
    label: 'Removed',
    color: 'text-green-400',
    bg: 'bg-green-400/10 border-green-400/20',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  not_found: {
    label: 'Not Found',
    color: 'text-white/40',
    bg: 'bg-white/5 border-white/10',
    icon: <EyeOff className="h-3 w-3" />,
  },
  monitoring: {
    label: 'Monitoring',
    color: 'text-indigo-400',
    bg: 'bg-indigo-400/10 border-indigo-400/20',
    icon: <Eye className="h-3 w-3" />,
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  people_search: 'People Search',
  background_check: 'Background Check',
  marketing: 'Marketing',
  credit_bureau: 'Credit Bureau',
  social_media: 'Social Media',
  genealogy: 'Genealogy',
  business_intelligence: 'Business Intel',
  phone_directory: 'Phone Directory',
  other: 'Other',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'text-green-400',
  medium: 'text-amber-400',
  hard: 'text-red-400',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function BrokerCard({ record, onRequestRemoval, className }: BrokerCardProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const { broker, status } = record;
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.monitoring;

  const handleRequestRemoval = async () => {
    if (!onRequestRemoval || isRequesting) return;
    setIsRequesting(true);
    try {
      await onRequestRemoval(record.id);
    } finally {
      setIsRequesting(false);
    }
  };

  // Compute removal timeline progress percentage.
  const removalProgress = (() => {
    if (status !== 'removal_requested' || !record.requestedAt) return null;
    const started = new Date(record.requestedAt).getTime();
    const totalMs = broker.avgRemovalDays * 24 * 60 * 60 * 1_000;
    const elapsed = Date.now() - started;
    return Math.min(100, Math.round((elapsed / totalMs) * 100));
  })();

  return (
    <div
      className={cn(
        'group relative rounded-xl border border-white/10 bg-white/5 p-5 transition-all duration-200',
        'hover:border-white/20 hover:bg-white/[0.07]',
        status === 'found' && 'border-red-400/20 bg-red-400/5',
        status === 'removed' && 'border-green-400/10',
        className,
      )}
    >
      {/* Top row: logo placeholder + broker info + status badge */}
      <div className="flex items-start gap-4">
        {/* Logo placeholder */}
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
            'bg-gradient-to-br from-white/10 to-white/5 text-white/70',
          )}
          aria-hidden="true"
        >
          {broker.name.charAt(0).toUpperCase()}
        </div>

        {/* Broker info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-white">{broker.name}</h3>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-xs text-white/40">
                  {CATEGORY_LABELS[broker.category] ?? broker.category}
                </span>
                <span className="text-white/20">·</span>
                <span className={cn('text-xs font-medium capitalize', DIFFICULTY_COLORS[broker.difficulty])}>
                  {broker.difficulty} to remove
                </span>
              </div>
            </div>

            {/* Status badge */}
            <span
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
                cfg.bg,
                cfg.color,
              )}
            >
              {cfg.icon}
              {cfg.label}
            </span>
          </div>
        </div>
      </div>

      {/* Removal timeline (only for removal_requested) */}
      {status === 'removal_requested' && removalProgress !== null && (
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-[11px] text-white/40">
            <span>Removal in progress</span>
            <span>~{broker.avgRemovalDays} days total</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700"
              style={{ width: `${removalProgress}%` }}
            />
          </div>
          {record.requestedAt && (
            <p className="mt-1 text-[11px] text-white/30">
              Requested {formatRelativeTime(record.requestedAt)}
            </p>
          )}
        </div>
      )}

      {/* Meta row */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/30">
        {record.removedAt && (
          <span className="flex items-center gap-1 text-green-400/70">
            <CheckCircle2 className="h-3 w-3" />
            Removed {formatDate(record.removedAt)}
          </span>
        )}
        {!record.removedAt && status === 'found' && (
          <span className="flex items-center gap-1 text-red-400/70">
            <AlertCircle className="h-3 w-3" />
            Data exposed
          </span>
        )}
        <span>Last checked {formatRelativeTime(record.lastChecked)}</span>
        {record.foundUrl && (
          <a
            href={record.foundUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-indigo-400/70 transition-colors hover:text-indigo-300"
          >
            <ExternalLink className="h-3 w-3" />
            View listing
          </a>
        )}
      </div>

      {/* Action row */}
      {(status === 'found') && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-white/50">
            Your data is listed on this broker site.
          </p>
          <button
            onClick={handleRequestRemoval}
            disabled={isRequesting}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-150',
              'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95',
              'disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            {isRequesting ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Shield className="h-3 w-3" />
                Request Removal
              </>
            )}
          </button>
        </div>
      )}

      {/* Opt-out URL link for manual action */}
      {status === 'found' && broker.optOutUrl && (
        <p className="mt-2 text-[11px] text-white/25">
          Or opt out manually at{' '}
          <a
            href={broker.optOutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 underline underline-offset-2 hover:text-white/60"
          >
            {broker.website}
          </a>
        </p>
      )}
    </div>
  );
}
