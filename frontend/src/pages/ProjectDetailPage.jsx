import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Github,
  ArrowLeft,
  BookOpen,
  Calendar,
  User,
  Film,
  Image as ImageIcon,
  Target,
  Code2,
  Rocket,
  Briefcase,
} from "lucide-react";
import { publicApi } from "../services/api";

const ProjectDetailPage = () => {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    publicApi
      .getProjectBySlug(slug)
      .then((data) => {
        if (isMounted) {
          setProject(data);
          document.title = `${data.title} — Project Documentation`;
        }
      })
      .catch((err) => {
        if (isMounted) setError("Project not found or is currently private.");
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
      <div className="pt-32 pb-24 px-[5%] lg:px-[9%] min-h-screen text-center flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#f5a623] border-t-transparent animate-spin mb-4" />
        <p className="text-slate-400 font-mono text-[11px] tracking-widest uppercase">
          Retrieving document...
        </p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="pt-32 pb-24 px-[5%] lg:px-[9%] min-h-screen text-center flex flex-col justify-center items-center">
        <h2 className="text-3xl font-extrabold text-white mb-3">
          Document Not Found
        </h2>
        <p className="text-slate-400 mb-6">
          {error || "The requested project document could not be located."}
        </p>
        <Link
          to="/projects"
          className="px-6 py-2.5 rounded-full bg-[#f5a623] text-[#122240] font-bold text-sm uppercase tracking-wider shadow-md hover:bg-white transition-all"
        >
          Return to Directory
        </Link>
      </div>
    );
  }

  const techList = Array.isArray(project.tech_stack)
    ? project.tech_stack
    : typeof project.tech_stack === "string"
      ? project.tech_stack.split(",").map((s) => s.trim())
      : [];

  return (
    <div className="pt-28 sm:pt-32 pb-24 px-[5%] lg:px-[9%] min-h-screen max-w-6xl mx-auto">
      {/* ── Document Header ── */}
      <div className="mb-12 space-y-8 max-w-4xl mx-auto text-center">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-[#f5a623] transition-colors group mx-auto"
        >
          <ArrowLeft
            size={13}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Projects Directory
        </Link>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="px-3 py-1 rounded bg-[#f5a623]/10 border border-[#f5a623]/30 text-[#f5a623] font-mono text-xs font-bold uppercase tracking-wider">
              DOC-REF: {project.reference_id}
            </span>
            {project.status === "in_progress" && (
              <span className="px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />{" "}
                Active Build
              </span>
            )}
            {project.category && (
              <span className="text-slate-300 text-xs font-medium uppercase tracking-wider px-3 py-1 rounded border border-white/20 bg-white/5">
                {project.category}
              </span>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            {project.title}
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed font-light mx-auto">
            {project.short_description || project.description}
          </p>
        </div>
      </div>

      {/* ── Hero Image ── */}
      {(project.hero_image || project.image) && (
        <motion.div
          className="w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden bg-[#0b1528] mb-20 shadow-2xl border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={project.hero_image || project.image}
            alt={project.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </motion.div>
      )}

      {/* ── Document Body (Sidebar + Content) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Sidebar: Metadata (3 cols) */}
        <div className="lg:col-span-4 space-y-10 lg:sticky lg:top-32 order-2 lg:order-1">
          <div className="space-y-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-white/10 pb-3">
              Project Specification
            </h4>

            <div className="space-y-5 text-sm">
              {project.client_name && (
                <div>
                  <span className="block text-xs text-slate-500 mb-1">
                    Client / Organization
                  </span>
                  <span className="text-white font-medium flex items-center gap-2">
                    <Briefcase size={14} className="text-[#f5a623]" />{" "}
                    {project.client_name}
                  </span>
                </div>
              )}

              <div>
                <span className="block text-xs text-slate-500 mb-1">
                  Current Status
                </span>
                <span className="text-white font-medium capitalize flex items-center gap-2">
                  <Target size={14} className="text-[#f5a623]" />
                  {project.status === "in_progress"
                    ? "In Progress"
                    : project.status}
                  {project.status === "in_progress" &&
                    project.progress > 0 &&
                    project.visibility_config?.progress !== false && (
                      <span className="text-slate-400 text-xs">
                        ({project.progress}%)
                      </span>
                    )}
                </span>
              </div>

              {project.expected_completion && (
                <div>
                  <span className="block text-xs text-slate-500 mb-1">
                    Expected Launch
                  </span>
                  <span className="text-white font-medium flex items-center gap-2">
                    <Calendar size={14} className="text-[#f5a623]" />{" "}
                    {new Date(project.expected_completion).toLocaleDateString(
                      undefined,
                      { month: "long", year: "numeric" },
                    )}
                  </span>
                </div>
              )}

              {project.completion_date && (
                <div>
                  <span className="block text-xs text-slate-500 mb-1">
                    Completion Date
                  </span>
                  <span className="text-white font-medium flex items-center gap-2">
                    <Calendar size={14} className="text-[#f5a623]" />{" "}
                    {new Date(project.completion_date).toLocaleDateString(
                      undefined,
                      { month: "long", year: "numeric" },
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {techList.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-white/10 pb-3">
                Technologies
              </h4>
              <div className="flex flex-wrap gap-2">
                {techList.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Links */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            {project.live_link && (
              <a
                href={project.live_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#f5a623] hover:bg-white text-[#0b1528] transition-colors group shadow-lg"
              >
                <span className="font-bold text-sm uppercase tracking-wider">
                  Live Demo
                </span>
                <ExternalLink
                  size={18}
                  className="group-hover:scale-110 transition-transform"
                />
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors group"
              >
                <span className="font-bold text-sm uppercase tracking-wider">
                  Source Code
                </span>
                <Github
                  size={18}
                  className="group-hover:scale-110 transition-transform"
                />
              </a>
            )}
            {project.related_case_study_info && (
              <Link
                to={`/case-studies/${project.related_case_study_info.slug || project.related_case_study_info.reference_id}`}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#2b4b9b]/20 hover:bg-[#2b4b9b]/30 border border-[#2b4b9b]/40 text-[#4a72d4] transition-colors group"
              >
                <span className="font-bold text-sm uppercase tracking-wider">
                  Read Case Study
                </span>
                <BookOpen
                  size={18}
                  className="group-hover:scale-110 transition-transform"
                />
              </Link>
            )}
          </div>
        </div>

        {/* Right Content: Main Document (8 cols) */}
        <div className="lg:col-span-8 space-y-16 order-1 lg:order-2">
          {project.full_description &&
            project.visibility_config?.overview !== false && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-[#f5a623]/20 text-[#f5a623] flex items-center justify-center text-sm font-black">
                    1
                  </span>
                  Detailed Overview
                </h2>
                <div className="text-slate-300 text-lg leading-loose whitespace-pre-line font-light">
                  {project.full_description}
                </div>
              </motion.section>
            )}

          {project.challenges &&
            project.visibility_config?.problem !== false && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-[#f5a623]/20 text-[#f5a623] flex items-center justify-center text-sm font-black">
                    2
                  </span>
                  Engineering Challenges
                </h2>
                <div className="pl-6 border-l-2 border-amber-500/50">
                  <p className="text-slate-300 text-lg leading-loose whitespace-pre-line font-light">
                    {project.challenges}
                  </p>
                </div>
              </motion.section>
            )}

          {project.solutions &&
            project.visibility_config?.architecture !== false && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-[#f5a623]/20 text-[#f5a623] flex items-center justify-center text-sm font-black">
                    3
                  </span>
                  Implemented Solutions
                </h2>
                <div className="pl-6 border-l-2 border-emerald-500/50">
                  <p className="text-slate-300 text-lg leading-loose whitespace-pre-line font-light">
                    {project.solutions}
                  </p>
                </div>
              </motion.section>
            )}

          {project.results && project.visibility_config?.impact !== false && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-[#f5a623]/20 text-[#f5a623] flex items-center justify-center text-sm font-black">
                  4
                </span>
                Results & Impact
              </h2>
              <div className="pl-6 border-l-2 border-blue-500/50">
                <p className="text-slate-300 text-lg leading-loose whitespace-pre-line font-light">
                  {project.results}
                </p>
              </div>
            </motion.section>
          )}
        </div>
      </div>

      {/* ── Document Appendix: Media Gallery ── */}
      {project.media && project.media.length > 0 && (
        <div className="mt-24 pt-16 border-t border-white/10 space-y-12">
          <div className="text-center">
            <h3 className="text-3xl font-extrabold text-white mb-3">
              Appendix: Visual Documentation
            </h3>
            <p className="text-slate-400 text-lg">
              Screenshots, walkthroughs, and architectural diagrams.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {project.media.map((item, idx) => (
              <figure key={item.reference_id || idx} className="space-y-4">
                <div className="aspect-video relative rounded-2xl overflow-hidden bg-[#0b1528] border border-white/10 shadow-xl group">
                  {item.media_type.includes("video") ? (
                    <video
                      src={item.file_url}
                      controls
                      poster={item.thumbnail_url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={item.file_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  )}
                  {item.media_type.includes("video") && (
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/20 text-white shadow-lg">
                      <Film size={18} />
                    </div>
                  )}
                </div>
                <figcaption className="text-center px-4">
                  <span className="block text-white font-bold text-base mb-1">
                    {item.title}
                  </span>
                  {item.caption && (
                    <span className="block text-slate-400 text-sm">
                      {item.caption}
                    </span>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
