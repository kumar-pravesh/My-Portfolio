import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Layers,
  FileText,
  Star,
  Briefcase,
} from "lucide-react";
import { api } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import {
  StatusBadge,
  RefBadge,
  ConfirmDialog,
  Pagination,
  DataTable,
} from "../../components/shared/index.jsx";

const MODULE_CONFIG = {
  services: {
    title: "Services",
    singular: "Service",
    path: "services",
    apiPath: "services",
    icon: Layers,
    cols: ["Title", "Status", "Ref ID", "Created"],
  },
  case_studies: {
    title: "Case Studies",
    singular: "Case Study",
    path: "case-studies",
    apiPath: "case-studies",
    icon: Briefcase,
    cols: ["Title", "Client", "Status", "Ref ID", "Created"],
  },
  blog_posts: {
    title: "Blog Posts",
    singular: "Blog Post",
    path: "blog",
    apiPath: "blog",
    icon: FileText,
    cols: ["Title", "Author", "Status", "Ref ID", "Published"],
  },
  testimonials: {
    title: "Testimonials",
    singular: "Testimonial",
    path: "testimonials",
    apiPath: "testimonials",
    icon: Star,
    cols: ["Name", "Company", "Rating", "Status", "Ref ID"],
  },
};

export default function ContentListPage({ module }) {
  const cfg = MODULE_CONFIG[module] || MODULE_CONFIG.services;
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const limit = 15;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...(search && { search }),
      });
      const res = await api.get(`/content/${cfg.apiPath}?${params}`);

      const rawData = res.data;
      const dataList = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.data)
          ? rawData.data
          : Array.isArray(rawData?.items)
            ? rawData.items
            : [];

      setItems(dataList);
      setTotal(rawData?.total !== undefined ? rawData.total : dataList.length);
    } catch (err) {
      setItems([]);
      setTotal(0);
      addToast("Failed to load " + cfg.title.toLowerCase(), "error");
    } finally {
      setLoading(false);
    }
  }, [page, search, cfg.apiPath, cfg.title, addToast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  async function handleDelete() {
    try {
      await api.delete(
        `/content/${cfg.apiPath}/${deleteTarget.ref_id || deleteTarget.id}`,
      );
      addToast(`${cfg.singular} deleted`, "success");
      setDeleteTarget(null);
      fetchItems();
    } catch {
      addToast("Delete failed", "error");
    }
  }

  async function toggleStatus(item) {
    try {
      const newStatus = item.status === "published" ? "draft" : "published";
      await api.patch(`/content/${cfg.apiPath}/${item.ref_id || item.id}`, {
        status: newStatus,
      });
      addToast(`Status updated to ${newStatus}`, "success");
      fetchItems();
    } catch {
      addToast("Status update failed", "error");
    }
  }

  const ModuleIcon = cfg.icon;

  function renderRow(item) {
    if (!item) return null;
    const itemId = item.ref_id || item.id;

    if (module === "testimonials") {
      return (
        <tr
          key={itemId || Math.random()}
          className="hover:bg-white/[0.02] transition-colors border-b border-white/5 text-xs text-slate-300"
        >
          <td className="py-3.5 px-4 font-semibold text-white">
            {item.author_name || item.client_name || item.name || "—"}
          </td>
          <td className="py-3.5 px-4 text-slate-400">{item.company || "—"}</td>
          <td className="py-3.5 px-4 text-amber-400">
            {"★".repeat(item.rating || 5)}
          </td>
          <td className="py-3.5 px-4">
            <StatusBadge status={item.status} />
          </td>
          <td className="py-3.5 px-4">
            <RefBadge refId={item.ref_id} />
          </td>
          <td className="py-3.5 px-4 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <button
                className="btn-icon"
                onClick={() => navigate(`/admin/${cfg.path}/${itemId}/edit`)}
                title="Edit"
              >
                <Edit size={14} />
              </button>
              <button
                className="btn-icon btn-icon--danger"
                onClick={() => setDeleteTarget(item)}
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
              <button
                className="btn-icon"
                onClick={() => toggleStatus(item)}
                title="Toggle status"
              >
                {item.status === "published" ? (
                  <EyeOff size={14} />
                ) : (
                  <Eye size={14} />
                )}
              </button>
            </div>
          </td>
        </tr>
      );
    }
    if (module === "blog_posts") {
      return (
        <tr
          key={itemId || Math.random()}
          className="hover:bg-white/[0.02] transition-colors border-b border-white/5 text-xs text-slate-300"
        >
          <td className="py-3.5 px-4 font-semibold text-white">{item.title}</td>
          <td className="py-3.5 px-4 text-slate-400">
            {item.author || item.author_name || "—"}
          </td>
          <td className="py-3.5 px-4">
            <StatusBadge status={item.status} />
          </td>
          <td className="py-3.5 px-4">
            <RefBadge refId={item.ref_id} />
          </td>
          <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
            {item.published_at
              ? new Date(item.published_at).toLocaleDateString()
              : item.created_at
                ? new Date(item.created_at).toLocaleDateString()
                : "—"}
          </td>
          <td className="py-3.5 px-4 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <button
                className="btn-icon"
                onClick={() => navigate(`/admin/${cfg.path}/${itemId}/edit`)}
                title="Edit"
              >
                <Edit size={14} />
              </button>
              <button
                className="btn-icon btn-icon--danger"
                onClick={() => setDeleteTarget(item)}
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
              <button
                className="btn-icon"
                onClick={() => toggleStatus(item)}
                title="Toggle status"
              >
                {item.status === "published" ? (
                  <EyeOff size={14} />
                ) : (
                  <Eye size={14} />
                )}
              </button>
            </div>
          </td>
        </tr>
      );
    }
    if (module === "case_studies") {
      return (
        <tr
          key={itemId || Math.random()}
          className="hover:bg-white/[0.02] transition-colors border-b border-white/5 text-xs text-slate-300"
        >
          <td className="py-3.5 px-4 font-semibold text-white">{item.title}</td>
          <td className="py-3.5 px-4 text-slate-400">{item.client || "—"}</td>
          <td className="py-3.5 px-4">
            <StatusBadge status={item.status} />
          </td>
          <td className="py-3.5 px-4">
            <RefBadge refId={item.ref_id} />
          </td>
          <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
            {item.created_at
              ? new Date(item.created_at).toLocaleDateString()
              : "—"}
          </td>
          <td className="py-3.5 px-4 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <button
                className="btn-icon"
                onClick={() => navigate(`/admin/${cfg.path}/${itemId}/edit`)}
                title="Edit"
              >
                <Edit size={14} />
              </button>
              <button
                className="btn-icon btn-icon--danger"
                onClick={() => setDeleteTarget(item)}
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
              <button
                className="btn-icon"
                onClick={() => toggleStatus(item)}
                title="Toggle status"
              >
                {item.status === "published" ? (
                  <EyeOff size={14} />
                ) : (
                  <Eye size={14} />
                )}
              </button>
            </div>
          </td>
        </tr>
      );
    }

    // services default
    return (
      <tr
        key={itemId || Math.random()}
        className="hover:bg-white/[0.02] transition-colors border-b border-white/5 text-xs text-slate-300"
      >
        <td className="py-3.5 px-4 font-semibold text-white">
          {item.name || item.title || "—"}
        </td>
        <td className="py-3.5 px-4">
          <StatusBadge status={item.status} />
        </td>
        <td className="py-3.5 px-4">
          <RefBadge refId={item.ref_id} />
        </td>
        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
          {item.created_at
            ? new Date(item.created_at).toLocaleDateString()
            : "—"}
        </td>
        <td className="py-3.5 px-4 text-right">
          <div className="flex items-center justify-end gap-1.5">
            <button
              className="btn-icon"
              onClick={() => navigate(`/admin/${cfg.path}/${itemId}/edit`)}
              title="Edit"
            >
              <Edit size={14} />
            </button>
            <button
              className="btn-icon btn-icon--danger"
              onClick={() => setDeleteTarget(item)}
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
            <button
              className="btn-icon"
              onClick={() => toggleStatus(item)}
              title="Toggle status"
            >
              {item.status === "published" ? (
                <EyeOff size={14} />
              ) : (
                <Eye size={14} />
              )}
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <ModuleIcon size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {cfg.title}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage and organize {cfg.title.toLowerCase()} showcases
            </p>
          </div>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all"
          onClick={() => navigate(`/admin/${cfg.path}/new`)}
        >
          <Plus size={16} /> New {cfg.singular}
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#111827] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-[#0d1322] border border-white/10 rounded-xl px-3.5 py-2 w-full sm:w-80">
            <Search size={15} className="text-slate-500 shrink-0" />
            <input
              type="text"
              className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full"
              placeholder={`Search ${cfg.title.toLowerCase()}...`}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Total: <span className="font-bold text-white">{total}</span> items
          </div>
        </div>

        <DataTable
          columns={[...cfg.cols, "Actions"]}
          loading={loading}
          empty={`No ${cfg.title.toLowerCase()} found`}
        >
          {Array.isArray(items) && items.map(renderRow)}
        </DataTable>

        {total > limit && (
          <div className="p-4 border-t border-white/10">
            <Pagination
              page={page}
              total={total}
              limit={limit}
              onChange={setPage}
            />
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title={`Delete ${cfg.singular}`}
          message={`Are you sure you want to delete "${deleteTarget.title || deleteTarget.author_name || "this item"}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          danger
        />
      )}
    </div>
  );
}
