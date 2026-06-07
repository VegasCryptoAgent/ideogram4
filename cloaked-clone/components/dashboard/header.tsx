"use client";

import React, { useState } from "react";
import { Bell, Search, ChevronDown, LogOut, Settings, User, CreditCard } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "removal" | "breach" | "scan" | "alert";
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Data Removed",
    message: "Your data was removed from Spokeo.com",
    time: "2 min ago",
    read: false,
    type: "removal",
  },
  {
    id: "2",
    title: "Breach Alert",
    message: "Your email appeared in a LinkedIn breach",
    time: "1 hour ago",
    read: false,
    type: "breach",
  },
  {
    id: "3",
    title: "Weekly Scan Complete",
    message: "Found 3 new listings. Removal started.",
    time: "6 hours ago",
    read: false,
    type: "scan",
  },
  {
    id: "4",
    title: "Data Removed",
    message: "Your data was removed from BeenVerified",
    time: "Yesterday",
    read: true,
    type: "removal",
  },
];

const typeColors = {
  removal: "bg-green-500/20 text-green-400",
  breach: "bg-red-500/20 text-red-400",
  scan: "bg-violet-500/20 text-violet-400",
  alert: "bg-amber-500/20 text-amber-400",
};

interface HeaderProps {
  title?: string;
}

export default function Header({ title = "Dashboard" }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="h-16 border-b border-white/8 bg-black/20 backdrop-blur-xl flex items-center justify-between px-6 flex-shrink-0">
      {/* Page title */}
      <div>
        <h1 className="text-base font-semibold text-white">{title}</h1>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <Button variant="ghost" size="icon-sm" className="hidden sm:flex">
          <Search className="w-4 h-4" />
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold text-white">
                {unreadCount}
              </span>
            )}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 top-10 w-80 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-sm font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-violet-400 hover:text-violet-300"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-white/5 last:border-0 hover:bg-white/5 cursor-pointer transition-colors ${
                      !notif.read ? "bg-white/3" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                          typeColors[notif.type]
                        }`}
                      >
                        {notif.type === "breach" ? "!" : notif.type === "removal" ? "✓" : "↻"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium truncate">{notif.title}</span>
                          {!notif.read && (
                            <span className="w-2 h-2 bg-violet-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-white/50 mt-0.5">{notif.message}</p>
                        <p className="text-xs text-white/30 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-white/10">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  View all notifications
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 hover:bg-white/5 rounded-xl px-2 py-1.5 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-white">Jane Doe</div>
                <div className="text-xs text-white/40">Pro Plan</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-white/40 hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <CreditCard className="mr-2 h-4 w-4" /> Subscription
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-400 focus:text-red-400 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </header>
  );
}
