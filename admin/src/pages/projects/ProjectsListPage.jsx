import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Copy,
  Star,
  Globe,
  Archive,
  FolderKanban,
} from "lucide-react";
import { api } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import {
  StatusBadge,
  RefBadge,
  DataTable,
  Pagination,
  ConfirmDialog,
  ThumbnailWithFallback,
} from "../../components/shared/index.jsx";

export default function ProjectsListPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [featured, setFeatured] = useState("");
  const [selected, setSelected] = useState([]);
  const [delTarget, setDelTarget] = useState(null);
  const LIMIT = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (featured) params.set("featured", featured);
      const r = await api.get(`/projects?${params}`);
      setData(r.data.data || r.data);
      setTotal(r.data.total || 0);
    } catch {
      addToast("Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  }, [page, search, status, featured, addToast]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    setPage(1);
  }, [search, status, featured]);

  const doDelete = async () => {
    try {
      await api.delete(`/projects/${delTarget}`);
      addToast("Project deleted successfully", "success");
      setDelTarget(null);
      load();
    } catch {
      addToast("Delete failed", "error");
    }
  };

  const doBulk = async (action) => {
    if (selected.length === 0) return;
    try {
      await api.post("/projects/bulk", { action, refIds: selected });
      addToast(`Bulk ${action} completed`, "success");
      setSelected([]);
      load();
    } catch {
      addToast("Bulk action failed", "error");
    }
  };

  const toggleSelect = (id) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Projects
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage portfolio project showcases and client work ({total} items)
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/projects/new")}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all"
        >
          <Plus size={15} /> New Project
        </button>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-[#0d1322] border border-white/10 rounded-lg px-3.5 h-10 min-w-64 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all flex-1 sm:flex-none">
          <Search size={15} className="text-slate-500 shrink-0" />
          <input
            className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full"
            placeholder="Search by title, ref ID, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-[#0d1322] border border-white/10 rounded-lg px-3 h-10 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all"
        >
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>

        <select
          value={featured}
          onChange={(e) => setFeatured(e.target.value)}
          className="bg-[#0d1322] border border-white/10 rounded-lg px-3 h-10 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all"
        >
          <option value="">All Projects</option>
          <option value="true">Featured Only</option>
        </select>

        {selected.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-slate-400">
              {selected.length} selected:
            </span>
            <button
              onClick={() => doBulk("publish")}
              className="px-2.5 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white flex items-center gap-1"
            >
              <Globe size={13} /> Publish
            </button>
            <button
              onClick={() => doBulk("archive")}
              className="px-2.5 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white flex items-center gap-1"
            >
              <Archive size={13} /> Archive
            </button>
            <button
              onClick={() => doBulk("delete")}
              className="px-2.5 py-1.5 rounded-md bg-rose-500/15 border border-rose-500/25 text-xs text-rose-300 hover:bg-rose-500 hover:text-white flex items-center gap-1"
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        columns={[
          "",
          "Preview",
          "Ref ID",
          "Project Title",
          "Category",
          "Status",
          "⭐",
          "Created",
          "Actions",
        ]}
        loading={loading}
        emptyText="No projects found"
      >
        {data.map((row) => (
          <tr
            key={row.id}
            onClick={() => navigate(`/admin/projects/${row.reference_id}`)}
            className="hover:bg-white/[0.03] transition-colors cursor-pointer"
          >
            <td
              onClick={(e) => e.stopPropagation()}
              className="px-4 py-3.5 w-9"
            >
              <input
                type="checkbox"
                checked={selected.includes(row.reference_id)}
                onChange={() => toggleSelect(row.reference_id)}
              />
            </td>
            <td className="px-4 py-3.5 w-14">
              <ThumbnailWithFallback
                src={row.image}
                alt={row.title}
                icon={FolderKanban}
              />
            </td>
            <td className="px-4 py-3.5">
              <RefBadge refId={row.reference_id} />
            </td>
            <td className="px-4 py-3.5">
              <div className="font-semibold text-xs text-white">
                {row.title}
              </div>
              {row.client_name && (
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Client: {row.client_name}
                </div>
              )}
            </td>
            <td className="px-4 py-3.5 text-xs text-slate-400">
              {row.category || "—"}
            </td>
            <td className="px-4 py-3.5">
              <StatusBadge status={row.status} />
            </td>
            <td className="px-4 py-3.5 text-center">
              {row.is_featured ? (
                <Star
                  size={15}
                  className="text-amber-400 fill-amber-400 inline"
                />
              ) : null}
            </td>
            <td className="px-4 py-3.5 text-xs text-slate-400 whitespace-nowrap">
              {new Date(row.created_at).toLocaleDateString()}
            </td>
            <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-1">
                <button
                  title="View Details"
                  onClick={() =>
                    navigate(`/admin/projects/${row.reference_id}`)
                  }
                  className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Eye size={14} />
                </button>
                <button
                  title="Edit Project"
                  onClick={() =>
                    navigate(`/admin/projects/${row.reference_id}/edit`)
                  }
                  className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Edit size={14} />
                </button>
                <button
                  title="Duplicate"
                  onClick={async () => {
                    try {
                      await api.post(`/projects/${row.reference_id}/duplicate`);
                      addToast("Duplicated!", "success");
                      load();
                    } catch {
                      addToast("Duplicate failed", "error");
                    }
                  }}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Copy size={14} />
                </button>
                <button
                  title="Delete"
                  onClick={() => setDelTarget(row.reference_id)}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      {/* Pagination */}
      <Pagination page={page} total={total} limit={LIMIT} onChange={setPage} />

      {/* Confirm Delete Modal */}
      {delTarget && (
        <ConfirmDialog
          title="Delete Project"
          message={`Are you sure you want to delete project ${delTarget}? This action cannot be undone.`}
          onConfirm={doDelete}
          onCancel={() => setDelTarget(null)}
          danger
        />
      )}
    </div>
  );
}
