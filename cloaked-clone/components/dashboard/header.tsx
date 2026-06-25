"use client";

import React, { useState, useEffect } from "react";
import { Bell, ChevronDown, LogOut, Settings, User, CreditCard } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "removal" | "breach" | "scan" | "alert";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString();
}

// Map API notification types to header display types
function mapNotifType(type: string): Notification["type"] {
  if (type.includes("removed") || type.includes("removal")) return "removal";
  if (type.includes("breach")) return "breach";
  if (type.includes("scan")) return "scan";
  return "alert";
}

const typeIcon: Record<string, string> = { removal: "✓", breach: "!", scan: "↻", alert: "⚠" };
const typeBg: Record<string, string> = {
  removal: "bg-green-500/20 text-green-400",
  breach: "bg-red-500/20 text-red-400",
  scan: "bg-orange-500/20 text-orange-400",
  alert: "bg-amber-500/20 text-amber-400",
};

interface HeaderProps {
  title?: string;
}

export default function Header({ title = "Dashboard" }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userName, setUserName] = useState("");
  const [userPlan, setUserPlan] = useState("Free");

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((json) => {
        const raw: { id: string; type: string; title: string; message: string; isRead: boolean; createdAt: string }[] =
          json.data?.items ?? json.data ?? [];
        setNotifications(
          raw.map((n) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            time: timeAgo(n.createdAt),
            read: n.isRead,
            type: mapNotifType(n.type),
          }))
        );
      })
      .catch(() => {});

    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((json) => {
        const d = json.data ?? json;
        const name = d.name || [d.firstName, d.lastName].filter(Boolean).join(" ") || d.email || "";
        if (name) setUserName(name);
        if (d.planId) setUserPlan(d.planId.charAt(0).toUpperCase() + d.planId.slice(1) + " Plan");
      })
      .catch(() => {});
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const initials = userName
    ? userName.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : "—";

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    fetch("/api/notifications", { method: "POST" }).catch(() => {});
  };

  return (
    <header className="h-16 border-b border-white/10 bg-[#141410] flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-base font-semibold text-white">{title}</h1>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/8 transition-colors text-white/50 hover:text-white"
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-11 w-80 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <h3 className="text-sm font-semibold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-orange-400 hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-white/40">No notifications yet</div>
                )}
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 cursor-pointer transition-colors ${!notif.read ? "bg-violet-600/10" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${typeBg[notif.type]}`}>
                        {typeIcon[notif.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-white truncate">{notif.title}</span>
                          {!notif.read && <span className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-white/50 mt-0.5">{notif.message}</p>
                        <p className="text-xs text-white/30 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 hover:bg-white/8 rounded-xl px-2.5 py-1.5 transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-violet-600 text-white text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-white">{userName || "Loading…"}</div>
                <div className="text-xs text-white/40">{userPlan}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-white/30 hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 bg-zinc-900 border-white/10 rounded-xl shadow-lg">
            <DropdownMenuLabel className="text-white">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer text-white/80 hover:text-white">
                <User className="mr-2 h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer text-white/80 hover:text-white">
                <CreditCard className="mr-2 h-4 w-4" /> Subscription
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer text-white/80 hover:text-white">
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              className="text-red-400 focus:text-red-400 cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {showNotifications && (
        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
      )}
    </header>
  );
}
