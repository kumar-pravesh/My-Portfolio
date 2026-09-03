import express from "express";
import db from "../db/index.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { generateReferenceId } from "../db/referenceId.js";

const router = express.Router();
const canEdit = authorize("CONTENT_EDITOR");

function slugify(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Generic CRUD factory for simple content modules
// Generic CRUD factory for simple content modules with route alias support
function buildCrud(tableName, prefix, aliases = [tableName]) {
  aliases.forEach((routePath) => {
    // LIST
    router.get(`/${routePath}`, authenticate, async (req, res) => {
      const { page = 1, limit = 20, search, status } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const conditions = ["deleted_at IS NULL"];
      const params = [];
      if (search) {
        params.push(`%${search}%`);
        if (tableName === "services") {
          conditions.push(
            `(name ILIKE $${params.length} OR reference_id ILIKE $${params.length})`,
          );
        } else if (tableName === "testimonials") {
          conditions.push(
            `(client_name ILIKE $${params.length} OR company ILIKE $${params.length} OR reference_id ILIKE $${params.length})`,
          );
        } else if (tableName === "case_studies") {
          conditions.push(
            `(title ILIKE $${params.length} OR client ILIKE $${params.length} OR reference_id ILIKE $${params.length})`,
          );
        } else {
          conditions.push(
            `(title ILIKE $${params.length} OR reference_id ILIKE $${params.length})`,
          );
        }
      }
      if (status) {
        params.push(status);
        conditions.push(`status=$${params.length}`);
      }
      const where = `WHERE ${conditions.join(" AND ")}`;
      try {
        const count = await db.query(
          `SELECT COUNT(*) FROM ${tableName} ${where}`,
          params,
        );
        params.push(parseInt(limit), offset);
        const data = await db.query(
          `SELECT * FROM ${tableName} ${where} ORDER BY display_order ASC, created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
          params,
        );
        res.json({
          data: data.rows,
          total: parseInt(count.rows[0].count),
          page: parseInt(page),
        });
      } catch (err) {
        console.error(`Failed to fetch ${tableName} list:`, err);
        res.status(500).json({ error: `Failed to fetch ${tableName}.` });
      }
    });

    // PUBLIC LIST (only published, filtered by featured, visibility, and limit)
    router.get(`/${routePath}/public`, async (req, res) => {
      try {
        const { featured, limit } = req.query;
        const conditions = [
          "status='published'",
          "(visibility = 'public' OR visibility IS NULL)",
          "deleted_at IS NULL",
        ];
        const params = [];

        if (featured === "true") {
          conditions.push(`is_featured = true`);
        }

        const where = `WHERE ${conditions.join(" AND ")}`;
        let limitClause = "";
        if (limit) {
          params.push(parseInt(limit));
          limitClause = `LIMIT $${params.length}`;
        }

        let orderClause = `ORDER BY display_order ASC, created_at DESC`;
        if (tableName === "blog_posts" || tableName === "testimonials") {
          orderClause = `ORDER BY is_featured DESC, display_order ASC, created_at DESC`;
        }

        const data = await db.query(
          `SELECT * FROM ${tableName} ${where} ${orderClause} ${limitClause}`,
          params,
        );
        res.json(data.rows);
      } catch (err) {
        console.error(`Failed to fetch public ${tableName}:`, err);
        res.status(500).json({ error: "Failed to fetch." });
      }
    });

    // PUBLIC GET SINGLE (by slug or refId)
    router.get(`/${routePath}/public/:slug`, async (req, res) => {
      try {
        const result = await db.query(
          `SELECT * FROM ${tableName} WHERE (slug = $1 OR reference_id = $1) AND status = 'published' AND deleted_at IS NULL`,
          [req.params.slug],
        );
        if (!result.rows[0])
          return res.status(404).json({ error: "Item not found." });

        // Fetch related media if any
        const media = await db.query(
          `SELECT * FROM media_assets
           WHERE (related_case_study = $1 OR related_blog = $1 OR related_service = $1)
             AND status = 'published' AND visibility = 'public' AND deleted_at IS NULL
           ORDER BY display_order ASC`,
          [result.rows[0].reference_id],
        );

        res.json({
          ...result.rows[0],
          media: media.rows,
        });
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch item." });
      }
    });

    // GET ONE
    router.get(`/${routePath}/:refId`, authenticate, async (req, res) => {
      try {
        const result = await db.query(
          `SELECT * FROM ${tableName} WHERE reference_id=$1 AND deleted_at IS NULL`,
          [req.params.refId],
        );
        if (!result.rows[0])
          return res.status(404).json({ error: "Not found." });
        res.json(result.rows[0]);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch." });
      }
    });

    // CREATE
    router.post(`/${routePath}`, authenticate, canEdit, async (req, res) => {
      try {
        const refId = await generateReferenceId(prefix, new Date());
        const body = {
          ...req.body,
          reference_id: refId,
          created_by: req.user.id,
        };
        if (body.name && !body.slug)
          body.slug = slugify(body.name) + "-" + refId.split("-")[2];
        if (body.title && !body.slug)
          body.slug = slugify(body.title) + "-" + refId.split("-")[2];
        const cols = Object.keys(body).filter((k) => body[k] !== undefined);
        const vals = cols.map((k) => body[k]);
        const placeholders = cols.map((_, i) => `$${i + 1}`).join(",");
        const result = await db.query(
          `INSERT INTO ${tableName} (${cols.join(",")}) VALUES (${placeholders}) RETURNING *`,
          vals,
        );
        res.status(201).json(result.rows[0]);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create." });
      }
    });

    // UPDATE
    router.put(
      `/${routePath}/:refId`,
      authenticate,
      canEdit,
      async (req, res) => {
        try {
          const existing = await db.query(
            `SELECT * FROM ${tableName} WHERE reference_id=$1 AND deleted_at IS NULL`,
            [req.params.refId],
          );
          if (!existing.rows[0])
            return res.status(404).json({ error: "Not found." });
          const body = req.body;
          const sets = Object.keys(body).map((k, i) => `${k}=$${i + 1}`);
          sets.push(`updated_at=NOW()`);
          const vals = [...Object.values(body), req.params.refId];
          const result = await db.query(
            `UPDATE ${tableName} SET ${sets.join(",")} WHERE reference_id=$${vals.length} AND deleted_at IS NULL RETURNING *`,
            vals,
          );
          res.json(result.rows[0]);
        } catch (err) {
          res.status(500).json({ error: "Failed to update." });
        }
      },
    );

    // DELETE
    router.delete(
      `/${routePath}/:refId`,
      authenticate,
      canEdit,
      async (req, res) => {
        try {
          await db.query(
            `UPDATE ${tableName} SET deleted_at=NOW() WHERE reference_id=$1`,
            [req.params.refId],
          );
          res.json({ message: "Deleted." });
        } catch (err) {
          res.status(500).json({ error: "Failed to delete." });
        }
      },
    );
  });
}

// Duplicate Blog Post
router.post(
  "/blog_posts/:refId/duplicate",
  authenticate,
  canEdit,
  async (req, res) => {
    try {
      const orig = await db.query(
        `SELECT * FROM blog_posts WHERE reference_id=$1 AND deleted_at IS NULL`,
        [req.params.refId],
      );
      if (!orig.rows[0])
        return res.status(404).json({ error: "Blog not found." });

      const b = orig.rows[0];
      const newRefId = await generateReferenceId("BLOG", new Date());
      const newSlug = `${b.slug || "blog"}-copy-${newRefId.split("-")[2]}`;

      const {
        id,
        reference_id,
        created_at,
        updated_at,
        deleted_at,
        published_at,
        scheduled_at,
        ...rest
      } = b;
      const body = {
        ...rest,
        reference_id: newRefId,
        slug: newSlug,
        title: `${b.title} (Copy)`,
        status: "draft",
        created_by: req.user.id,
      };

      const cols = Object.keys(body).filter((k) => body[k] !== undefined);
      const vals = cols.map((k) => body[k]);
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(",");

      const result = await db.query(
        `INSERT INTO blog_posts (${cols.join(",")}) VALUES (${placeholders}) RETURNING *`,
        vals,
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Duplicate blog error:", err);
      res.status(500).json({ error: "Failed to duplicate blog post." });
    }
  },
);

// Register all content modules with route alias support
buildCrud("services", "SERV", ["services"]);
buildCrud("case_studies", "CASE", ["case_studies", "case-studies"]);
buildCrud("blog_posts", "BLOG", ["blog_posts", "blog"]);
buildCrud("testimonials", "TEST", ["testimonials"]);

export default router;
