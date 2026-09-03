import express from "express";
import db from "../db/index.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { auditLog } from "../middleware/auditLog.js";
import { generateReferenceId } from "../db/referenceId.js";

const router = express.Router();
const canEdit = authorize("CONTENT_EDITOR");

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Public: GET published projects (used by public website) ──────
router.get("/public", async (req, res) => {
  try {
    const { featured, limit } = req.query;
    const conditions = [
      "status = 'published'",
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

    const result = await db.query(
      `SELECT id, reference_id, slug, title, image, hero_image, short_description, description,
              full_description, status, tech_stack, services_provided, live_link, github_url,
              is_featured, display_order, category, industry, client_name, completion_date,
              challenges, solutions, results, key_metrics, created_at, published_at
       FROM projects
       ${where}
       ORDER BY display_order ASC, published_at DESC, created_at DESC
       ${limitClause}`,
      params,
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Projects public fetch error:", err);
    res.status(500).json({ error: "Failed to retrieve projects." });
  }
});

// ── Public: GET current work project (Currently Building) ────────
router.get("/public/current-work", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT reference_id, slug, title, image, short_description,
              status, tech_stack, progress, start_date, completion_date,
              expected_completion, cta_enabled, cta_label
       FROM projects
       WHERE show_on_home_current_work = true 
         AND status IN ('in_progress', 'upcoming') 
         AND (visibility = 'public' OR visibility IS NULL)
         AND deleted_at IS NULL
       ORDER BY home_display_order ASC, created_at DESC
       LIMIT 1`,
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error("Projects current work fetch error:", err);
    res.status(500).json({ error: "Failed to retrieve current work." });
  }
});

// ── Public: GET single published project by slug or reference_id ─
router.get("/public/:slug", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM projects
       WHERE (slug = $1 OR reference_id = $1) 
         AND status IN ('published', 'in_progress', 'upcoming') 
         AND (visibility = 'public' OR visibility IS NULL)
         AND deleted_at IS NULL`,
      [req.params.slug],
    );
    if (!result.rows[0])
      return res.status(404).json({ error: "Project not found." });

    // Retrieve related media if any
    const media = await db.query(
      `SELECT * FROM media_assets
       WHERE related_project = $1 AND status = 'published' AND visibility = 'public' AND deleted_at IS NULL
       ORDER BY display_order ASC`,
      [result.rows[0].reference_id],
    );

    // Retrieve related case study if any
    const caseStudy = await db.query(
      `SELECT reference_id, slug, title, short_description, client FROM case_studies
       WHERE related_project = $1 AND status = 'published' AND deleted_at IS NULL LIMIT 1`,
      [result.rows[0].reference_id],
    );

    const project = result.rows[0];
    const vc = project.visibility_config || {};

    // Enforce section visibility: Nullify fields if marked as hidden
    if (vc.problem === false) project.challenges = null;
    if (vc.impact === false) {
      project.results = null;
      project.key_metrics = null;
    }
    if (vc.capabilities === false && project.services_provided)
      project.services_provided = [];
    if (vc.engineering === false) project.solutions = null;

    res.json({
      ...project,
      media: media.rows,
      related_case_study_info: caseStudy.rows[0] || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve project details." });
  }
});

// ── Admin: GET all projects (paginated, filtered) ────────────────
router.get("/", authenticate, async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    status,
    featured,
    sort = "created_at",
    order = "desc",
  } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const conditions = ["deleted_at IS NULL"];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(
      `(title ILIKE $${params.length} OR reference_id ILIKE $${params.length} OR client_name ILIKE $${params.length})`,
    );
  }
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }
  if (featured === "true") conditions.push(`is_featured = true`);

  const where = `WHERE ${conditions.join(" AND ")}`;
  const allowedSorts = [
    "created_at",
    "updated_at",
    "title",
    "display_order",
    "status",
  ];
  const sortCol = allowedSorts.includes(sort) ? sort : "created_at";
  const sortDir = order === "asc" ? "ASC" : "DESC";

  try {
    const countResult = await db.query(
      `SELECT COUNT(*) FROM projects ${where}`,
      params,
    );
    params.push(parseInt(limit), offset);
    const dataResult = await db.query(
      `SELECT id, reference_id, title, image, category, industry, status, is_featured,
              created_at, updated_at, published_at, display_order, client_name
       FROM projects ${where}
       ORDER BY ${sortCol} ${sortDir}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );
    res.json({
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch projects." });
  }
});

// ── Admin: GET single project ────────────────────────────────────
router.get("/:refId", authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM projects WHERE reference_id = $1 AND deleted_at IS NULL`,
      [req.params.refId],
    );
    if (!result.rows[0])
      return res.status(404).json({ error: "Project not found." });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch project." });
  }
});

