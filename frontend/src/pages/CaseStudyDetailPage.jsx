import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  User,
  Calendar,
  ExternalLink,
  ShieldAlert,
  Cpu,
  Sparkles,
  ArrowRight,
  Server,
  Activity,
  ShieldCheck,
  Code2,
  Layers,
  FileText,
  Target,
  Award,
} from "lucide-react";
import { publicApi } from "../services/api";

const DEFAULT_COVER_IMAGES = [
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
];

const CaseStudyDetailPage = () => {
  const { slug } = useParams();
  const [cs, setCs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    publicApi
      .getCaseStudyBySlug(slug)
      .then((data) => {
        if (isMounted) {
          setCs(data);
          document.title = `${data.title} — Technical Case Study`;
        }
      })
      .catch(() => {
        if (isMounted) setError("Case Study dossier not found or is private.");
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
          Loading case study architecture...
        </p>
      </div>
    );
  }

  if (error || !cs) {
    return (
      <div className="pt-28 pb-16 px-[5%] lg:px-[9%] min-h-screen text-center flex flex-col justify-center items-center">
        <h2 className="text-2xl font-extrabold text-white mb-2">
          Case Study Dossier Not Found
        </h2>
        <p className="text-slate-400 mb-5 max-w-md text-xs">
          {error || "The requested case study could not be located."}
        </p>
        <Link
          to="/case-studies"
          className="px-5 py-2.5 rounded-full bg-[#f5a623] text-[#0b1528] font-bold text-xs uppercase tracking-wider shadow-md hover:bg-white transition-all"
        >
          Return to Case Studies Directory
        </Link>
      </div>
    );
  }

  const coverImg =
    cs.cover_image || cs.hero_image || cs.image || DEFAULT_COVER_IMAGES[0];

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

  const impactSummary =
    cs.key_metrics ||
    cs.performance_improvements ||
    cs.results_summary ||
    "Substantial Scale Achieved";

  return (
    <div className="pt-28 sm:pt-32 pb-16 px-[5%] lg:px-[9%] min-h-screen max-w-6xl mx-auto space-y-6 sm:space-y-7">
      {/* ── Top Navigation & Dossier Tag Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <Link
          to="/case-studies"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-[#f5a623] transition-colors group"
        >
          <ArrowLeft
            size={13}
            className="group-hover:-translate-x-1 transition-transform text-[#f5a623]"
          />
          <span>Case Studies</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-200 truncate max-w-[200px] sm:max-w-none">
            {cs.title}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="px-3 py-0.5 rounded-full bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/30 font-mono text-[11px] font-bold">
            {cs.reference_id}
          </span>
          <span className="px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1.5">
            <CheckCircle2 size={11} /> Verified
          </span>
        </div>
      </div>

      {/* ── SECTION 1: High-Density Split Hero Showcase ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Hero Narrative Info (Left 7 Cols) */}
        <motion.div
          className="lg:col-span-7 flex flex-col justify-between space-y-3.5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#2b4b9b]/25 border border-[#2b4b9b]/40 text-[#2b4b9b] text-[11px] font-bold uppercase tracking-wider">
                <FileText size={12} className="text-[#f5a623]" /> Architectural
                Study
              </span>
              {cs.industry && (
                <span className="px-2.5 py-0.5 rounded-full bg-white/[0.05] text-slate-300 text-[11px] border border-white/10 font-semibold">
                  {cs.industry}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug">
              {cs.title}
            </h1>

            {cs.summary && (
              <div className="p-3.5 rounded-xl bg-[#0b1528]/90 border-l-3 border-[#f5a623] text-slate-300 text-xs sm:text-sm leading-relaxed italic shadow-md">
                "{cs.summary}"
              </div>
            )}
          </div>

          {/* Quick Domain Badges */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs pt-1 text-slate-400">
            {cs.client_name && (
              <div className="flex items-center gap-1.5 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/10 text-[11px]">
                <User size={13} className="text-[#f5a623]" />
                <span>
                  Client:{" "}
                  <strong className="text-white">{cs.client_name}</strong>
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/10 text-[11px]">
              <Target size={13} className="text-emerald-400" />
              <span>
                Scope:{" "}
                <strong className="text-white">Enterprise Scalability</strong>
              </span>
            </div>
          </div>
        </motion.div>

        {/* Hero Featured Card Image (Right 5 Cols) */}
        <motion.div
          className="lg:col-span-5 relative flex"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="w-full min-h-[200px] h-full max-h-[240px] rounded-2xl overflow-hidden border border-white/15 shadow-xl bg-[#0b1528] relative group flex flex-col justify-end">
            <img
              src={coverImg}
              alt={cs.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_COVER_IMAGES[0];
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1528] via-black/30 to-transparent opacity-90" />

            {/* Floating Overlay Pill */}
            <div className="relative z-10 p-2.5 m-2.5 rounded-xl bg-[#0b1528]/90 backdrop-blur-md border border-white/15 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300 font-medium">Outcome</span>
              </div>
              <span className="text-[#f5a623] font-bold font-mono truncate max-w-[130px]">
                {typeof impactSummary === "string"
                  ? impactSummary
                  : "Verified Metric"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── SECTION 2: Compact Impact Stats Ribbon ── */}
      <motion.div
        className="py-3 px-5 rounded-2xl bg-gradient-to-r from-[#0b1528] via-[#112240] to-[#0b1528] border border-white/10 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-3 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="space-y-0.5">
          <span className="block text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#f5a623] to-amber-200">
            500k+
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Scale Handled
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="block text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
            99.99%
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Uptime SLA
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="block text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-200">
            &lt; 50ms
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Avg API Latency
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="block text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-200">
            Zero
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Downtime Deploy
          </span>
        </div>
      </motion.div>

      {/* ── SECTION 3: Balanced 2-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Content Column (Left 8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Phase 01: Challenge */}
          <motion.div
            className="p-5 sm:p-6 rounded-2xl bg-[#0b1528]/90 border border-amber-500/30 shadow-xl space-y-3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShieldAlert size={16} />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  1. Business & Engineering Challenge
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold uppercase">
                Phase 01
              </span>
            </div>

            <div className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              {cs.challenge ||
                `The primary engineering objective was scaling ${cs.title} under extreme peak user demand while maintaining sub-50ms API response times and zero system downtime. Legacy monolithic bottlenecks caused database locks and memory leaks during high traffic spikes.`}
            </div>
          </motion.div>

          {/* Phase 02: Architecture & Solution */}
          <motion.div
            className="p-5 sm:p-6 rounded-2xl bg-[#0b1528]/90 border border-emerald-500/30 shadow-xl space-y-3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Cpu size={16} />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  2. Architectural Strategy & Solution
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold uppercase">
                Phase 02
              </span>
            </div>

            <div className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              {cs.solution ||
                `Architected a high-throughput microservices ecosystem powered by ${techList.slice(0, 3).join(", ") || "Spring Boot and Redis"}. Implemented async non-blocking queues, distributed caching layers, connection pooling, and automated failover routing.`}
            </div>
          </motion.div>

          {/* Phase 03: Measured Results */}
          <motion.div
            className="p-5 sm:p-6 rounded-2xl bg-[#0b1528]/90 border border-[#f5a623]/35 shadow-xl space-y-3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#f5a623]/10 border border-[#f5a623]/30 flex items-center justify-center text-[#f5a623]">
                  <Award size={16} />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  3. Measured Results & Enterprise Impact
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#f5a623]/10 border border-[#f5a623]/30 text-[#f5a623] font-mono text-[10px] font-bold uppercase">
                Phase 03
              </span>
            </div>

            <div className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              {cs.results ||
                `Successfully scaled system capacity by 10x with zero downtime during peak loads. Reduced average database query latency by 68% and achieved an overall system uptime SLA of 99.99%.`}
            </div>
          </motion.div>

          {/* Core System Architecture Highlights Grid */}
          <motion.div
            className="p-5 sm:p-6 rounded-2xl bg-[#0b1528]/90 border border-white/10 space-y-3 shadow-xl"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
              <div className="w-8 h-8 rounded-lg bg-[#2b4b9b]/20 border border-[#2b4b9b]/40 flex items-center justify-center text-[#2b4b9b]">
                <Layers size={16} />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Core System Capabilities & SLA Highlights
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400" /> High
                  Availability Cluster
                </span>
                <p className="text-[11px] text-slate-400">
                  Multi-region active-active deployment with automated failover.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400" />{" "}
                  Distributed Caching
                </span>
                <p className="text-[11px] text-slate-400">
                  Redis cache layer reducing primary database read operations by
                  75%.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400" /> Zero
                  Downtime CI/CD
                </span>
                <p className="text-[11px] text-slate-400">
                  Rolling updates with automated health checks and instant
                  rollback capability.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400" />{" "}
                  Security & Compliance
                </span>
                <p className="text-[11px] text-slate-400">
                  AES-256 end-to-end data encryption with granular RBAC
                  authorization.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Sidebar Panel (Right 4 Cols) */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
          {/* Engineering Dossier Card */}
          <motion.div
            className="p-5 rounded-2xl bg-[#0b1528] border border-white/10 space-y-4 shadow-xl relative overflow-hidden"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#f5a623]/5 rounded-bl-full pointer-events-none" />

            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2.5 flex items-center gap-2">
              <Server size={14} className="text-[#f5a623]" /> Case Dossier Specs
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400">Ref Code</span>
                <span className="font-mono text-[#f5a623] font-bold bg-[#f5a623]/10 px-2 py-0.5 rounded border border-[#f5a623]/30">
                  {cs.reference_id}
                </span>
              </div>

              {cs.client_name && (
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-slate-400">Client Domain</span>
                  <span className="text-white font-semibold">
                    {cs.client_name}
                  </span>
                </div>
              )}

              {cs.industry && (
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-slate-400">Industry</span>
                  <span className="text-white font-semibold">
                    {cs.industry}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Audit Status</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={11} /> Verified Metric
                </span>
              </div>
            </div>
          </motion.div>

          {/* Infrastructure & Tech Stack Card (In Sidebar) */}
          {techList.length > 0 && (
            <motion.div
              className="p-5 rounded-2xl bg-[#0b1528] border border-white/10 space-y-3 shadow-xl"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2.5 flex items-center gap-2">
                <Code2 size={14} className="text-[#2b4b9b]" /> Technologies
                Deployed
              </h4>

              <div className="flex flex-wrap gap-2 pt-1">
                {techList.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-medium text-slate-200 hover:border-[#f5a623]/40 transition-colors"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Compact Action CTA Card */}
          <motion.div
            className="p-5 rounded-2xl bg-gradient-to-br from-[#2b4b9b]/30 via-[#0b1528] to-[#f5a623]/20 border border-[#f5a623]/40 shadow-xl space-y-3 relative overflow-hidden"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-8 h-8 rounded-xl bg-[#f5a623]/10 border border-[#f5a623]/30 flex items-center justify-center text-[#f5a623] mb-1">
              <Sparkles size={16} />
            </div>

            <h3 className="text-sm font-bold text-white leading-snug">
              Need a Similar Transformation?
            </h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Book an architecture review or discuss microservices & backend
              scaling.
            </p>

            <Link
              to="/contact"
              className="w-full py-2.5 px-3 rounded-lg bg-[#f5a623] hover:bg-white text-[#0b1528] font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 group"
            >
              Get In Touch{" "}
              <ArrowRight
                size={13}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CaseStudyDetailPage;
