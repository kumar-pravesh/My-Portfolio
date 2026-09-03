import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Layers,
  Briefcase,
  FileText,
  Star,
} from "lucide-react";
import { api } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

const MODULE_CONFIG = {
  services: {
    singular: "Service",
    path: "services",
    apiPath: "services",
    icon: Layers,
  },
  case_studies: {
    singular: "Case Study",
    path: "case-studies",
    apiPath: "case-studies",
    icon: Briefcase,
  },
  blog_posts: {
    singular: "Blog Post",
    path: "blog",
    apiPath: "blog",
    icon: FileText,
  },
  testimonials: {
    singular: "Testimonial",
    path: "testimonials",
    apiPath: "testimonials",
    icon: Star,
  },
};

const EMPTY_FORMS = {
  services: { title: "", description: "", icon: "", status: "draft" },
  case_studies: {
    title: "",
    client: "",
    description: "",
    outcome: "",
    image: "",
    status: "draft",
  },
  blog_posts: {
    title: "",
    author: "",
    content: "",
    tags: "",
    image: "",
    status: "draft",
  },
  testimonials: {
    author_name: "",
    company: "",
    role: "",
    content: "",
    rating: 5,
    avatar: "",
    status: "published",
  },
};

export default function ContentFormPage({ module }) {
  const cfg = MODULE_CONFIG[module] || MODULE_CONFIG.services;
  const { refId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const isEdit = Boolean(refId);

  const [form, setForm] = useState(EMPTY_FORMS[module] || EMPTY_FORMS.services);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/content/${cfg.apiPath}/${refId}`)
      .then((r) => setForm(r.data))
      .catch(() => addToast("Failed to load item", "error"))
      .finally(() => setLoading(false));
  }, [refId]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/content/${cfg.apiPath}/${refId}`, form);
        addToast(`${cfg.singular} updated`, "success");
      } else {
        await api.post(`/content/${cfg.apiPath}`, form);
        addToast(`${cfg.singular} created`, "success");
      }
      navigate(`/admin/${cfg.path}`);
    } catch (err) {
      addToast(err.response?.data?.error || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="p-12 text-center text-slate-400 font-mono text-xs">
        Loading item details...
      </div>
    );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
            onClick={() => navigate(`/admin/${cfg.path}`)}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {isEdit ? `Edit ${cfg.singular}` : `New ${cfg.singular}`}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEdit
                ? "Update details below"
                : `Create a new ${cfg.singular.toLowerCase()} entry`}
            </p>
          </div>
        </div>

        <button
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
          form="content-form"
          type="submit"
          disabled={saving}
        >
          <Save size={15} /> {saving ? "Saving..." : "Save Item"}
        </button>
      </div>

      {/* Form Card */}
      <form
        id="content-form"
        onSubmit={handleSubmit}
        className="bg-[#111827] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {"title" in form && (
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Title *
              </label>
              <input
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                required
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Enter item title..."
              />
            </div>
          )}

          {"author_name" in form && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Author / Client Name *
              </label>
              <input
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                required
                value={form.author_name}
                onChange={(e) => set("author_name", e.target.value)}
                placeholder="e.g. Sarah Jenkins"
              />
            </div>
          )}

          {"company" in form && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Company
              </label>
              <input
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={form.company || ""}
                onChange={(e) => set("company", e.target.value)}
                placeholder="e.g. Sivion Global"
              />
            </div>
          )}

          {"role" in form && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Designation / Role
              </label>
              <input
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={form.role || ""}
                onChange={(e) => set("role", e.target.value)}
                placeholder="e.g. CTO / Product Manager"
              />
            </div>
          )}

          {"author" in form && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Author Name
              </label>
              <input
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={form.author || ""}
                onChange={(e) => set("author", e.target.value)}
                placeholder="e.g. Pravesh Kumar"
              />
            </div>
          )}

          {"client" in form && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Client / Industry
              </label>
              <input
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={form.client || ""}
                onChange={(e) => set("client", e.target.value)}
                placeholder="e.g. HealthTech Enterprise"
              />
            </div>
          )}

          {"icon" in form && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Icon Identifier
              </label>
              <input
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={form.icon || ""}
                onChange={(e) => set("icon", e.target.value)}
                placeholder="Globe, Code, Server, 🌐"
              />
            </div>
          )}

          {"rating" in form && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Rating (1-5 Stars)
              </label>
              <select
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                value={form.rating}
                onChange={(e) => set("rating", Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r} className="bg-[#111827]">
                    {r} Star{r > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Status
            </label>
            <select
              className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500 transition-all"
              value={form.status || "draft"}
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
              Display Order
            </label>
            <input
              type="number"
              className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white outline-none focus:border-indigo-500 transition-all"
              value={form.display_order ?? 0}
              onChange={(e) =>
                set("display_order", parseInt(e.target.value) || 0)
              }
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2 pt-2 border-t border-white/10">
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
                  Mark as Featured Item
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  A maximum of 3 featured items (sorted by Display Order) will
                  be displayed on the Home Page.
                </p>
              </div>
            </label>
          </div>

          {"description" in form && (
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Description *
              </label>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-4 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all min-h-28"
                required
                rows={4}
                value={form.description || ""}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Provide details..."
              />
            </div>
          )}

          {"content" in form && (
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Full Content *
              </label>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-4 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all min-h-48"
                required
                rows={8}
                value={form.content || ""}
                onChange={(e) => set("content", e.target.value)}
                placeholder="Full markdown/text content..."
              />
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
