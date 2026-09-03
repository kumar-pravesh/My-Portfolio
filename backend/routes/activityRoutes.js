import express from "express";
import db from "../db/index.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// GET activity logs (admin only)
router.get("/", authenticate, authorize("ADMIN"), async (req, res) => {
  const { page = 1, limit = 30, module, action, user_id, from, to } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const conditions = [];
  const params = [];

  if (module) {
    params.push(module);
    conditions.push(`module=$${params.length}`);
  }
  if (action) {
    params.push(action);
    conditions.push(`action=$${params.length}`);
  }
  if (user_id) {
    params.push(user_id);
    conditions.push(`user_id::text=$${params.length}`);
  }
  if (from) {
    params.push(from);
    conditions.push(`created_at >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    conditions.push(`created_at <= $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  try {
    const count = await db.query(
      `SELECT COUNT(*) FROM activity_logs ${where}`,
      params,
    );
    params.push(parseInt(limit), offset);
    const data = await db.query(
      `SELECT * FROM activity_logs ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );
    res.json({
      data: data.rows,
      total: parseInt(count.rows[0].count),
      page: parseInt(page),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch activity logs." });
  }
});

export default router;
