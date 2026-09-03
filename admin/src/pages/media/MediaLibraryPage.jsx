import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  RefreshCw,
  Grid3X3,
  List,
  Image as ImageIcon,
  Video,
  FileText,
  Film,
  Play,
  Trash2,
  Edit3,
  Archive,
  Globe,
  Star,
  Upload,
  Filter,
  X,
  CheckSquare,
  Square,
  Eye,
  Copy,
  ExternalLink,
} from "lucide-react";
import { api } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { RefBadge, StatusBadge } from "../../components/shared/index.jsx";

const MEDIA_TYPES = [
  { value: "", label: "All Types" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
  { value: "short_video", label: "Reels / Shorts" },
  { value: "presentation_video", label: "Presentation Videos" },
  { value: "document", label: "Documents" },
  { value: "pdf", label: "PDFs" },
  { value: "external_video", label: "External Videos" },
  { value: "external_image", label: "External Images" },
];

const TYPE_ICON = {
  image: ImageIcon,
  video: Video,
  short_video: Film,
  presentation_video: Play,
  document: FileText,
  pdf: FileText,
  external_video: ExternalLink,
  external_image: ExternalLink,
};

const TYPE_COLOR = {
  image: "from-sky-500 to-indigo-500",
  video: "from-purple-500 to-pink-500",
  short_video: "from-rose-500 to-orange-500",
  presentation_video: "from-amber-500 to-yellow-500",
  document: "from-emerald-500 to-teal-500",
  pdf: "from-red-500 to-rose-500",
  external_video: "from-violet-500 to-purple-500",
  external_image: "from-cyan-500 to-sky-500",
};

function formatSize(bytes) {
  if (!bytes) return "—";
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${mb.toFixed(1)} MB`;
}

function MediaTypeChip({ type }) {
  const label = MEDIA_TYPES.find((t) => t.value === type)?.label || type;
  const gradient = TYPE_COLOR[type] || "from-slate-500 to-slate-600";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r ${gradient} bg-opacity-15 text-white text-[10px] font-bold uppercase tracking-wide`}
    >
      {label}
    </span>
  );
}

