import express from "express";
import db from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Global search across all modules
router.get("/", authenticate, async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json({ results: {} });

  const term = `%${q}%`;
  try {
    const [projects, leads, contacts, services, blogs] = await Promise.all([
      db.query(
        `SELECT reference_id, title AS label, status, 'project' AS type FROM projects
                WHERE deleted_at IS NULL AND (title ILIKE $1 OR reference_id ILIKE $1) LIMIT 5`,
        [term],
      ),
      db.query(
        `SELECT reference_id, full_name AS label, status, 'lead' AS type FROM leads
                WHERE deleted_at IS NULL AND (full_name ILIKE $1 OR email ILIKE $1 OR reference_id ILIKE $1) LIMIT 5`,
        [term],
      ),
      db.query(
        `SELECT reference_id, name AS label, status, 'contact' AS type FROM messages
                WHERE deleted_at IS NULL AND (name ILIKE $1 OR email ILIKE $1 OR reference_id ILIKE $1) LIMIT 5`,
        [term],
      ),
      db.query(
        `SELECT reference_id, name AS label, status, 'service' AS type FROM services
                WHERE deleted_at IS NULL AND (name ILIKE $1 OR reference_id ILIKE $1) LIMIT 5`,
        [term],
      ),
      db.query(
        `SELECT reference_id, title AS label, status, 'blog' AS type FROM blog_posts
                WHERE deleted_at IS NULL AND (title ILIKE $1 OR reference_id ILIKE $1) LIMIT 5`,
        [term],
      ),
    ]);

    res.json({
      results: {
        projects: projects.rows,
        leads: leads.rows,
        contacts: contacts.rows,
        services: services.rows,
        blogs: blogs.rows,
      },
      total:
        projects.rows.length +
        leads.rows.length +
        contacts.rows.length +
        services.rows.length +
        blogs.rows.length,
    });
  } catch (err) {
    res.status(500).json({ error: "Search failed." });
  }
});

export default router;
