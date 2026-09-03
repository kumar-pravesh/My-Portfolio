import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Globe,
  Archive,
  Star,
  FolderKanban,
  Code2,
  Link as LinkIcon,
  Sparkles,
  FileText,
  Search,
  Calendar,
  Eye,
  Image as ImageIcon,
  ChevronRight,
} from "lucide-react";
import { api } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import {
  RefBadge,
  StatusBadge,
  ImageUploader,
} from "../../components/shared/index.jsx";

const EMPTY = {
  title: "",
  image: "",
  hero_image: "",
  description: "",
  short_description: "",
  full_description: "",
  challenges: "",
  solutions: "",
  results: "",
  client_name: "",
  industry: "",
  category: "",
  project_type: "",
  live_link: "",
  github_url: "",
  is_featured: false,
  display_order: 0,
  status: "draft",
  tech_stack: "",
  services_provided: "",
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
  start_date: "",
  completion_date: "",
  expected_completion: "",
  cta_enabled: true,
  cta_label: "View Details",
  visibility: "public",
  visibility_config: {
    progress: true,
    details: true,
    overview: true,
    problem: true,
    capabilities: true,
    role: true,
    engineering: true,
    architecture: false,
    impact: true,
  },
  show_on_home_current_work: false,
  home_display_order: 0,
  progress: 0,
};

