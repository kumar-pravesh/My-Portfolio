import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Globe,
  Archive,
  ExternalLink,
  Github,
  Star,
  Calendar,
  Layers,
  ExternalLink as LinkIcon,
} from "lucide-react";
import { api } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import {
  StatusBadge,
  RefBadge,
  ConfirmDialog,
} from "../../components/shared/index.jsx";

export default function ProjectDetailPage() {
  const { refId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [delOpen, setDelOpen] = useState(false);

  useEffect(() => {
    api
      .get(`/projects/${refId}`)
      .then((r) => setData(r.data))
      .catch(() => toast.error("Project not found."))
      .finally(() => setLoading(false));
  }, [refId]);

  const quickAction = async (status) => {
    try {
      await api.put(`/projects/${refId}`, { status });
      setData((d) => ({ ...d, status }));
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error("Status update failed.");
    }
  };

  const doDelete = async () => {
    try {
      await api.delete(`/projects/${refId}`);
      toast.success("Project deleted.");
      navigate("/admin/projects");
    } catch {
      toast.error("Delete failed.");
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono text-xs">
        Loading project details...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <h3 className="text-base font-bold text-white mb-2">
          Project Not Found
        </h3>
        <button
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl"
          onClick={() => navigate("/admin/projects")}
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const MetaRow = ({ label, value }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 text-xs">
      <span className="text-slate-400 font-medium">{label}</span>
      <span className="font-semibold text-white truncate max-w-[180px]">
        {value || "—"}
      </span>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all shrink-0"
            onClick={() => navigate("/admin/projects")}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {data.title}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <RefBadge refId={data.reference_id} large />
              <StatusBadge status={data.status} />
              {data.is_featured && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                  <Star size={11} className="fill-amber-400" /> Featured
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {data.status !== "published" && (
            <button
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all"
              onClick={() => quickAction("published")}
            >
              <Globe size={14} /> Publish
            </button>
          )}
          {data.status === "published" && (
            <button
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-all"
              onClick={() => quickAction("draft")}
            >
              Unpublish
            </button>
          )}
          <button
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-all"
            onClick={() => quickAction("archived")}
          >
            <Archive size={14} /> Archive
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all"
            onClick={() => navigate(`/admin/projects/${refId}/edit`)}
          >
            <Edit size={14} /> Edit
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 hover:bg-rose-600 text-rose-400 hover:text-white font-semibold text-xs transition-all"
            onClick={() => setDelOpen(true)}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Content (Left) */}
        <div className="lg:col-span-8 space-y-6">
          {data.image && (
            <div className="bg-[#111827] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <img
                src={data.image}
                alt={data.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Description
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {data.description ||
                data.short_description ||
                "No description provided."}
            </p>
            {data.full_description &&
              data.full_description !== data.description && (
                <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-white/5">
                  {data.full_description}
                </p>
              )}
          </div>

          {(data.challenges || data.solutions || data.results) && (
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-white/10">
                Case Study Details
              </h3>
              {data.challenges && (
                <div>
                  <span className="text-xs font-bold text-white block mb-1">
                    Challenges
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {data.challenges}
                  </p>
                </div>
              )}
              {data.solutions && (
                <div>
                  <span className="text-xs font-bold text-white block mb-1">
                    Solutions
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {data.solutions}
                  </p>
                </div>
              )}
              {data.results && (
                <div>
                  <span className="text-xs font-bold text-white block mb-1">
                    Results
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {data.results}
                  </p>
                </div>
              )}
            </div>
          )}

          {data.tech_stack?.length > 0 && (
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.tech_stack.map((t, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info (Right) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-xl space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-white/10 mb-2">
              Metadata
            </h3>
            <MetaRow label="Client" value={data.client_name} />
            <MetaRow label="Industry" value={data.industry} />
            <MetaRow label="Category" value={data.category} />
            <MetaRow label="Type" value={data.project_type} />
            <MetaRow
              label="Start Date"
              value={
                data.start_date &&
                new Date(data.start_date).toLocaleDateString()
              }
            />
            <MetaRow
              label="Completed"
              value={
                data.completion_date &&
                new Date(data.completion_date).toLocaleDateString()
              }
            />
            <MetaRow label="Display Order" value={data.display_order} />
          </div>

          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-white/10">
              External Links
            </h3>
            {data.live_link && (
              <a
                href={data.live_link}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md"
              >
                <LinkIcon size={14} /> Live Demo
              </a>
            )}
            {data.github_url && (
              <a
                href={data.github_url}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs transition-all"
              >
                <Github size={14} /> GitHub Repository
              </a>
            )}
            {!data.live_link && !data.github_url && (
              <p className="text-xs text-slate-500 text-center py-2">
                No external links configured
              </p>
            )}
          </div>

          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-xl space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-white/10 mb-2">
              Timestamps
            </h3>
            <MetaRow
              label="Created"
              value={
                data.created_at &&
                new Date(data.created_at).toLocaleDateString()
              }
            />
            <MetaRow
              label="Updated"
              value={
                data.updated_at &&
                new Date(data.updated_at).toLocaleDateString()
              }
            />
            <MetaRow
              label="Published"
              value={
                data.published_at &&
                new Date(data.published_at).toLocaleDateString()
              }
            />
          </div>
        </div>
      </div>

      {delOpen && (
        <ConfirmDialog
          open={delOpen}
          title="Delete Project"
          message={`Delete ${data.reference_id} — ${data.title}? This cannot be undone.`}
          onConfirm={doDelete}
          onCancel={() => setDelOpen(false)}
        />
      )}
    </div>
  );
}
