import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight, Sparkles } from "lucide-react";

const DEFAULT_ARTICLE_IMAGES = [
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
];

const ArticleCard = ({ blog, index = 0 }) => {
  const coverImg =
    blog.featured_image ||
    blog.cover_image ||
    blog.hero_image ||
    DEFAULT_ARTICLE_IMAGES[index % DEFAULT_ARTICLE_IMAGES.length];

  const slugOrId = blog.slug || blog.reference_id;
  const readingTime =
    blog.reading_time ||
    (blog.reading_time_minutes ? `${blog.reading_time_minutes} min` : "5 min");

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

  const date = new Date(
    blog.published_at || blog.created_at || Date.now(),
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      to={`/blog/${slugOrId}`}
      className="group flex flex-col rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0b1528] hover:border-[#f5a623]/40 hover:shadow-[0_8px_32px_-8px_rgba(245,166,35,0.2)] transition-all duration-300 cursor-pointer"
      aria-label={`Read article: ${blog.title}`}
    >
      {/* ── Image — fixed compact height ── */}
      <div className="relative h-36 shrink-0 overflow-hidden bg-[#0c162c]">
        <img
          src={coverImg}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              DEFAULT_ARTICLE_IMAGES[index % DEFAULT_ARTICLE_IMAGES.length];
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1528]/80 via-transparent to-transparent" />

        {/* Category badge — top left */}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#030712]/75 backdrop-blur-sm border border-[#f5a623]/30 text-[#f5a623] text-[11px] font-semibold">
          <Sparkles size={10} aria-hidden="true" />
          {blog.category || "Engineering"}
        </span>
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col gap-3 p-4 flex-1">
        {/* Metadata row — date · read time · tags */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium flex-wrap">
          <span className="flex items-center gap-1">
            <Calendar
              size={11}
              className="text-[#f5a623]/80"
              aria-hidden="true"
            />
            {date}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} className="text-[#f5a623]/80" aria-hidden="true" />
            {readingTime}
          </span>
          {tagList.slice(0, 2).map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.07] text-slate-400 text-[10px]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-[#f5a623] transition-colors duration-200">
          {blog.title}
        </h3>

        {/* Excerpt — strictly 2 lines */}
        <p className="text-[12px] text-slate-400 leading-relaxed line-clamp-2 flex-1">
          {blog.excerpt || blog.summary || blog.content}
        </p>

        {/* CTA row */}
        <div className="flex items-center justify-end pt-1 border-t border-white/[0.06] mt-auto">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#f5a623]/80 group-hover:text-[#f5a623] transition-colors">
            Read more
            <ArrowRight
              size={12}
              className="group-hover:translate-x-0.5 transition-transform"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
