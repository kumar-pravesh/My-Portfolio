import React, { useState, useEffect, useCallback } from "react";
import { UserPlus, Edit, Trash2, ShieldCheck } from "lucide-react";
import { api } from "../../context/AuthContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import {
  StatusBadge,
  RefBadge,
  ConfirmDialog,
  Modal,
  DataTable,
} from "../../components/shared/index.jsx";

const ROLE_COLORS = {
  SUPER_ADMIN: "badge-danger",
  ADMIN: "badge-warning",
  EDITOR: "badge-info",
};

export default function UsersPage() {
  const { user: me } = useAuth();
  const { addToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "EDITOR",
  });
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch {
      addToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/users", form);
      addToast("User created successfully", "success");
      setShowModal(false);
      setForm({ name: "", email: "", password: "", role: "EDITOR" });
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.error || "Create failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      addToast("User deleted", "success");
      setDeleteTarget(null);
      fetchUsers();
    } catch {
      addToast("Delete failed", "error");
    }
  }

  async function toggleStatus(u) {
    try {
      const status = u.status === "active" ? "inactive" : "active";
      await api.patch(`/users/${u.id}`, { status });
      addToast(
        `User ${status === "active" ? "activated" : "deactivated"}`,
        "success",
      );
      fetchUsers();
    } catch {
      addToast("Status update failed", "error");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">
            Manage administrator accounts and permissions
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <UserPlus size={16} /> New User
        </button>
      </div>

      <div className="card">
        <DataTable
          columns={[
            "Name",
            "Email",
            "Role",
            "Status",
            "Ref ID",
            "Last Login",
            "Actions",
          ]}
          loading={loading}
          empty="No users found"
        >
          {users.map((u) => (
            <tr key={u.id}>
              <td>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    className="avatar"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "var(--primary)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {(u.name || u.email)[0].toUpperCase()}
                  </div>
                  <span>{u.name || "—"}</span>
                  {u.id === me?.id && (
                    <span
                      className="badge badge-info"
                      style={{ fontSize: "0.65rem" }}
                    >
                      You
                    </span>
                  )}
                </div>
              </td>
              <td>{u.email}</td>
              <td>
                <span
                  className={`badge ${ROLE_COLORS[u.role] || "badge-secondary"}`}
                >
                  <ShieldCheck size={11} style={{ marginRight: 4 }} />
                  {u.role}
                </span>
              </td>
              <td>
                <StatusBadge status={u.status || "active"} />
              </td>
              <td>
                <RefBadge refId={u.ref_id} />
              </td>
              <td>
                {u.last_login_at
                  ? new Date(u.last_login_at).toLocaleDateString()
                  : "Never"}
              </td>
              <td className="table-actions">
                <button
                  className="btn-icon"
                  onClick={() => toggleStatus(u)}
                  disabled={u.id === me?.id}
                  title={u.status === "active" ? "Deactivate" : "Activate"}
                >
                  <Edit size={15} />
                </button>
                <button
                  className="btn-icon btn-icon--danger"
                  onClick={() => setDeleteTarget(u)}
                  disabled={u.id === me?.id}
                  title="Delete user"
                >
                  <Trash2 size={15} />
                </button>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>

      {showModal && (
        <Modal title="Create New User" onClose={() => setShowModal(false)}>
          <form
            onSubmit={handleCreate}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Jane Smith"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                className="form-input"
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="admin@example.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                className="form-input"
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                placeholder="Min 8 characters"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value }))
                }
              >
                <option value="EDITOR">Editor</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "flex-end",
                marginTop: "0.5rem",
              }}
            >
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "Creating…" : "Create User"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete User"
          message={`Are you sure you want to delete "${deleteTarget.name || deleteTarget.email}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          danger
        />
      )}
    </div>
  );
}
