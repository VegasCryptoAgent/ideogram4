"use client";

import { useState } from "react";
import { Sparkles, Wrench, Bug, Shield, Bell } from "lucide-react";
import MarketingNavbar from "@/components/marketing/navbar";
import MarketingFooter from "@/components/marketing/footer";

type ReleaseTag = "Features" | "Improvements" | "Fixes" | "Security";

interface ReleaseEntry {
  type: "new" | "improved" | "fix" | "security";
  text: string;
}

interface Release {
  version: string;
  date: string;
  tags: ReleaseTag[];
  entries: ReleaseEntry[];
}

const releases: Release[] = [
  {
    version: "v3.4.0",
    date: "June 18, 2026",
    tags: ["Features", "Security"],
    entries: [
      { type: "new", text: "AI-powered spam call detection with 99.2% accuracy" },
      { type: "new", text: "Family plan dashboard for up to 5 members" },
      { type: "security", text: "Upgraded to AES-256-GCM encryption for all stored aliases" },
      { type: "fix", text: "Fixed edge case where email forwarding could be delayed by >30s" },
    ],
  },
  {
    version: "v3.3.2",
    date: "June 10, 2026",
    tags: ["Fixes", "Improvements"],
    entries: [
      { type: "improved", text: "Faster data broker scan times (avg 47% reduction)" },
      { type: "fix", text: "Corrected alias statistics showing incorrect email count" },
      { type: "fix", text: "Fixed iOS Safari autofill compatibility issue" },
    ],
  },
  {
    version: "v3.3.0",
    date: "May 28, 2026",
    tags: ["Features"],
    entries: [
      { type: "new", text: "Password manager with TOTP support" },
      { type: "new", text: "Browser extension for Chrome and Firefox" },
      { type: "improved", text: "Revamped onboarding flow (3-step setup)" },
    ],
  },
  {
    version: "v3.2.1",
    date: "May 15, 2026",
    tags: ["Security", "Fixes"],
    entries: [
      { type: "security", text: "Patched XSS vulnerability in email alias preview (reported via bug bounty)" },
      { type: "fix", text: "Data removal requests now correctly retry on broker timeout" },
      { type: "improved", text: "Dashboard loading time reduced by 60%" },
    ],
  },
  {
    version: "v3.2.0",
    date: "May 1, 2026",
    tags: ["Features"],
    entries: [
      { type: "new", text: "Dark web & SSN monitoring with instant alerts" },
      { type: "new", text: "Virtual phone numbers (3 per Premium account)" },
      { type: "improved", text: "Redesigned mobile app navigation" },
    ],
  },
  {
    version: "v3.1.0",
    date: "April 15, 2026",
    tags: ["Features", "Improvements"],
    entries: [
      { type: "new", text: "Spam filter with custom allow/block lists" },
      { type: "new", text: "Breach Monitor with historical breach lookup" },
      { type: "improved", text: "Email alias inbox now supports attachments up to 25MB" },
    ],
  },
  {
    version: "v3.0.0",
    date: "April 1, 2026",
    tags: ["Features"],
    entries: [
      { type: "new", text: "Complete product redesign (Shield 3.0)" },
      { type: "new", text: "Dashboard with privacy score" },
      { type: "new", text: "Family plan beta launch" },
      { type: "improved", text: "200+ data brokers added to removal network (now 400+)" },
    ],
  },
  {
    version: "v2.9.5",
    date: "March 20, 2026",
    tags: ["Fixes"],
    entries: [
      { type: "fix", text: "Resolved issue with Google OAuth login on some Android devices" },
      { type: "fix", text: "Fixed email forwarding for aliases with special characters" },
      { type: "improved", text: "API response times improved by 35%" },
    ],
  },
];

const allTags: ReleaseTag[] = ["Features", "Improvements", "Fixes", "Security"];

const tagStyles: Record<ReleaseTag, string> = {
  Features: "bg-orange-100 text-orange-700 border border-orange-200",
  Improvements: "bg-blue-100 text-blue-700 border border-blue-200",
  Fixes: "bg-red-100 text-red-700 border border-red-200",
  Security: "bg-purple-100 text-purple-700 border border-purple-200",
};

