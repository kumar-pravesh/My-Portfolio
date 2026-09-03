import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Trash2, Archive, Mail } from "lucide-react";
import { api } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import {
  StatusBadge,
  RefBadge,
  ConfirmDialog,
} from "../../components/shared/index.jsx";

export default function ContactDetailPage() {
  const { refId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    api
      .get(`/contact/${refId}`)
      .then((r) => {
        setData(r.data);
        setNote(r.data.internal_notes || "");
      })
      .catch(() => toast.error("Not found."))
      .finally(() => setLoading(false));
  }, [refId]);

  const updateStatus = async (status) => {
    try {
      await api.put(`/contact/${refId}`, { status });
      setData((d) => ({ ...d, status }));
      toast.success(`Status → ${status}`);
    } catch {
      toast.error("Update failed.");
    }
  };

  const saveNote = async () => {
    try {
      await api.put(`/contact/${refId}`, { internal_notes: note });
      toast.success("Note saved.");
    } catch {
      toast.error("Failed to save note.");
    }
  };

  const convertToLead = async () => {
    setConverting(true);
    try {
      const r = await api.post(`/contact/${refId}/convert-to-lead`);
      toast.success(`Lead created: ${r.data.lead_ref_id}`);
      navigate(`/admin/leads/${r.data.lead_ref_id}`);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Conversion failed.");
    } finally {
      setConverting(false);
    }
  };

  const doDelete = async () => {
    try {
      await api.delete(`/contact/${refId}`);
      toast.success("Deleted.");
      navigate("/admin/contacts");
    } catch {
      toast.error("Delete failed.");
    }
  };

  if (loading)
    return (
      <div className="app-loading">
        <div className="spinner" />
      </div>
    );
  if (!data)
    return (
      <div className="empty-state" style={{ padding: 60 }}>
        <p>Message not found</p>
      </div>
    );

  const MetaRow = ({ label, value }) => (
    <div className="detail-meta-row">
      <span className="detail-meta-label">{label}</span>
      <span className="detail-meta-value">{value || "—"}</span>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} />
          </button>
          <div>
            <h1 className="page-title">Message from {data.name}</h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 4,
              }}
            >
              <RefBadge refId={data.reference_id} large />
              <StatusBadge status={data.status} />
            </div>
          </div>
        </div>
        <div className="page-actions">
          <a href={`mailto:${data.email}`} className="btn btn-secondary">
            <Mail size={14} /> Reply
          </a>
          <button
            className="btn btn-success"
            onClick={convertToLead}
            disabled={converting}
          >
            <TrendingUp size={14} />{" "}
            {converting ? "Converting..." : "Convert to Lead"}
          </button>
          <button className="btn btn-danger" onClick={() => setDelOpen(true)}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Status buttons */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Update Status</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["unread", "read", "in_progress", "replied", "archived"].map((s) => (
            <button
              key={s}
              className={`btn btn-sm ${data.status === s ? "btn-primary" : "btn-secondary"}`}
              onClick={() => updateStatus(s)}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="detail-layout">
        <div className="detail-main">
          <div className="card">
            <div className="card-title">Message</div>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.8,
                color: "var(--text-muted)",
                whiteSpace: "pre-wrap",
              }}
            >
              {data.message}
            </p>
          </div>
          <div className="card">
            <div className="card-title">Internal Notes</div>
            <textarea
              className="form-textarea"
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add private notes visible only to admins..."
            />
            <button
              className="btn btn-primary btn-sm"
              style={{ marginTop: 10 }}
              onClick={saveNote}
            >
              Save Notes
            </button>
          </div>

          {/* Convert CTA */}
          <div
            className="card"
            style={{
              border: "1px solid var(--success)",
              background: "var(--success-dim)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  Ready to pursue this contact?
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    marginTop: 4,
                  }}
                >
                  Convert to a lead to start tracking with the full CRM
                  pipeline. Original message ({data.reference_id}) will be
                  preserved.
                </div>
              </div>
              <button
                className="btn btn-success"
                onClick={convertToLead}
                disabled={converting}
              >
                <TrendingUp size={14} />{" "}
                {converting ? "Converting..." : "Convert to Lead"}
              </button>
            </div>
          </div>
        </div>

        <div className="detail-sidebar">
          <div className="card">
            <div className="card-title">Sender Info</div>
            <MetaRow label="Name" value={data.name} />
            <MetaRow
              label="Email"
              value={
                <a
                  href={`mailto:${data.email}`}
                  style={{ color: "var(--accent)" }}
                >
                  {data.email}
                </a>
              }
            />
            <MetaRow label="Phone" value={data.phone} />
            <MetaRow label="Subject" value={data.subject} />
          </div>
          <div className="card">
            <div className="card-title">Timestamps</div>
            <MetaRow
              label="Submitted"
              value={new Date(data.created_at).toLocaleString()}
            />
            <MetaRow
              label="Updated"
              value={
                data.updated_at && new Date(data.updated_at).toLocaleString()
              }
            />
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={delOpen}
        title="Delete Message"
        message={`Delete ${data.reference_id}?`}
        onConfirm={doDelete}
        onCancel={() => setDelOpen(false)}
      />
    </div>
  );
}
