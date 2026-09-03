import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Layers,
  ArrowRight,
  Cpu,
  ShieldCheck,
  Database,
  Zap,
  Sparkles,
  Server,
  Code2,
  Layout,
  Cloud,
  Lock,
  Terminal,
  Activity,
} from "lucide-react";
import { publicApi } from "../services/api";

const ServiceDetailPage = () => {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    publicApi
      .getServiceBySlug(slug)
      .then((data) => {
        if (isMounted) {
          setService(data);
          document.title = `${data.name || data.title} — Enterprise Service Architecture`;
        }
      })
      .catch(() => {
        if (isMounted)
          setError("Service specification not found or currently inactive.");
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
      <div className="pt-36 pb-24 px-[5%] lg:px-[9%] min-h-screen text-center flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#f5a623] border-t-transparent animate-spin mb-4" />
        <p className="text-slate-400 font-mono text-xs tracking-widest uppercase">
          Loading service architecture...
        </p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="pt-36 pb-24 px-[5%] lg:px-[9%] min-h-screen text-center flex flex-col justify-center items-center">
        <h2 className="text-3xl font-extrabold text-white mb-3">
          Service Specification Not Found
        </h2>
        <p className="text-slate-400 mb-6 max-w-md text-sm">
          {error || "The requested service specification could not be located."}
        </p>
        <Link
          to="/services"
          className="px-6 py-3 rounded-full bg-[#f5a623] text-[#0b1528] font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#f5a623]/25 hover:bg-white transition-all"
        >
          Return to Services Overview
        </Link>
      </div>
    );
  }

  // Extract technologies list
  const techList = Array.isArray(service.technologies)
    ? service.technologies
    : typeof service.technologies === "string"
      ? service.technologies.split(",").map((s) => s.trim())
      : service.tech_stack || [];

  const featuresList = Array.isArray(service.features)
    ? service.features
    : typeof service.features === "string"
      ? service.features.split(",").map((s) => s.trim())
      : [];

  return (
    <div className="pt-28 sm:pt-32 pb-20 px-[5%] lg:px-[9%] min-h-screen max-w-6xl mx-auto">
      {/* Top Breadcrumb Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-[#f5a623] transition-colors group"
        >
          <ArrowLeft
            size={14}
            className="group-hover:-translate-x-1 transition-transform text-[#f5a623]"
          />
          <span>Services</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-200">
            {service.name || service.title}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/30 font-mono text-xs font-bold">
            {service.reference_id}
          </span>
        </div>
      </div>

      {/* Hero Content Area */}
      <motion.div
        className="space-y-4 mb-10"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f5a623]/10 border border-[#f5a623]/30 text-[#f5a623] text-xs font-bold tracking-wider uppercase">
          <Sparkles size={13} /> Service Architecture
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
          {service.name || service.title}
        </h1>

        <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl font-normal">
          {service.description || service.full_description}
        </p>

        {/* Highlight Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
          {[
            { icon: Activity, label: "High Throughput", val: "Sub-100ms API" },
            { icon: Lock, label: "Enterprise Security", val: "OAuth2 & RBAC" },
            { icon: Cloud, label: "Deployment", val: "Docker / Cloud" },
            {
              icon: Terminal,
              label: "Architecture",
              val: "Modular & Scalable",
            },
          ].map((m, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-[#0b1528]/80 border border-white/5 flex items-center gap-3"
            >
              <m.icon size={18} className="text-[#f5a623] shrink-0" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">
                  {m.label}
                </span>
                <span className="text-xs font-semibold text-white">
                  {m.val}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 2-Column Master Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Detailed Description Card */}
          {service.full_description && (
            <motion.div
              className="p-8 rounded-3xl bg-[#0b1528]/90 border border-white/10 space-y-4 shadow-2xl relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#f5a623] via-[#2b4b9b] to-transparent" />

              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="w-9 h-9 rounded-xl bg-[#f5a623]/10 border border-[#f5a623]/30 flex items-center justify-center text-[#f5a623]">
                  <Cpu size={18} />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Architectural Capabilities & Overview
                </h3>
              </div>

              <div className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line pt-1">
                {service.full_description}
              </div>
            </motion.div>
          )}

          {/* 4 Core Pillars Grid */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="text-emerald-400" size={18} /> Core
              Engineering Standards
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Frontend Excellence",
                  desc: "Responsive, accessible UIs built with React 19, Tailwind CSS, and Framer Motion for rich interaction.",
                  icon: Layout,
                },
                {
                  title: "Backend Microservices",
                  desc: "Robust Java 21 & Spring Boot RESTful microservices with distributed transaction handling.",
                  icon: Server,
                },
                {
                  title: "Data & Analytics",
                  desc: "PostgreSQL database schemas with optimized indexing, pooling, and automated migration scripts.",
                  icon: Database,
                },
                {
                  title: "DevOps & Security",
                  desc: "Docker containerization, CI/CD pipelines, automated testing, and zero-trust security standards.",
                  icon: Lock,
                },
              ].map((pillar, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#0b1528]/80 border border-white/5 hover:border-white/20 transition-all duration-300 group space-y-2"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#f5a623] group-hover:scale-110 transition-transform">
                    <pillar.icon size={16} />
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {pillar.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Technology Stack Badges */}
          {techList.length > 0 && (
            <motion.div
              className="p-8 rounded-3xl bg-[#0b1528]/90 border border-white/10 space-y-4 shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="w-9 h-9 rounded-xl bg-[#2b4b9b]/20 border border-[#2b4b9b]/40 flex items-center justify-center text-[#2b4b9b]">
                  <Code2 size={18} />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Supported Tech Stack & Ecosystem
                </h3>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {techList.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-slate-200 hover:border-[#f5a623]/50 hover:text-white transition-all shadow-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Sticky Sidebar */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
          {/* Specifications Card */}
          <motion.div
            className="p-6 rounded-3xl bg-[#0b1528] border border-white/10 space-y-5 shadow-2xl"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-2">
              <Server size={15} className="text-[#f5a623]" /> Specifications
            </h4>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400">Reference ID</span>
                <span className="font-mono text-white font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  {service.reference_id}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400">Delivery Model</span>
                <span className="text-slate-200 font-semibold">
                  Agile / Sprint-Based
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400">Architecture</span>
                <span className="text-slate-200 font-semibold">
                  Cloud Native
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Status</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Zap size={12} /> Active Service
                </span>
              </div>
            </div>
          </motion.div>

          {/* Interactive CTA Card */}
          <motion.div
            className="p-6 rounded-3xl bg-gradient-to-br from-[#2b4b9b]/30 via-[#0b1528] to-[#f5a623]/20 border border-[#f5a623]/40 shadow-2xl space-y-4 relative overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-10 h-10 rounded-2xl bg-[#f5a623]/10 border border-[#f5a623]/30 flex items-center justify-center text-[#f5a623] mb-2">
              <Sparkles size={20} />
            </div>

            <h3 className="text-base font-bold text-white leading-tight">
              Need This Architecture Built?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Schedule a technical discovery call or request a detailed
              architectural proposal.
            </p>

            <Link
              to="/contact"
              className="w-full py-3 px-4 rounded-xl bg-[#f5a623] hover:bg-white text-[#0b1528] font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#f5a623]/25 transition-all flex items-center justify-center gap-2 group"
            >
              Request Proposal{" "}
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
