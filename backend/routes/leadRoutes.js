import express from "express";
import db from "../db/index.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { auditLog } from "../middleware/auditLog.js";
import { generateReferenceId } from "../db/referenceId.js";

const router = express.Router();
const canEdit = authorize("SALES_MANAGER");

// ── LIST leads ───────────────────────────────────────────────────
router.get("/", authenticate, async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    status,
    priority,
    source,
    assigned_to,
    sort = "created_at",
    order = "desc",
  } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const conditions = ["l.deleted_at IS NULL"];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(
      `(l.full_name ILIKE $${params.length} OR l.email ILIKE $${params.length} OR l.company ILIKE $${params.length} OR l.reference_id ILIKE $${params.length})`,
    );
  }
  if (status) {
    params.push(status);
    conditions.push(`l.status = $${params.length}`);
  }
  if (priority) {
    params.push(priority);
    conditions.push(`l.priority = $${params.length}`);
  }
  if (source) {
    params.push(source);
    conditions.push(`l.lead_source = $${params.length}`);
  }
  if (assigned_to) {
    params.push(assigned_to);
    conditions.push(`l.assigned_to::text = $${params.length}`);
  }

  const where = `WHERE ${conditions.join(" AND ")}`;
  const sortDir = order === "asc" ? "ASC" : "DESC";

  try {
    const countResult = await db.query(
      `SELECT COUNT(*) FROM leads l ${where}`,
      params,
    );
    params.push(parseInt(limit), offset);
    const dataResult = await db.query(
      `SELECT l.id, l.reference_id, l.full_name, l.company, l.email, l.phone,
              l.service_interested, l.status, l.priority, l.lead_source,
              l.follow_up_date, l.created_at, l.updated_at,
              u.full_name AS assigned_name
       FROM leads l
       LEFT JOIN users u ON l.assigned_to = u.id
       ${where} ORDER BY l.${sort === "status" ? "status" : "created_at"} ${sortDir}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );
    res.json({
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch leads." });
  }
});

// ── SINGLE lead with activities ───────────────────────────────────
router.get("/:refId", authenticate, async (req, res) => {
  try {
    const leadResult = await db.query(
      `SELECT l.*, u.full_name AS assigned_name, c.full_name AS created_by_name,
              m.reference_id AS source_contact_ref
       FROM leads l
       LEFT JOIN users u ON l.assigned_to = u.id
       LEFT JOIN users c ON l.created_by = c.id
       LEFT JOIN messages m ON l.source_contact_id = m.id
       WHERE l.reference_id = $1 AND l.deleted_at IS NULL`,
      [req.params.refId],
    );
    if (!leadResult.rows[0])
      return res.status(404).json({ error: "Lead not found." });

    const activitiesResult = await db.query(
      `SELECT la.*, u.full_name AS user_name_ref FROM lead_activities la
       LEFT JOIN users u ON la.user_id = u.id
       WHERE la.lead_id = $1 ORDER BY la.created_at DESC`,
      [leadResult.rows[0].id],
    );

    res.json({ ...leadResult.rows[0], activities: activitiesResult.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch lead." });
  }
});

// ── CREATE lead ───────────────────────────────────────────────────
router.post(
  "/",
  authenticate,
  canEdit,
  auditLog("leads", "CREATE"),
  async (req, res) => {
    const {
      full_name,
      company,
      email,
      phone,
      service_interested,
      budget,
      message,
      lead_source = "website",
      priority = "medium",
      status = "new",
      assigned_to,
      follow_up_date,
      notes,
    } = req.body;

    if (!full_name || !email)
      return res
        .status(400)
        .json({ error: "Full name and email are required." });

    try {
      const refId = await generateReferenceId("LEAD", new Date());
      const result = await db.query(
        `INSERT INTO leads (reference_id, full_name, company, email, phone, service_interested,
        budget, message, lead_source, priority, status, assigned_to, follow_up_date, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
        [
          refId,
          full_name,
          company,
          email,
          phone,
          service_interested,
          budget,
          message,
          lead_source,
          priority,
          status,
          assigned_to,
          follow_up_date,
          notes,
          req.user.id,
        ],
      );

      // Log initial activity
      await db.query(
        `INSERT INTO lead_activities (lead_id, user_id, user_name, action, new_value)
       VALUES ($1,$2,$3,'created','new')`,
        [result.rows[0].id, req.user.id, req.user.full_name],
      );

      // Notify admins
      const admins = await db.query(
        `SELECT id FROM users WHERE role IN ('SUPER_ADMIN','ADMIN') AND is_active = true`,
      );
      for (const admin of admins.rows) {
        const nRefId = await generateReferenceId("NOTI", new Date());
        await db.query(
          `INSERT INTO notifications (reference_id, user_id, title, body, type, related_table, related_ref_id)
         VALUES ($1,$2,$3,$4,'lead','leads',$5)`,
          [
            nRefId,
            admin.id,
            `New Lead: ${full_name}`,
            `${refId} — ${service_interested || "General"}`,
            refId,
          ],
        );
      }

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create lead." });
    }
  },
);

