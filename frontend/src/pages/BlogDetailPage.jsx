import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  Sparkles,
  ChevronLeft,
  Linkedin,
  Twitter,
  Link as LinkIcon,
  FileText,
  BookOpen,
  Hash,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { publicApi } from "../services/api";

const DEFAULT_ARTICLE_IMAGES = [
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
];

const BlogDetailPage = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    publicApi
      .getBlogBySlug(slug)
      .then((data) => {
        if (isMounted) {
          setBlog(data);
          document.title = `${data.title} — Technical Blog`;
        }
      })
      .catch((err) => {
        if (isMounted) setError("Blog post not found or draft status.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-28 pb-16 px-[5%] lg:px-[9%] min-h-screen text-center flex flex-col justify-center items-center">
        <div className="w-10 h-10 rounded-full border-3 border-[#f5a623] border-t-transparent animate-spin mb-3" />
        <p className="text-slate-400 font-mono text-[11px] tracking-widest uppercase">
          Loading article data...
        </p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="pt-28 pb-16 px-[5%] lg:px-[9%] min-h-screen text-center flex flex-col justify-center items-center">
        <h2 className="text-2xl font-extrabold text-white mb-2">
          Article Not Found
        </h2>
        <p className="text-slate-400 mb-5 max-w-md text-xs">
          {error || "The requested article could not be located."}
        </p>
        <Link
          to="/blog"
          className="px-5 py-2.5 rounded-full bg-[#f5a623] text-[#0b1528] font-bold text-xs uppercase tracking-wider shadow-md hover:bg-white transition-all"
        >
          Return to Blog Directory
        </Link>
      </div>
    );
  }

  const coverImg =
    blog.featured_image ||
    blog.cover_image ||
    blog.hero_image ||
    DEFAULT_ARTICLE_IMAGES[0];
  const date = new Date(
    blog.published_at || blog.created_at || Date.now(),
  ).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const authorName = blog.author_name || "Pravesh Kumar";

  // Normalize tags
  const tagList = Array.isArray(blog.tags)
    ? blog.tags
    : typeof blog.tags === "string"
      ? blog.tags.startsWith("[")
        ? (() => {
            try {
              return JSON.parse(blog.tags);
            } catch {
              return blog.tags.split(",");
            }
          })()
        : blog.tags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
      : [];

  return (
    <div className="pt-28 sm:pt-32 pb-16 px-[5%] lg:px-[9%] min-h-screen max-w-6xl mx-auto space-y-6 sm:space-y-7">
      {/* ── Top Navigation & Tag Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-[#f5a623] transition-colors group"
        >
          <ArrowLeft
            size={13}
            className="group-hover:-translate-x-1 transition-transform text-[#f5a623]"
          />
          <span>Engineering Blog</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-200 truncate max-w-[200px] sm:max-w-none">
            {blog.title}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="px-3 py-0.5 rounded-full bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/30 font-mono text-[11px] font-bold">
            {blog.reference_id}
          </span>
          {blog.category && (
            <span className="px-3 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[11px] font-semibold flex items-center gap-1.5">
              <BookOpen size={11} /> {blog.category}
            </span>
          )}
        </div>
      </div>

      {/* ── SECTION 1: Split Hero Showcase ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Hero Narrative Info (Left 7 Cols) */}
        <motion.div
          className="lg:col-span-7 flex flex-col justify-between space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#2b4b9b]/25 border border-[#2b4b9b]/40 text-[#2b4b9b] text-[11px] font-bold uppercase tracking-wider">
                <FileText size={12} className="text-[#f5a623]" /> Editorial
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
              {blog.title}
            </h1>

            {/* Author Block */}
            <div className="flex items-center gap-3 pt-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                {authorName.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-slate-200 font-bold text-sm">
                  {authorName}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Author
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs pt-2 text-slate-400">
            <div className="flex items-center gap-1.5 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/10 text-[11px]">
              <Calendar size={13} className="text-[#f5a623]" />
              <span>
                Published: <strong className="text-white">{date}</strong>
              </span>
            </div>
            {blog.reading_time_minutes && (
              <div className="flex items-center gap-1.5 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/10 text-[11px]">
                <Clock size={13} className="text-blue-400" />
                <span>
                  Read Time:{" "}
                  <strong className="text-white">
                    {blog.reading_time_minutes} min
                  </strong>
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Hero Featured Image (Right 5 Cols) */}
        <motion.div
          className="lg:col-span-5 relative flex"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="w-full min-h-[200px] h-full rounded-2xl overflow-hidden border border-white/15 shadow-xl bg-[#0b1528] relative group flex flex-col justify-end">
            <img
              src={coverImg}
              alt={blog.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_ARTICLE_IMAGES[0];
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1528] via-black/20 to-transparent opacity-90" />

            {/* Floating Overlay Pill */}
            <div className="relative z-10 p-2.5 m-2.5 rounded-xl bg-[#0b1528]/90 backdrop-blur-md border border-white/15 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-slate-300 font-medium">Article Type</span>
              </div>
              <span className="text-white font-bold font-mono truncate">
                {blog.category || "Tech Insight"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── SECTION 2: Balanced 2-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-4">
        {/* Main Content Column (Left 8 Cols) */}
        <motion.div
          className="lg:col-span-8 space-y-5"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-5 sm:p-8 rounded-2xl bg-[#0b1528]/80 border border-white/10 shadow-xl">
            <div className="prose prose-invert prose-slate prose-sm sm:prose-base lg:prose-lg max-w-none text-slate-300 leading-relaxed font-sans prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[#f5a623] prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:border prose-img:border-white/10">
              <ReactMarkdown>{blog.content}</ReactMarkdown>
            </div>
          </div>
        </motion.div>

        {/* Floating Sidebar Panel (Right 4 Cols) */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
          {/* Article Specs Card */}
          <motion.div
            className="p-5 rounded-2xl bg-[#0b1528] border border-white/10 space-y-4 shadow-xl relative overflow-hidden"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-bl-full pointer-events-none" />

            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2.5 flex items-center gap-2">
              <BookOpen size={14} className="text-[#2b4b9b]" /> Article Details
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400">Ref Code</span>
                <span className="font-mono text-[#f5a623] font-bold bg-[#f5a623]/10 px-2 py-0.5 rounded border border-[#f5a623]/30">
                  {blog.reference_id}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400">Author</span>
                <span className="text-white font-semibold">{authorName}</span>
              </div>

              {blog.category && (
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-slate-400">Category</span>
                  <span className="text-white font-semibold">
                    {blog.category}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400">Published Date</span>
                <span className="text-white font-semibold">
                  {new Date(
                    blog.published_at || blog.created_at || Date.now(),
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Tags List Card */}
          {tagList.length > 0 && (
            <motion.div
              className="p-5 rounded-2xl bg-[#0b1528] border border-white/10 space-y-3 shadow-xl"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2.5 flex items-center gap-2">
                <Hash size={14} className="text-blue-400" /> Topics & Tags
              </h4>

              <div className="flex flex-wrap gap-2 pt-1">
                {tagList.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-medium text-slate-300 hover:border-blue-400/40 hover:text-white transition-colors cursor-default"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Share & Connect Card */}
          <motion.div
            className="p-5 rounded-2xl bg-gradient-to-br from-[#2b4b9b]/30 via-[#0b1528] to-blue-500/10 border border-blue-500/30 shadow-xl space-y-4 relative overflow-hidden"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-1">
              <Share2 size={16} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-white leading-snug">
                Share this Insight
              </h3>
              <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                Found this helpful? Share it with your network or team.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`,
                    "_blank",
                  )
                }
                className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-[#0077b5] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-md gap-2 text-xs font-bold"
              >
                <Linkedin size={14} /> Post
              </button>
              <button
                onClick={() =>
                  window.open(
                    `https://twitter.com/intent/tweet?url=${window.location.href}&text=${encodeURIComponent(blog.title)}`,
                    "_blank",
                  )
                }
                className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-[#1DA1F2] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-md gap-2 text-xs font-bold"
              >
                <Twitter size={14} /> Tweet
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied!");
                }}
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-emerald-600 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-md"
              >
                <LinkIcon size={14} />
              </button>
            </div>

            <div className="pt-3 mt-3 border-t border-white/10">
              <Link
                to="/contact"
                className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 group"
              >
                Discuss this topic{" "}
                <MessageSquare
                  size={13}
                  className="group-hover:scale-110 transition-transform"
                />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;
