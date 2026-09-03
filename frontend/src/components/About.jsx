import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import SectionHeader from "./SectionHeader";
import { MapPin, Code2, Briefcase, ArrowRight, Server } from "lucide-react";

const About = () => {
  const { settings } = useSettings();

  const skills = (
    settings.tech_arsenal ||
    "Java 21, Spring Boot, React 19, PostgreSQL, Microservices, Docker, REST APIs, Node.js, Kafka, AWS, Tailwind CSS, Redis"
  )
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <section
      className="bg-[#0b1528] py-20 px-[5%] lg:px-[9%] relative overflow-hidden"
      id="about"
    >
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#3158B7]/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FFA916]/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeader
          badge="Behind The Code"
          title="About"
          highlight="Me"
          subtitle={
            settings.about_heading ||
            "Associate IT Engineer & Full Stack Architect"
          }
          className="text-left md:text-center mb-12"
        />

        {/* ── Bento Grid Layout ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Main Bio Box (Spans 2 cols) */}
          <motion.div
            className="md:col-span-2 lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-sm hover:bg-white/[0.04] transition-colors relative overflow-hidden group"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FFA916]/20 to-transparent blur-2xl group-hover:from-[#FFA916]/30 transition-all" />
            <h3 className="text-2xl font-bold text-white mb-4 font-display">
              {settings.owner_name
                ? `Hi, I'm ${settings.owner_name}.`
                : "Who am I?"}
            </h3>
            <p className="text-slate-300 leading-relaxed text-sm sm:text-base mb-6">
              {settings.about_text ||
                "Dedicated software engineer with expertise in Java 21, Spring Boot microservices, React 19, Neon PostgreSQL, and clean architecture. Experienced in delivering production-grade enterprise software."}
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-[#FFA916] font-bold text-sm hover:text-white transition-colors group/link"
            >
              Let's collaborate{" "}
              <ArrowRight
                size={16}
                className="group-hover/link:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>

          {/* Stats / Experience Box */}
          <motion.div
            className="bg-gradient-to-br from-[#FFA916] to-[#e5950d] rounded-3xl p-6 sm:p-8 flex flex-col justify-center items-center text-center shadow-[0_0_30px_rgba(255,169,22,0.15)] relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:10px_10px]" />
            <h3 className="text-5xl sm:text-6xl font-black text-[#0a0f1c] mb-2 font-display drop-shadow-sm">
              {settings.years_of_experience || "2+"}
            </h3>
            <p className="text-[#0a0f1c] font-bold text-xs sm:text-sm uppercase tracking-wider">
              Years of
              <br />
              Experience
            </p>
          </motion.div>

          {/* Location Box */}
          <motion.div
            className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-sm flex flex-col justify-center items-center text-center hover:bg-white/[0.04] transition-colors"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-14 h-14 rounded-full bg-[#3158B7]/20 flex items-center justify-center mb-4 text-[#3158B7] shadow-[0_0_15px_rgba(49,88,183,0.3)]">
              <MapPin size={24} />
            </div>
            <h4 className="text-white font-bold mb-1 text-sm sm:text-base">
              Based in
            </h4>
            <p className="text-slate-400 text-xs sm:text-sm">
              {settings.company_address || "Banka, Bihar, India"}
            </p>
          </motion.div>

          {/* Skills Tag Box (Spans 2 cols on lg, 3 on md) */}
          <motion.div
            className="md:col-span-3 lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-sm overflow-hidden flex flex-col justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="text-white font-bold mb-5 flex items-center gap-2">
              <Code2 size={18} className="text-[#FFA916]" /> Tech Arsenal
            </h4>

            <div className="flex flex-wrap gap-2.5">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-300 bg-white/[0.03] border border-white/10 rounded-lg hover:border-[#FFA916] hover:text-[#FFA916] transition-colors cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Focus / Roles Box */}
          <motion.div
            className="md:col-span-3 lg:col-span-2 bg-gradient-to-br from-[#3158B7]/10 to-transparent border border-[#3158B7]/30 rounded-3xl p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden group hover:border-[#3158B7]/50 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="absolute -right-6 -bottom-6 w-32 h-32 text-[#3158B7] opacity-20 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
              <Server size={128} />
            </div>
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <Briefcase size={18} className="text-[#FFA916]" /> Current Focus
            </h4>
            <ul className="space-y-4 relative z-10">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FFA916] mt-2 shrink-0 shadow-[0_0_8px_rgba(255,169,22,0.6)]" />
                <div>
                  <h5 className="text-white font-medium text-sm">
                    {settings.current_focus_1_title ||
                      "Enterprise Microservices"}
                  </h5>
                  <p className="text-slate-400 text-xs mt-1">
                    {settings.current_focus_1_subtitle ||
                      "Architecting robust distributed systems using Java 21 & Kafka."}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FFA916] mt-2 shrink-0 shadow-[0_0_8px_rgba(255,169,22,0.6)]" />
                <div>
                  <h5 className="text-white font-medium text-sm">
                    {settings.current_focus_2_title || "Full-Stack Scalability"}
                  </h5>
                  <p className="text-slate-400 text-xs mt-1">
                    {settings.current_focus_2_subtitle ||
                      "Bridging React frontends with high-performance Postgres backends."}
                  </p>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