// ── UPDATE lead ───────────────────────────────────────────────────
router.put(
  "/:refId",
  authenticate,
  canEdit,
  auditLog("leads", "UPDATE"),
  async (req, res) => {
    try {
      const existing = await db.query(
        `SELECT * FROM leads WHERE reference_id = $1 AND deleted_at IS NULL`,
        [req.params.refId],
      );
      if (!existing.rows[0])
        return res.status(404).json({ error: "Lead not found." });
      const prev = existing.rows[0];

      const {
        full_name,
        company,
        email,
        phone,
        service_interested,
        budget,
        message,
        lead_source,
        priority,
        status,
        assigned_to,
        follow_up_date,
        notes,
      } = req.body;

      const result = await db.query(
        `UPDATE leads SET
        full_name=$1, company=$2, email=$3, phone=$4, service_interested=$5,
        budget=$6, message=$7, lead_source=$8, priority=$9, status=$10,
        assigned_to=$11, follow_up_date=$12, notes=$13, updated_at=NOW()
       WHERE reference_id=$14 AND deleted_at IS NULL RETURNING *`,
        [
          full_name ?? prev.full_name,
          company ?? prev.company,
          email ?? prev.email,
          phone ?? prev.phone,
          service_interested ?? prev.service_interested,
          budget ?? prev.budget,
          message ?? prev.message,
          lead_source ?? prev.lead_source,
          priority ?? prev.priority,
          status ?? prev.status,
          assigned_to ?? prev.assigned_to,
          follow_up_date ?? prev.follow_up_date,
          notes ?? prev.notes,
          req.params.refId,
        ],
      );

      // Log status change
      if (status && status !== prev.status) {
        await db.query(
          `INSERT INTO lead_activities (lead_id, user_id, user_name, action, old_value, new_value)
         VALUES ($1,$2,$3,'status_changed',$4,$5)`,
          [prev.id, req.user.id, req.user.full_name, prev.status, status],
        );
      }

      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: "Failed to update lead." });
    }
  },
);

// ── ADD note to lead ──────────────────────────────────────────────
router.post("/:refId/notes", authenticate, canEdit, async (req, res) => {
  const { notes } = req.body;
  try {
    const lead = await db.query(
      `SELECT id FROM leads WHERE reference_id=$1 AND deleted_at IS NULL`,
      [req.params.refId],
    );
    if (!lead.rows[0])
      return res.status(404).json({ error: "Lead not found." });

    await db.query(
      `INSERT INTO lead_activities (lead_id, user_id, user_name, action, notes)
       VALUES ($1,$2,$3,'note_added',$4)`,
      [lead.rows[0].id, req.user.id, req.user.full_name, notes],
    );
    await db.query(`UPDATE leads SET notes=$1, updated_at=NOW() WHERE id=$2`, [
      notes,
      lead.rows[0].id,
    ]);
    res.json({ message: "Note added." });
  } catch (err) {
    res.status(500).json({ error: "Failed to add note." });
  }
});

// ── SOFT DELETE lead ──────────────────────────────────────────────
router.delete(
  "/:refId",
  authenticate,
  canEdit,
  auditLog("leads", "DELETE"),
  async (req, res) => {
    try {
      await db.query(
        `UPDATE leads SET deleted_at=NOW() WHERE reference_id=$1`,
        [req.params.refId],
      );
      res.json({ message: "Lead deleted." });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete lead." });
    }
  },
);

export default router;
