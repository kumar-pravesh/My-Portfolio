import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Github,
  Linkedin,
  Loader,
  CheckCircle2,
} from "lucide-react";
import { publicApi } from "../services/api";
import { useSettings } from "../context/SettingsContext";
import Tilt from "./Tilt";

import SectionHeader from "./SectionHeader";

const Contact = () => {
  const { settings } = useSettings();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    service: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      const data = await publicApi.submitContact(form);
      setSubmittedRef(data.reference_id || "CONT-SUCCESS");
      setForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        service: "",
        message: "",
      });
    } catch (err) {
      console.warn("API submission failed:", err.message);
      setErrorMsg(
        err.message || "Failed to submit contact message. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className="py-14 sm:py-16 px-[5%] lg:px-[9%] max-w-full bg-[#060c18] border-t border-white/[0.06]"
      id="contact"
    >
      <SectionHeader
        badge="Get In Touch"
        title="Contact"
        highlight="Me!"
        subtitle="Have a project or engineering inquiry? Send a message directly to get started."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-6xl mx-auto">
        {/* Contact Info */}
        <motion.div
          className="lg:col-span-5 space-y-10"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-4">
            <h3 className="text-4xl sm:text-5xl font-black text-white font-display tracking-tight">
              Get in Touch<span className="text-[#f5a623]">.</span>
            </h3>
            <p className="text-base text-slate-300 leading-relaxed font-sans max-w-sm">
              I am always interested in hearing about new enterprise projects,
              engineering opportunities, or technology collaborations.
            </p>
          </div>

          <div className="space-y-3">
            {settings.company_email && (
              <a
                href={`mailto:${settings.company_email}`}
                className="group flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#f5a623]/20 to-[#f5a623]/5 text-[#f5a623] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Mail size={18} />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Email
                  </span>
                  <strong className="text-[13px] sm:text-sm text-white font-semibold group-hover:text-[#f5a623] transition-colors">
                    {settings.company_email}
                  </strong>
                </div>
              </a>
            )}

            {settings.company_phone && (
              <a
                href={`tel:${settings.company_phone.replace(/\s+/g, "")}`}
                className="group flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#f5a623]/20 to-[#f5a623]/5 text-[#f5a623] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Phone size={18} />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Phone
                  </span>
                  <strong className="text-[13px] sm:text-sm text-white font-semibold group-hover:text-[#f5a623] transition-colors">
                    {settings.company_phone}
                  </strong>
                </div>
              </a>
            )}

            {settings.company_address && (
              <div className="group flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#f5a623]/20 to-[#f5a623]/5 text-[#f5a623] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin size={18} />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Location
                  </span>
                  <strong className="text-[13px] sm:text-sm text-white font-semibold group-hover:text-[#f5a623] transition-colors">
                    {settings.company_address}
                  </strong>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 pt-2">
            {settings.github_url && (
              <a
                href={settings.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-300 hover:bg-[#f5a623] hover:text-[#122240] hover:border-[#f5a623] hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(245,166,35,0.3)] transition-all"
                title="GitHub"
              >
                <Github size={20} />
              </a>
            )}
            {settings.linkedin_url && (
              <a
                href={settings.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-300 hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5] hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(0,119,181,0.3)] transition-all"
                title="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            )}
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          className="lg:col-span-7 flex"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Tilt
            className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl w-full"
            options={{ max: 8, scale: 1.01 }}
          >
            {submittedRef ? (
              <div className="text-center py-12 text-[#f5a623] space-y-4">
                <CheckCircle2
                  size={56}
                  className="mx-auto text-emerald-400 animate-bounce"
                />
                <h3 className="text-2xl font-bold text-white">
                  Message Submitted Successfully!
                </h3>
                <p className="text-slate-300 text-sm max-w-md mx-auto">
                  Thank you for reaching out. Your inquiry has been routed to
                  our CRM system.
                </p>
                <div className="inline-block px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">
                  Reference: {submittedRef}
                </div>
                <div>
                  <button
                    onClick={() => setSubmittedRef(null)}
                    className="mt-4 px-6 py-2 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm font-medium flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />{" "}
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Full Name <span className="text-[#f5a623]">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. John Doe"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-[#0a1122]/50 border border-white/5 rounded-xl text-white placeholder-slate-600 text-[13px] outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[#f5a623]/40 focus:bg-white/[0.02] transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Email Address <span className="text-[#f5a623]">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="john@company.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-[#0a1122]/50 border border-white/5 rounded-xl text-white placeholder-slate-600 text-[13px] outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[#f5a623]/40 focus:bg-white/[0.02] transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      placeholder="+1 (555) 000-0000"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#0a1122]/50 border border-white/5 rounded-xl text-white placeholder-slate-600 text-[13px] outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[#f5a623]/40 focus:bg-white/[0.02] transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      name="company"
                      placeholder="Tech Firm Inc."
                      value={form.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#0a1122]/50 border border-white/5 rounded-xl text-white placeholder-slate-600 text-[13px] outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[#f5a623]/40 focus:bg-white/[0.02] transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Service Required
                  </label>
                  <select
                    name="service"
                    value={form.service}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#0a1122]/80 border border-white/5 rounded-xl text-white text-[13px] outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[#f5a623]/40 transition-all shadow-inner appearance-none cursor-pointer"
                    style={{
                      backgroundImage:
                        'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1rem top 50%",
                      backgroundSize: "0.65rem auto",
                    }}
                  >
                    <option value="" className="bg-[#0b1528] text-slate-400">
                      Select a service...
                    </option>
                    <option value="Web Development" className="bg-[#0b1528]">
                      Full-Stack Web Development
                    </option>
                    <option
                      value="Frontend & Backend Integration"
                      className="bg-[#0b1528]"
                    >
                      Frontend & Backend Integration
                    </option>
                    <option
                      value="Microservices & API Architecture"
                      className="bg-[#0b1528]"
                    >
                      Microservices & REST API Architecture
                    </option>
                    <option
                      value="Consulting & Code Audit"
                      className="bg-[#0b1528]"
                    >
                      Technical Consulting & Code Audit
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Project Details <span className="text-[#f5a623]">*</span>
                  </label>
                  <textarea
                    name="message"
                    placeholder="Tell us about your project requirements, scope, or questions..."
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-[#0a1122]/50 border border-white/5 rounded-xl text-white placeholder-slate-600 text-[13px] outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[#f5a623]/40 focus:bg-white/[0.02] transition-all resize-none shadow-inner"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group w-full py-3.5 rounded-xl bg-gradient-to-r from-[#f5a623] to-[#ffc866] text-[#122240] font-black tracking-wide text-[13px] sm:text-sm shadow-[0_4px_15px_rgba(245,166,35,0.25)] hover:shadow-[0_6px_25px_rgba(245,166,35,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 overflow-hidden relative"
                  >
                    {/* Button sweep animation */}
                    <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />

                    {submitting ? (
                      <>
                        <Loader
                          size={18}
                          className="animate-spin z-10 relative"
                        />{" "}
                        <span className="z-10 relative">
                          Submitting to CRM...
                        </span>
                      </>
                    ) : (
                      <>
                        <Send
                          size={18}
                          className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform z-10 relative"
                        />{" "}
                        <span className="z-10 relative">Submit Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </Tilt>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
