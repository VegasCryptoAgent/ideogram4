'use client';

/**
 * ScanProgress — real-time scan progress component.
 *
 * Polls /api/scan/status every 2 seconds while a scan is running and
 * displays an animated progress bar, current broker name, and live counts.
 *
 * Props:
 *   jobId       — The ScanJob ID to track. Pass null to render nothing.
 *   onComplete  — Optional callback fired when the scan finishes.
 */

import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScanStatusPayload {
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progressPercent: number;
  currentBroker: string | null;
  scanned: number;
  found: number;
  total: number;
}

interface ScanProgressProps {
  jobId: string | null;
  onComplete?: (result: ScanStatusPayload) => void;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ScanProgress({ jobId, onComplete, className }: ScanProgressProps) {
  const [status, setStatus] = useState<ScanStatusPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!jobId) {
      setStatus(null);
      return;
    }

    const poll = async () => {
      try {
        const res = await fetch(`/api/scan/status?jobId=${jobId}`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = (await res.json()) as { success: boolean; data: ScanStatusPayload };
        if (!json.success) return;

        setStatus(json.data);
        setError(null);

        if (json.data.status === 'completed' || json.data.status === 'failed') {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onComplete?.(json.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Poll error');
      }
    };

    // Immediate first poll.
    void poll();

    // Poll every 2 seconds.
    intervalRef.current = setInterval(poll, 2_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [jobId, onComplete]);

  if (!jobId || !status) return null;

  const { progressPercent, currentBroker, scanned, found, total } = status;
  const isRunning = status.status === 'running' || status.status === 'pending';
  const isComplete = status.status === 'completed';
  const isFailed = status.status === 'failed';

  return (
    <div className={cn('rounded-xl border border-white/10 bg-white/5 p-6', className)}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500" />
            </span>
          )}
          {isComplete && (
            <span className="flex h-2.5 w-2.5 rounded-full bg-green-500" />
          )}
          {isFailed && (
            <span className="flex h-2.5 w-2.5 rounded-full bg-red-500" />
          )}
          <h3 className="text-sm font-semibold text-white">
            {isRunning ? 'Scanning Data Brokers…' : isComplete ? 'Scan Complete' : 'Scan Failed'}
          </h3>
        </div>
        <span className="text-sm font-medium tabular-nums text-white/60">
          {Math.round(progressPercent)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            isComplete ? 'bg-green-500' : isFailed ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500',
          )}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Current broker (animated) */}
      {isRunning && currentBroker && (
        <p className="mb-4 truncate text-xs text-white/50">
          Checking{' '}
          <span className="font-medium text-white/80">{currentBroker}</span>
          <span className="ml-0.5 animate-pulse">…</span>
        </p>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-white/10">
        <Stat label="Scanned" value={scanned} total={total} />
        <Stat label="Found" value={found} highlight={found > 0} />
        <Stat
          label="Remaining"
          value={Math.max(0, total - scanned)}
          muted
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-3 text-xs text-red-400">Connection issue: {error}</p>
      )}

      {/* Completion message */}
      {isComplete && (
        <p className="mt-4 text-center text-sm text-white/60">
          {found > 0
            ? `Found ${found} listing${found !== 1 ? 's' : ''}. Removal requests submitted automatically.`
            : 'No listings found — your data looks clean!'}
        </p>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatProps {
  label: string;
  value: number;
  total?: number;
  highlight?: boolean;
  muted?: boolean;
}

function Stat({ label, value, total, highlight, muted }: StatProps) {
  return (
    <div className="px-4 text-center first:pl-0 last:pr-0">
      <div
        className={cn(
          'text-2xl font-bold tabular-nums',
          highlight ? 'text-red-400' : muted ? 'text-white/40' : 'text-white',
        )}
      >
        {value}
        {total !== undefined && (
          <span className="text-sm font-normal text-white/30">/{total}</span>
        )}
      </div>
      <div className="mt-0.5 text-[11px] uppercase tracking-wide text-white/40">{label}</div>
    </div>
  );
}
