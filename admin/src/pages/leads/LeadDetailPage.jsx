import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MessageCircle,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { api } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import {
  StatusBadge,
  PriorityBadge,
  RefBadge,
  ConfirmDialog,
} from "../../components/shared/index.jsx";

const STATUS_FLOW = [
  "new",
  "contacted",
  "qualified",
  "proposal_sent",
  "negotiation",
  "won",
  "lost",
];

export default function LeadDetailPage() {
  const { refId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [delOpen, setDelOpen] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get(`/leads/${refId}`)
      .then((r) => setData(r.data))
      .catch(() => toast.error("Not found."))
      .finally(() => setLoading(false));
  };
  useEffect(load, [refId]);

  const changeStatus = async (status) => {
    try {
      await api.put(`/leads/${refId}`, { status });
      load();
      toast.success(`Status → ${status}`);
    } catch {
      toast.error("Update failed.");
    }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    setSavingNote(true);
    try {
      await api.post(`/leads/${refId}/notes`, { notes: note });
      setNote("");
      load();
      toast.success("Note added.");
    } catch {
      toast.error("Failed to add note.");
    } finally {
      setSavingNote(false);
    }
  };

  const doDelete = async () => {
    try {
      await api.delete(`/leads/${refId}`);
      toast.success("Lead deleted.");
      navigate("/admin/leads");
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
        <p>Lead not found</p>
      </div>
    );

  const MetaRow = ({ label, value }) => (
    <div className="detail-meta-row">
      <span className="detail-meta-label">{label}</span>
      <span className="detail-meta-value">{value || "—"}</span>
    </div>
  );

  const ACTIVITY_ICONS = {
    created: "🎯",
    status_changed: "🔄",
    note_added: "📝",
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} />
          </button>
          <div>
            <h1 className="page-title">{data.full_name}</h1>
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
              <PriorityBadge priority={data.priority} />
            </div>
          </div>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/admin/leads/${refId}/edit`)}
          >
            <Edit size={14} /> Edit
          </button>
          <button className="btn btn-danger" onClick={() => setDelOpen(true)}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Status Pipeline */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Status Pipeline</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STATUS_FLOW.map((s) => (
            <button
              key={s}
              onClick={() => changeStatus(s)}
              className={`btn btn-sm ${data.status === s ? "btn-primary" : "btn-secondary"}`}
              style={{ textTransform: "capitalize" }}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
        {data.source_contact_ref && (
          <div
            style={{ marginTop: 12, fontSize: 12, color: "var(--text-muted)" }}
          >
            Converted from contact:{" "}
            <span
              className="ref-id"
              onClick={() =>
                navigate(`/admin/contacts/${data.source_contact_ref}`)
              }
            >
              {data.source_contact_ref}
            </span>
          </div>
        )}
      </div>

      <div className="detail-layout">
        <div className="detail-main">
          {data.message && (
            <div className="card">
              <div className="card-title">
                <MessageCircle
                  size={14}
                  style={{ display: "inline", marginRight: 6 }}
                />
                Original Message
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-muted)",
                  lineHeight: 1.7,
                }}
              >
                {data.message}
              </p>
            </div>
          )}

          {data.notes && (
            <div className="card">
              <div className="card-title">Notes</div>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-muted)",
                  lineHeight: 1.7,
                }}
              >
                {data.notes}
              </p>
            </div>
          )}

          {/* Add Note */}
          <div className="card">
            <div className="card-title">Add Note</div>
            <textarea
              className="form-textarea"
              placeholder="Add an internal note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
            <button
              className="btn btn-primary btn-sm"
              style={{ marginTop: 10 }}
              onClick={addNote}
              disabled={savingNote || !note.trim()}
            >
              {savingNote ? "Saving..." : "Add Note"}
            </button>
          </div>

          {/* Activity Timeline */}
          <div className="card">
            <div className="card-title">Activity Timeline</div>
            {data.activities?.length === 0 ? (
              <p style={{ color: "var(--text-dim)", fontSize: 13 }}>
                No activities yet.
              </p>
            ) : (
              <div className="timeline">
                {(data.activities || []).map((act, i) => (
                  <div key={act.id} className="timeline-item">
                    <div className="timeline-dot">
                      {ACTIVITY_ICONS[act.action] || "•"}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-action">
                        <strong>{act.user_name || "System"}</strong>
                        {" — "}
                        {act.action.replace("_", " ")}
                        {act.old_value && act.new_value && (
                          <span style={{ color: "var(--text-dim)" }}>
                            {" "}
                            ({act.old_value} → {act.new_value})
                          </span>
                        )}
                      </div>
                      {act.notes && (
                        <div className="timeline-note">{act.notes}</div>
                      )}
                      <div className="timeline-meta">
                        {new Date(act.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="detail-sidebar">
          <div className="card">
            <div className="card-title">Contact Info</div>
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
            <MetaRow label="Company" value={data.company} />
          </div>
          <div className="card">
            <div className="card-title">Lead Details</div>
            <MetaRow label="Service" value={data.service_interested} />
            <MetaRow label="Budget" value={data.budget} />
            <MetaRow
              label="Source"
              value={data.lead_source?.replace("_", " ")}
            />
            <MetaRow label="Assigned" value={data.assigned_name} />
          </div>
          {data.follow_up_date && (
            <div
              className="card"
              style={{
                background: "var(--warning-dim)",
                borderColor: "var(--warning)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                }}
              >
                <Calendar size={16} color="var(--warning)" />
                <div>
                  <div style={{ fontWeight: 600 }}>Follow-up Due</div>
                  <div style={{ color: "var(--warning)", fontWeight: 700 }}>
                    {new Date(data.follow_up_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="card">
            <div className="card-title">Timestamps</div>
            <MetaRow
              label="Created"
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
        title="Delete Lead"
        message={`Delete ${data.reference_id}? This cannot be undone.`}
        onConfirm={doDelete}
        onCancel={() => setDelOpen(false)}
      />
    </div>
  );
}
