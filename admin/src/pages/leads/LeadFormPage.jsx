import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { api } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export default function LeadFormPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    full_name: "",
    company: "",
    email: "",
    phone: "",
    service_interested: "",
    budget: "",
    message: "",
    lead_source: "website",
    priority: "medium",
    status: "new",
    follow_up_date: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const inp = (k) => ({
    value: form[k],
    onChange: set(k),
    className: "form-input",
  });

  const submit = async () => {
    if (!form.full_name || !form.email)
      return toast.error("Name and email are required.");
    setSaving(true);
    try {
      const r = await api.post("/leads", form);
      toast.success(`Lead created: ${r.data.reference_id}`);
      navigate(`/admin/leads/${r.data.reference_id}`);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to create lead.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 740, margin: "0 auto" }}>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} />
          </button>
          <h1 className="page-title">New Lead</h1>
        </div>
        <button className="btn btn-primary" onClick={submit} disabled={saving}>
          <Save size={14} /> {saving ? "Saving..." : "Create Lead"}
        </button>
      </div>

      <div className="card">
        <div className="form-section-title">Contact Information</div>
        <div className="form-grid form-grid-2">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input {...inp("full_name")} placeholder="John Smith" />
          </div>
          <div className="form-group">
            <label className="form-label">Company</label>
            <input {...inp("company")} placeholder="ABC Technologies" />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              {...inp("email")}
              type="email"
              placeholder="john@example.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input {...inp("phone")} placeholder="+91 9876543210" />
          </div>
        </div>

        <div className="form-section-title">Lead Details</div>
        <div className="form-grid form-grid-2">
          <div className="form-group">
            <label className="form-label">Service Interested</label>
            <select
              className="form-select"
              value={form.service_interested}
              onChange={set("service_interested")}
            >
              <option value="">Select service...</option>
              <option>Web Development</option>
              <option>Full Stack Development</option>
              <option>Backend Development</option>
              <option>React Development</option>
              <option>API Development</option>
              <option>Database Design</option>
              <option>Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Budget</label>
            <select
              className="form-select"
              value={form.budget}
              onChange={set("budget")}
            >
              <option value="">Select budget...</option>
              <option>Under ₹50K</option>
              <option>₹50K–₹1L</option>
              <option>₹1L–₹5L</option>
              <option>Above ₹5L</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Lead Source</label>
            <select
              className="form-select"
              value={form.lead_source}
              onChange={set("lead_source")}
            >
              <option value="website">Website</option>
              <option value="contact_form">Contact Form</option>
              <option value="referral">Referral</option>
              <option value="social_media">Social Media</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              className="form-select"
              value={form.priority}
              onChange={set("priority")}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Follow-up Date</label>
            <input {...inp("follow_up_date")} type="date" />
          </div>
          <div className="form-group">
            <label className="form-label">Initial Status</label>
            <select
              className="form-select"
              value={form.status}
              onChange={set("status")}
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">Message / Requirement</label>
          <textarea
            className="form-textarea"
            rows={4}
            value={form.message}
            onChange={set("message")}
            placeholder="What does the client need?"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Internal Notes</label>
          <textarea
            className="form-textarea"
            rows={2}
            value={form.notes}
            onChange={set("notes")}
            placeholder="Internal team notes..."
          />
        </div>
      </div>
    </div>
  );
}
