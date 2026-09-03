import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { api } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import {
  StatusBadge,
  PriorityBadge,
  RefBadge,
  DataTable,
  Pagination,
} from "../../components/shared/index.jsx";

export default function LeadsListPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (priority) params.set("priority", priority);
      const r = await api.get(`/leads?${params}`);
      setData(r.data.data || r.data.leads || r.data);
      setTotal(r.data.total || 0);
    } catch {
      addToast("Failed to load leads", "error");
    } finally {
      setLoading(false);
    }
  }, [page, search, status, priority]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    setPage(1);
  }, [search, status, priority]);

  const columns = [
    {
      key: "reference_id",
      label: "Ref ID",
      width: 155,
      render: (v) => <RefBadge refId={v} />,
    },
    {
      key: "full_name",
      label: "Lead",
      render: (v, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{v}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {row.email}
          </div>
          {row.company && (
            <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
              {row.company}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "service_interested",
      label: "Service",
      width: 130,
      render: (v) => v || "—",
    },
    {
      key: "status",
      label: "Status",
      width: 110,
      render: (v) => <StatusBadge status={v} />,
    },
    {
      key: "priority",
      label: "Priority",
      width: 90,
      render: (v) => <PriorityBadge priority={v} />,
    },
    {
      key: "assigned_name",
      label: "Assigned",
      width: 110,
      render: (v) =>
        v || <span style={{ color: "var(--text-dim)" }}>Unassigned</span>,
    },
    {
      key: "follow_up_date",
      label: "Follow-up",
      width: 100,
      render: (v) => (v ? new Date(v).toLocaleDateString() : "—"),
    },
    {
      key: "created_at",
      label: "Created",
      width: 100,
      render: (v) => new Date(v).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      width: 80,
      render: (_, row) => (
        <button
          className="btn btn-primary btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/leads/${row.reference_id}`);
          }}
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Leads</h1>
          <p className="page-subtitle">{total} total leads</p>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/admin/leads/new")}
          >
            <Plus size={14} /> New Lead
          </button>
        </div>
      </div>

      <div className="table-toolbar">
        <div className="search-input">
          <Search size={13} style={{ color: "var(--text-dim)" }} />
          <input
            placeholder="Search by name, email, ref ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {[
            "new",
            "contacted",
            "qualified",
            "proposal_sent",
            "negotiation",
            "won",
            "lost",
          ].map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
        <select
          className="filter-select"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="">All Priorities</option>
          {["low", "medium", "high", "urgent"].map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyText="No leads found"
      />
      <Pagination page={page} total={total} limit={LIMIT} onChange={setPage} />
    </div>
  );
}
