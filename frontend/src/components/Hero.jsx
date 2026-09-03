import React, { useEffect, useRef } from "react";
import Typed from "typed.js";
import { Github, Linkedin, ArrowRight, Download, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useSettings } from "../context/SettingsContext";
import Tilt from "./Tilt";

const Hero = () => {
  const el = useRef(null);
  const { settings } = useSettings();

  // Dynamic typed words parsing with fallback
  const rawTypedWords = settings.hero_typed_words;
  const typedWords = Array.isArray(rawTypedWords)
    ? rawTypedWords
    : typeof rawTypedWords === "string"
      ? (() => {
          try {
            return JSON.parse(rawTypedWords);
          } catch (e) {
            return null;
          }
        })()
      : null;

  const activeTypedWords =
    typedWords && typedWords.length > 0
      ? typedWords
      : [
          "Java Full Stack Developer",
          "Spring Boot & Microservices Specialist",
          "React JS Frontend Architect",
          "Enterprise REST API Developer",
          "Cloud Systems Integrator",
        ];

  useEffect(() => {
    if (!el.current) return;
    const typed = new Typed(el.current, {
      strings: activeTypedWords,
      typeSpeed: 60,
      backSpeed: 30,
      backDelay: 1400,
      loop: true,
    });

    return () => {
      typed.destroy();
    };
  }, [JSON.stringify(activeTypedWords)]);

  const resumeUrl = settings.resume_url || "/resume.pdf";
  const ownerName = settings.owner_name || "Pravesh Kumar";

  // Split name for dual-color editorial treatment ("Pravesh" -> white, "Kumar" -> orange)
  const nameParts = ownerName.split(" ");
  const firstName = nameParts[0] || "Pravesh";
  const lastName = nameParts.slice(1).join(" ") || "Kumar";

  return (
    <section
      className="relative min-h-[90vh] pt-20 sm:pt-24 lg:pt-20 pb-16 px-[5%] lg:px-[8%] max-w-full flex flex-col-reverse lg:flex-row justify-center items-center gap-10 lg:gap-8 overflow-hidden"
      id="home"
    >
      {/* ── Ambient Background Glow Effects ── */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#FFA916]/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#3158B7]/15 blur-[140px] pointer-events-none rounded-full" />

      {/* ── Left Content Column ── */}
      <motion.div
        className="flex-1 text-center lg:text-left z-10 space-y-4 max-w-2xl"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
      >
        {/* Availability Badge */}
        {settings.hero_badge && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFA916]/10 border border-[#FFA916]/30 text-[#FFA916] text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {settings.hero_badge}
          </div>
        )}

        {/* Small Introduction */}
        <h3 className="text-lg sm:text-xl font-bold text-slate-300 tracking-wide">
          {settings.hero_greeting || "Hello, It's Me"}
        </h3>

        {/* Display Typography Main Name (Pravesh Kumar) */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight leading-none my-1.5">
          <span className="text-white">{firstName} </span>
          <span className="text-[#FFA916] drop-shadow-[0_4px_25px_rgba(255,169,22,0.3)]">
            {lastName}
          </span>
        </h1>

        {/* Professional Identity Line */}
        <h2 className="text-base sm:text-2xl font-bold text-amber-100/90 tracking-wide">
          {settings.hero_professional_title ||
            "Software Engineer · Full-Stack Developer"}
        </h2>

        {/* Unique Value Statement / Tagline */}
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans pt-1">
          {settings.hero_tagline ||
            "Architecting scalable applications, intelligent systems & digital experiences."}
        </p>

        {/* Dynamic Typed Line */}
        <h3 className="text-sm sm:text-lg font-bold text-slate-200 flex items-center justify-center lg:justify-start gap-2 pt-1">
          <span>And I'm a</span>
          <span className="text-[#FFA916] font-mono underline decoration-[#FFA916]/40 underline-offset-4">
            <span ref={el}></span>
          </span>
        </h3>

        {/* ── Actions Row (Socials & CTAs) ── */}
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-4">
          {/* Social Icons */}
          <div className="flex items-center gap-2.5">
            {settings.github_url && (
              <a
                href={settings.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/[0.03] border border-white/10 text-[#FFA916] flex items-center justify-center hover:bg-[#FFA916] hover:text-[#142646] hover:border-[#FFA916] hover:shadow-[0_0_15px_rgba(255,169,22,0.4)] hover:-translate-y-1 transition-all"
                title="GitHub Profile"
              >
                <Github size={16} />
              </a>
            )}
            {settings.linkedin_url && (
              <a
                href={settings.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/[0.03] border border-white/10 text-[#FFA916] flex items-center justify-center hover:bg-[#FFA916] hover:text-[#142646] hover:border-[#FFA916] hover:shadow-[0_0_15px_rgba(255,169,22,0.4)] hover:-translate-y-1 transition-all"
                title="LinkedIn Profile"
              >
                <Linkedin size={16} />
              </a>
            )}
            {settings.company_email && (
              <a
                href={`mailto:${settings.company_email}`}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/[0.03] border border-white/10 text-[#FFA916] flex items-center justify-center hover:bg-[#FFA916] hover:text-[#142646] hover:border-[#FFA916] hover:shadow-[0_0_15px_rgba(255,169,22,0.4)] hover:-translate-y-1 transition-all"
                title="Email Contact"
              >
                <Mail size={16} />
              </a>
            )}
          </div>

          {/* Vertical Divider */}
          <div className="hidden sm:block w-[1px] h-8 bg-white/10 mx-1 lg:mx-2" />

          {/* CTA Buttons Group */}
          <div className="flex items-center gap-3">
            {/* Download CV (Primary) */}
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#FFA916] text-[#142646] font-black text-[9px] sm:text-[10px] uppercase tracking-widest shadow-lg shadow-[#FFA916]/25 hover:shadow-[0_0_15px_rgba(255,169,22,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <Download size={13} /> Download CV
            </a>

            {/* Explore Projects (Secondary) */}
            <a
              href="/projects"
              className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#3158B7] hover:bg-[#3158B7]/90 text-white font-black text-[9px] sm:text-[10px] uppercase tracking-widest shadow-lg shadow-[#3158B7]/30 hover:shadow-[0_0_15px_rgba(49,88,183,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group"
            >
              Explore Projects{" "}
              <ArrowRight
                size={13}
                className="group-hover:translate-x-1 transition-transform"
              />
            </a>
          </div>
        </div>
      </motion.div>

      {/* ── Right Column: Interactive Photo ── */}
      <motion.div
        className="relative w-full lg:w-[480px] h-[340px] sm:h-[420px] lg:h-[480px] flex justify-center items-center shrink-0 z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: [0, -15, 0],
        }}
        transition={{
          opacity: { duration: 0.8, delay: 0.2 },
          scale: { duration: 0.8, delay: 0.2 },
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <Tilt
          options={{ max: 15, scale: 1.05 }}
          className="relative w-[240px] sm:w-[300px] lg:w-[340px] aspect-square group"
        >
          {/* Glowing backdrop shadow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FFA916] to-[#3158B7] blur-[40px] opacity-40 group-hover:opacity-60 transition-opacity duration-700 animate-pulse" />

          {/* Premium Animated Gradient Border Ring */}
          <motion.div
            className="absolute inset-[-4px] rounded-full bg-gradient-to-br from-[#FFA916] via-transparent to-[#3158B7] opacity-70 group-hover:opacity-100 transition-opacity duration-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />

          {/* Inner masking background */}
          <div className="absolute inset-0 rounded-full bg-[#0d1322] z-0" />

          {/* Image Container */}
          <div className="relative z-10 w-full h-full rounded-full overflow-hidden border-[6px] border-[#0d1322]">
            <img
              src={settings.hero_image || "/images/profile.png"}
              alt={ownerName}
              className="w-full h-full object-cover object-center grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
            />
            {/* Inner shadow overlay for depth */}
            <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.6)] pointer-events-none" />
          </div>

          {/* Decorative floating orbits */}
          <motion.div
            className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-[#FFA916] to-[#f5a623] rounded-full blur-[2px] opacity-60 z-20 shadow-[0_0_20px_rgba(255,169,22,0.4)]"
            animate={{
              y: [0, 15, 0],
              x: [0, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
          <motion.div
            className="absolute -bottom-4 -left-4 w-8 h-8 bg-gradient-to-br from-[#3158B7] to-[#4b76e3] rounded-full blur-[1px] opacity-60 z-20 shadow-[0_0_20px_rgba(49,88,183,0.4)]"
            animate={{
              y: [0, -10, 0],
              x: [0, 10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
        </Tilt>
      </motion.div>
    </section>
  );
};

export default Hero;
