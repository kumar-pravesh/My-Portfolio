import express from "express";
import db from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// GET /api/admin/stats — dashboard overview stats
router.get("/stats", authenticate, async (req, res) => {
  try {
    const [
      projects,
      leads,
      contacts,
      users,
      recentProjects,
      recentLeads,
      recentContacts,
      recentActivity,
      leadsOverTime,
      leadsByStatus,
      mediaStats,
    ] = await Promise.all([
      // Project stats
      db.query(`SELECT
        COUNT(*) FILTER (WHERE deleted_at IS NULL) AS total,
        COUNT(*) FILTER (WHERE status = 'published' AND deleted_at IS NULL) AS published,
        COUNT(*) FILTER (WHERE status = 'draft' AND deleted_at IS NULL) AS draft,
        COUNT(*) FILTER (WHERE is_featured = true AND deleted_at IS NULL) AS featured
        FROM projects`),

      // Lead stats
      db.query(`SELECT
        COUNT(*) FILTER (WHERE deleted_at IS NULL) AS total,
        COUNT(*) FILTER (WHERE status = 'new' AND deleted_at IS NULL) AS new,
        COUNT(*) FILTER (WHERE status = 'qualified' AND deleted_at IS NULL) AS qualified,
        COUNT(*) FILTER (WHERE status = 'won' AND deleted_at IS NULL) AS won,
        COUNT(*) FILTER (WHERE status = 'lost' AND deleted_at IS NULL) AS lost
        FROM leads`),

      // Contact/message stats
      db.query(`SELECT
        COUNT(*) FILTER (WHERE deleted_at IS NULL) AS total,
        COUNT(*) FILTER (WHERE status = 'unread' AND deleted_at IS NULL) AS unread
        FROM messages`),

      // User stats
      db.query(`SELECT COUNT(*) AS total FROM users WHERE is_active = true`),

      // Recent projects
      db.query(`SELECT id, reference_id, title, status, is_featured, created_at
        FROM projects WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 5`),

      // Recent leads
      db.query(`SELECT id, reference_id, full_name, email, company, status, priority, created_at
        FROM leads WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 5`),

      // Recent contacts
      db.query(`SELECT id, reference_id, name, email, status, created_at
        FROM messages WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 5`),

      // Recent activity
      db.query(`SELECT id, user_name, action, module, record_ref_id, record_title, created_at
        FROM activity_logs ORDER BY created_at DESC LIMIT 10`),

      // Leads over time (last 30 days)
      db.query(`SELECT DATE(created_at) AS date, COUNT(*) AS count
        FROM leads WHERE created_at >= NOW() - INTERVAL '30 days' AND deleted_at IS NULL
        GROUP BY DATE(created_at) ORDER BY date`),

      // Leads by status
      db.query(
        `SELECT status, COUNT(*) AS count FROM leads WHERE deleted_at IS NULL GROUP BY status`,
      ),

      // Media stats & Portfolio Media Usage calculation from Neon metadata
      db.query(`SELECT
        COUNT(*) FILTER (WHERE deleted_at IS NULL) AS total,
        COALESCE(SUM(file_size) FILTER (WHERE deleted_at IS NULL), 0) AS total_bytes
        FROM media_assets`),
    ]);

    res.json({
      projects: projects.rows[0],
      leads: leads.rows[0],
      contacts: contacts.rows[0],
      users: { total: users.rows[0].total },
      media: {
        total: mediaStats ? mediaStats.rows[0].total : 0,
        portfolio_media_usage_bytes: mediaStats
          ? mediaStats.rows[0].total_bytes
          : 0,
      },
      recentProjects: recentProjects.rows,
      recentLeads: recentLeads.rows,
      recentContacts: recentContacts.rows,
      recentActivity: recentActivity.rows,
      charts: {
        leadsOverTime: leadsOverTime.rows,
        leadsByStatus: leadsByStatus.rows,
      },
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats." });
  }
});

export default router;