export default function MediaLibraryPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkAction, setBulkAction] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchMedia = useCallback(() => {
    setLoading(true);
    let url = "/media?limit=100";
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (typeFilter) url += `&media_type=${encodeURIComponent(typeFilter)}`;
    if (statusFilter) url += `&status=${encodeURIComponent(statusFilter)}`;

    api
      .get(url)
      .then((r) => setItems(r.data?.data || []))
      .catch(() => toast.error("Failed to load media library."))
      .finally(() => setLoading(false));
  }, [search, typeFilter, statusFilter]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const toggleSelect = (refId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(refId) ? next.delete(refId) : next.add(refId);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === items.length) setSelected(new Set());
    else setSelected(new Set(items.map((i) => i.reference_id)));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/media/${deleteTarget.reference_id}`);
      toast.success(`Deleted ${deleteTarget.reference_id}`);
      setDeleteTarget(null);
      fetchMedia();
    } catch {
      toast.error("Delete failed.");
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selected.size === 0) return;
    try {
      await api.post("/media/bulk/action", {
        action: bulkAction,
        refIds: [...selected],
      });
      toast.success(`Bulk ${bulkAction} applied to ${selected.size} item(s)`);
      setSelected(new Set());
      setBulkAction("");
      fetchMedia();
    } catch {
      toast.error("Bulk action failed.");
    }
  };

  const copyUrl = (url) => {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => toast.success("URL copied!"));
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("");
    setStatusFilter("");
  };

  return (
    <div className="space-y-6 w-full max-w-full pb-12">
      {/* Hero Header */}
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Media Library
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold">
              {items.length} Assets
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Central repository for all images, videos, reels, documents and
            portfolio media
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap relative z-10">
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-[#0d1322] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
              title="Grid View"
            >
              <Grid3X3 size={14} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
              title="Table View"
            >
              <List size={14} />
            </button>
          </div>

          <button
            onClick={fetchMedia}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={() => navigate("/admin/media/upload")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all"
          >
            <Upload size={15} /> Upload Media
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search
              size={15}
              className="absolute left-3.5 top-2.5 text-slate-500"
            />
            <input
              className="w-full bg-[#0d1322] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, description, category, reference ID, filename..."
            />
          </div>

          {/* Type filter */}
          <select
            className="w-full sm:w-auto bg-[#0d1322] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {MEDIA_TYPES.map((t) => (
              <option key={t.value} value={t.value} className="bg-[#111827]">
                {t.label}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            className="w-full sm:w-auto bg-[#0d1322] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="" className="bg-[#111827]">
              All Statuses
            </option>
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

          {(search || typeFilter || statusFilter) && (
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-slate-400 hover:text-white shrink-0 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Bulk Actions Bar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
            <span className="text-xs font-bold text-indigo-300">
              {selected.size} selected
            </span>
            <select
              className="bg-[#0d1322] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
            >
              <option value="">Choose action...</option>
              <option value="publish">Publish</option>
              <option value="draft">Set as Draft</option>
              <option value="archive">Archive</option>
              <option value="delete">Delete</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-40"
            >
              Apply
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs text-slate-400 hover:text-white ml-auto"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ── GRID VIEW ── */}
      {viewMode === "grid" && (
        <div>
          {/* Select All */}
          {items.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={selectAll}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                {selected.size === items.length ? (
                  <CheckSquare size={14} className="text-indigo-400" />
                ) : (
                  <Square size={14} />
                )}
                {selected.size === items.length ? "Deselect All" : "Select All"}
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array(10)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-[#111827] border border-white/10 rounded-2xl h-48 skeleton-shimmer"
                  />
                ))}
            </div>
          ) : items.length === 0 ? (
            <div className="bg-[#111827] border border-white/10 rounded-2xl py-20 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <ImageIcon size={28} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-white font-bold">No media assets yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Upload images, videos, reels and documents to your library
                </p>
              </div>
              <button
                onClick={() => navigate("/admin/media/upload")}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-2"
              >
                <Upload size={14} /> Upload First Asset
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {items.map((item) => {
                const Icon = TYPE_ICON[item.media_type] || ImageIcon;
                const isSelected = selected.has(item.reference_id);
                const isVideo = item.media_type?.includes("video");
                const isImage =
                  item.media_type === "image" ||
                  item.media_type === "external_image";

                return (
                  <div
                    key={item.id}
                    className={`group relative bg-[#111827] border rounded-2xl overflow-hidden shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${isSelected ? "border-indigo-500 ring-2 ring-indigo-500/40" : "border-white/10 hover:border-white/25"}`}
                  >
                    {/* Selection Checkbox */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(item.reference_id);
                      }}
                      className="absolute top-2 left-2 z-20 w-6 h-6 rounded-lg bg-black/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {isSelected ? (
                        <CheckSquare size={14} className="text-indigo-400" />
                      ) : (
                        <Square size={14} className="text-white" />
                      )}
                    </button>

                    {/* Status Dot */}
                    <div
                      className={`absolute top-2 right-2 z-20 w-2 h-2 rounded-full ${item.status === "published" ? "bg-emerald-400" : item.status === "archived" ? "bg-amber-400" : "bg-slate-500"}`}
                    />

                    {/* Thumbnail / Preview Area */}
                    <div
                      className="w-full h-36 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden"
                      onClick={() =>
                        navigate(`/admin/media/${item.reference_id}/edit`)
                      }
                    >
                      {isImage && item.file_url ? (
                        <img
                          src={item.file_url}
                          alt={item.alt_text || item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : item.thumbnail_url ? (
                        <div className="relative w-full h-full">
                          <img
                            src={item.thumbnail_url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          {isVideo && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Play
                                size={28}
                                className="text-white drop-shadow-lg"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          className={`flex flex-col items-center gap-2 text-slate-400`}
                        >
                          <div
                            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${TYPE_COLOR[item.media_type] || "from-slate-500 to-slate-600"} flex items-center justify-center`}
                          >
                            <Icon size={22} className="text-white" />
                          </div>
                          {isVideo && (
                            <span className="text-[10px] font-mono">
                              {item.duration || "Video"}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Info */}
                    <div className="p-3 space-y-1">
                      <div className="text-xs font-bold text-white truncate">
                        {item.title}
                      </div>
                      <div className="text-[10px] font-mono text-indigo-300 truncate">
                        {item.reference_id}
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <MediaTypeChip type={item.media_type} />
                        <span className="text-[10px] text-slate-500">
                          {formatSize(item.file_size)}
                        </span>
                      </div>
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent pt-6 pb-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/media/${item.reference_id}/edit`);
                        }}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                        title="Edit"
                      >
                        <Edit3 size={12} />
                      </button>
                      {item.file_url && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyUrl(item.file_url);
                          }}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                          title="Copy URL"
                        >
                          <Copy size={12} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(item);
                        }}
                        className="p-1.5 rounded-lg bg-rose-500/30 hover:bg-rose-500/50 text-rose-300 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TABLE VIEW ── */}
      {viewMode === "table" && (
        <div className="bg-[#111827] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#0d1322]/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4 w-10">
                    <button onClick={selectAll}>
                      {selected.size === items.length && items.length > 0 ? (
                        <CheckSquare size={14} className="text-indigo-400" />
                      ) : (
                        <Square size={14} />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-4">Ref ID</th>
                  <th className="py-3.5 px-4">Preview</th>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Size</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Featured</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {loading ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="py-12 text-center text-slate-500 font-mono"
                    >
                      Loading media assets...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="py-12 text-center text-slate-500"
                    >
                      No assets found. Upload some media!
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const isSelected = selected.has(item.reference_id);
                    const isImage =
                      item.media_type === "image" ||
                      item.media_type === "external_image";
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-white/[0.02] transition-colors ${isSelected ? "bg-indigo-500/5" : ""}`}
                      >
                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleSelect(item.reference_id)}
                          >
                            {isSelected ? (
                              <CheckSquare
                                size={14}
                                className="text-indigo-400"
                              />
                            ) : (
                              <Square size={14} className="text-slate-500" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <RefBadge refId={item.reference_id} />
                        </td>
                        <td className="py-3 px-4">
                          {(isImage && item.file_url) || item.thumbnail_url ? (
                            <img
                              src={item.file_url || item.thumbnail_url}
                              alt={item.title}
                              className="w-14 h-10 object-cover rounded-lg border border-white/10"
                            />
                          ) : (
                            <div className="w-14 h-10 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center">
                              {React.createElement(
                                TYPE_ICON[item.media_type] || ImageIcon,
                                { size: 16, className: "text-slate-500" },
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-bold text-white truncate">
                            {item.title}
                          </div>
                          {item.duration && (
                            <div className="text-[10px] text-slate-500 font-mono">
                              {item.duration}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <MediaTypeChip type={item.media_type} />
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {item.category || "—"}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {formatSize(item.file_size)}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.is_featured ? (
                            <Star
                              size={14}
                              className="text-amber-400 fill-amber-400"
                            />
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/media/${item.reference_id}/edit`,
                                )
                              }
                              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                              title="Edit"
                            >
                              <Edit3 size={13} />
                            </button>
                            {item.file_url && (
                              <button
                                onClick={() => copyUrl(item.file_url)}
                                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                                title="Copy URL"
                              >
                                <Copy size={13} />
                              </button>
                            )}
                            <button
                              onClick={() => setDeleteTarget(item)}
                              className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 text-rose-400">
              Permanently Delete Media Asset?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-white font-mono">
                {deleteTarget.reference_id}
              </strong>{" "}
              (<em>{deleteTarget.title}</em>)? This removes it from all related
              content. Reference IDs are never reused.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
