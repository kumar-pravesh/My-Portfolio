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
  Clock,
  User,
  Tag,
  List,
  Bold,
  Italic,
  Code,
  Quote,
  Type,
  Copy,
  Trash2,
  Layout,
} from "lucide-react";
import { api } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import {
  RefBadge,
  StatusBadge,
  ImageUploader,
} from "../../components/shared/index.jsx";

const DEFAULT_CATEGORIES = [
  "Technology",
  "Web Development",
  "AI",
  "Software Engineering",
  "UI/UX",
  "Business",
  "Digital Transformation",
  "Company News",
  "Tutorials",
  "Case Studies",
];

const EMPTY = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  author_id: "",
  author_name: "Pravesh Kumar",
  category: "Technology",
  tags: [],
  status: "draft",
  featured_image: "",
  image_alt: "",
  image_caption: "",
  is_featured: false,
  scheduled_at: "",
  published_at: "",
  reading_time: "3 min read",
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
  canonical_url: "",
  robots_meta: "index, follow",
  og_title: "",
  og_description: "",
  og_image: "",
  social_title: "",
  social_description: "",
  social_image: "",
  related_projects: [],
  related_case_studies: [],
  related_services: [],
  related_blogs: [],
  cta_title: "",
  cta_description: "",
  cta_button_text: "",
  cta_url: "",
};

