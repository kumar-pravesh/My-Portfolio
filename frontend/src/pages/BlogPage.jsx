import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, BookOpen, Sparkles, X, CheckCircle2 } from "lucide-react";
import { publicApi } from "../services/api";
import ArticleCard from "../components/ArticleCard";

const CATEGORIES = [
  "All",
  "Java & Spring",
  "Microservices",
  "React / Frontend",
  "Database & Redis",
  "System Design",
];

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    document.title = "Blog & Insights — Pravesh Kumar Portfolio";
    let isMounted = true;
    publicApi
      .getBlogs()
      .then((data) => {
        if (isMounted) {
          setBlogs(Array.isArray(data) ? data : data.data || []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = blogs.filter((b) => {
    const matchesSearch =
      search === "" ||
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.category?.toLowerCase().includes(search.toLowerCase()) ||
      b.summary?.toLowerCase().includes(search.toLowerCase()) ||
      b.reference_id?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      activeCategory === "All" ||
      b.category?.toLowerCase().includes(activeCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-20 sm:pt-24 pb-20 px-[5%] lg:px-[9%] min-h-screen max-w-7xl mx-auto space-y-8 sm:space-y-10">
      {/* ── Executive Hero Header ── */}
      <div className="relative text-center max-w-3xl mx-auto space-y-4 pt-4">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-40 bg-[#f5a623]/10 blur-[100px] pointer-events-none rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f5a623]/10 border border-[#f5a623]/30 text-[#f5a623] text-[11px] font-bold uppercase tracking-wider shadow-sm"
        >
          <BookOpen size={12} /> Tech Publications & Engineering Insights
        </motion.div>

        <motion.h1
          className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          Technical{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f5a623] via-amber-200 to-[#f5a623]">
            Blog & Insights
          </span>
        </motion.h1>

        <motion.p
          className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          Deep dives into Java 21, Spring Boot, microservices architecture,
          React performance, and enterprise software patterns.
        </motion.p>

        {/* ── Search & Filter Controls ── */}
        <motion.div
          className="pt-2 max-w-2xl mx-auto space-y-3"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {/* Glass Search Input */}
          <div className="relative group">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f5a623] transition-colors"
            />
            <input
              type="text"
              placeholder="Search articles by title, topic, or Ref ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-[#0b1528]/90 backdrop-blur-xl border border-white/15 rounded-2xl text-white text-xs sm:text-sm outline-none focus:border-[#f5a623]/60 focus:ring-2 focus:ring-[#f5a623]/20 shadow-xl transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    isActive
                      ? "bg-[#f5a623] text-[#0b1528] shadow-md shadow-[#f5a623]/20"
                      : "bg-white/[0.04] text-slate-400 hover:text-white border border-white/10 hover:border-white/20"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ── Status Bar ── */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs text-slate-400">
        <div className="flex items-center gap-2 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            Showing <strong className="text-white">{filtered.length}</strong>{" "}
            Technical Article{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
        {(search || activeCategory !== "All") && (
          <button
            onClick={() => {
              setSearch("");
              setActiveCategory("All");
            }}
            className="text-[11px] text-[#f5a623] hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* ── Grid List ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-2xl bg-[#0b1528] border border-white/5 animate-pulse h-80"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#0b1528]/80 rounded-2xl border border-white/10 max-w-md mx-auto space-y-3 text-slate-400">
          <div className="w-10 h-10 rounded-full bg-white/5 mx-auto flex items-center justify-center text-slate-500">
            <Search size={20} />
          </div>
          <p className="text-sm font-semibold text-white">
            No articles matching your search
          </p>
          <p className="text-xs text-slate-400">
            Try adjusting your keywords or category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((blog, idx) => (
            <motion.div
              key={blog.reference_id || idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex"
            >
              <ArticleCard blog={blog} index={idx} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogPage;
