import React, { useState, useEffect, useCallback } from "react";
import { Search, Filter } from "lucide-react";
import { api } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import {
  RefBadge,
  Pagination,
  DataTable,
} from "../../components/shared/index.jsx";

const ACTION_COLORS = {
  CREATE: "badge-success",
  UPDATE: "badge-info",
  DELETE: "badge-danger",
  LOGIN: "badge-secondary",
  LOGOUT: "badge-secondary",
};

export default function ActivityLogsPage() {
  const { addToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [module, setModule] = useState("");
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.set("search", search);
      if (module) params.set("module", module);
      if (action) params.set("action", action);
      const res = await api.get(`/activity?${params}`);
      setLogs(res.data.logs || res.data);
      setTotal(res.data.total || (res.data.length ?? 0));
    } catch {
      addToast("Failed to load activity logs", "error");
    } finally {
      setLoading(false);
    }
  }, [page, search, module, action]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity Logs</h1>
          <p className="page-subtitle">Full audit trail of all admin actions</p>
        </div>
      </div>

      <div className="card">
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            padding: "1rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            flexWrap: "wrap",
          }}
        >
          <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
            <Search size={15} />
            <input
              type="text"
              placeholder="Search logs…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            className="form-select"
            style={{ width: "auto" }}
            value={module}
            onChange={(e) => {
              setModule(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Modules</option>
            <option value="projects">Projects</option>
            <option value="leads">Leads</option>
            <option value="messages">Contacts</option>
            <option value="users">Users</option>
            <option value="services">Services</option>
            <option value="blog_posts">Blog</option>
            <option value="testimonials">Testimonials</option>
          </select>
          <select
            className="form-select"
            style={{ width: "auto" }}
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
          </select>
        </div>

        <DataTable
          columns={[
            "Timestamp",
            "User",
            "Action",
            "Module",
            "Target Ref",
            "Details",
          ]}
          loading={loading}
          empty="No activity logs found"
        >
          {logs.map((log) => (
            <tr key={log.id}>
              <td
                style={{
                  whiteSpace: "nowrap",
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                }}
              >
                {new Date(log.created_at).toLocaleString()}
              </td>
              <td>
                <span style={{ fontWeight: 500 }}>
                  {log.user_email || log.user_id || "System"}
                </span>
              </td>
              <td>
                <span
                  className={`badge ${ACTION_COLORS[log.action] || "badge-secondary"}`}
                >
                  {log.action}
                </span>
              </td>
              <td style={{ textTransform: "capitalize" }}>
                {log.module?.replace(/_/g, " ")}
              </td>
              <td>
                <RefBadge refId={log.target_ref_id} />
              </td>
              <td
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                  maxWidth: 300,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {log.details ? JSON.stringify(log.details).slice(0, 80) : "—"}
              </td>
            </tr>
          ))}
        </DataTable>

        {total > limit && (
          <div
            style={{
              padding: "1rem 1.5rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            <Pagination
              page={page}
              total={total}
              limit={limit}
              onChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
