import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { api } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import {
  StatusBadge,
  RefBadge,
  DataTable,
  Pagination,
} from "../../components/shared/index.jsx";

export default function ContactsListPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      const r = await api.get(`/contact?${params}`);
      setData(r.data.data || r.data.messages || r.data);
      setTotal(r.data.total || 0);
    } catch {
      addToast("Failed to load messages", "error");
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const columns = [
    {
      key: "status",
      label: "",
      width: 10,
      render: (v) => (
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: v === "unread" ? "var(--danger)" : "var(--success)",
            flexShrink: 0,
          }}
        />
      ),
    },
    {
      key: "reference_id",
      label: "Ref ID",
      width: 155,
      render: (v) => <RefBadge refId={v} />,
    },
    {
      key: "name",
      label: "Name",
      render: (v, row) => (
        <div>
          <div
            style={{
              fontWeight: row.status === "unread" ? 700 : 500,
              fontSize: 13,
            }}
          >
            {v}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {row.email}
          </div>
        </div>
      ),
    },
    { key: "subject", label: "Subject", render: (v) => v || "—" },
    {
      key: "status",
      label: "Status",
      width: 110,
      render: (v) => <StatusBadge status={v} />,
    },
    {
      key: "created_at",
      label: "Submitted",
      width: 110,
      render: (v) => new Date(v).toLocaleString().slice(0, 16),
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
            navigate(`/admin/contacts/${row.reference_id}`);
          }}
        >
          Open
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Contact Messages</h1>
          <p className="page-subtitle">{total} total messages</p>
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
          {["unread", "read", "in_progress", "replied", "archived"].map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyText="No messages found"
      />
      <Pagination page={page} total={total} limit={LIMIT} onChange={setPage} />
    </div>
  );
}
