import React from "react";
import {
  ExternalLink,
  Monitor,
  Activity,
  Users,
  ShoppingCart,
  Car,
  CheckCircle2,
} from "lucide-react";

const getIconComponent = (category = "") => {
  const c = category.toLowerCase();
  if (c.includes("mobility") || c.includes("car") || c.includes("transport"))
    return <Car size={11} />;
  if (c.includes("health") || c.includes("medical") || c.includes("hms"))
    return <Activity size={11} />;
  if (c.includes("portal") || c.includes("staff") || c.includes("user"))
    return <Users size={11} />;
  if (c.includes("marketing") || c.includes("shop") || c.includes("e-commerce"))
    return <ShoppingCart size={11} />;
  return <Monitor size={11} />;
};

const ProjectCard = ({ project, index = 0 }) => {
  const refId = project.reference_id || `PROJ-00${index + 1}`;
  const coverImg =
    project.image ||
    project.hero_image ||
    "https://via.placeholder.com/600x400/122240/f5a623?text=Project+Preview";
  const liveUrl = project.live_link || project.live_url || project.demo_url;

  const techList = Array.isArray(project.tech_stack)
    ? project.tech_stack
    : typeof project.tech_stack === "string"
      ? project.tech_stack
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  return (
    <div className="group flex flex-col rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0b1528] hover:border-[#f5a623]/40 hover:shadow-[0_8px_32px_-8px_rgba(245,166,35,0.2)] transition-all duration-300 h-full">
      {/* ── Pristine Image Header ── */}
      <div className="relative h-36 shrink-0 overflow-hidden bg-[#0e192d]">
        <img
          src={coverImg}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://via.placeholder.com/600x400/122240/f5a623?text=Project+Preview";
          }}
        />
        {/* Subtle bottom gradient to blend into body */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1528] via-transparent to-transparent opacity-80" />
      </div>

      {/* ── Content Body ── */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          {/* Category & Ref ID Meta Row */}
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1 text-[#f5a623] text-[11px] font-semibold">
              {getIconComponent(project.category || "")}
              {project.category || "Featured Project"}
            </span>
            <span className="font-mono text-[10px] text-slate-400/80 font-medium">
              {refId}
            </span>
          </div>

          {/* Title (Non-clickable for Project Details) */}
          <h3 className="text-base font-bold text-white mb-1.5 leading-snug line-clamp-2">
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-[12px] text-slate-400 leading-relaxed line-clamp-2 mb-3">
            {project.short_description || project.description}
          </p>

          {/* Tech Stack Chips */}
          {techList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
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
        </div>

        {/* Footer Action Links (View Details Removed, Replaced with Non-Clickable Production Badge) */}
        <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Verified System
          </div>

          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 hover:border-[#f5a623]/50 text-[11px] font-semibold text-slate-200 hover:text-[#f5a623] transition-all"
            >
              <ExternalLink size={11} className="text-[#f5a623]" />
              Live Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
