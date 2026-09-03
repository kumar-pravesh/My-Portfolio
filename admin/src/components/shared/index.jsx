import React, { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  FolderKanban,
  Copy,
  Check,
  AlertTriangle,
  X,
  Upload,
  Image as ImageIcon,
  Link,
  Trash2,
} from "lucide-react";

// ── StatusBadge ───────────────────────────────
export function StatusBadge({ status }) {
  const s = (status || "").toLowerCase().replace(/[\s-]/g, "_");

  const statusStyles = {
    published: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25",
    won: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25",
    active: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25",
    read: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25",
    replied: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25",
    draft: "bg-sky-500/12 text-sky-400 border-sky-500/25",
    new: "bg-sky-500/12 text-sky-400 border-sky-500/25",
    in_progress: "bg-amber-500/12 text-amber-400 border-amber-500/25",
    contacted: "bg-amber-500/12 text-amber-400 border-amber-500/25",
    medium: "bg-amber-500/12 text-amber-400 border-amber-500/25",
    qualified: "bg-purple-500/12 text-purple-400 border-purple-500/25",
    proposal_sent: "bg-purple-500/12 text-purple-400 border-purple-500/25",
    unread: "bg-rose-500/12 text-rose-400 border-rose-500/25",
    high: "bg-rose-500/12 text-rose-400 border-rose-500/25",
    urgent: "bg-rose-500/12 text-rose-400 border-rose-500/25",
    archived: "bg-white/5 text-slate-400 border-white/10",
    lost: "bg-white/5 text-slate-400 border-white/10",
    inactive: "bg-white/5 text-slate-400 border-white/10",
  };

  const currentClass =
    statusStyles[s] || "bg-white/5 text-slate-400 border-white/10";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border ${currentClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_6px_currentColor]" />
      {status || "Unknown"}
    </span>
  );
}

// ── PriorityBadge ─────────────────────────────
export function PriorityBadge({ priority }) {
  const p = (priority || "").toLowerCase();

  const priorityStyles = {
    high: "bg-rose-500/12 text-rose-400 border-rose-500/25",
    urgent: "bg-rose-500/12 text-rose-400 border-rose-500/25",
    medium: "bg-amber-500/12 text-amber-400 border-amber-500/25",
    low: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25",
  };

  const currentClass =
    priorityStyles[p] || "bg-white/5 text-slate-400 border-white/10";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border ${currentClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_6px_currentColor]" />
      {priority}
    </span>
  );
}

// ── RefBadge ──────────────────────────────────
export function RefBadge({ refId, large }) {
  const [copied, setCopied] = useState(false);
  if (!refId) return <span className="text-slate-500">—</span>;

  const copy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(refId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <span
      onClick={copy}
      title="Click to copy Reference ID"
      className={`inline-flex items-center gap-1.5 font-mono font-semibold text-indigo-400 bg-indigo-500/12 border border-indigo-500/25 rounded-md hover:bg-indigo-500/25 transition-all cursor-pointer whitespace-nowrap ${
        large ? "text-xs px-3 py-1.5" : "text-[11.5px] px-2.5 py-0.5"
      }`}
    >
      {copied ? (
        <Check size={12} className="text-emerald-400 shrink-0" />
      ) : (
        <Copy size={12} className="opacity-70 shrink-0" />
      )}
      <span>{refId}</span>
    </span>
  );
}

// ── ThumbnailWithFallback ──────────────────────
export function ThumbnailWithFallback({
  src,
  alt = "",
  width = 44,
  height = 32,
  icon: Icon = FolderKanban,
}) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className="flex items-center justify-center bg-gradient-to-br from-indigo-500/15 to-cyan-500/15 border border-indigo-500/20 rounded-md text-indigo-300"
        style={{ width, height, minWidth: width }}
        title={alt || "No preview image"}
      >
        <Icon size={Math.min(width, height) * 0.45} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className="rounded-md border border-white/10 object-cover"
      style={{ width, height, minWidth: width }}
    />
  );
}

