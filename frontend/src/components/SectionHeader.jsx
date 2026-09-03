import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

/**
 * Reusable Section Header Component
 * Provides ultra-premium modern typography, gradient text highlights,
 * and subtle kicker badges across all portfolio sections.
 */
const SectionHeader = ({
  badge,
  title,
  highlight,
  subtitle,
  className = "text-center mb-8 sm:mb-10",
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: -20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* ── Kicker Badge ── */}
      {badge && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5a623]/10 border border-[#f5a623]/25 text-[#f5a623] text-[11px] font-semibold tracking-wider uppercase mb-3">
          <Sparkles size={12} className="text-[#f5a623]" aria-hidden="true" />
          <span>{badge}</span>
        </div>
      )}

      {/* ── Heading ── */}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
        {title}{" "}
        {highlight && (
          <span className="bg-gradient-to-r from-[#f5a623] via-[#ffc86b] to-[#f5a623] bg-clip-text text-transparent">
            {highlight}
          </span>
        )}
      </h2>

      {/* ── Subtitle ── */}
      {subtitle && (
        <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-xl mx-auto font-normal leading-relaxed tracking-normal">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

export default SectionHeader;
