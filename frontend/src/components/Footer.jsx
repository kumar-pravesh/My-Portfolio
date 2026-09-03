import React from "react";
import { Link } from "react-router-dom";
import { Github, Linkedin, Mail, Heart, ArrowRight } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

const Footer = () => {
  const { settings } = useSettings();

  const brandName = settings.owner_name || settings.company_name || "PORTFOLIO";

  return (
    <footer className="relative bg-[#0a0f1c] border-t border-white/5 pt-20 sm:pt-28 pb-8 px-[5%] lg:px-[8%] overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[250px] bg-[#3158B7]/20 blur-[120px] rounded-full pointer-events-none" />

      {/* ── Top Section (Compact Premium CTA) ── */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8 mb-12 backdrop-blur-sm">
        <div className="text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            Let's build something{" "}
            <span className="text-[#FFA916]">extraordinary.</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-xl">
            {settings.seo_description ||
              "Java Full Stack Developer specializing in scalable enterprise web solutions."}
          </p>
        </div>

        <Link
          to="/contact"
          className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-[#FFA916] text-[#0a0f1c] font-black text-[11px] uppercase tracking-widest hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(255,169,22,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:-translate-y-0.5 shrink-0 group w-full md:w-auto"
        >
          Start a project{" "}
          <ArrowRight
            size={14}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>

      {/* ── Middle Section (Links & Massive Typography) ── */}
      <div className="relative z-10 flex flex-col gap-10 sm:gap-16">
        {/* Navigation & Socials Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
          {/* Inline Links */}
          <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm font-bold tracking-wide text-slate-300 uppercase">
            <Link to="/" className="hover:text-[#FFA916] transition-colors">
              Home
            </Link>
            <Link
              to="/services"
              className="hover:text-[#FFA916] transition-colors"
            >
              Services
            </Link>
            <Link
              to="/projects"
              className="hover:text-[#FFA916] transition-colors"
            >
              Projects
            </Link>
            <Link
              to="/case-studies"
              className="hover:text-[#FFA916] transition-colors"
            >
              Case Studies
            </Link>
            <Link to="/blog" className="hover:text-[#FFA916] transition-colors">
              Blog
            </Link>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            {settings.github_url && (
              <a
                href={settings.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-[#0a0f1c] hover:bg-[#FFA916] transition-all"
              >
                <Github size={18} />
              </a>
            )}
            {settings.linkedin_url && (
              <a
                href={settings.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-[#0a0f1c] hover:bg-[#FFA916] transition-all"
              >
                <Linkedin size={18} />
              </a>
            )}
            {settings.company_email && (
              <a
                href={`mailto:${settings.company_email}`}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-[#0a0f1c] hover:bg-[#FFA916] transition-all"
              >
                <Mail size={18} />
              </a>
            )}
          </div>
        </div>

        {/* Huge Display Brand Name */}
        <div className="w-full overflow-hidden flex justify-center">
          <h1 className="text-[12vw] sm:text-[11vw] lg:text-[10vw] leading-[0.8] font-black font-display text-white/[0.03] tracking-tighter uppercase select-none whitespace-nowrap text-center">
            {brandName}
          </h1>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-white/5 text-[11px] sm:text-xs text-slate-500 tracking-wider">
        <p>
          © {new Date().getFullYear()} {brandName}. ALL RIGHTS RESERVED.
        </p>
        <p className="flex items-center gap-1.5 uppercase">
          Crafted with{" "}
          <Heart size={12} className="fill-[#FFA916] text-[#FFA916]" /> in Bihar
        </p>
      </div>
    </footer>
  );
};

export default Footer;
