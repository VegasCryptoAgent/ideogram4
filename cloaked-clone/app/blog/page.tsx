"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Clock, ArrowRight, BookOpen, Mail } from "lucide-react";
import Link from "next/link";
import MarketingNavbar from "@/components/marketing/navbar";
import MarketingFooter from "@/components/marketing/footer";

type Category =
  | "All"
  | "Privacy Tips"
  | "Data Brokers"
  | "Identity Theft"
  | "Product Updates"
  | "Industry News";

interface Post {
  id: number;
  title: string;
  category: Exclude<Category, "All">;
  date: string;
  author: string;
  excerpt: string;
  readTime: string;
}

const CATEGORIES: Category[] = [
  "All",
  "Privacy Tips",
  "Data Brokers",
  "Identity Theft",
  "Product Updates",
  "Industry News",
];

const CATEGORY_COLORS: Record<Exclude<Category, "All">, string> = {
  "Data Brokers": "bg-[#F97316] text-white",
  "Privacy Tips": "bg-emerald-500 text-white",
  "Product Updates": "bg-blue-500 text-white",
  "Identity Theft": "bg-red-500 text-white",
  "Industry News": "bg-purple-500 text-white",
};

const POSTS: Post[] = [
  {
    id: 1,
    title: "How Data Brokers Profit From Your Personal Information",
    category: "Privacy Tips",
    date: "May 28, 2026",
    author: "Sarah Chen",
    excerpt:
      "Every Google search, social media post, and online purchase feeds a $240 billion industry built on your data.",
    readTime: "8 min",
  },
  {
    id: 2,
    title: "Spam Calls Are Up 300%: Here's What You Can Do",
    category: "Privacy Tips",
    date: "May 20, 2026",
    author: "Marcus Webb",
    excerpt:
      "Robocalls hit a record 5.5 billion in April alone. Here's how to stop them from reaching you.",
    readTime: "5 min",
  },
  {
    id: 3,
    title: "Shield Changelog: May 2026 Feature Updates",
    category: "Product Updates",
    date: "May 15, 2026",
    author: "Dev Patel",
    excerpt:
      "Dark web monitoring upgrades, 12 new broker removals, and a redesigned dashboard.",
    readTime: "3 min",
  },
  {
    id: 4,
    title: "The 10 Most Dangerous Data Brokers in 2026",
    category: "Data Brokers",
    date: "May 10, 2026",
    author: "James Torres",
    excerpt:
      "These companies have your home address, family members, and daily routine — and sell it to anyone.",
    readTime: "10 min",
  },
  {
    id: 5,
    title: "Identity Theft Recovery: A Step-by-Step Guide",
    category: "Identity Theft",
    date: "May 5, 2026",
    author: "Aisha Johnson",
    excerpt:
      "If your identity has been stolen, here's exactly what to do in the first 48 hours.",
    readTime: "15 min",
  },
  {
    id: 6,
    title: "How to Opt Out of WhitePages, Spokeo, and BeenVerified",
    category: "Data Brokers",
    date: "Apr 28, 2026",
    author: "James Torres",
    excerpt:
      "Three of the biggest people-search sites, and how to remove yourself from all of them.",
    readTime: "7 min",
  },
  {
    id: 7,
    title: "What is a Data Broker? (And Why You Should Care)",
    category: "Privacy Tips",
    date: "Apr 20, 2026",
    author: "Sarah Chen",
    excerpt:
      "Most people have never heard of data brokers. That's exactly how they like it.",
    readTime: "6 min",
  },
  {
    id: 8,
    title: "Shield Raises $375M Series C to Expand Privacy Tools",
    category: "Product Updates",
    date: "Apr 15, 2026",
    author: "Sarah Chen",
    excerpt:
      "The funding will accelerate international expansion and new identity protection features.",
    readTime: "2 min",
  },
  {
    id: 9,
    title: "CCPA vs GDPR: What's the Difference for US Consumers?",
    category: "Industry News",
    date: "Apr 10, 2026",
    author: "Priya Nair",
    excerpt:
      "Two major privacy laws, two different approaches. Here's what they mean for you.",
    readTime: "9 min",
  },
];

function CategoryPill({
  category,
  small = false,
}: {
  category: Exclude<Category, "All">;
  small?: boolean;
}) {
  return (
    <span
      className={`inline-block font-medium rounded-full ${small ? "text-xs px-2.5 py-1" : "text-xs px-3 py-1.5"} ${CATEGORY_COLORS[category]}`}
    >
      {category}
    </span>
  );
}

