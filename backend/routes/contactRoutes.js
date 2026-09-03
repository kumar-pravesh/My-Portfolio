import express from "express";
import { z } from "zod";
import db from "../db/index.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { auditLog } from "../middleware/auditLog.js";
import { generateReferenceId } from "../db/referenceId.js";
import { validateRequest } from "../middleware/validate.js";

const router = express.Router();
const canEdit = authorize("SALES_MANAGER");

const contactSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address"),
    message: z.string().min(10, "Message must be at least 10 characters"),
    phone: z.string().max(30).optional(),
    subject: z.string().max(255).optional(),
  }),
});

// ── Public: submit contact form ──────────────────────────────────
router.post("/public", validateRequest(contactSchema), async (req, res) => {
  const { name, email, message, phone, subject } = req.body;

  try {
    const refId = await generateReferenceId("CONT", new Date());
    const result = await db.query(
      `INSERT INTO messages (reference_id, name, email, phone, subject, message, status)
       VALUES ($1,$2,$3,$4,$5,$6,'unread') RETURNING *`,
      [refId, name, email, phone || null, subject || null, message],
    );
    // Notify all admins
    const admins = await db.query(
      `SELECT id FROM users WHERE role IN ('SUPER_ADMIN','ADMIN') AND is_active = true`,
    );
    for (const admin of admins.rows) {
      const nRefId = await generateReferenceId("NOTI", new Date());
      await db.query(
        `INSERT INTO notifications (reference_id, user_id, title, body, type, related_table, related_ref_id)
         VALUES ($1,$2,$3,$4,'contact','messages',$5)`,
        [
          nRefId,
          admin.id,
          `New Contact Message from ${name}`,
          `${refId}: ${message.substring(0, 100)}`,
          refId,
        ],
      );
    }
    res.status(201).json({ success: true, reference_id: refId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit message." });
  }
});

// ── Admin: list messages ─────────────────────────────────────────
router.get("/", authenticate, async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    status,
    sort = "created_at",
    order = "desc",
  } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const conditions = ["deleted_at IS NULL"];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(
      `(name ILIKE $${params.length} OR email ILIKE $${params.length} OR reference_id ILIKE $${params.length})`,
    );
  }
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const where = `WHERE ${conditions.join(" AND ")}`;
  const sortDir = order === "asc" ? "ASC" : "DESC";

  try {
    const countResult = await db.query(
      `SELECT COUNT(*) FROM messages ${where}`,
      params,
    );
    params.push(parseInt(limit), offset);
    const dataResult = await db.query(
      `SELECT m.*, u.full_name AS assigned_name
       FROM messages m
       LEFT JOIN users u ON m.assigned_to = u.id
       ${where} ORDER BY m.created_at ${sortDir}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );
    res.json({
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages." });
  }
});

// ── Admin: single message ────────────────────────────────────────
router.get("/:refId", authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT m.*, u.full_name AS assigned_name FROM messages m
       LEFT JOIN users u ON m.assigned_to = u.id
       WHERE m.reference_id = $1 AND m.deleted_at IS NULL`,
      [req.params.refId],
    );
    if (!result.rows[0])
      return res.status(404).json({ error: "Message not found." });
    // Auto-mark as read
    if (result.rows[0].status === "unread") {
      await db.query(
        `UPDATE messages SET status='read', updated_at=NOW() WHERE reference_id=$1`,
        [req.params.refId],
      );
      result.rows[0].status = "read";
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch message." });
  }
});

// ── Admin: update message status/assign/notes ────────────────────
router.put("/:refId", authenticate, canEdit, async (req, res) => {
  const { status, assigned_to, internal_notes } = req.body;
  try {
    const result = await db.query(
      `UPDATE messages SET
        status = COALESCE($1, status),
        assigned_to = COALESCE($2, assigned_to),
        internal_notes = COALESCE($3, internal_notes),
        updated_at = NOW()
       WHERE reference_id = $4 AND deleted_at IS NULL RETURNING *`,
      [status, assigned_to, internal_notes, req.params.refId],
    );
    if (!result.rows[0])
      return res.status(404).json({ error: "Message not found." });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update message." });
  }
});

// ── Admin: Convert contact → Lead ────────────────────────────────
router.post(
  "/:refId/convert-to-lead",
  authenticate,
  canEdit,
  auditLog("messages", "CONVERT"),
  async (req, res) => {
    try {
      const msgResult = await db.query(
        `SELECT * FROM messages WHERE reference_id = $1 AND deleted_at IS NULL`,
        [req.params.refId],
      );
      const msg = msgResult.rows[0];
      if (!msg) return res.status(404).json({ error: "Message not found." });

      const leadRefId = await generateReferenceId("LEAD", new Date());
      const leadResult = await db.query(
        `INSERT INTO leads (reference_id, source_contact_id, full_name, email, phone, message, lead_source, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,'contact_form',$7) RETURNING *`,
        [
          leadRefId,
          msg.id,
          msg.name,
          msg.email,
          msg.phone,
          msg.message,
          req.user.id,
        ],
      );

      // Update message status
      await db.query(
        `UPDATE messages SET status='in_progress', updated_at=NOW() WHERE id=$1`,
        [msg.id],
      );

      res.status(201).json({
        lead: leadResult.rows[0],
        contact_ref_id: msg.reference_id,
        lead_ref_id: leadRefId,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to convert to lead." });
    }
  },
);

// ── Admin: Delete message (soft) ─────────────────────────────────
router.delete("/:refId", authenticate, canEdit, async (req, res) => {
  try {
    await db.query(
      `UPDATE messages SET deleted_at = NOW() WHERE reference_id = $1`,
      [req.params.refId],
    );
    res.json({ message: "Message deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete message." });
  }
});

export default router;