// ── Admin: CREATE project ────────────────────────────────────────
router.post(
  "/",
  authenticate,
  canEdit,
  auditLog("projects", "CREATE"),
  async (req, res) => {
    const {
      title,
      image,
      description,
      short_description,
      full_description,
      client_name,
      industry,
      category,
      project_type,
      tech_stack,
      services_provided,
      live_link,
      github_url,
      hero_image,
      challenges,
      solutions,
      results,
      key_metrics,
      is_featured,
      display_order,
      seo_title,
      seo_description,
      seo_keywords,
      status = "draft",
      start_date,
      completion_date,
      show_on_home_current_work = false,
      home_display_order = 0,
      progress = 0,
      expected_completion,
      cta_enabled = true,
      cta_label,
      visibility = "public",
      visibility_config = {},
    } = req.body;

    if (!title) return res.status(400).json({ error: "Title is required." });

    try {
      const refId = await generateReferenceId("PROJ", new Date());
      const slug = slugify(title) + "-" + refId.split("-")[2];
      const now = new Date();
      const publishedAt = status === "published" ? now : null;

      const result = await db.query(
        `INSERT INTO projects (
        reference_id, title, slug, image, description, short_description, full_description,
        client_name, industry, category, project_type, tech_stack, services_provided,
        live_link, github_url, hero_image, challenges, solutions, results, key_metrics,
        is_featured, display_order, seo_title, seo_description, seo_keywords,
        status, start_date, completion_date, published_at, created_by, updated_at,
        show_on_home_current_work, home_display_order, progress,
        expected_completion, cta_enabled, cta_label, visibility, visibility_config
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,NOW(),$31,$32,$33,$34,$35,$36,$37,$38)
      RETURNING *`,
        [
          refId,
          title,
          slug,
          image || "",
          description || "",
          short_description,
          full_description,
          client_name,
          industry,
          category,
          project_type,
          tech_stack || [],
          services_provided || [],
          live_link,
          github_url,
          hero_image,
          challenges,
          solutions,
          results,
          key_metrics ? JSON.stringify(key_metrics) : "{}",
          is_featured || false,
          display_order || 0,
          seo_title,
          seo_description,
          seo_keywords || [],
          status,
          start_date || null,
          completion_date || null,
          publishedAt,
          req.user.id,
          show_on_home_current_work,
          home_display_order,
          progress,
          expected_completion || null,
          cta_enabled,
          cta_label || "View Details",
          visibility,
          visibility_config,
        ],
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create project." });
    }
  },
);

// ── Admin: UPDATE project ────────────────────────────────────────
router.put(
  "/:refId",
  authenticate,
  canEdit,
  auditLog("projects", "UPDATE"),
  async (req, res) => {
    const {
      title,
      image,
      description,
      short_description,
      full_description,
      client_name,
      industry,
      category,
      project_type,
      tech_stack,
      services_provided,
      live_link,
      github_url,
      hero_image,
      challenges,
      solutions,
      results,
      key_metrics,
      is_featured,
      display_order,
      seo_title,
      seo_description,
      seo_keywords,
      status,
      start_date,
      completion_date,
      show_on_home_current_work,
      home_display_order,
      progress,
      expected_completion,
      cta_enabled,
      cta_label,
      visibility,
      visibility_config,
    } = req.body;

    try {
      const existing = await db.query(
        `SELECT * FROM projects WHERE reference_id = $1 AND deleted_at IS NULL`,
        [req.params.refId],
      );
      if (!existing.rows[0])
        return res.status(404).json({ error: "Project not found." });

      const prev = existing.rows[0];
      const publishedAt =
        status === "published" && prev.status !== "published"
          ? new Date()
          : prev.published_at;

      const result = await db.query(
        `UPDATE projects SET
        title=$1, image=$2, description=$3, short_description=$4, full_description=$5,
        client_name=$6, industry=$7, category=$8, project_type=$9, tech_stack=$10,
        services_provided=$11, live_link=$12, github_url=$13, hero_image=$14,
        challenges=$15, solutions=$16, results=$17, key_metrics=$18,
        is_featured=$19, display_order=$20, seo_title=$21, seo_description=$22, seo_keywords=$23,
        status=$24, start_date=$25, completion_date=$26, published_at=$27, updated_at=NOW(),
        show_on_home_current_work=$28, home_display_order=$29, progress=$30,
        expected_completion=$31, cta_enabled=$32, cta_label=$33, visibility=$34, visibility_config=$35
       WHERE reference_id=$36 AND deleted_at IS NULL
       RETURNING *`,
        [
          title ?? prev.title,
          image ?? prev.image,
          description ?? prev.description,
          short_description ?? prev.short_description,
          full_description ?? prev.full_description,
          client_name ?? prev.client_name,
          industry ?? prev.industry,
          category ?? prev.category,
          project_type ?? prev.project_type,
          tech_stack ?? prev.tech_stack,
          services_provided ?? prev.services_provided,
          live_link ?? prev.live_link,
          github_url ?? prev.github_url,
          hero_image ?? prev.hero_image,
          challenges ?? prev.challenges,
          solutions ?? prev.solutions,
          results ?? prev.results,
          key_metrics ? JSON.stringify(key_metrics) : prev.key_metrics,
          is_featured ?? prev.is_featured,
          display_order ?? prev.display_order,
          seo_title ?? prev.seo_title,
          seo_description ?? prev.seo_description,
          seo_keywords ?? prev.seo_keywords,
          status ?? prev.status,
          start_date === "" ? null : (start_date ?? prev.start_date),
          completion_date === ""
            ? null
            : (completion_date ?? prev.completion_date),
          publishedAt,
          show_on_home_current_work ?? prev.show_on_home_current_work,
          home_display_order ?? prev.home_display_order,
          progress ?? prev.progress,
          expected_completion === ""
            ? null
            : (expected_completion ?? prev.expected_completion),
          cta_enabled ?? prev.cta_enabled,
          cta_label ?? prev.cta_label,
          visibility ?? prev.visibility,
          visibility_config ?? prev.visibility_config,
          req.params.refId,
        ],
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update project." });
    }
  },
);

// ── Admin: DUPLICATE project ─────────────────────────────────────
router.post("/:refId/duplicate", authenticate, canEdit, async (req, res) => {
  try {
    const src = await db.query(
      `SELECT * FROM projects WHERE reference_id = $1 AND deleted_at IS NULL`,
      [req.params.refId],
    );
    if (!src.rows[0])
      return res.status(404).json({ error: "Project not found." });
    const p = src.rows[0];
    const refId = await generateReferenceId("PROJ", new Date());
    const slug = slugify(p.title + " copy") + "-" + refId.split("-")[2];

    const result = await db.query(
      `INSERT INTO projects (
        reference_id, title, slug, image, description, short_description, full_description,
        client_name, industry, category, project_type, tech_stack, services_provided,
        live_link, github_url, hero_image, challenges, solutions, results, key_metrics,
        is_featured, display_order, seo_title, seo_description, seo_keywords,
        status, start_date, completion_date, created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,'draft',$26,$27,$28)
      RETURNING reference_id, title, status`,
      [
        refId,
        p.title + " (Copy)",
        slug,
        p.image,
        p.description,
        p.short_description,
        p.full_description,
        p.client_name,
        p.industry,
        p.category,
        p.project_type,
        p.tech_stack,
        p.services_provided,
        p.live_link,
        p.github_url,
        p.hero_image,
        p.challenges,
        p.solutions,
        p.results,
        p.key_metrics,
        false,
        p.display_order + 1,
        p.seo_title,
        p.seo_description,
        p.seo_keywords,
        p.start_date,
        p.completion_date,
        req.user.id,
      ],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to duplicate project." });
  }
});

// ── Admin: BULK actions ──────────────────────────────────────────
router.post("/bulk", authenticate, canEdit, async (req, res) => {
  const { action, refIds } = req.body;
  if (!action || !Array.isArray(refIds) || refIds.length === 0)
    return res.status(400).json({ error: "action and refIds[] required." });

  try {
    const actionMap = {
      publish: `UPDATE projects SET status='published', published_at=NOW(), updated_at=NOW() WHERE reference_id = ANY($1) AND deleted_at IS NULL`,
      unpublish: `UPDATE projects SET status='draft', updated_at=NOW() WHERE reference_id = ANY($1) AND deleted_at IS NULL`,
      archive: `UPDATE projects SET status='archived', updated_at=NOW() WHERE reference_id = ANY($1) AND deleted_at IS NULL`,
      delete: `UPDATE projects SET deleted_at=NOW() WHERE reference_id = ANY($1)`,
    };
    if (!actionMap[action])
      return res.status(400).json({ error: "Invalid bulk action." });
    await db.query(actionMap[action], [refIds]);
    res.json({
      message: `Bulk ${action} completed on ${refIds.length} project(s).`,
    });
  } catch (err) {
    res.status(500).json({ error: "Bulk action failed." });
  }
});

// ── Admin: SOFT DELETE ────────────────────────────────────────────
router.delete(
  "/:refId",
  authenticate,
  canEdit,
  auditLog("projects", "DELETE"),
  async (req, res) => {
    try {
      const result = await db.query(
        `UPDATE projects SET deleted_at = NOW() WHERE reference_id = $1 AND deleted_at IS NULL RETURNING reference_id, title`,
        [req.params.refId],
      );
      if (!result.rows[0])
        return res.status(404).json({ error: "Project not found." });
      res.json({ message: "Project deleted.", ...result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete project." });
    }
  },
);

// ── Legacy public endpoint (keep for compatibility) ──────────────
router.get("/legacy/all", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM projects WHERE status = 'published' AND deleted_at IS NULL ORDER BY display_order ASC`,
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve projects." });
  }
});

export default router;
