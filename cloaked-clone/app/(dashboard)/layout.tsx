"use client";

import React, { useState } from "react";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/scanner": "Identity Scanner",
  "/brokers": "Data Brokers",
  "/phone": "Virtual Phone Numbers",
  "/email": "Email Aliases",
  "/autocloak": "AutoCloak AI",
  "/spam": "Spam Filter",
  "/breach": "Breach Monitor",
  "/cards": "Virtual Cards",
  "/passwords": "Password Manager",
  "/settings": "Settings",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const pageTitle = PAGE_TITLES[pathname] || "Dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative w-64 h-full">
          <Sidebar collapsed={false} onToggle={() => setMobileSidebarOpen(false)} />
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="absolute top-4 right-4 p-1 text-white/40 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block flex-shrink-0 h-full relative z-10">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile menu button */}
        <div className="lg:hidden absolute top-4 left-4 z-20">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 text-white/60 hover:text-white bg-white/5 rounded-lg border border-white/10"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <Header title={pageTitle} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
