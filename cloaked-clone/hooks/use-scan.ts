'use client';

/**
 * useScan — manages the full lifecycle of a privacy scan.
 *
 * State:
 *   currentJob   — the active ScanJob (null when idle)
 *   isScanning   — true while a scan is pending or running
 *   progress     — latest ScanStatusPayload from the polling endpoint
 *   error        — last error message, or null
 *
 * Methods:
 *   startScan()  — creates a scan job and begins polling
 *   cancelScan() — stops polling (note: does not cancel the server-side job)
 *
 * The hook auto-polls /api/scan/status every 2 seconds while isScanning is
 * true and stops when status becomes 'completed' or 'failed'.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

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

export interface ScanJob {
  id: string;
  status: string;
  createdAt: string;
}

interface UseScanReturn {
  currentJob: ScanJob | null;
  isScanning: boolean;
  progress: ScanStatusPayload | null;
  error: string | null;
  startScan: () => Promise<void>;
  cancelScan: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 2_000;

export function useScan(): UseScanReturn {
  const [currentJob, setCurrentJob] = useState<ScanJob | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState<ScanStatusPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isCancelledRef = useRef(false);

  // ── Polling ───────────────────────────────────────────────────────────────

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const pollStatus = useCallback(async (jobId: string) => {
    try {
      const res = await fetch(`/api/scan/status?jobId=${encodeURIComponent(jobId)}`);

      if (!res.ok) {
        throw new Error(`Status check failed: HTTP ${res.status}`);
      }

      const json = (await res.json()) as { success: boolean; data: ScanStatusPayload; error?: string };

      if (!json.success) {
        throw new Error(json.error ?? 'Unknown error from status endpoint');
      }

      if (isCancelledRef.current) return;

      setProgress(json.data);

      if (json.data.status === 'completed' || json.data.status === 'failed') {
        setIsScanning(false);
        stopPolling();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Poll error';
      setError(msg);
      // Keep polling on transient errors — only stop on terminal states.
    }
  }, [stopPolling]);

  const startPolling = useCallback(
    (jobId: string) => {
      stopPolling();
      isCancelledRef.current = false;

      // Immediate first poll.
      void pollStatus(jobId);

      intervalRef.current = setInterval(() => {
        void pollStatus(jobId);
      }, POLL_INTERVAL_MS);
    },
    [pollStatus, stopPolling],
  );

  // ── startScan ─────────────────────────────────────────────────────────────

  const startScan = useCallback(async () => {
    if (isScanning) return;

    setError(null);
    setProgress(null);
    setIsScanning(true);

    try {
      const res = await fetch('/api/scan', { method: 'POST' });

      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }

      const json = (await res.json()) as { success: boolean; data: { job: ScanJob }; error?: string };

      if (!json.success) {
        throw new Error(json.error ?? 'Failed to start scan');
      }

      const job = json.data.job;
      setCurrentJob(job);
      startPolling(job.id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start scan';
      setError(msg);
      setIsScanning(false);
    }
  }, [isScanning, startPolling]);

  // ── cancelScan ────────────────────────────────────────────────────────────

  const cancelScan = useCallback(() => {
    isCancelledRef.current = true;
    stopPolling();
    setIsScanning(false);
  }, [stopPolling]);

  // ── Cleanup ───────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      isCancelledRef.current = true;
      stopPolling();
    };
  }, [stopPolling]);

  // ── Check for existing scan on mount ─────────────────────────────────────

  useEffect(() => {
    const checkExistingScan = async () => {
      try {
        const res = await fetch('/api/scan/status');
        if (!res.ok) return;

        const json = (await res.json()) as { success: boolean; data: ScanStatusPayload | null };
        if (!json.success || !json.data) return;

        const data = json.data;
        if (data.status === 'pending' || data.status === 'running') {
          setIsScanning(true);
          setProgress(data);
          setCurrentJob({
            id: data.jobId,
            status: data.status,
            createdAt: new Date().toISOString(),
          });
          startPolling(data.jobId);
        }
      } catch {
        // Silently ignore — no active scan.
      }
    };

    void checkExistingScan();
    // Run only once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { currentJob, isScanning, progress, error, startScan, cancelScan };
}
