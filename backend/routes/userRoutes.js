import express from "express";
import db from "../db/index.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { generateReferenceId } from "../db/referenceId.js";
import bcrypt from "bcryptjs";

const router = express.Router();
const onlySuperAdmin = authorize("SUPER_ADMIN");

// LIST users
router.get("/", authenticate, onlySuperAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, reference_id, full_name, email, role, avatar_url, is_active, last_login, created_at
       FROM users ORDER BY created_at DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

// CREATE user
router.post("/", authenticate, onlySuperAdmin, async (req, res) => {
  const { full_name, email, password, role = "VIEWER" } = req.body;
  if (!full_name || !email || !password)
    return res
      .status(400)
      .json({ error: "Name, email, and password required." });
  try {
    const hash = await bcrypt.hash(password, 12);
    const refId = await generateReferenceId("USER", new Date());
    const result = await db.query(
      `INSERT INTO users (reference_id, full_name, email, password_hash, role)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, reference_id, full_name, email, role, created_at`,
      [refId, full_name, email, hash, role],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505")
      return res.status(409).json({ error: "Email already exists." });
    res.status(500).json({ error: "Failed to create user." });
  }
});

// UPDATE user (role, active status, name)
router.put("/:id", authenticate, onlySuperAdmin, async (req, res) => {
  const { full_name, role, is_active } = req.body;
  try {
    const result = await db.query(
      `UPDATE users SET
        full_name = COALESCE($1, full_name),
        role = COALESCE($2, role),
        is_active = COALESCE($3, is_active),
        updated_at = NOW()
       WHERE id = $4 RETURNING id, reference_id, full_name, email, role, is_active`,
      [full_name, role, is_active, req.params.id],
    );
    if (!result.rows[0])
      return res.status(404).json({ error: "User not found." });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update user." });
  }
});

// DELETE / deactivate user
router.delete("/:id", authenticate, onlySuperAdmin, async (req, res) => {
  try {
    await db.query(
      `UPDATE users SET is_active=false, updated_at=NOW() WHERE id=$1`,
      [req.params.id],
    );
    res.json({ message: "User deactivated." });
  } catch (err) {
    res.status(500).json({ error: "Failed to deactivate user." });
  }
});

export default router;
