'use client';

/**
 * useNotifications — manages in-app notifications with auto-refresh.
 *
 * State:
 *   notifications   — array of Notification objects (newest first)
 *   unreadCount     — number of unread notifications
 *   isLoading       — true during the initial fetch
 *   error           — last fetch error, or null
 *
 * Methods:
 *   fetchNotifications()  — manually refresh the list
 *   markAsRead(id)        — marks a single notification as read
 *   markAllAsRead()       — marks all notifications as read
 *
 * Auto-refreshes every 30 seconds while the component is mounted.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType =
  | 'scan_complete'
  | 'record_found'
  | 'record_removed'
  | 'breach_detected'
  | 'call_blocked'
  | 'alias_forwarded'
  | 'subscription_renewed'
  | 'subscription_expiring'
  | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data: Record<string, unknown> | null;
  createdAt: string;
}

interface UseNotificationsReturn {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

const REFRESH_INTERVAL_MS = 30_000;

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=50');

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = (await res.json()) as {
        success: boolean;
        data: { notifications: AppNotification[] };
        error?: string;
      };

      if (!json.success) {
        throw new Error(json.error ?? 'Failed to load notifications');
      }

      setNotifications(json.data.notifications);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── markAsRead ────────────────────────────────────────────────────────────

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update.
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );

    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch {
      // Roll back optimistic update on failure.
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)),
      );
    }
  }, []);

  // ── markAllAsRead ─────────────────────────────────────────────────────────

  const markAllAsRead = useCallback(async () => {
    // Optimistic update.
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch {
      // Re-fetch to restore correct state on failure.
      void fetchNotifications();
    }
  }, [fetchNotifications]);

  // ── Auto-refresh ──────────────────────────────────────────────────────────

  useEffect(() => {
    // Initial load.
    void fetchNotifications();

    // Schedule periodic refresh.
    intervalRef.current = setInterval(() => {
      void fetchNotifications();
    }, REFRESH_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