const tagFilterStyles: Record<string, string> = {
  Features: "bg-orange-500 text-white border-orange-500",
  Improvements: "bg-blue-500 text-white border-blue-500",
  Fixes: "bg-red-500 text-white border-red-500",
  Security: "bg-purple-600 text-white border-purple-600",
};

const entryIcon = (type: ReleaseEntry["type"]) => {
  switch (type) {
    case "new":
      return <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />;
    case "improved":
      return <Wrench className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />;
    case "fix":
      return <Bug className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />;
    case "security":
      return <Shield className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />;
  }
};

const entryLabel = (type: ReleaseEntry["type"]) => {
  switch (type) {
    case "new":
      return <span className="text-orange-600 font-semibold text-xs uppercase tracking-wide">NEW</span>;
    case "improved":
      return <span className="text-blue-600 font-semibold text-xs uppercase tracking-wide">IMPROVED</span>;
    case "fix":
      return <span className="text-red-600 font-semibold text-xs uppercase tracking-wide">FIX</span>;
    case "security":
      return <span className="text-purple-700 font-semibold text-xs uppercase tracking-wide">SECURITY</span>;
  }
};

export default function ChangelogPage() {
  const [activeTag, setActiveTag] = useState<"All" | ReleaseTag>("All");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const filtered = releases.filter(
    (r) => activeTag === "All" || r.tags.includes(activeTag)
  );

  return (
    <div className="min-h-screen bg-[#F5F2EC]">
      <MarketingNavbar />

      {/* Hero */}
      <section className="bg-[#0E0E0A] py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-5xl md:text-6xl text-white font-bold mb-5">
            Shield Changelog
          </h1>
          <p className="text-white/55 text-xl">
            New features, improvements, and fixes — shipped every week.
          </p>
        </div>
      </section>

      {/* Filter Pills */}
      <section className="bg-[#F5F2EC] border-b border-[#E5E0D5] py-6 px-6 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setActiveTag("All")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              activeTag === "All"
                ? "bg-[#141410] text-white border-[#141410]"
                : "bg-white text-[#1A1A14]/70 border-[#D4CFC5] hover:border-[#1A1A14]"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                activeTag === tag
                  ? tagFilterStyles[tag]
                  : "bg-white text-[#1A1A14]/70 border-[#D4CFC5] hover:border-[#1A1A14]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 px-6 bg-[#F5F2EC]">
        <div className="max-w-3xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-[#1A1A14]/40">
              <p>No releases found for this filter.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#E5E0D5] ml-[7px]" />
              <div className="flex flex-col gap-12">
                {filtered.map((release, idx) => (
                  <div key={release.version} className="relative pl-10">
                    {/* Dot */}
                    <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-[#F97316] border-2 border-[#F5F2EC] shadow-sm" />

                    <div className="bg-white border border-[#E5E0D5] rounded-2xl p-6 border-l-4 border-l-[#F97316]">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="bg-[#F97316] text-white text-xs font-bold px-3 py-1 rounded-full">
                          {release.version}
                        </span>
                        <span className="text-[#1A1A14]/50 text-sm">{release.date}</span>
                        <div className="flex flex-wrap gap-1.5 ml-auto">
                          {release.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${tagStyles[tag]}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ul className="flex flex-col gap-3">
                        {release.entries.map((entry, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            {entryIcon(entry.type)}
                            <span className="text-sm text-[#1A1A14]/75 leading-relaxed">
                              <span className="mr-1.5">{entryLabel(entry.type)}</span>
                              {entry.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Subscribe */}
      <section className="bg-[#0E0E0A] py-20 px-6">
        <div className="max-w-xl mx-auto text-center">
          <Bell className="w-8 h-8 text-[#F97316] mx-auto mb-4" />
          <h2 className="font-serif text-3xl text-white font-bold mb-3">
            Subscribe to the changelog
          </h2>
          <p className="text-white/50 mb-8">
            Get notified when new releases ship. No spam, ever.
          </p>
          {subscribed ? (
            <div className="flex items-center justify-center gap-2 text-green-400">
              <span className="text-lg">You're subscribed!</span>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubscribed(true);
              }}
              className="flex gap-3"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316] transition-all"
              />
              <button
                type="submit"
                className="bg-[#F97316] hover:bg-[#EA6B0F] text-white px-6 py-2.5 rounded-xl font-semibold transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
