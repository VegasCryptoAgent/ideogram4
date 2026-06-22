"use client";

import React, { useState } from "react";
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

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "1", title: "Data Removed", message: "Your data was removed from Spokeo.com", time: "2 min ago", read: false, type: "removal" },
  { id: "2", title: "Breach Alert", message: "Your email appeared in a LinkedIn breach", time: "1 hour ago", read: false, type: "breach" },
  { id: "3", title: "Weekly Scan Complete", message: "Found 3 new listings. Removal started.", time: "6 hours ago", read: false, type: "scan" },
  { id: "4", title: "Data Removed", message: "Your data was removed from BeenVerified", time: "Yesterday", read: true, type: "removal" },
];

const typeIcon: Record<string, string> = { removal: "✓", breach: "!", scan: "↻", alert: "⚠" };
const typeBg: Record<string, string> = {
  removal: "bg-green-100 text-green-700",
  breach: "bg-red-100 text-red-700",
  scan: "bg-[#F97316]/10 text-[#F97316]",
  alert: "bg-amber-100 text-amber-700",
};

interface HeaderProps {
  title?: string;
}

export default function Header({ title = "Dashboard" }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <header className="h-16 border-b border-[#D4CFC5] bg-white flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-base font-semibold text-[#1A1A14]">{title}</h1>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#E8E3D9] transition-colors text-[#1A1A14]/50 hover:text-[#1A1A14]"
          >
            <Bell className="w-4.5 h-4.5 w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-11 w-80 bg-white border border-[#E5E0D5] rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E0D5]">
                <h3 className="text-sm font-semibold text-[#1A1A14]">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-[#F97316] hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 border-b border-[#E5E0D5] last:border-0 hover:bg-[#F5F2EC] cursor-pointer transition-colors ${!notif.read ? "bg-[#FDEEDE]/40" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${typeBg[notif.type]}`}>
                        {typeIcon[notif.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-[#1A1A14] truncate">{notif.title}</span>
                          {!notif.read && <span className="w-2 h-2 bg-[#F97316] rounded-full flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-[#1A1A14]/50 mt-0.5">{notif.message}</p>
                        <p className="text-xs text-[#1A1A14]/30 mt-1">{notif.time}</p>
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
            <button className="flex items-center gap-2.5 hover:bg-[#E8E3D9] rounded-xl px-2.5 py-1.5 transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-[#141410] text-white text-xs">JD</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-[#1A1A14]">Jane Doe</div>
                <div className="text-xs text-[#1A1A14]/40">Pro Plan</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#1A1A14]/30 hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 bg-white border-[#E5E0D5] rounded-xl shadow-lg">
            <DropdownMenuLabel className="text-[#1A1A14]">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#E5E0D5]" />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer text-[#1A1A14]">
                <User className="mr-2 h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer text-[#1A1A14]">
                <CreditCard className="mr-2 h-4 w-4" /> Subscription
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer text-[#1A1A14]">
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#E5E0D5]" />
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500 cursor-pointer"
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
