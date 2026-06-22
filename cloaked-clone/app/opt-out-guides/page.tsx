"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Clock, ChevronRight, Shield, Database, RefreshCw } from "lucide-react";
import MarketingNavbar from "@/components/marketing/navbar";
import MarketingFooter from "@/components/marketing/footer";

const brokers = [
  { name: "Spokeo", category: "People Search", difficulty: "Easy", time: "5 min" },
  { name: "WhitePages", category: "People Search", difficulty: "Medium", time: "10 min" },
  { name: "BeenVerified", category: "People Search", difficulty: "Easy", time: "5 min" },
  { name: "Intelius", category: "People Search", difficulty: "Medium", time: "10 min" },
  { name: "PeopleFinder", category: "People Search", difficulty: "Easy", time: "5 min" },
  { name: "TruthFinder", category: "People Search", difficulty: "Medium", time: "8 min" },
  { name: "Radaris", category: "People Search", difficulty: "Hard", time: "15 min" },
  { name: "PeekYou", category: "People Search", difficulty: "Easy", time: "5 min" },
  { name: "Pipl", category: "People Search", difficulty: "Hard", time: "20 min" },
  { name: "MyLife", category: "People Search", difficulty: "Medium", time: "12 min" },
  { name: "Acxiom", category: "Marketing", difficulty: "Hard", time: "20 min" },
  { name: "Experian", category: "Financial", difficulty: "Medium", time: "15 min" },
  { name: "LexisNexis", category: "Other", difficulty: "Hard", time: "30 min" },
  { name: "ZabaSearch", category: "People Search", difficulty: "Easy", time: "5 min" },
  { name: "FastPeopleSearch", category: "People Search", difficulty: "Easy", time: "5 min" },
  { name: "US Search", category: "People Search", difficulty: "Medium", time: "10 min" },
  { name: "Instant Checkmate", category: "People Search", difficulty: "Medium", time: "8 min" },
  { name: "CheckPeople", category: "People Search", difficulty: "Easy", time: "5 min" },
  { name: "Arrests.org", category: "Other", difficulty: "Hard", time: "30 min" },
  { name: "Nuwber", category: "People Search", difficulty: "Medium", time: "10 min" },
  { name: "Epsilon", category: "Marketing", difficulty: "Hard", time: "25 min" },
  { name: "CoreLogic", category: "Financial", difficulty: "Hard", time: "20 min" },
  { name: "Data.com", category: "Marketing", difficulty: "Medium", time: "10 min" },
  { name: "Equifax", category: "Financial", difficulty: "Medium", time: "15 min" },
];

const categories = ["All", "People Search", "Marketing", "Social", "Financial", "Other"];

const difficultyStyles: Record<string, string> = {
  Easy: "bg-green-100 text-green-700 border border-green-200",
  Medium: "bg-orange-100 text-orange-700 border border-orange-200",
  Hard: "bg-red-100 text-red-700 border border-red-200",
};

export default function OptOutGuidesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = brokers.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || b.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#F5F2EC]">
      <MarketingNavbar />

      {/* Hero */}
      <section className="bg-[#0E0E0A] py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#F97316]/10 border border-[#F97316]/20 rounded-full px-4 py-1.5 mb-6">
            <Shield className="w-3.5 h-3.5 text-[#F97316]" />
            <span className="text-[#F97316] text-sm font-medium">Free opt-out guides</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white font-bold leading-tight mb-6">
            Data Broker Opt-Out Guides
          </h1>
          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Step-by-step instructions to manually remove your information from the biggest people-search sites.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 text-[#F97316] hover:text-[#EA6B0F] transition-colors text-base font-medium"
          >
            Or let Shield handle all 400+ removals automatically{" "}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#1A1A14] border-y border-white/10 py-6 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-3 divide-x divide-white/10">
          {[
            { icon: <Database className="w-4 h-4" />, value: "400+", label: "Brokers tracked" },
            { icon: <Shield className="w-4 h-4" />, value: "1.7B+", label: "Records removed" },
            { icon: <RefreshCw className="w-4 h-4" />, value: "Weekly", label: "Updated" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 px-6">
              <span className="text-[#F97316]">{stat.icon}</span>
              <span className="text-white font-bold text-xl">{stat.value}</span>
              <span className="text-white/50 text-xs uppercase tracking-wide">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-10 px-6 bg-[#F5F2EC]">
        <div className="max-w-6xl mx-auto">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1A1A14]/40" />
            <input
              type="text"
              placeholder="Search brokers (e.g. Spokeo, WhitePages…)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#D4CFC5] rounded-xl text-[#1A1A14] placeholder:text-[#1A1A14]/40 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316] transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  activeCategory === cat
                    ? "bg-[#F97316] text-white border-[#F97316]"
                    : "bg-white text-[#1A1A14]/70 border-[#D4CFC5] hover:border-[#F97316] hover:text-[#F97316]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="pb-16 px-6 bg-[#F5F2EC]">
        <div className="max-w-6xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-[#1A1A14]/40">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-lg">No guides found for "{search}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filtered.map((broker) => (
                <div
                  key={broker.name}
                  className="bg-white border border-[#E5E0D5] rounded-2xl p-5 flex flex-col gap-3 hover:shadow-lg hover:border-[#F97316]/30 transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif font-bold text-[#141410] text-base leading-tight">
                      {broker.name}
                    </h3>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${difficultyStyles[broker.difficulty]}`}
                    >
                      {broker.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block bg-[#F5F2EC] text-[#1A1A14]/60 text-xs px-2.5 py-1 rounded-full border border-[#E5E0D5]">
                      {broker.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#1A1A14]/50 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{broker.time}</span>
                  </div>
                  <Link
                    href={`/opt-out-guides/${broker.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="mt-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-[#D4CFC5] rounded-lg text-sm text-[#1A1A14] font-medium hover:border-[#F97316] hover:text-[#F97316] transition-all group-hover:border-[#F97316]/50"
                  >
                    View Guide
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
          <p className="text-center text-[#1A1A14]/40 text-sm mt-8">
            Showing {filtered.length} of {brokers.length} guides
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#0E0E0A] py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-white font-bold mb-4">
            Too many sites to opt out of manually?
          </h2>
          <p className="text-white/60 text-lg mb-8">
            Shield automates all 400+ removals for you — and keeps monitoring to make sure your data stays off.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA6B0F] text-white px-8 py-3.5 rounded-xl font-semibold transition-colors"
          >
            Get started free
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
