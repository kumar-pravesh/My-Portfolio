import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { publicApi } from "../services/api";
import { ArrowRight, Terminal } from "lucide-react";

const CurrentWork = () => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    publicApi
      .getCurrentWork()
      .then((data) => {
        if (isMounted) setProject(data);
      })
      .catch(() => {
        if (isMounted) setError(true);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading || error || !project) return null;

  const isUpcoming = project.status === "upcoming";
  const statusColor = isUpcoming ? "text-[#FFA916]" : "text-emerald-400";
  const statusBg = isUpcoming ? "bg-[#FFA916]/10" : "bg-emerald-400/10";
  const statusDot = isUpcoming ? "bg-[#FFA916]" : "bg-emerald-400";
  const statusLabel = isUpcoming ? "UPCOMING" : "IN PROGRESS";

  // Determine subheader based on status
  const subheader = isUpcoming ? "WHAT'S NEXT" : "WHAT I'M WORKING ON";
  const mainHeading = isUpcoming ? "On the Horizon" : "Currently Building";

  return (
    <section
      className="py-10 px-[5%] lg:px-[9%] max-w-full bg-[#0b1528] relative z-10"
      id="current-work"
    >
      <div className="flex flex-col items-center justify-center text-center mb-6">
        <span className="text-[#FFA916] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-1.5">
          {subheader}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {mainHeading}
        </h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto relative group"
      >
        {/* Animated Gradient Glow Border */}
        <div className="absolute -inset-[2px] bg-gradient-to-r from-[#f5a623] via-emerald-400 to-[#2b4b9b] rounded-2xl opacity-0 group-hover:opacity-60 blur-md transition-opacity duration-700 ease-in-out pointer-events-none" />
        <div className="absolute -inset-[1px] bg-gradient-to-r from-[#f5a623] via-emerald-400 to-[#2b4b9b] rounded-2xl opacity-20 group-hover:opacity-100 transition-opacity duration-700 ease-in-out pointer-events-none" />

        <div className="relative overflow-hidden bg-[#0b1528]/95 border border-white/10 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl group-hover:border-transparent transition-colors duration-700">
          {/* Subtle Glow Effect */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#f5a623]/5 to-emerald-500/10 rounded-full blur-3xl pointer-events-none transition-opacity opacity-50 group-hover:opacity-100" />

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
            {/* Content Left */}
            <div className="flex-1 space-y-4">
              {/* Header / Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  {project.title}
                </h3>
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusBg} border border-white/5 whitespace-nowrap self-start sm:self-auto`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${statusDot} ${!isUpcoming ? "animate-pulse" : ""}`}
                  />
                  <span
                    className={`text-[11px] font-bold tracking-wider ${statusColor}`}
                  >
                    {statusLabel}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 text-slate-300 text-xs sm:text-sm leading-relaxed">
                {project.short_description && (
                  <p className="font-medium text-white/90 line-clamp-2">
                    {project.short_description}
                  </p>
                )}
                {/* Fallback to description if short_description is missing, but truncate it */}
                {!project.short_description && project.description && (
                  <p className="line-clamp-2">{project.description}</p>
                )}
              </div>

              {/* Tech Stack */}
              {project.tech_stack && project.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {project.tech_stack.slice(0, 5).map((tech, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-[#142646] border border-white/5 rounded-md text-[11px] text-slate-300 font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.tech_stack.length > 5 && (
                    <span className="px-3 py-1 bg-[#142646] border border-white/5 rounded-md text-[11px] text-slate-400 font-mono">
                      +{project.tech_stack.length - 5}
                    </span>
                  )}
                </div>
              )}

              {/* Progress Bar (Only for In Progress) */}
              {!isUpcoming &&
                project.progress > 0 &&
                project.visibility_config?.progress !== false && (
                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Development Phase</span>
                      <span className="text-emerald-400">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000 ease-out relative shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                        style={{ width: `${project.progress}%` }}
                      >
                        <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite]" />
                      </div>
                    </div>
                  </div>
                )}

              {/* Expected Dates (Optional) */}
              {(project.expected_completion || project.start_date) && (
                <div className="pt-2 flex items-center gap-4 text-[11px] text-slate-400 font-mono uppercase tracking-wider">
                  {isUpcoming && project.start_date && (
                    <span className="flex items-center gap-1.5">
                      <Terminal size={12} /> Starts:{" "}
                      {new Date(project.start_date).toLocaleDateString(
                        undefined,
                        { month: "short", year: "numeric" },
                      )}
                    </span>
                  )}
                  {project.expected_completion && (
                    <span className="flex items-center gap-1.5">
                      Target:{" "}
                      {new Date(project.expected_completion).toLocaleDateString(
                        undefined,
                        { month: "short", year: "numeric" },
                      )}
                    </span>
                  )}
                </div>
              )}

              {/* CTA */}
              {project.cta_enabled !== false && (
                <div className="pt-4">
                  <Link
                    to={`/projects/${project.slug}`}
                    className="inline-flex items-center gap-2 text-[13px] font-semibold text-white group/btn"
                  >
                    <span className="group-hover/btn:text-[#FFA916] transition-colors">
                      {project.cta_label || "View Details"}
                    </span>
                    <ArrowRight
                      size={14}
                      className="text-white/50 group-hover/btn:text-[#FFA916] group-hover/btn:translate-x-1 transition-all"
                    />
                  </Link>
                </div>
              )}
            </div>

            {/* Image (Optional, visible mainly on tablet/desktop) */}
            {project.image && (
              <div className="w-full md:w-56 h-36 md:h-44 rounded-xl overflow-hidden border border-white/10 shrink-0 relative bg-black/20 hidden sm:block group-hover:-translate-y-1 transition-transform duration-500 shadow-xl group-hover:shadow-[0_10px_20px_-10px_rgba(245,166,35,0.2)]">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default CurrentWork;