export default function ProjectFormPage() {
  const { refId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(refId);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general"); // 'general' | 'media' | 'seo'

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    api
      .get(`/projects/${refId}`)
      .then((r) =>
        setForm({
          ...r.data,
          tech_stack: Array.isArray(r.data.tech_stack)
            ? r.data.tech_stack.join(", ")
            : r.data.tech_stack || "",
          services_provided: Array.isArray(r.data.services_provided)
            ? r.data.services_provided.join(", ")
            : r.data.services_provided || "",
          seo_keywords: Array.isArray(r.data.seo_keywords)
            ? r.data.seo_keywords.join(", ")
            : r.data.seo_keywords || "",
          visibility_config:
            r.data.visibility_config || EMPTY.visibility_config,
        }),
      )
      .catch(() => toast.error("Failed to load project."))
      .finally(() => setLoading(false));
  }, [refId]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setVisibility = (k, v) =>
    setForm((f) => ({
      ...f,
      visibility_config: { ...f.visibility_config, [k]: v },
    }));

  const submit = async (statusOverride) => {
    setSaving(true);
    const techArr =
      typeof form.tech_stack === "string"
        ? form.tech_stack
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : form.tech_stack;
    const servArr =
      typeof form.services_provided === "string"
        ? form.services_provided
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : form.services_provided;
    const seoArr =
      typeof form.seo_keywords === "string"
        ? form.seo_keywords
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : form.seo_keywords;

    const payload = {
      ...form,
      status: statusOverride || form.status,
      tech_stack: techArr,
      services_provided: servArr,
      seo_keywords: seoArr,
    };

    try {
      if (isEdit) {
        await api.put(`/projects/${refId}`, payload);
        toast.success("Project updated successfully!");
      } else {
        const r = await api.post("/projects", payload);
        toast.success(`Project created: ${r.data.reference_id}`);
        navigate(`/admin/projects/${r.data.reference_id}`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-12 text-center text-slate-400 font-mono text-xs">
        Loading project editor...
      </div>
    );

  // Split tech stack into live preview tags
  const techTags =
    typeof form.tech_stack === "string"
      ? form.tech_stack
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : Array.isArray(form.tech_stack)
        ? form.tech_stack
        : [];

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden pb-12">
      {/* Premium Header Banner */}
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden space-y-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Tier 1: Breadcrumb Nav + Actions Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all shrink-0"
              onClick={() => navigate("/admin/projects")}
              title="Back to Projects"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <span
                className="cursor-pointer hover:text-white transition-colors"
                onClick={() => navigate("/admin/projects")}
              >
                Projects
              </span>
              <ChevronRight size={14} className="text-slate-600" />
              <span className="text-white font-semibold">
                {isEdit ? "Edit Project" : "New Project"}
              </span>
            </div>
          </div>

          {/* Action Buttons Group */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {isEdit && (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-all"
                onClick={() => navigate(`/admin/projects/${refId}`)}
              >
                <Eye size={14} /> Preview
              </button>
            )}
            {isEdit && (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 font-semibold text-xs transition-all disabled:opacity-50"
                onClick={() => submit("archived")}
                disabled={saving}
              >
                <Archive size={14} /> Archive
              </button>
            )}
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
              onClick={() => submit()}
              disabled={saving}
            >
              <Save size={14} /> {saving ? "Saving..." : "Save Project"}
            </button>
          </div>
        </div>

        {/* Tier 2: Main Title & Status Badges */}
        <div className="space-y-2 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
            {isEdit
              ? form.title || "Untitled Project"
              : "Create New Project Showcase"}
          </h1>

          <div className="flex items-center gap-2.5 flex-wrap pt-1">
            {isEdit && form.reference_id && (
              <RefBadge refId={form.reference_id} large />
            )}
            <StatusBadge status={form.status} />
            {form.is_featured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-bold uppercase tracking-wider">
                <Star size={12} className="fill-amber-400" /> Featured Showcase
              </span>
            )}
          </div>
        </div>

        {/* Tier 3: Navigation Tabs */}
        <div className="flex items-center gap-2 pt-4 border-t border-white/10 overflow-x-auto relative z-10">
          {[
            {
              id: "general",
              label: "General Info & Links",
              icon: FolderKanban,
            },
            {
              id: "content",
              label: "Detailed Engineering Content",
              icon: FileText,
            },
            { id: "media", label: "Project Images", icon: ImageIcon },
            { id: "seo", label: "Visibility & Settings", icon: Search },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: General Info & Links */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <FolderKanban size={16} /> Basic Project Information
            </h3>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Project Title *
              </label>
              <input
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold"
                required
                value={form.title || ""}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Clinixa — Hospital Management System"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Client / Company
                </label>
                <input
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                  value={form.client_name || ""}
                  onChange={(e) => set("client_name", e.target.value)}
                  placeholder="e.g. HealthCorp Inc."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Industry
                </label>
                <input
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                  value={form.industry || ""}
                  onChange={(e) => set("industry", e.target.value)}
                  placeholder="e.g. Healthcare & Telemedicine"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Category
                </label>
                <input
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                  value={form.category || ""}
                  onChange={(e) => set("category", e.target.value)}
                  placeholder="e.g. Enterprise Web App"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Project Type
                </label>
                <input
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                  value={form.project_type || ""}
                  onChange={(e) => set("project_type", e.target.value)}
                  placeholder="e.g. Full-Stack SaaS"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Technologies Used (Comma-Separated)
              </label>
              <input
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 font-mono transition-all"
                value={form.tech_stack || ""}
                onChange={(e) => set("tech_stack", e.target.value)}
                placeholder="React, Node.js, PostgreSQL, Docker"
              />
              {techTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {techTags.map((t, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-mono"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Live Website URL
                </label>
                <div className="flex items-center gap-2 bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5">
                  <LinkIcon size={14} className="text-slate-500 shrink-0" />
                  <input
                    type="url"
                    className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full"
                    value={form.live_link || ""}
                    onChange={(e) => set("live_link", e.target.value)}
                    placeholder="https://app.domain.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  GitHub Repository URL
                </label>
                <div className="flex items-center gap-2 bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5">
                  <Code2 size={14} className="text-slate-500 shrink-0" />
                  <input
                    type="url"
                    className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full"
                    value={form.github_url || ""}
                    onChange={(e) => set("github_url", e.target.value)}
                    placeholder="https://github.com/user/repo"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <FileText size={16} /> Descriptions & Overview
            </h3>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Short Summary Card Teaser
              </label>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                rows={2}
                value={form.short_description || ""}
                onChange={(e) => set("short_description", e.target.value)}
                placeholder="One-liner summary displayed on public portfolio cards..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Exhaustive Description
              </label>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all min-h-48"
                rows={7}
                value={form.description || ""}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Detailed explanation of the project, key features, architecture, and scope..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Detailed Engineering Content */}
      {activeTab === "content" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <FileText size={16} /> Extended Descriptions
            </h3>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Detailed Overview (Replaces Exhaustive Description if provided)
              </label>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all min-h-48"
                rows={5}
                value={form.full_description || ""}
                onChange={(e) => set("full_description", e.target.value)}
                placeholder="A deep dive overview into the project's background and core offering..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Engineering Challenges & Problem Statement
              </label>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 transition-all min-h-48"
                rows={6}
                value={form.challenges || ""}
                onChange={(e) => set("challenges", e.target.value)}
                placeholder="What was the problem? What challenges did you face?"
              />
            </div>
          </div>

          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Sparkles size={16} /> Solutions & Impact
            </h3>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Implemented Solutions / Architecture
              </label>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-all min-h-48"
                rows={6}
                value={form.solutions || ""}
                onChange={(e) => set("solutions", e.target.value)}
                placeholder="How did you solve the problem? What was the high-level architecture?"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                Results & Impact
              </label>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all min-h-48"
                rows={5}
                value={form.results || ""}
                onChange={(e) => set("results", e.target.value)}
                placeholder="Qualitative and quantitative results (e.g. 3x faster rendering, increased retention)..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Project Images */}
      {activeTab === "media" && (
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-wider">
                <ImageIcon size={18} className="text-indigo-400" /> Project
                Images
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage the images displayed for this project across the website
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ImageUploader
              label="Portfolio Thumbnail"
              value={form.image || ""}
              onChange={(val) => set("image", val)}
              hint="Used on project cards"
            />

            <ImageUploader
              label="Project Hero Image"
              value={form.hero_image || ""}
              onChange={(val) => set("hero_image", val)}
              hint="Used on project detail"
            />
          </div>
        </div>
      )}

      {/* Tab 3: Settings & SEO */}
      {activeTab === "seo" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Search size={16} /> SEO & Meta Tags
            </h3>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                SEO Meta Title
              </label>
              <input
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                value={form.seo_title || ""}
                onChange={(e) => set("seo_title", e.target.value)}
                placeholder="e.g. Clinixa - Enterprise HMS Portal"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                SEO Keywords (Comma-Separated)
              </label>
              <input
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 font-mono transition-all"
                value={form.seo_keywords || ""}
                onChange={(e) => set("seo_keywords", e.target.value)}
                placeholder="react, hospital management, fullstack, portfolio"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                SEO Description
              </label>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                rows={3}
                value={form.seo_description || ""}
                onChange={(e) => set("seo_description", e.target.value)}
                placeholder="Search engine page snippet summary..."
              />
            </div>
          </div>

          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Calendar size={16} /> Publishing Options & Timeline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Publish Status
                </label>
                <select
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                >
                  <option value="draft" className="bg-[#111827]">
                    Draft
                  </option>
                  <option value="upcoming" className="bg-[#111827]">
                    Upcoming
                  </option>
                  <option value="in_progress" className="bg-[#111827]">
                    In Progress
                  </option>
                  <option value="published" className="bg-[#111827]">
                    Completed (Published)
                  </option>
                  <option value="archived" className="bg-[#111827]">
                    Archived
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Display Order Index
                </label>
                <input
                  type="number"
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-white outline-none focus:border-indigo-500 transition-all"
                  value={form.display_order ?? 0}
                  onChange={(e) =>
                    set("display_order", parseInt(e.target.value) || 0)
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Project Start Date
                </label>
                <input
                  type="date"
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                  value={form.start_date ? form.start_date.slice(0, 10) : ""}
                  onChange={(e) => set("start_date", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Completion Date
                </label>
                <input
                  type="date"
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                  value={
                    form.completion_date
                      ? form.completion_date.slice(0, 10)
                      : ""
                  }
                  onChange={(e) => set("completion_date", e.target.value)}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/10">
              <label className="flex items-center gap-3 cursor-pointer p-3.5 rounded-xl bg-[#0d1322] border border-white/10 hover:border-amber-500/40 transition-all">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/20 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                  checked={form.is_featured}
                  onChange={(e) => set("is_featured", e.target.checked)}
                />
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Star size={14} className="text-amber-400 fill-amber-400" />{" "}
                    Mark Project as Featured Showcase
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    A maximum of 3 featured projects (sorted by Display Order)
                    will appear on the Home page.
                  </p>
                </div>
              </label>
            </div>

            <div className="pt-3 border-t border-white/10 mt-4">
              <label className="flex items-center gap-3 cursor-pointer p-3.5 rounded-xl bg-[#0d1322] border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/20 text-emerald-600 focus:ring-emerald-500 bg-slate-900"
                  checked={form.show_on_home_current_work}
                  onChange={(e) =>
                    set("show_on_home_current_work", e.target.checked)
                  }
                />
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles size={14} className="text-emerald-400" /> Show on
                    Home – "Currently Building"
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Displays this project as the main ongoing work section.
                    Needs "In Progress" or "Upcoming" status.
                  </p>
                </div>
              </label>

              {form.show_on_home_current_work && (
                <div className="grid grid-cols-2 gap-4 mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Current Work Order
                    </label>
                    <input
                      type="number"
                      className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-white outline-none focus:border-emerald-500 transition-all"
                      value={form.home_display_order ?? 0}
                      onChange={(e) =>
                        set("home_display_order", parseInt(e.target.value) || 0)
                      }
                      placeholder="e.g. 1"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Progress (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-white outline-none focus:border-emerald-500 transition-all"
                      value={form.progress ?? 0}
                      onChange={(e) => {
                        let val = parseInt(e.target.value) || 0;
                        if (val > 100) val = 100;
                        if (val < 0) val = 0;
                        set("progress", val);
                      }}
                      placeholder="e.g. 72"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-white/10 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Eye size={16} /> Privacy & Feature Toggles
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Global Visibility
                  </label>
                  <select
                    className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                    value={form.visibility}
                    onChange={(e) => set("visibility", e.target.value)}
                  >
                    <option value="public" className="bg-[#111827]">
                      Public
                    </option>
                    <option value="private" className="bg-[#111827]">
                      Private
                    </option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Expected Completion Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                    value={
                      form.expected_completion
                        ? form.expected_completion.slice(0, 10)
                        : ""
                    }
                    onChange={(e) => set("expected_completion", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-[#0d1322] border border-white/5 hover:border-white/10 transition-all">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-white/20 text-indigo-600 bg-slate-900"
                    checked={form.cta_enabled}
                    onChange={(e) => set("cta_enabled", e.target.checked)}
                  />
                  <span className="text-xs font-bold text-white">
                    Enable CTA (View Details)
                  </span>
                </label>
                {form.cta_enabled && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      CTA Label
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
                      value={form.cta_label || ""}
                      onChange={(e) => set("cta_label", e.target.value)}
                      placeholder="e.g. View Details"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-4">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Section Visibility Toggles
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { k: "progress", label: "Show Progress (%)" },
                    { k: "overview", label: "Detailed Overview" },
                    { k: "problem", label: "Engineering Challenges" },
                    { k: "architecture", label: "Solutions / Architecture" },
                    { k: "impact", label: "Results & Impact" },
                  ].map((sec) => (
                    <label
                      key={sec.k}
                      className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all"
                    >
                      <input
                        type="checkbox"
                        className="w-3.5 h-3.5 rounded border-white/20 text-indigo-600 bg-slate-900"
                        checked={form.visibility_config[sec.k] ?? true}
                        onChange={(e) => setVisibility(sec.k, e.target.checked)}
                      />
                      <span className="text-[11px] font-medium text-slate-300">
                        {sec.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
