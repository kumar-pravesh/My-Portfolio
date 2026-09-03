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
  AlertTriangle,
  Lightbulb,
  Cpu,
  TrendingUp,
  Columns,
  Share2,
  Layers,
  CheckCircle2,
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
  client: "",
  industry: "",
  short_description: "",
  status: "draft",
  related_project: "",
  business_challenge: "",
  problem_statement: "",
  pain_points: "",
  objectives: "",
  solution_overview: "",
  proposed_solution: "",
  key_features: "",
  implementation_approach: "",
  architecture_overview: "",
  technologies: "",
  integrations: "",
  architecture_diagram: "",
  results_summary: "",
  business_impact: "",
  performance_improvements: "",
  key_metrics: "",
  roi_cost_savings: "",
  before_state: "",
  after_state: "",
  cover_image: "",
  hero_image: "",
  social_share_image: "",
  related_services: "",
  related_testimonial: "",
  related_blogs: "",
  slug: "",
  seo_title: "",
  seo_description: "",
  is_featured: false,
  published_at: "",
};

export default function CaseStudyFormPage() {
  const { refId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(refId);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [projectsList, setProjectsList] = useState([]);

  useEffect(() => {
    api
      .get("/projects?limit=100")
      .then((r) => setProjectsList(r.data?.data || []))
      .catch(() => {});

    if (!isEdit) return;
    setLoading(true);
    api
      .get(`/content/case_studies/${refId}`)
      .then((r) =>
        setForm({
          ...r.data,
          technologies: Array.isArray(r.data.technologies)
            ? r.data.technologies.join(", ")
            : r.data.technologies || "",
        }),
      )
      .catch(() => toast.error("Failed to load case study."))
      .finally(() => setLoading(false));
  }, [refId]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (statusOverride) => {
    setSaving(true);
    const techArr =
      typeof form.technologies === "string"
        ? form.technologies
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : form.technologies;

    const payload = {
      ...form,
      status: statusOverride || form.status,
      technologies: techArr,
    };

    try {
      if (isEdit) {
        await api.put(`/content/case_studies/${refId}`, payload);
        toast.success("Case Study updated successfully!");
      } else {
        const r = await api.post("/content/case_studies", payload);
        toast.success(`Case Study created: ${r.data.reference_id}`);
        navigate(`/admin/case-studies/${r.data.reference_id}/edit`);
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
        Loading case study editor...
      </div>
    );

  const techTags =
    typeof form.technologies === "string"
      ? form.technologies
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : Array.isArray(form.technologies)
        ? form.technologies
        : [];

  const TABS = [
    { id: "basic", label: "Basic Info", icon: FolderKanban },
    { id: "challenge", label: "Challenge", icon: AlertTriangle },
    { id: "solution", label: "Solution", icon: Lightbulb },
    { id: "tech", label: "Tech & Architecture", icon: Cpu },
    { id: "results", label: "Results & Impact", icon: TrendingUp },
    { id: "before_after", label: "Before & After", icon: Columns },
    { id: "media", label: "Media Assets", icon: ImageIcon },
    { id: "related", label: "Related Content", icon: Share2 },
    { id: "seo", label: "SEO & Publishing", icon: Search },
  ];

  return (
    <div className="space-y-6 w-full max-w-full pb-12">
      {/* Header Banner */}
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Tier 1: Breadcrumb Nav + Actions Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all shrink-0"
              onClick={() => navigate("/admin/case-studies")}
              title="Back to Case Studies"
            >
              <ArrowLeft size={15} />
            </button>
            <div className="flex items-center gap-1 text-xs text-slate-400 font-medium truncate">
              <span
                className="cursor-pointer hover:text-white transition-colors"
                onClick={() => navigate("/admin/case-studies")}
              >
                Case Studies
              </span>
              <ChevronRight size={13} className="text-slate-600 shrink-0" />
              <span className="text-white font-semibold truncate">
                {isEdit ? "Edit Case Study" : "New Case Study"}
              </span>
            </div>
          </div>

          {/* Action Buttons Group */}
          <div className="flex items-center gap-2 flex-wrap relative z-10">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-all disabled:opacity-50"
              onClick={() => submit("draft")}
              disabled={saving}
            >
              <Save size={13} /> Save Draft
            </button>
            {isEdit && (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 font-semibold text-xs transition-all disabled:opacity-50"
                onClick={() => submit("archived")}
                disabled={saving}
              >
                <Archive size={13} /> Archive
              </button>
            )}
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 shrink-0"
              onClick={() => submit("published")}
              disabled={saving}
            >
              <Globe size={13} /> {saving ? "Saving..." : "Publish Case Study"}
            </button>
          </div>
        </div>

        {/* Tier 2: Main Title & Status Badges */}
        <div className="space-y-1.5 relative z-10">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug break-words">
            {isEdit ? form.title || "Untitled Case Study" : "New Case Study"}
          </h1>

          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            {isEdit && form.reference_id && (
              <RefBadge refId={form.reference_id} large />
            )}
            <StatusBadge status={form.status} />
            {form.is_featured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                <Star size={11} className="fill-amber-400" /> Featured Case
                Study
              </span>
            )}
          </div>
        </div>

        {/* Tier 3: Sleek 9 Navigation Tabs (Flex Wrap - 100% Visible, No Hiding) */}
        <div className="pt-3 border-t border-white/10 relative z-10">
          <div className="flex flex-wrap items-center gap-1.5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 ring-1 ring-white/20"
                      : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5"
                  }`}
                >
                  <Icon
                    size={13}
                    className={isActive ? "text-white" : "text-slate-400"}
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab 1: Basic Information */}
      {activeTab === "basic" && (
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <FolderKanban size={16} /> Basic Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Title *
              </label>
              <input
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all font-bold"
                required
                value={form.title || ""}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Scaling Clinixa Healthcare Portal to 500k Active Patients"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Related Project
              </label>
              <select
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                value={form.related_project || ""}
                onChange={(e) => set("related_project", e.target.value)}
              >
                <option value="" className="bg-[#111827]">
                  -- Select Related Project --
                </option>
                {projectsList.map((p) => (
                  <option
                    key={p.reference_id}
                    value={p.reference_id}
                    className="bg-[#111827]"
                  >
                    {p.title} ({p.reference_id})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Client{" "}
                <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                value={form.client || ""}
                onChange={(e) => set("client", e.target.value)}
                placeholder="Optional Client Name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Industry
              </label>
              <input
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                value={form.industry || ""}
                onChange={(e) => set("industry", e.target.value)}
                placeholder="e.g. Healthcare, Fintech, SaaS"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Status
              </label>
              <select
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                <option value="draft" className="bg-[#111827]">
                  Draft
                </option>
                <option value="published" className="bg-[#111827]">
                  Published
                </option>
                <option value="archived" className="bg-[#111827]">
                  Archived
                </option>
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Short Description
              </label>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                rows={3}
                value={form.short_description || ""}
                onChange={(e) => set("short_description", e.target.value)}
                placeholder="Brief summary displayed on case study cards..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Challenge */}
      {activeTab === "challenge" && (
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <AlertTriangle size={16} /> Business Challenge & Problems
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Business Challenge
              </label>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all min-h-28"
                rows={4}
                value={form.business_challenge || ""}
                onChange={(e) => set("business_challenge", e.target.value)}
                placeholder="Core business hurdles and background context..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Problem Statement
              </label>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all min-h-28"
                rows={4}
                value={form.problem_statement || ""}
                onChange={(e) => set("problem_statement", e.target.value)}
                placeholder="Precise problem definition requiring engineering solution..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Pain Points
              </label>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all min-h-28"
                rows={4}
                value={form.pain_points || ""}
                onChange={(e) => set("pain_points", e.target.value)}
                placeholder="Operational bottlenecks, legacy flaws, or performance issues..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Objectives
              </label>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all min-h-28"
                rows={4}
                value={form.objectives || ""}
                onChange={(e) => set("objectives", e.target.value)}
                placeholder="Target goals, SLAs, uptime expectations, or KPI targets..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Solution */}
      {activeTab === "solution" && (
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <Lightbulb size={16} /> Solution Strategy & Features
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Solution Overview
              </label>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all min-h-28"
                rows={4}
                value={form.solution_overview || ""}
                onChange={(e) => set("solution_overview", e.target.value)}
                placeholder="High-level solution architecture summary..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Proposed Solution
              </label>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all min-h-28"
                rows={4}
                value={form.proposed_solution || ""}
                onChange={(e) => set("proposed_solution", e.target.value)}
                placeholder="Detailed breakdown of system capabilities built..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Key Features
              </label>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all min-h-28"
                rows={4}
                value={form.key_features || ""}
                onChange={(e) => set("key_features", e.target.value)}
                placeholder="Key feature modules (bullet points or comma list)..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Implementation Approach
              </label>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all min-h-28"
                rows={4}
                value={form.implementation_approach || ""}
                onChange={(e) => set("implementation_approach", e.target.value)}
                placeholder="Development methodology, migration strategy, deployment..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Technology & Architecture */}
      {activeTab === "tech" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Cpu size={16} /> Technology Stack & Integrations
            </h3>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Technologies (Comma-Separated)
              </label>
              <input
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 font-mono transition-all"
                value={form.technologies || ""}
                onChange={(e) => set("technologies", e.target.value)}
                placeholder="React, Java 21, Spring Boot, PostgreSQL, Docker"
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

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Architecture Overview
              </label>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all min-h-24"
                rows={3}
                value={form.architecture_overview || ""}
                onChange={(e) => set("architecture_overview", e.target.value)}
                placeholder="Microservices, Monolith, Serverless, Cloud Infra details..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Third-Party Integrations
              </label>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                rows={2}
                value={form.integrations || ""}
                onChange={(e) => set("integrations", e.target.value)}
                placeholder="Stripe, AWS S3, Twilio, SendGrid..."
              />
            </div>
          </div>

          <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
            <ImageUploader
              label="Architecture Diagram"
              value={form.architecture_diagram || ""}
              onChange={(val) => set("architecture_diagram", val)}
              hint="High-resolution architecture flow diagram"
            />
          </div>
        </div>
      )}

      {/* Tab 5: Results & Business Impact */}
      {activeTab === "results" && (
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <TrendingUp size={16} /> Results & Business Impact
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Results Summary
              </label>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                rows={3}
                value={form.results_summary || ""}
                onChange={(e) => set("results_summary", e.target.value)}
                placeholder="High level overview of final outcomes..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Business Impact
              </label>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                rows={3}
                value={form.business_impact || ""}
                onChange={(e) => set("business_impact", e.target.value)}
                placeholder="Growth metrics, market expansion, conversion boost..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Performance Improvements
              </label>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                rows={3}
                value={form.performance_improvements || ""}
                onChange={(e) =>
                  set("performance_improvements", e.target.value)
                }
                placeholder="e.g. Latency reduced from 1.2s to 150ms, 99.99% uptime..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Key Metrics
              </label>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                rows={3}
                value={form.key_metrics || ""}
                onChange={(e) => set("key_metrics", e.target.value)}
                placeholder="e.g. 500k+ active users, 10M transactions processed..."
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                ROI / Cost Savings
              </label>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                rows={2}
                value={form.roi_cost_savings || ""}
                onChange={(e) => set("roi_cost_savings", e.target.value)}
                placeholder="e.g. Saved $40,000/mo in cloud infrastructure costs..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Before & After */}
      {activeTab === "before_after" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <Columns size={16} /> Before (Legacy State)
            </h3>
            <textarea
              className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500 transition-all min-h-56"
              rows={7}
              value={form.before_state || ""}
              onChange={(e) => set("before_state", e.target.value)}
              placeholder="Describe the previous system state, hurdles, slow load times, manual bottlenecks..."
            />
          </div>

          <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <CheckCircle2 size={16} /> After (Transformed State)
            </h3>
            <textarea
              className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-all min-h-56"
              rows={7}
              value={form.after_state || ""}
              onChange={(e) => set("after_state", e.target.value)}
              placeholder="Describe the modernized architecture, automated workflows, ultra-fast UI..."
            />
          </div>
        </div>
      )}

      {/* Tab 7: Media Assets */}
      {activeTab === "media" && (
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <ImageIcon size={16} className="text-indigo-400" /> Case Study
                Media Assets
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Upload images directly from device or enter image URLs
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUploader
              label="Cover Image"
              value={form.cover_image || ""}
              onChange={(val) => set("cover_image", val)}
              hint="Cover image displayed on case study listing cards"
            />

            <ImageUploader
              label="Hero Image"
              value={form.hero_image || ""}
              onChange={(val) => set("hero_image", val)}
              hint="High definition banner image on top of case study page"
            />

            <ImageUploader
              label="Architecture Diagram"
              value={form.architecture_diagram || ""}
              onChange={(val) => set("architecture_diagram", val)}
              hint="System flow and infrastructure diagram"
            />

            <ImageUploader
              label="Social Share Image"
              value={form.social_share_image || ""}
              onChange={(val) => set("social_share_image", val)}
              hint="Preview card thumbnail for social media links"
            />
          </div>
        </div>
      )}

      {/* Tab 8: Related Content */}
      {activeTab === "related" && (
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <Share2 size={16} /> Related Portfolio Content
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Related Project
              </label>
              <select
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                value={form.related_project || ""}
                onChange={(e) => set("related_project", e.target.value)}
              >
                <option value="" className="bg-[#111827]">
                  -- Select Project --
                </option>
                {projectsList.map((p) => (
                  <option
                    key={p.reference_id}
                    value={p.reference_id}
                    className="bg-[#111827]"
                  >
                    {p.title} ({p.reference_id})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Related Services
              </label>
              <input
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                value={form.related_services || ""}
                onChange={(e) => set("related_services", e.target.value)}
                placeholder="e.g. Full-Stack Web App Development, Cloud Architecture"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Related Testimonial
              </label>
              <input
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                value={form.related_testimonial || ""}
                onChange={(e) => set("related_testimonial", e.target.value)}
                placeholder="Client quote or reference ID..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Related Blogs
              </label>
              <input
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                value={form.related_blogs || ""}
                onChange={(e) => set("related_blogs", e.target.value)}
                placeholder="e.g. How We Built an Enterprise Portal with Java 21"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 9: SEO & Publishing */}
      {activeTab === "seo" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Search size={16} /> SEO & Meta Data
            </h3>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                URL Slug
              </label>
              <input
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                value={form.slug || ""}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="e.g. clinixa-healthcare-case-study"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                SEO Title
              </label>
              <input
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                value={form.seo_title || ""}
                onChange={(e) => set("seo_title", e.target.value)}
                placeholder="e.g. Case Study: Clinixa Enterprise Platform"
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
                placeholder="Search engine meta snippet summary..."
              />
            </div>
          </div>

          <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Calendar size={16} /> Publishing Controls
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Publish Status
                </label>
                <select
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                >
                  <option value="draft" className="bg-[#111827]">
                    Draft
                  </option>
                  <option value="published" className="bg-[#111827]">
                    Published
                  </option>
                  <option value="archived" className="bg-[#111827]">
                    Archived
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Publish Date
                </label>
                <input
                  type="date"
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                  value={
                    form.published_at ? form.published_at.slice(0, 10) : ""
                  }
                  onChange={(e) => set("published_at", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Display Order
              </label>
              <input
                type="number"
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-indigo-500 transition-all"
                value={form.display_order ?? 0}
                onChange={(e) =>
                  set("display_order", parseInt(e.target.value) || 0)
                }
              />
            </div>

            <div className="pt-3 border-t border-white/10">
              <label className="flex items-center gap-3 cursor-pointer p-3.5 rounded-xl bg-[#0d1322] border border-white/10 hover:border-amber-500/40 transition-all">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/20 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                  checked={Boolean(form.is_featured)}
                  onChange={(e) => set("is_featured", e.target.checked)}
                />
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Star size={14} className="text-amber-400 fill-amber-400" />{" "}
                    Mark Case Study as Featured Showcase
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    A maximum of 3 featured case studies (sorted by Display
                    Order) will appear on the Home page.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
