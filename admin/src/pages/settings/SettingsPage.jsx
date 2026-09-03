import React, { useState, useEffect } from "react";
import {
  Save,
  Eye,
  EyeOff,
  Shield,
  User,
  Globe,
  CheckCircle2,
  Lock,
  Key,
  Server,
  Cpu,
  Activity,
  RefreshCw,
  UserCheck,
  Mail,
  ShieldCheck,
  Layout,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  FileText,
  Sparkles,
  Code,
  Link2,
  Upload,
} from "lucide-react";
import { useAuth, api } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();

  const [tab, setTab] = useState("hero");
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [pwForm, setPwForm] = useState({
    current_password: "",
    new_password: "",
    confirm: "",
  });
  const [showPw, setShowPw] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [saving, setSaving] = useState(false);

  // Hero Management State
  const [heroForm, setHeroForm] = useState({
    hero_greeting: "Hello, It's Me",
    owner_name: "Pravesh Kumar",
    hero_professional_title: "Software Engineer · Full-Stack Developer",
    hero_tagline:
      "Architecting scalable applications, intelligent systems & digital experiences.",
    hero_subtitle:
      "Result-oriented Java Full Stack Developer with hands-on experience designing, developing, and deploying high-throughput web applications and cloud enterprise microservices.",
    hero_badge: "Available for Senior Full Stack & Lead Roles",
    resume_url: "/resume.pdf",
    hero_cta_primary: "Download CV",
    hero_cta_secondary: "Explore Projects",
    github_url: "https://github.com/kumar-pravesh",
    linkedin_url: "https://linkedin.com/in/pravesh-kumar",
    company_email: "praveshkumar5502@gmail.com",
    about_heading: "Associate IT Engineer & Full Stack Architect",
    about_text:
      "Dedicated software engineer with expertise in Java 21, Spring Boot microservices, React 19, Neon PostgreSQL, and clean architecture. Experienced in delivering production-grade enterprise software.",
    company_address: "Banka, Bihar, India",
    years_of_experience: "2+",
    tech_arsenal:
      "Java 21, Spring Boot, React 19, PostgreSQL, Microservices, Docker, REST APIs, Node.js, Kafka, AWS, Tailwind CSS, Redis",
    current_focus_1_title: "Enterprise Microservices",
    current_focus_1_subtitle:
      "Architecting robust distributed systems using Java 21 & Kafka.",
    current_focus_2_title: "Full-Stack Scalability",
    current_focus_2_subtitle:
      "Bridging React frontends with high-performance Postgres backends.",
  });

  const [typedWords, setTypedWords] = useState([
    "Java Full Stack Developer",
    "Spring Boot & Microservices Specialist",
    "React JS Frontend Architect",
    "Enterprise REST API Developer",
    "Cloud Systems Integrator",
  ]);
  const [newTypedWord, setNewTypedWord] = useState("");
  const [loadingHero, setLoadingHero] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    if (user) setProfile({ name: user.name || "", email: user.email || "" });
  }, [user]);

  // Load Hero Settings from Backend API
  useEffect(() => {
    let isMounted = true;
    setLoadingHero(true);
    api
      .get("/settings/public")
      .then((res) => {
        if (!isMounted || !res.data) return;
        const data = res.data;
        setHeroForm((prev) => ({
          ...prev,
          hero_greeting: data.hero_greeting || prev.hero_greeting,
          owner_name: data.owner_name || prev.owner_name,
          hero_professional_title:
            data.hero_professional_title || prev.hero_professional_title,
          hero_tagline: data.hero_tagline || prev.hero_tagline,
          hero_subtitle: data.hero_subtitle || prev.hero_subtitle,
          hero_badge: data.hero_badge || prev.hero_badge,
          resume_url: data.resume_url || prev.resume_url,
          hero_cta_primary: data.hero_cta_primary || prev.hero_cta_primary,
          hero_cta_secondary:
            data.hero_cta_secondary || prev.hero_cta_secondary,
          github_url: data.github_url || prev.github_url,
          linkedin_url: data.linkedin_url || prev.linkedin_url,
          company_email: data.company_email || prev.company_email,
          about_heading: data.about_heading || prev.about_heading,
          about_text: data.about_text || prev.about_text,
          company_address: data.company_address || prev.company_address,
          years_of_experience:
            data.years_of_experience || prev.years_of_experience,
          tech_arsenal: data.tech_arsenal || prev.tech_arsenal,
          current_focus_1_title:
            data.current_focus_1_title || prev.current_focus_1_title,
          current_focus_1_subtitle:
            data.current_focus_1_subtitle || prev.current_focus_1_subtitle,
          current_focus_2_title:
            data.current_focus_2_title || prev.current_focus_2_title,
          current_focus_2_subtitle:
            data.current_focus_2_subtitle || prev.current_focus_2_subtitle,
        }));

        if (data.hero_typed_words) {
          const words = Array.isArray(data.hero_typed_words)
            ? data.hero_typed_words
            : typeof data.hero_typed_words === "string"
              ? JSON.parse(data.hero_typed_words)
              : [];
          if (words.length > 0) setTypedWords(words);
        }
      })
      .catch((err) => {
        console.warn("Could not load hero settings:", err.message);
      })
      .finally(() => {
        if (isMounted) setLoadingHero(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function saveHeroSettings(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...heroForm,
        hero_typed_words: typedWords,
      };
      await api.put("/settings", payload);
      addToast("Hero section & settings updated successfully!", "success");
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", "Portfolio Resume / CV");
      formData.append("media_type", "document");
      formData.append("category", "General");

      const res = await api.post("/media", formData);
      if (res.data?.file_url) {
        setHeroForm((prev) => ({ ...prev, resume_url: res.data.file_url }));
        addToast("Resume file uploaded successfully!", "success");
      }
    } catch (err) {
      addToast(
        err.response?.data?.error || "Failed to upload resume file",
        "error",
      );
    } finally {
      setUploadingResume(false);
      e.target.value = null;
    }
  };

  // Typed Word Helpers
  const addWord = () => {
    if (!newTypedWord.trim()) return;
    setTypedWords([...typedWords, newTypedWord.trim()]);
    setNewTypedWord("");
  };

  const removeWord = (index) => {
    setTypedWords(typedWords.filter((_, i) => i !== index));
  };

  const moveWord = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= typedWords.length) return;
    const updated = [...typedWords];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setTypedWords(updated);
  };

  const updateWordText = (index, val) => {
    const updated = [...typedWords];
    updated[index] = val;
    setTypedWords(updated);
  };

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch("/auth/profile", { name: profile.name });
      if (res.data?.user) setUser(res.data.user);
      addToast("Profile updated successfully", "success");
    } catch (err) {
      addToast(err.response?.data?.error || "Update failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) {
      addToast("New passwords do not match", "error");
      return;
    }
    if (pwForm.new_password.length < 8) {
      addToast("Password must be at least 8 characters", "error");
      return;
    }
    setSaving(true);
    try {
      await api.post("/auth/change-password", {
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      });
      addToast("Password changed successfully", "success");
      setPwForm({ current_password: "", new_password: "", confirm: "" });
    } catch (err) {
      addToast(err.response?.data?.error || "Password change failed", "error");
    } finally {
      setSaving(false);
    }
  }

  const TABS = [
    { id: "hero", label: "Hero & Content", icon: Layout },
    { id: "profile", label: "Profile Settings", icon: User },
    { id: "security", label: "Security & Auth", icon: Shield },
    { id: "about", label: "System Info", icon: Globe },
  ];

  const getStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (pass.length >= 12) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9!@#$%^&*]/.test(pass)) score += 25;
    return score;
  };

  const strengthScore = getStrength(pwForm.new_password);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your account credentials, security preferences, and environment
          status
        </p>
      </div>

      {/* Top Horizontal Pill Navigation Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-[#111827] border border-white/10 rounded-2xl w-fit shadow-lg">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                active
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={15} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Panels */}
      {tab === "hero" && (
        <form onSubmit={saveHeroSettings} className="space-y-6 animate-fade">
          {/* Header Banner */}
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles size={13} /> Hero Section Configuration
                </div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Executive Portfolio Hero Manager
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Customize your hero typography, identity statements, dynamic
                  typed specializations, and CV downloads.
                </p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 shrink-0"
              >
                {saving ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                <span>Save All Settings</span>
              </button>
            </div>
          </div>

          {/* 1. Basic Hero Information */}
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider pb-3 border-b border-white/10 flex items-center gap-2">
              <Layout size={15} /> 1. Core Hero Identity & Typography
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Greeting */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Small Introduction
                </label>
                <input
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  value={heroForm.hero_greeting}
                  onChange={(e) =>
                    setHeroForm((f) => ({
                      ...f,
                      hero_greeting: e.target.value,
                    }))
                  }
                  placeholder="e.g. Hello, It's Me"
                  required
                />
              </div>

              {/* Owner Name */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Display Name (Pravesh Kumar)
                </label>
                <input
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-bold placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  value={heroForm.owner_name}
                  onChange={(e) =>
                    setHeroForm((f) => ({ ...f, owner_name: e.target.value }))
                  }
                  placeholder="e.g. Pravesh Kumar"
                  required
                />
              </div>

              {/* Professional Title */}
              <div className="space-y-2 sm:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Professional Identity Line
                </label>
                <input
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-amber-200 font-semibold placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  value={heroForm.hero_professional_title}
                  onChange={(e) =>
                    setHeroForm((f) => ({
                      ...f,
                      hero_professional_title: e.target.value,
                    }))
                  }
                  placeholder="e.g. Software Engineer · Full-Stack Developer"
                  required
                />
              </div>

              {/* Tagline */}
              <div className="space-y-2 sm:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Professional Value Statement / Tagline
                </label>
                <input
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  value={heroForm.hero_tagline}
                  onChange={(e) =>
                    setHeroForm((f) => ({ ...f, hero_tagline: e.target.value }))
                  }
                  placeholder="e.g. Architecting scalable applications, intelligent systems & digital experiences."
                  required
                />
              </div>

              {/* Status Badge */}
              <div className="space-y-2 sm:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Top Status Badge Text
                </label>
                <input
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-emerald-400 placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
                  value={heroForm.hero_badge}
                  onChange={(e) =>
                    setHeroForm((f) => ({ ...f, hero_badge: e.target.value }))
                  }
                  placeholder="e.g. Available for Senior Full Stack & Lead Roles"
                />
              </div>
            </div>
          </div>

          {/* 2. Dynamic Typed Words Manager */}
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Code size={15} /> 2. Dynamic Typed Specializations ("And I'm
                  a ...")
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Manage the typewriter animation items rendered dynamically on
                  the portfolio hero.
                </p>
              </div>
            </div>

            {/* Existing Words List */}
            <div className="space-y-3">
              {typedWords.map((word, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 bg-[#0d1322] border border-white/10 rounded-xl group hover:border-white/20 transition-all"
                >
                  <span className="w-7 h-7 rounded-lg bg-white/5 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    className="flex-1 bg-transparent text-xs text-white font-mono px-2 py-1 outline-none focus:bg-white/5 rounded"
                    value={word}
                    onChange={(e) => updateWordText(idx, e.target.value)}
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveWord(idx, -1)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                      title="Move Up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveWord(idx, 1)}
                      disabled={idx === typedWords.length - 1}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                      title="Move Down"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeWord(idx)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all"
                      title="Remove Item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add New Word Form */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  className="flex-1 bg-[#0d1322] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  placeholder="Enter new typed specialization (e.g. Cloud Solutions Architect)"
                  value={newTypedWord}
                  onChange={(e) => setNewTypedWord(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addWord();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addWord}
                  className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0"
                >
                  <Plus size={15} /> Add Word
                </button>
              </div>
            </div>
          </div>

          {/* 3. CV & Call To Action Buttons */}
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider pb-3 border-b border-white/10 flex items-center gap-2">
              <FileText size={15} /> 3. CV Download & CTA Button Configurations
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* CV File URL */}
              <div className="space-y-2 sm:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Download CV File URL / Path
                </label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-mono placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    value={heroForm.resume_url}
                    onChange={(e) =>
                      setHeroForm((f) => ({ ...f, resume_url: e.target.value }))
                    }
                    placeholder="/resume.pdf or https://..."
                    required
                  />
                  {heroForm.resume_url && (
                    <a
                      href={heroForm.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white flex items-center gap-2 text-xs font-bold shrink-0 transition-all"
                    >
                      <Link2 size={14} /> View
                    </a>
                  )}
                  <label
                    className={`px-4 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 flex items-center gap-2 text-xs font-bold shrink-0 transition-all cursor-pointer ${uploadingResume ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    {uploadingResume ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Upload size={14} />
                    )}
                    {uploadingResume ? "Uploading..." : "Upload File"}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      disabled={uploadingResume}
                    />
                  </label>
                </div>
              </div>

              {/* Primary CTA Text */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Primary CTA Label
                </label>
                <input
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-bold placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  value={heroForm.hero_cta_primary}
                  onChange={(e) =>
                    setHeroForm((f) => ({
                      ...f,
                      hero_cta_primary: e.target.value,
                    }))
                  }
                  placeholder="Download CV"
                />
              </div>

              {/* Secondary CTA Text */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Secondary CTA Label
                </label>
                <input
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-bold placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  value={heroForm.hero_cta_secondary}
                  onChange={(e) =>
                    setHeroForm((f) => ({
                      ...f,
                      hero_cta_secondary: e.target.value,
                    }))
                  }
                  placeholder="Explore Projects"
                />
              </div>
            </div>
          </div>

          {/* 4. About Me Configuration */}
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider pb-3 border-b border-white/10 flex items-center gap-2">
              <User size={15} /> 4. About Me Section Configuration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  About Section Sub-Title
                </label>
                <input
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  value={heroForm.about_heading}
                  onChange={(e) =>
                    setHeroForm((f) => ({
                      ...f,
                      about_heading: e.target.value,
                    }))
                  }
                  placeholder="Associate IT Engineer & Full Stack Architect"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Main Bio / About Text
                </label>
                <textarea
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all min-h-[100px] resize-y"
                  value={heroForm.about_text}
                  onChange={(e) =>
                    setHeroForm((f) => ({ ...f, about_text: e.target.value }))
                  }
                  placeholder="Dedicated software engineer..."
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Location / Base Address
                </label>
                <input
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  value={heroForm.company_address}
                  onChange={(e) =>
                    setHeroForm((f) => ({
                      ...f,
                      company_address: e.target.value,
                    }))
                  }
                  placeholder="Banka, Bihar, India"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Years of Experience
                </label>
                <input
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
                  value={heroForm.years_of_experience}
                  onChange={(e) =>
                    setHeroForm((f) => ({
                      ...f,
                      years_of_experience: e.target.value,
                    }))
                  }
                  placeholder="e.g. 2+"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Tech Arsenal (Comma separated)
                </label>
                <input
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
                  value={heroForm.tech_arsenal}
                  onChange={(e) =>
                    setHeroForm((f) => ({ ...f, tech_arsenal: e.target.value }))
                  }
                  placeholder="Java, Spring Boot, React, Postgres..."
                />
              </div>

              {/* Current Focus 1 */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Current Focus 1 Title
                </label>
                <input
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-amber-200 placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  value={heroForm.current_focus_1_title}
                  onChange={(e) =>
                    setHeroForm((f) => ({
                      ...f,
                      current_focus_1_title: e.target.value,
                    }))
                  }
                  placeholder="Enterprise Microservices"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Current Focus 1 Subtitle
                </label>
                <input
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  value={heroForm.current_focus_1_subtitle}
                  onChange={(e) =>
                    setHeroForm((f) => ({
                      ...f,
                      current_focus_1_subtitle: e.target.value,
                    }))
                  }
                  placeholder="Architecting robust systems..."
                />
              </div>

              {/* Current Focus 2 */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Current Focus 2 Title
                </label>
                <input
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-amber-200 placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  value={heroForm.current_focus_2_title}
                  onChange={(e) =>
                    setHeroForm((f) => ({
                      ...f,
                      current_focus_2_title: e.target.value,
                    }))
                  }
                  placeholder="Full-Stack Scalability"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Current Focus 2 Subtitle
                </label>
                <input
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  value={heroForm.current_focus_2_subtitle}
                  onChange={(e) =>
                    setHeroForm((f) => ({
                      ...f,
                      current_focus_2_subtitle: e.target.value,
                    }))
                  }
                  placeholder="Bridging React..."
                />
              </div>
            </div>
          </div>

          {/* Save Button Footer */}
          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              <span>Save Hero Configuration</span>
            </button>
          </div>
        </form>
      )}

      {/* Content Panels */}
      {tab === "profile" && (
        <div className="space-y-6 animate-fade">
          {/* User Overview Banner Card */}
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5 text-center sm:text-left">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 border-2 border-white/20 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-500/30">
                    {(user?.name || user?.email || "A")[0].toUpperCase()}
                  </div>
                  <span
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#111827]"
                    title="Active Session"
                  />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-extrabold text-white tracking-tight">
                    {user?.name || "Administrator"}
                  </h2>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-400 font-mono">
                    <Mail size={13} className="text-indigo-400 shrink-0" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                      <ShieldCheck size={12} /> {user?.role || "SUPER_ADMIN"}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                      <UserCheck size={12} /> Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider text-slate-400 pb-3 border-b border-white/10">
              Personal Information
            </h3>

            <form onSubmit={saveProfile} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <User size={13} className="text-indigo-400" /> Full Name
                  </label>
                  <input
                    className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Mail size={13} className="text-indigo-400" /> Email Address
                  </label>
                  <div className="relative">
                    <input
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-4 pr-10 py-3 text-xs text-slate-400 cursor-not-allowed outline-none font-mono"
                      value={profile.email}
                      disabled
                    />
                    <Lock
                      size={14}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    System login email cannot be changed.
                  </p>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Shield size={13} className="text-indigo-400" /> Account
                    Role & Permissions
                  </label>
                  <div className="p-4 bg-[#0d1322] border border-white/10 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold text-xs">
                        {user?.role?.[0] || "S"}
                      </div>
                      <div>
                        <div className="text-xs font-bold font-mono text-white">
                          {user?.role || "SUPER_ADMIN"}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Full administrative rights granted
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" /> Saving
                      Changes...
                    </>
                  ) : (
                    <>
                      <Save size={15} /> Save Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECURITY TAB */}
      {tab === "security" && (
        <div className="space-y-6 animate-fade max-w-2xl">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
              <Shield size={22} className="text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white text-sm mb-0.5">
                  Password Protection
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Update your login password regularly to protect your admin
                  dashboard.
                </p>
              </div>
            </div>

            <form onSubmit={changePassword} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-[#0d1322] border border-white/10 rounded-xl pl-4 pr-10 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    type={showPw.current ? "text" : "password"}
                    required
                    placeholder="Enter current password"
                    value={pwForm.current_password}
                    onChange={(e) =>
                      setPwForm((f) => ({
                        ...f,
                        current_password: e.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    onClick={() =>
                      setShowPw((s) => ({ ...s, current: !s.current }))
                    }
                  >
                    {showPw.current ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  New Password
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-[#0d1322] border border-white/10 rounded-xl pl-4 pr-10 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    type={showPw.new ? "text" : "password"}
                    required
                    placeholder="Min 8 characters"
                    value={pwForm.new_password}
                    onChange={(e) =>
                      setPwForm((f) => ({ ...f, new_password: e.target.value }))
                    }
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    onClick={() => setShowPw((s) => ({ ...s, new: !s.new }))}
                  >
                    {showPw.new ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {pwForm.new_password && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                      <span>Strength</span>
                      <span
                        className={
                          strengthScore > 50
                            ? "text-emerald-400"
                            : "text-amber-400"
                        }
                      >
                        {strengthScore <= 25
                          ? "Weak"
                          : strengthScore <= 75
                            ? "Good"
                            : "Strong"}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          strengthScore <= 25
                            ? "bg-rose-500"
                            : strengthScore <= 75
                              ? "bg-amber-400"
                              : "bg-emerald-500"
                        }`}
                        style={{ width: `${strengthScore}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-[#0d1322] border border-white/10 rounded-xl pl-4 pr-10 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    type={showPw.confirm ? "text" : "password"}
                    required
                    placeholder="Repeat new password"
                    value={pwForm.confirm}
                    onChange={(e) =>
                      setPwForm((f) => ({ ...f, confirm: e.target.value }))
                    }
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    onClick={() =>
                      setShowPw((s) => ({ ...s, confirm: !s.current }))
                    }
                  >
                    {showPw.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />{" "}
                      Updating...
                    </>
                  ) : (
                    <>
                      <Key size={15} /> Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SYSTEM INFO TAB */}
      {tab === "about" && (
        <div className="space-y-6 animate-fade">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  System Architecture & Status
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Active environment metrics and server parameters
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold w-fit">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                All Systems Operational
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Application",
                  value: "Portfolio Admin",
                  icon: Server,
                  badge: "Production",
                },
                {
                  label: "Version",
                  value: "v1.0.0 (Tailwind v4)",
                  icon: Cpu,
                  badge: "Latest",
                },
                {
                  label: "Tech Framework",
                  value: "React 19 + Vite + Node",
                  icon: Activity,
                  badge: "Vite",
                },
                {
                  label: "Database",
                  value: "PostgreSQL 16",
                  icon: CheckCircle2,
                  badge: "Healthy",
                },
                {
                  label: "Admin Port",
                  value: "http://localhost:5174",
                  icon: Globe,
                  badge: "Port 5174",
                },
                {
                  label: "Backend API",
                  value: "http://localhost:5000",
                  icon: Server,
                  badge: "Port 5000",
                },
                {
                  label: "Auth Token",
                  value: "JWT (7-Day Expiry)",
                  icon: Lock,
                  badge: "Secure",
                },
                {
                  label: "Styling System",
                  value: "Tailwind CSS v4.x",
                  icon: Shield,
                  badge: "CSS-First",
                },
              ].map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#0d1322] border border-white/10 flex flex-col justify-between gap-3 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                        <ItemIcon size={16} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                        {item.badge}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {item.label}
                      </span>
                      <span className="text-xs font-mono font-semibold text-white truncate block mt-0.5">
                        {item.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
