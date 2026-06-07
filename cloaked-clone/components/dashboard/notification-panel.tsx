'use client';

/**
 * NotificationPanel — sliding side panel for in-app notifications.
 *
 * Features:
 *  - Animated slide-in from the right (CSS transition)
 *  - Grouped by type with distinct icons
 *  - "Mark all as read" button
 *  - Click individual notification to mark it read
 *  - Time-ago timestamps
 *  - Backdrop click to close
 */

import { useEffect, useRef } from 'react';
import {
  X,
  Bell,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Search,
  CheckCheck,
  Info,
} from 'lucide-react';
import { cn, formatRelativeTime } from '../../lib/utils';

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
  createdAt: Date | string;
  data?: Record<string, unknown>;
}

interface NotificationPanelProps {
  isOpen: boolean;
  notifications: AppNotification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  className?: string;
}

// ─── Notification type config ─────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ReactNode; iconBg: string; iconColor: string }
> = {
  scan_complete: {
    icon: <Search className="h-4 w-4" />,
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-400',
  },
  record_found: {
    icon: <AlertTriangle className="h-4 w-4" />,
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
  },
  record_removed: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-400',
  },
  breach_detected: {
    icon: <ShieldAlert className="h-4 w-4" />,
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-400',
  },
  call_blocked: {
    icon: <Bell className="h-4 w-4" />,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
  },
  alias_forwarded: {
    icon: <Bell className="h-4 w-4" />,
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-400',
  },
  subscription_renewed: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-400',
  },
  subscription_expiring: {
    icon: <AlertTriangle className="h-4 w-4" />,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
  },
  system: {
    icon: <Info className="h-4 w-4" />,
    iconBg: 'bg-white/5',
    iconColor: 'text-white/40',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function NotificationPanel({
  isOpen,
  notifications,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  className,
}: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Close on Escape key.
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when panel is open.
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      {/* Slide-in panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col',
          'border-l border-white/10 bg-[#0f172a] shadow-2xl',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-white/60" />
            <h2 className="text-sm font-semibold text-white">Notifications</h2>
            {unreadCount > 0 && (
              <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-[11px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-white/50 transition-colors hover:bg-white/5 hover:text-white"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close notifications"
              className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <div className="rounded-full bg-white/5 p-4">
                <Bell className="h-6 w-6 text-white/20" />
              </div>
              <p className="text-sm text-white/40">No notifications yet</p>
              <p className="text-xs text-white/20">
                We'll notify you when something important happens.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => onMarkAsRead(notification.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Notification item ────────────────────────────────────────────────────────

interface NotificationItemProps {
  notification: AppNotification;
  onMarkAsRead: () => void;
}

function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const cfg = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.system;

  return (
    <li
      role="button"
      tabIndex={0}
      onClick={() => {
        if (!notification.isRead) onMarkAsRead();
      }}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !notification.isRead) onMarkAsRead();
      }}
      className={cn(
        'relative flex cursor-pointer gap-3 px-5 py-4 transition-colors',
        'hover:bg-white/[0.03]',
        !notification.isRead && 'bg-indigo-500/[0.03]',
      )}
    >
      {/* Unread dot */}
      {!notification.isRead && (
        <span
          aria-hidden="true"
          className="absolute left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-indigo-500"
        />
      )}

      {/* Icon */}
      <div
        className={cn(
          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          cfg.iconBg,
          cfg.iconColor,
        )}
      >
        {cfg.icon}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm leading-snug',
              notification.isRead ? 'font-normal text-white/60' : 'font-semibold text-white',
            )}
          >
            {notification.title}
          </p>
          <span className="shrink-0 text-[11px] text-white/30">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-white/40 line-clamp-2">
          {notification.message}
        </p>
      </div>
    </li>
  );
}
