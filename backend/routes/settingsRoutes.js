import express from "express";
import db from "../db/index.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();
const canEdit = authorize("SUPER_ADMIN");

// PUBLIC: GET all site & company settings
router.get("/public", async (req, res) => {
  try {
    const result = await db.query(`SELECT key, value FROM settings`);
    const settingsMap = {};
    for (const row of result.rows) {
      settingsMap[row.key] = row.value;
    }
    res.json(settingsMap);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch public settings." });
  }
});

// ADMIN: GET all settings
router.get("/", authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT key, value, updated_at FROM settings`,
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch settings." });
  }
});

// ADMIN: PUT update settings key-value pair
router.put("/", authenticate, canEdit, async (req, res) => {
  try {
    const settingsObj = req.body; // e.g. { hero_title: "...", company_phone: "..." }
    const keys = Object.keys(settingsObj);

    for (const k of keys) {
      await db.query(
        `INSERT INTO settings (key, value, updated_by, updated_at)
         VALUES ($1, $2::jsonb, $3, NOW())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = NOW()`,
        [k, JSON.stringify(settingsObj[k]), req.user.id],
      );
    }
    res.json({ message: "Settings updated successfully." });
  } catch (err) {
    console.error("Settings update error:", err);
    res.status(500).json({ error: "Failed to update settings." });
  }
});

export default router;
