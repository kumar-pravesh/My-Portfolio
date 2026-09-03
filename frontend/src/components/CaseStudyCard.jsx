import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Cpu, Layers } from "lucide-react";

const DEFAULT_COVER_IMAGES = [
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
];

const CaseStudyCard = ({ cs, index = 0 }) => {
  const coverImg =
    cs.cover_image ||
    cs.hero_image ||
    DEFAULT_COVER_IMAGES[index % DEFAULT_COVER_IMAGES.length];

  const techList = Array.isArray(cs.technologies)
    ? cs.technologies
    : typeof cs.technologies === "string"
      ? cs.technologies.startsWith("[")
        ? (() => {
            try {
              return JSON.parse(cs.technologies);
            } catch {
              return cs.technologies.split(",");
            }
          })()
        : cs.technologies
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
      : [];

  const impact =
    cs.key_metrics || cs.performance_improvements || cs.results_summary;
  const impactText =
    typeof impact === "object" ? JSON.stringify(impact) : impact;
  const slugOrId = cs.slug || cs.reference_id;

  return (
    <Link
      to={`/case-studies/${slugOrId}`}
      className="group flex flex-col rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0b1528] hover:border-[#f5a623]/40 hover:shadow-[0_8px_32px_-8px_rgba(245,166,35,0.2)] transition-all duration-300 cursor-pointer h-full"
      aria-label={`Read case study: ${cs.title}`}
    >
      {/* ── Cover Image Header (Compact h-36) ── */}
      <div className="relative h-36 shrink-0 overflow-hidden bg-[#0e192d]">
        <img
          src={coverImg}
          alt={cs.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              DEFAULT_COVER_IMAGES[index % DEFAULT_COVER_IMAGES.length];
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1528]/90 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-0.5 rounded-full bg-[#0b1528]/85 backdrop-blur-sm text-[#f5a623] border border-[#f5a623]/30 font-mono text-[11px] font-semibold flex items-center gap-1">
            <Cpu size={11} className="text-[#f5a623]" />
            {cs.reference_id}
          </span>
          {cs.industry && (
            <span className="text-[11px] text-slate-200 font-semibold bg-[#112240]/85 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/15 flex items-center gap-1">
              <Layers size={10} className="text-[#f5a623]" />
              {cs.industry}
            </span>
          )}
        </div>
      </div>

      {/* ── Content Body ── */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          {/* Title */}
          <h3 className="text-base font-bold text-white mb-2 leading-snug group-hover:text-[#f5a623] transition-colors duration-200 line-clamp-2">
            {cs.title}
          </h3>

          {/* Description */}
          <p className="text-[12px] text-slate-400 leading-relaxed line-clamp-2 mb-3">
            {cs.short_description ||
              cs.summary ||
              cs.business_challenge ||
              cs.solution_overview}
          </p>

          {/* Metrics Pill */}
          {impactText && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-medium flex items-center gap-2 mb-3">
              <TrendingUp size={13} className="text-emerald-400 shrink-0" />
              <span className="line-clamp-1">{impactText}</span>
            </div>
          )}
        </div>

        <div>
          {/* Tech Stack Chips */}
          {techList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {techList.slice(0, 3).map((tech, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-white/[0.04] border border-white/10 text-slate-400 group-hover:border-[#f5a623]/30 group-hover:text-white transition-colors"
                >
                  {tech}
                </span>
              ))}
              {techList.length > 3 && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                  +{techList.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Action Link Footer */}
          <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#f5a623]/80 group-hover:text-[#f5a623] transition-colors">
              Read Case Study
              <ArrowRight
                size={12}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CaseStudyCard;