// ── ImageUploader ─────────────────────────────
export function ImageUploader({ label = "Image", value = "", onChange, hint }) {
  const [mode, setMode] = useState("upload"); // 'upload' | 'url'
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2 bg-[#0d1322] border border-white/10 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/5">
        <label className="text-xs font-bold text-white uppercase tracking-wider">
          {label}
        </label>
        <div className="flex items-center gap-1 bg-[#111827] p-1 rounded-lg border border-white/10">
          <button
            type="button"
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              mode === "upload"
                ? "bg-indigo-500 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
            onClick={() => setMode("upload")}
          >
            Upload Image
          </button>
          <button
            type="button"
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              mode === "url"
                ? "bg-indigo-500 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
            onClick={() => setMode("url")}
          >
            Use Image URL
          </button>
        </div>
      </div>

      {value ? (
        <div className="relative group rounded-xl border border-white/10 bg-[#111827] p-3 flex items-center gap-4">
          <img
            src={value}
            alt="Selected preview"
            className="w-20 h-20 rounded-xl object-cover border border-white/10 shrink-0 bg-slate-950 shadow-md"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">
              {value.startsWith("data:") ? "Uploaded Image File" : value}
            </p>
            <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
              Ready for project showcase
            </p>
            {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-600 hover:text-white transition-all shrink-0"
            title="Remove image"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : mode === "upload" ? (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
            dragActive
              ? "border-indigo-500 bg-indigo-500/10"
              : "border-white/10 hover:border-white/20 bg-[#111827]"
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-2.5">
            <Upload size={20} />
          </div>
          <span className="text-xs font-bold text-white mb-0.5">
            Upload Image
          </span>
          <span className="text-[10px] text-slate-400">
            Select file from device or drag and drop here
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] && handleFile(e.target.files[0])
            }
          />
        </label>
      ) : (
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2 bg-[#111827] border border-white/10 rounded-xl px-3.5 py-2.5">
            <Link size={15} className="text-slate-500 shrink-0" />
            <input
              type="url"
              className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full"
              placeholder="https://images.unsplash.com/... or /image.jpg"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
        </div>
      )}

      {hint && !value && (
        <p className="text-[10px] text-slate-400 font-medium">{hint}</p>
      )}
    </div>
  );
}

// ── ConfirmDialog ─────────────────────────────
export function ConfirmDialog({
  open = true,
  title,
  message,
  onConfirm,
  onCancel,
  danger = true,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-pop"
      onClick={onCancel}
    >
      <div
        className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-7 text-center">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4.5 ${
              danger
                ? "bg-rose-500/15 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
                : "bg-amber-500/15 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            }`}
          >
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-base font-bold text-white mb-2">
            {title || "Are you sure?"}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">{message}</p>
        </div>
        <div className="p-4 bg-black/20 border-t border-white/10 flex gap-3 justify-center">
          <button
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-md transition-all ${
              danger
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
            }`}
            onClick={onConfirm}
          >
            {danger ? "Delete Record" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal wrapper ──────────────────────────────
export function Modal({ open = true, title, onClose, children, size = "md" }) {
  if (!open) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-pop"
      onClick={onClose}
    >
      <div
        className={`bg-[#111827] border border-white/10 rounded-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl ${sizeClasses[size] || "max-w-2xl"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <span className="font-bold text-base text-white">{title}</span>
          <button
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ── Pagination ────────────────────────────────
export function Pagination({ page, total, limit, onChange }) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  let pages = [];
  if (totalPages <= 7) {
    pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else if (page <= 4) {
    pages = [1, 2, 3, 4, 5, "…", totalPages];
  } else if (page >= totalPages - 3) {
    pages = [
      1,
      "…",
      ...Array.from({ length: 5 }, (_, i) => totalPages - 4 + i),
    ];
  } else {
    pages = [1, "…", page - 1, page, page + 1, "…", totalPages];
  }

  return (
    <div className="flex items-center justify-between mt-5 text-xs text-slate-400 flex-wrap gap-3">
      <div>
        Showing{" "}
        <strong className="text-white font-semibold">
          {start}–{end}
        </strong>{" "}
        of <strong className="text-white font-semibold">{total}</strong> entries
      </div>
      <div className="flex items-center gap-1">
        <button
          className="min-w-8 h-8 px-2 rounded-lg bg-[#111827] border border-white/10 text-slate-400 hover:text-white hover:border-indigo-500/50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-all"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          ‹
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1.5 text-slate-500">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`min-w-8 h-8 px-2 rounded-lg text-xs font-semibold transition-all border ${
                p === page
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent shadow-md shadow-indigo-500/30"
                  : "bg-[#111827] border-white/10 text-slate-400 hover:text-white hover:border-indigo-500/50"
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          className="min-w-8 h-8 px-2 rounded-lg bg-[#111827] border border-white/10 text-slate-400 hover:text-white hover:border-indigo-500/50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-all"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          ›
        </button>
      </div>
    </div>
  );
}

// ── DataTable ─────────────────────────────────
export function DataTable({
  columns,
  data,
  loading,
  empty = "No records found",
  emptyText,
  children,
  onSort,
  sortCol,
  sortDir,
}) {
  const emptyMsg = emptyText || empty;
  const colCount = columns?.length || 1;
  const useData = data !== undefined && !children;

  const hasRows = useData
    ? data && data.length > 0
    : React.Children.count(children) > 0;

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#111827]">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-slate-900/90 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
            {(columns || []).map((col, i) => {
              const label = typeof col === "string" ? col : col.label;
              const key = typeof col === "string" ? col : col.key || i;
              return (
                <th
                  key={key}
                  className="px-4 py-3.5 text-left whitespace-nowrap"
                  style={{ width: col.width, textAlign: col.align || "left" }}
                >
                  {col.sortable ? (
                    <button
                      className="inline-flex items-center gap-1 font-bold text-slate-400 hover:text-white"
                      onClick={() => onSort?.(key)}
                    >
                      {label}
                      {sortCol === key ? (
                        sortDir === "asc" ? (
                          <ChevronUp size={13} />
                        ) : (
                          <ChevronDown size={13} />
                        )
                      ) : null}
                    </button>
                  ) : (
                    label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {loading ? (
            Array(5)
              .fill(0)
              .map((_, i) => (
                <tr key={i}>
                  {Array(colCount)
                    .fill(0)
                    .map((_, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div
                          className="skeleton-shimmer h-4 rounded-md"
                          style={{ width: j === 0 ? "40%" : "80%" }}
                        />
                      </td>
                    ))}
                </tr>
              ))
          ) : !hasRows ? (
            <tr>
              <td colSpan={colCount}>
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                    <FolderKanban size={32} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    {emptyMsg}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Try adjusting your search criteria or clear current filters.
                  </p>
                </div>
              </td>
            </tr>
          ) : useData ? (
            data.map((row, i) => (
              <tr
                key={row.id || row.reference_id || i}
                className="hover:bg-white/[0.03] transition-colors"
              >
                {columns.map((col, j) => (
                  <td
                    key={col.key || j}
                    className="px-4 py-3.5 text-slate-200"
                    style={{ textAlign: col.align || "left" }}
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : (row[col.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}