export default function BlogFormPage() {
  const { refId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(refId);

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [contentMode, setContentMode] = useState("write"); // 'write' | 'preview'
  const [usersList, setUsersList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [caseStudiesList, setCaseStudiesList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [blogsList, setBlogsList] = useState([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    // Fetch relational lookup data
    api
      .get("/users")
      .then((r) => setUsersList(r.data?.data || r.data || []))
      .catch(() => {});
    api
      .get("/projects?limit=100")
      .then((r) => setProjectsList(r.data?.data || []))
      .catch(() => {});
    api
      .get("/content/case_studies?limit=100")
      .then((r) => setCaseStudiesList(r.data?.data || []))
      .catch(() => {});
    api
      .get("/content/services?limit=100")
      .then((r) => setServicesList(r.data?.data || []))
      .catch(() => {});
    api
      .get("/content/blog_posts?limit=100")
      .then((r) => setBlogsList(r.data?.data || []))
      .catch(() => {});

    if (!isEdit) return;
    setLoading(true);
    api
      .get(`/content/blog_posts/${refId}`)
      .then((r) => setForm(r.data))
      .catch(() => toast.error("Failed to load blog post."))
      .finally(() => setLoading(false));
  }, [refId]);

  // Helper setter
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Dynamic slug generator
  const handleTitleChange = (val) => {
    set("title", val);
    if (!isEdit || !form.slug) {
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      set("slug", generatedSlug);
    }
  };

  // Automatic reading time calculator (~200 words per minute)
  useEffect(() => {
    if (!form.content) return;
    const words = form.content.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    setForm((f) => ({ ...f, reading_time: `${minutes} min read` }));
  }, [form.content]);

  // Tag helper
  const addTag = (tagToAdd) => {
    const clean = tagToAdd.trim();
    if (!clean) return;
    const currentTags = Array.isArray(form.tags) ? form.tags : [];
    if (!currentTags.includes(clean)) {
      set("tags", [...currentTags, clean]);
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove) => {
    const currentTags = Array.isArray(form.tags) ? form.tags : [];
    set(
      "tags",
      currentTags.filter((t) => t !== tagToRemove),
    );
  };

  // Toolbar action for markdown editor
  const insertMarkdown = (prefix, suffix = "") => {
    const textarea = document.getElementById("blog-editor-textarea");
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end) || "text";
    const replacement = `${prefix}${selected}${suffix}`;
    const newText =
      text.substring(0, start) + replacement + text.substring(end);
    set("content", newText);
  };

  const submit = async (statusOverride) => {
    if (!form.title) {
      toast.error("Title is required!");
      return;
    }
    setSaving(true);

    const payload = {
      ...form,
      status: statusOverride || form.status,
      tags: Array.isArray(form.tags) ? form.tags : [],
    };

    try {
      if (isEdit) {
        await api.put(`/content/blog_posts/${refId}`, payload);
        toast.success("Blog post updated successfully!");
      } else {
        const r = await api.post("/content/blog_posts", payload);
        toast.success(`Blog post created: ${r.data.reference_id}`);
        navigate(`/admin/blog/${r.data.reference_id}/edit`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  // Duplicate Blog Handler
  const handleDuplicate = async () => {
    if (!isEdit) return;
    setSaving(true);
    try {
      const r = await api.post(`/content/blog_posts/${refId}/duplicate`);
      toast.success(`Blog duplicated to new draft: ${r.data.reference_id}`);
      navigate(`/admin/blog/${r.data.reference_id}/edit`);
    } catch (err) {
      toast.error("Failed to duplicate blog.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-12 text-center text-slate-400 font-mono text-xs">
        Loading blog CMS editor...
      </div>
    );

  const TABS = [
    { id: "basic", label: "Basic Info", icon: FolderKanban },
    { id: "content", label: "Blog Content", icon: FileText },
    { id: "media", label: "Featured Image", icon: ImageIcon },
    { id: "category", label: "Category & Tags", icon: Tag },
    { id: "publish", label: "Publishing", icon: Calendar },
    { id: "seo", label: "SEO & Social", icon: Search },
    { id: "related", label: "Related Content", icon: Share2 },
    { id: "cta", label: "CTA & Preview", icon: Eye },
  ];

  return (
    <div className="space-y-6 w-full max-w-full pb-12">
      {/* Header Banner */}
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Tier 1: Breadcrumb + Action Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all shrink-0"
              onClick={() => navigate("/admin/blog")}
              title="Back to Blogs"
            >
              <ArrowLeft size={15} />
            </button>
            <div className="flex items-center gap-1 text-xs text-slate-400 font-medium truncate">
              <span
                className="cursor-pointer hover:text-white transition-colors"
                onClick={() => navigate("/admin/blog")}
              >
                Blog CMS
              </span>
              <ChevronRight size={13} className="text-slate-600 shrink-0" />
              <span className="text-white font-semibold truncate">
                {isEdit ? "Edit Blog Post" : "New Blog Post"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap relative z-10">
            {isEdit && (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-all"
                onClick={handleDuplicate}
                disabled={saving}
                title="Duplicate blog post into a new draft"
              >
                <Copy size={13} /> Duplicate
              </button>
            )}
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
              <Globe size={13} /> {saving ? "Saving..." : "Publish Blog"}
            </button>
          </div>
        </div>

        {/* Tier 2: Title & Metadata Badges */}
        <div className="space-y-1.5 relative z-10">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug break-words">
            {isEdit ? form.title || "Untitled Blog Post" : "New Blog Post"}
          </h1>

          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            <RefBadge refId={form.reference_id || "BLOG-AUTO"} large />
            <StatusBadge status={form.status} />
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 border border-white/10 text-slate-300 text-[10px] font-mono">
              <Clock size={11} className="text-indigo-400" />{" "}
              {form.reading_time || "3 min read"}
            </span>
            {form.is_featured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                <Star size={11} className="fill-amber-400" /> Featured Article
              </span>
            )}
          </div>
        </div>

        {/* Tier 3: Sleek 8 Navigation Tabs */}
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

      {/* Tab 1: Basic Info */}
      {activeTab === "basic" && (
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <FolderKanban size={16} /> Basic Blog Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Reference ID{" "}
                <span className="text-slate-500 font-normal">
                  (Auto-Generated)
                </span>
              </label>
              <input
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-indigo-300 font-mono font-bold outline-none cursor-not-allowed opacity-80"
                readOnly
                value={
                  form.reference_id ||
                  "Auto-generated upon save (BLOG-2026-XXXXX)"
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                URL Slug *
              </label>
              <input
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                required
                value={form.slug || ""}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="how-ai-is-transforming-modern-businesses"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Main Title *
              </label>
              <input
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all font-bold text-sm"
                required
                value={form.title || ""}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. How AI Is Transforming Modern Businesses"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Author *
              </label>
              <select
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                value={form.author_id || ""}
                onChange={(e) => {
                  const selUser = usersList.find(
                    (u) => u.id === e.target.value,
                  );
                  setForm((f) => ({
                    ...f,
                    author_id: e.target.value,
                    author_name: selUser
                      ? selUser.name || selUser.username
                      : "Pravesh Kumar",
                  }));
                }}
              >
                <option value="" className="bg-[#111827]">
                  Pravesh Kumar (Super Admin)
                </option>
                {usersList.map((u) => (
                  <option key={u.id} value={u.id} className="bg-[#111827]">
                    {u.name || u.username} ({u.role || "User"})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Primary Category *
              </label>
              <select
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                value={form.category || "Technology"}
                onChange={(e) => set("category", e.target.value)}
              >
                {DEFAULT_CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#111827]">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Excerpt / Short Summary *
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  {(form.excerpt || "").length} / 250 chars
                </span>
              </div>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                rows={3}
                required
                value={form.excerpt || ""}
                onChange={(e) => set("excerpt", e.target.value)}
                placeholder="A compelling 2-sentence summary displayed on blog cards and search listings..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Rich Blog Content Editor */}
      {activeTab === "content" && (
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <FileText size={16} /> Rich Text Content Editor
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Supports Headings, Formatting, Lists, Code Blocks, and Live
                Preview
              </p>
            </div>

            {/* Mode Toggle Switch */}
            <div className="flex items-center gap-1 bg-[#0d1322] p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setContentMode("write")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  contentMode === "write"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Write Mode
              </button>
              <button
                type="button"
                onClick={() => setContentMode("preview")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  contentMode === "preview"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Live Preview Mode
              </button>
            </div>
          </div>

          {contentMode === "write" ? (
            <div className="space-y-3">
              {/* Editor Formatting Toolbar */}
              <div className="flex items-center gap-1 overflow-x-auto p-2 bg-[#0d1322] rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => insertMarkdown("## ")}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg text-xs font-bold"
                  title="H2 Heading"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("### ")}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg text-xs font-bold"
                  title="H3 Heading"
                >
                  H3
                </button>
                <div className="h-4 w-px bg-white/10 mx-1" />
                <button
                  type="button"
                  onClick={() => insertMarkdown("**", "**")}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
                  title="Bold"
                >
                  <Bold size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("*", "*")}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
                  title="Italic"
                >
                  <Italic size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("`", "`")}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
                  title="Inline Code"
                >
                  <Code size={14} />
                </button>
                <div className="h-4 w-px bg-white/10 mx-1" />
                <button
                  type="button"
                  onClick={() => insertMarkdown("> ")}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
                  title="Quote"
                >
                  <Quote size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("- ")}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
                  title="Bullet List"
                >
                  <List size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("[", "](https://example.com)")}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
                  title="Add Link"
                >
                  <LinkIcon size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("![alt text](", ")")}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
                  title="Add Image"
                >
                  <ImageIcon size={14} />
                </button>
                <div className="h-4 w-px bg-white/10 mx-1" />
                <button
                  type="button"
                  onClick={() => insertMarkdown("```javascript\n", "\n```")}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg font-mono text-xs"
                  title="Code Block"
                >
                  &lt;/&gt;
                </button>
              </div>

              <textarea
                id="blog-editor-textarea"
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-4 text-xs text-white placeholder-slate-500 font-mono outline-none focus:border-indigo-500 transition-all min-h-96 leading-relaxed"
                rows={16}
                value={form.content || ""}
                onChange={(e) => set("content", e.target.value)}
                placeholder="Write article content using markdown or formatted text..."
              />
            </div>
          ) : (
            <div className="bg-[#0d1322] border border-white/10 rounded-xl p-6 text-slate-200 space-y-4 min-h-96">
              <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">
                {form.title || "Untitled Post"}
              </h2>
              <div className="prose prose-invert max-w-none text-xs leading-relaxed space-y-3 whitespace-pre-wrap font-sans">
                {form.content || (
                  <span className="text-slate-500 italic">
                    No content written yet...
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Featured Image & Alt Text */}
      {activeTab === "media" && (
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <ImageIcon size={16} className="text-indigo-400" /> Featured
                Article Image
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Upload image from device or input URL with SEO Alt text
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUploader
              label="Featured Image"
              value={form.featured_image || ""}
              onChange={(val) => set("featured_image", val)}
              hint="Main hero image for blog detail header and listing card"
            />

            <div className="space-y-4 bg-[#0d1322] border border-white/10 p-5 rounded-2xl">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Image Alt Text *
                </label>
                <input
                  className="w-full bg-[#111827] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                  value={form.image_alt || ""}
                  onChange={(e) => set("image_alt", e.target.value)}
                  placeholder="e.g. Clinixa HMS hospital management dashboard preview"
                />
                <p className="text-[10px] text-slate-500">
                  Crucial for accessibility and Google Image SEO rankings.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Image Caption
                </label>
                <input
                  className="w-full bg-[#111827] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                  value={form.image_caption || ""}
                  onChange={(e) => set("image_caption", e.target.value)}
                  placeholder="Caption displayed directly under the image..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Category & Tags */}
      {activeTab === "category" && (
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <Tag size={16} /> Category & Multi-Tag Management
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 bg-[#0d1322] border border-white/10 p-5 rounded-2xl">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Primary Category *
              </label>
              <select
                className="w-full bg-[#111827] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                value={form.category || "Technology"}
                onChange={(e) => set("category", e.target.value)}
              >
                {DEFAULT_CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#111827]">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 bg-[#0d1322] border border-white/10 p-5 rounded-2xl">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Article Tags
              </label>
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 bg-[#111827] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(tagInput);
                    }
                  }}
                  placeholder="Type tag (e.g. React) & press Enter"
                />
                <button
                  type="button"
                  onClick={() => addTag(tagInput)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all"
                >
                  Add Tag
                </button>
              </div>

              {/* Live Tags Pills */}
              <div className="flex flex-wrap gap-2 pt-2 min-h-12 border border-white/5 bg-[#111827] p-3 rounded-xl">
                {(Array.isArray(form.tags) ? form.tags : []).map((t, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="hover:text-red-400 transition-colors"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Publishing & Schedule */}
      {activeTab === "publish" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Calendar size={16} /> Status & Publishing Workflow
            </h3>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Publication Status
              </label>
              <select
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all font-semibold"
                value={form.status || "draft"}
                onChange={(e) => set("status", e.target.value)}
              >
                <option value="draft" className="bg-[#111827]">
                  Draft (Private)
                </option>
                <option value="scheduled" className="bg-[#111827]">
                  Scheduled (Auto-Publish at Future Time)
                </option>
                <option value="published" className="bg-[#111827]">
                  Published (Live on Website)
                </option>
                <option value="archived" className="bg-[#111827]">
                  Archived (Hidden from Public)
                </option>
              </select>
            </div>

            {form.status === "scheduled" && (
              <div className="space-y-1.5 bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                <label className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                  value={
                    form.scheduled_at ? form.scheduled_at.slice(0, 16) : ""
                  }
                  onChange={(e) => set("scheduled_at", e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Publish Date
              </label>
              <input
                type="date"
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                value={form.published_at ? form.published_at.slice(0, 10) : ""}
                onChange={(e) => set("published_at", e.target.value)}
              />
            </div>
          </div>

          <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Star size={16} /> Showcase Controls
            </h3>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Display Order Index
              </label>
              <input
                type="number"
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-indigo-500 transition-all"
                value={form.display_order ?? 0}
                onChange={(e) =>
                  set("display_order", parseInt(e.target.value) || 0)
                }
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-[#0d1322] border border-white/10 hover:border-amber-500/40 transition-all">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-white/20 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                checked={Boolean(form.is_featured)}
                onChange={(e) => set("is_featured", e.target.checked)}
              />
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Star size={14} className="text-amber-400 fill-amber-400" />{" "}
                  Mark as Featured Article
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  A maximum of 3 featured articles (sorted by Display Order)
                  will appear on the Home page.
                </p>
              </div>
            </label>

            <div className="p-4 rounded-xl bg-[#0d1322] border border-white/10 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Calculated Reading Time
              </span>
              <p className="text-sm font-bold text-indigo-300 flex items-center gap-2 font-mono">
                <Clock size={16} /> {form.reading_time || "3 min read"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: SEO & Social */}
      {activeTab === "seo" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Search size={16} /> Google Search SEO Metadata
            </h3>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  SEO Title
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  {(form.seo_title || form.title || "").length} / 60 chars
                </span>
              </div>
              <input
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                value={form.seo_title || ""}
                onChange={(e) => set("seo_title", e.target.value)}
                placeholder={form.title || "SEO Title..."}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  SEO Description
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  {(form.seo_description || form.excerpt || "").length} / 160
                  chars
                </span>
              </div>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                rows={3}
                value={form.seo_description || ""}
                onChange={(e) => set("seo_description", e.target.value)}
                placeholder={form.excerpt || "Search engine snippet..."}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                SEO Keywords (Comma-Separated)
              </label>
              <input
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                value={
                  typeof form.seo_keywords === "string"
                    ? form.seo_keywords
                    : Array.isArray(form.seo_keywords)
                      ? form.seo_keywords.join(", ")
                      : ""
                }
                onChange={(e) => set("seo_keywords", e.target.value)}
                placeholder="AI, Web Development, Microservices"
              />
            </div>
          </div>

          <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Share2 size={16} /> Open Graph / Social Media Preview
            </h3>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Social Share Title
              </label>
              <input
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                value={form.social_title || ""}
                onChange={(e) => set("social_title", e.target.value)}
                placeholder={form.seo_title || form.title || "Social Title"}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Social Share Description
              </label>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                rows={2}
                value={form.social_description || ""}
                onChange={(e) => set("social_description", e.target.value)}
                placeholder={
                  form.seo_description ||
                  form.excerpt ||
                  "Social description snippet"
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Related Content */}
      {activeTab === "related" && (
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <Share2 size={16} /> Associate Related Portfolio Records
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Related Projects
              </label>
              <select
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                value={
                  Array.isArray(form.related_projects)
                    ? form.related_projects[0] || ""
                    : form.related_projects || ""
                }
                onChange={(e) =>
                  set(
                    "related_projects",
                    e.target.value ? [e.target.value] : [],
                  )
                }
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
                Related Case Study
              </label>
              <select
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                value={
                  Array.isArray(form.related_case_studies)
                    ? form.related_case_studies[0] || ""
                    : form.related_case_studies || ""
                }
                onChange={(e) =>
                  set(
                    "related_case_studies",
                    e.target.value ? [e.target.value] : [],
                  )
                }
              >
                <option value="" className="bg-[#111827]">
                  -- Select Case Study --
                </option>
                {caseStudiesList.map((c) => (
                  <option
                    key={c.reference_id}
                    value={c.reference_id}
                    className="bg-[#111827]"
                  >
                    {c.title} ({c.reference_id})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Related Services
              </label>
              <select
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                value={
                  Array.isArray(form.related_services)
                    ? form.related_services[0] || ""
                    : form.related_services || ""
                }
                onChange={(e) =>
                  set(
                    "related_services",
                    e.target.value ? [e.target.value] : [],
                  )
                }
              >
                <option value="" className="bg-[#111827]">
                  -- Select Service --
                </option>
                {servicesList.map((s) => (
                  <option
                    key={s.reference_id}
                    value={s.reference_id}
                    className="bg-[#111827]"
                  >
                    {s.name} ({s.reference_id})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Related Blog Article
              </label>
              <select
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                value={
                  Array.isArray(form.related_blogs)
                    ? form.related_blogs[0] || ""
                    : form.related_blogs || ""
                }
                onChange={(e) =>
                  set("related_blogs", e.target.value ? [e.target.value] : [])
                }
              >
                <option value="" className="bg-[#111827]">
                  -- Select Blog Article --
                </option>
                {blogsList
                  .filter((b) => b.reference_id !== form.reference_id)
                  .map((b) => (
                    <option
                      key={b.reference_id}
                      value={b.reference_id}
                      className="bg-[#111827]"
                    >
                      {b.title} ({b.reference_id})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: CTA & Live Public Preview */}
      {activeTab === "cta" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Optional CTA Box Form */}
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Sparkles size={16} /> Article Footer Call-To-Action (Optional)
            </h3>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                CTA Title
              </label>
              <input
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                value={form.cta_title || ""}
                onChange={(e) => set("cta_title", e.target.value)}
                placeholder="e.g. Need a similar enterprise web solution?"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                CTA Description
              </label>
              <textarea
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                rows={2}
                value={form.cta_description || ""}
                onChange={(e) => set("cta_description", e.target.value)}
                placeholder="Let's discuss how we can help transform your business tech stack."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  CTA Button Label
                </label>
                <input
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                  value={form.cta_button_text || ""}
                  onChange={(e) => set("cta_button_text", e.target.value)}
                  placeholder="Contact Us"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  CTA Target URL
                </label>
                <input
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                  value={form.cta_url || ""}
                  onChange={(e) => set("cta_url", e.target.value)}
                  placeholder="/contact"
                />
              </div>
            </div>
          </div>

          {/* Full Public Page Live Card Preview */}
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Eye size={16} /> Live Public Card Preview
            </h3>

            <div className="bg-[#0d1322] border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all hover:border-indigo-500/40">
              {form.featured_image ? (
                <img
                  src={form.featured_image}
                  alt={form.image_alt || "Blog"}
                  className="w-full h-44 object-cover"
                />
              ) : (
                <div className="w-full h-44 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 flex items-center justify-center text-slate-500 text-xs font-mono">
                  No Featured Image Uploaded
                </div>
              )}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                    {form.category || "Technology"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock size={11} /> {form.reading_time || "3 min read"}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white leading-snug">
                  {form.title || "Untitled Blog Post"}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {form.excerpt ||
                    "Article summary preview will appear here..."}
                </p>
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <User size={13} className="text-indigo-400" />{" "}
                    {form.author_name || "Pravesh Kumar"}
                  </span>
                  <span className="text-indigo-400 font-bold flex items-center gap-1 cursor-pointer hover:underline">
                    Read Article <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
