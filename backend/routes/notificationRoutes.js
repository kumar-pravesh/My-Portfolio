import express from "express";
import db from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// GET notifications for current user
router.get("/", authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.user.id],
    );
    const unread = result.rows.filter((n) => !n.is_read).length;
    res.json({ data: result.rows, unread });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications." });
  }
});

// Mark all as read
router.put("/read-all", authenticate, async (req, res) => {
  try {
    await db.query(`UPDATE notifications SET is_read=true WHERE user_id=$1`, [
      req.user.id,
    ]);
    res.json({ message: "All notifications marked as read." });
  } catch (err) {
    res.status(500).json({ error: "Failed to update notifications." });
  }
});

// Mark single as read
router.put("/:id/read", authenticate, async (req, res) => {
  try {
    await db.query(
      `UPDATE notifications SET is_read=true WHERE id=$1 AND user_id=$2`,
      [req.params.id, req.user.id],
    );
    res.json({ message: "Notification marked as read." });
  } catch (err) {
    res.status(500).json({ error: "Failed to update notification." });
  }
});

export default router;
