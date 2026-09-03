import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit3,
  Copy,
  Archive,
  Trash2,
  Star,
  Globe,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  Tag,
} from "lucide-react";
import { api } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { RefBadge, StatusBadge } from "../../components/shared/index.jsx";

const DEFAULT_CATEGORIES = [
  "All Categories",
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

export default function BlogListPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState("");

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBlogs = () => {
    setLoading(true);
    api
      .get("/content/blog_posts?limit=100")
      .then((r) => {
        setAllBlogs(r.data?.data || r.data || []);
      })
      .catch(() => toast.error("Failed to load blog posts."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const items = allBlogs.filter((b) => {
    if (statusFilter && b.status !== statusFilter) return false;
    if (catFilter && catFilter !== "All Categories" && b.category !== catFilter)
      return false;
    if (featuredFilter === "true" && !b.is_featured) return false;
    if (search) {
      const s = search.toLowerCase();
      const match =
        b.title?.toLowerCase().includes(s) ||
        b.reference_id?.toLowerCase().includes(s) ||
        b.author_name?.toLowerCase().includes(s) ||
        b.category?.toLowerCase().includes(s);
      if (!match) return false;
    }
    return true;
  });

  // Duplicate handler
  const handleDuplicate = async (refId) => {
    try {
      const r = await api.post(`/content/blog_posts/${refId}/duplicate`);
      toast.success(`Duplicated blog: ${r.data.reference_id}`);
      fetchBlogs();
    } catch (err) {
      toast.error("Failed to duplicate blog.");
    }
  };

  // Confirm delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/content/blog_posts/${deleteTarget.reference_id}`);
      toast.success(`Deleted blog ${deleteTarget.reference_id}`);
      setDeleteTarget(null);
      fetchBlogs();
    } catch (err) {
      toast.error("Failed to delete blog post.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full pb-12">
      {/* Top Banner */}
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Blog CMS Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold">
              {items.length} Posts
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Publish, schedule, edit, and manage search-optimized blog articles
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <button
            type="button"
            onClick={fetchBlogs}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            title="Refresh List"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/blog/new")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all shrink-0"
          >
            <Plus size={15} /> New Blog Post
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center gap-3">
        {/* Search Field */}
        <div className="relative flex-1 w-full">
          <Search
            size={15}
            className="absolute left-3.5 top-3 text-slate-500"
          />
          <input
            className="w-full bg-[#0d1322] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Reference ID, Title, Author, Category, Tags..."
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            className="w-full md:w-auto bg-[#0d1322] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="" className="bg-[#111827]">
              All Statuses
            </option>
            <option value="draft" className="bg-[#111827]">
              Draft
            </option>
            <option value="scheduled" className="bg-[#111827]">
              Scheduled
            </option>
            <option value="published" className="bg-[#111827]">
              Published
            </option>
            <option value="archived" className="bg-[#111827]">
              Archived
            </option>
          </select>

          {/* Category Filter */}
          <select
            className="w-full md:w-auto bg-[#0d1322] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all"
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
          >
            {DEFAULT_CATEGORIES.map((c) => (
              <option
                key={c}
                value={c === "All Categories" ? "" : c}
                className="bg-[#111827]"
              >
                {c}
              </option>
            ))}
          </select>

          {/* Featured Filter */}
          <select
            className="w-full md:w-auto bg-[#0d1322] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all"
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
          >
            <option value="" className="bg-[#111827]">
              Any Featured
            </option>
            <option value="true" className="bg-[#111827]">
              Featured Only
            </option>
          </select>

          {/* Clear Filters */}
          {(search || statusFilter || catFilter || featuredFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setCatFilter("");
                setFeaturedFilter("");
              }}
              className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#111827] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#0d1322]/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Ref ID</th>
                <th className="py-3.5 px-4">Image</th>
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4">Author</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Featured</th>
                <th className="py-3.5 px-4">Publish Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-slate-500 font-mono"
                  >
                    Loading blog post records...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No blog posts found matching your criteria.
                  </td>
                </tr>
              ) : (
                items.map((b) => (
                  <tr
                    key={b.id || b.reference_id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono">
                      <RefBadge refId={b.reference_id} />
                    </td>

                    <td className="py-3.5 px-4">
                      {b.featured_image ? (
                        <img
                          src={b.featured_image}
                          alt={b.title}
                          className="w-12 h-9 object-cover rounded-lg border border-white/10"
                        />
                      ) : (
                        <div className="w-12 h-9 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-slate-500 text-[10px]">
                          No img
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-white max-w-[150px] sm:max-w-[200px] md:max-w-[250px]">
                      <div
                        className="truncate cursor-pointer hover:text-indigo-400 transition-colors"
                        onClick={() =>
                          navigate(`/admin/blog/${b.reference_id}/edit`)
                        }
                      >
                        {b.title}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono truncate block">
                        {b.slug}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      <span className="flex items-center gap-1.5">
                        <User size={13} className="text-indigo-400 shrink-0" />{" "}
                        {b.author_name || "Pravesh Kumar"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 font-semibold text-[11px]">
                        {b.category || "Technology"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={b.status} />
                    </td>

                    <td className="py-3.5 px-4">
                      {b.is_featured ? (
                        <Star
                          size={15}
                          className="text-amber-400 fill-amber-400"
                          title="Featured Post"
                        />
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {b.published_at
                        ? new Date(b.published_at).toLocaleDateString()
                        : b.created_at
                          ? new Date(b.created_at).toLocaleDateString()
                          : "—"}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/admin/blog/${b.reference_id}/edit`)
                          }
                          className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                          title="Edit Blog"
                        >
                          <Edit3 size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicate(b.reference_id)}
                          className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                          title="Duplicate Blog"
                        >
                          <Copy size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(b)}
                          className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all"
                          title="Delete Blog"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle size={24} />
              <h3 className="text-base font-bold text-white">
                Permanently Delete Blog Post?
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-white font-mono">
                {deleteTarget.reference_id}
              </strong>{" "}
              ({deleteTarget.title})? This action cannot be undone and reference
              IDs are never reused.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