function BlogCard({ post, index }: { post: Post; index: number }) {
  return (
    <motion.article
      className="bg-white border border-[#D4CFC5] rounded-2xl overflow-hidden hover:border-[#F97316]/40 hover:shadow-md transition-all duration-300 flex flex-col"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.07, 0.35) }}
    >
      <div className="p-6 flex flex-col flex-1">
        <div className="mb-4">
          <CategoryPill category={post.category} />
        </div>
        <h3 className="font-serif text-lg font-bold text-[#141410] mb-3 leading-snug line-clamp-2">
          {post.title}
        </h3>
        <p className="text-[#1A1A14]/65 text-sm leading-relaxed mb-5 line-clamp-3 flex-1">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#E5E0D5]">
          <div className="flex items-center gap-3 text-xs text-[#1A1A14]/55">
            <span>{post.author}</span>
            <span>·</span>
            <span>{post.date}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readTime} read
            </span>
          </div>
          <Link
            href="#"
            className="text-[#F97316] text-sm font-medium hover:text-[#EA6B0F] transition-colors flex items-center gap-1"
          >
            Read <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [emailInput, setEmailInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const filteredPosts = useMemo(() => {
    return POSTS.filter((post) => {
      const matchesCategory =
        activeCategory === "All" || post.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        q === "" ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F2EC] font-sans">
      <MarketingNavbar />

      {/* Hero */}
      <section className="bg-[#141410] pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/70 mb-8">
              <BookOpen className="w-3.5 h-3.5" />
              Shield Blog
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-5 leading-tight">
              Shield Privacy Blog
            </h1>
            <p className="text-xl text-white/65 max-w-2xl mx-auto leading-relaxed mb-10">
              Guides, news, and insights on protecting your personal information
              in the modern world.
            </p>

            {/* Search */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-full pl-12 pr-5 py-3.5 text-white placeholder:text-white/40 focus:outline-none focus:border-[#F97316]/60 focus:bg-white/15 transition-colors text-sm"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-[#F5F2EC] sticky top-0 z-10 border-b border-[#D4CFC5] py-4 px-6 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-[#141410] text-white"
                    : "bg-white border border-[#D4CFC5] text-[#1A1A14]/65 hover:border-[#141410]/40 hover:text-[#141410]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Featured Post */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2 className="text-xs font-medium text-[#1A1A14]/55 uppercase tracking-widest mb-6">
            Featured Article
          </h2>
          <article className="bg-white border border-[#D4CFC5] rounded-3xl overflow-hidden hover:border-[#F97316]/40 hover:shadow-lg transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Image placeholder */}
              <div className="bg-gradient-to-br from-[#141410] to-[#1A1A14] min-h-[280px] lg:min-h-full flex items-center justify-center">
                <span className="text-7xl select-none">📰</span>
              </div>
              {/* Content */}
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <div className="mb-4">
                  <CategoryPill category="Data Brokers" />
                </div>
                <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#141410] mb-4 leading-snug">
                  The 2026 Complete Guide to Removing Your Data from
                  People-Search Sites
                </h3>
                <p className="text-[#1A1A14]/65 leading-relaxed mb-6">
                  Data brokers have made billions collecting your personal
                  details. This comprehensive guide walks you through removing
                  yourself from the 50+ most popular people-search sites, step
                  by step.
                </p>
                <div className="flex items-center gap-4 text-sm text-[#1A1A14]/55 mb-7">
                  <span>Sarah Chen</span>
                  <span>·</span>
                  <span>June 15, 2026</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    12 min read
                  </span>
                </div>
                <Link
                  href="#"
                  className="inline-flex items-center gap-2 bg-[#F97316] text-white rounded-full px-6 py-3 font-semibold hover:bg-[#EA6B0F] transition-colors self-start"
                >
                  Read article <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </article>
        </motion.section>

        {/* Blog Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xs font-medium text-[#1A1A14]/55 uppercase tracking-widest">
              {activeCategory === "All" ? "All Articles" : activeCategory}
              {searchQuery && (
                <span className="ml-2 normal-case">
                  — "{searchQuery}"
                </span>
              )}
            </h2>
            <span className="text-sm text-[#1A1A14]/55">
              {filteredPosts.length} article
              {filteredPosts.length !== 1 ? "s" : ""}
            </span>
          </div>

          {filteredPosts.length === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-[#1A1A14]/55 text-lg">
                No articles found matching your search.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                }}
                className="mt-4 text-[#F97316] text-sm font-medium hover:text-[#EA6B0F]"
              >
                Clear filters
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post, i) => (
                <BlogCard key={post.id} post={post} index={i} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Newsletter Strip */}
      <section className="bg-[#141410] py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-12 h-12 bg-[#F97316]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="w-6 h-6 text-[#F97316]" />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
              Get privacy tips in your inbox
            </h2>
            <p className="text-white/55 text-lg mb-8">
              Weekly guides, news, and product updates. No spam, ever.
            </p>

            {subscribed ? (
              <motion.div
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-6 py-3.5 text-white"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <span className="text-green-400">✓</span>
                You're subscribed! Check your inbox.
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="flex-1 bg-white/10 border border-white/20 rounded-full px-5 py-3.5 text-white placeholder:text-white/40 focus:outline-none focus:border-[#F97316]/60 transition-colors text-sm"
                />
                <button
                  type="submit"
                  className="bg-[#F97316] text-white rounded-full px-7 py-3.5 font-semibold hover:bg-[#EA6B0F] transition-colors text-sm whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            )}

            <p className="text-white/30 text-xs mt-5">
              Unsubscribe any time. We respect your privacy.
            </p>
          </motion.div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
