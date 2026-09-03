import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required." });

  try {
    const result = await db.query(
      `SELECT id, reference_id, full_name, email, password_hash, role, avatar_url, is_active
       FROM users WHERE email = $1`,
      [email],
    );
    const user = result.rows[0];
    if (!user || !user.is_active)
      return res.status(401).json({ error: "Invalid credentials." });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials." });

    await db.query(`UPDATE users SET last_login = NOW() WHERE id = $1`, [
      user.id,
    ]);

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        reference_id: user.reference_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed." });
  }
});

// GET /api/auth/me
router.get("/me", authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, reference_id, full_name, email, role, avatar_url, last_login, created_at
       FROM users WHERE id = $1`,
      [req.user.id],
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile." });
  }
});

// PUT /api/auth/change-password
router.put("/change-password", authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res
      .status(400)
      .json({ error: "Passwords invalid. Minimum 8 characters." });
  }
  try {
    const result = await db.query(
      `SELECT password_hash FROM users WHERE id = $1`,
      [req.user.id],
    );
    const valid = await bcrypt.compare(
      currentPassword,
      result.rows[0].password_hash,
    );
    if (!valid)
      return res.status(401).json({ error: "Current password incorrect." });

    const hash = await bcrypt.hash(newPassword, 12);
    await db.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
      [hash, req.user.id],
    );
    res.json({ message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to update password." });
  }
});

export default router;
