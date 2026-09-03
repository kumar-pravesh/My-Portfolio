import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import db from "../db/index.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { generateReferenceId } from "../db/referenceId.js";
import {
  isB2Configured,
  generateObjectKey,
  uploadToB2,
  deleteFromB2,
  resolveMediaRecord,
  resolveMediaList,
} from "../services/b2Service.js";

const router = express.Router();
const canEdit = authorize("CONTENT_EDITOR");

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Temp Upload directory ──────────────────────────────────────────
const TEMP_DIR = path.join(__dirname, "..", "uploads", "temp");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// Sub-directories per media type (for local fallback)
const DIRS = {
  image: "images",
  video: "videos",
  short_video: "reels",
  presentation_video: "presentations",
  document: "documents",
  pdf: "documents",
  cv: "cv",
  external_video: null,
  external_image: null,
};

// ── File size limits (bytes) ──────────────────────────────────────
const MAX_SIZES = {
  image: 10 * 1024 * 1024, // 10 MB
  document: 100 * 1024 * 1024, // 100 MB (PPT/DOC)
  pdf: 50 * 1024 * 1024, // 50 MB
  cv: 10 * 1024 * 1024, // 10 MB
  video: 500 * 1024 * 1024, // 500 MB
  short_video: 200 * 1024 * 1024, // 200 MB
  presentation_video: 500 * 1024 * 1024, // 500 MB
};

// ── Allowed MIME types ────────────────────────────────────────────
const ALLOWED = {
  image: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ],
  video: [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
    "video/x-msvideo",
  ],
  short_video: ["video/mp4", "video/webm", "video/ogg"],
  presentation_video: ["video/mp4", "video/webm", "video/ogg"],
  document: [
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  pdf: ["application/pdf"],
  cv: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

function slugifyFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Multer storage (Temp disk buffering) ──────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = slugifyFilename(path.basename(file.originalname, ext));
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB global limit
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "thumbnail") {
      if (ALLOWED.image.includes(file.mimetype)) {
        return cb(null, true);
      }
      return cb(
        new Error(`Thumbnail must be an image (got ${file.mimetype})`),
        false,
      );
    }

    const mediaType = req.body?.media_type || "image";
    const allowed = ALLOWED[mediaType] || ALLOWED.image;
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(`File type ${file.mimetype} not allowed for ${mediaType}`),
        false,
      );
    }
  },
});

function cleanupTempFile(file) {
  if (file?.path && fs.existsSync(file.path)) {
    try {
      fs.unlinkSync(file.path);
    } catch (err) {
      console.warn(`Failed to clean up temp file ${file.path}:`, err.message);
    }
  }
}

// ── Helper: build local file URL ──────────────────────────────────
function buildFileUrl(req, relativePath) {
  const base = `${req.protocol}://${req.get("host")}`;
  return `${base}/uploads/${relativePath}`;
}

// ── Detect external video provider ───────────────────────────────
function detectProvider(url = "") {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("vimeo.com")) return "vimeo";
  return "other";
}

// ── Detect media type from MIME ───────────────────────────────────
function detectMediaType(mime = "") {
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  if (mime.includes("presentation") || mime.includes("powerpoint"))
    return "document";
  if (mime.startsWith("video/")) return "video";
  return "document";
}

// ── Public GET published media assets ─────────────────────────────
router.get("/public", async (req, res) => {
  try {
    const { media_type, category, featured, project_ref, limit } = req.query;
    const conditions = [
      `status = 'published'`,
      `(visibility = 'public' OR visibility IS NULL)`,
      `deleted_at IS NULL`,
    ];
    const params = [];

    if (media_type) {
      params.push(media_type);
      conditions.push(`media_type = $${params.length}`);
    }
    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }
    if (featured) {
      params.push(featured === "true");
      conditions.push(`is_featured = $${params.length}`);
    }
    if (project_ref) {
      params.push(project_ref);
      conditions.push(`related_project = $${params.length}`);
    }

    const where = `WHERE ${conditions.join(" AND ")}`;
    let limitClause = "";
    if (limit) {
      params.push(parseInt(limit));
      limitClause = `LIMIT $${params.length}`;
    }

    const result = await db.query(
      `SELECT reference_id, title, description, media_type, file_url, file_name,
              file_size, mime_type, width, height, duration, aspect_ratio, alt_text,
              caption, thumbnail_url, storage_key, thumbnail_key, external_url, external_provider, category, tags,
              is_featured, related_project, related_case_study, related_blog
       FROM media_assets ${where}
       ORDER BY display_order ASC, created_at DESC
       ${limitClause}`,
      params,
    );

    const resolved = await resolveMediaList(result.rows);
    res.json(resolved);
  } catch (err) {
    console.error("Public media fetch error:", err);
    res.status(500).json({ error: "Failed to fetch public media." });
  }
});

// LIST media assets (Admin)
router.get("/", authenticate, async (req, res) => {
  const {
    page = 1,
    limit = 50,
    search,
    status,
    media_type,
    category,
    featured,
    collection_id,
  } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const conditions = ["deleted_at IS NULL"];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    const p = params.length;
    conditions.push(
      `(title ILIKE $${p} OR description ILIKE $${p} OR file_name ILIKE $${p} OR reference_id ILIKE $${p} OR category ILIKE $${p})`,
    );
  }
  if (status) {
    params.push(status);
    conditions.push(`status=$${params.length}`);
  }
  if (media_type) {
    params.push(media_type);
    conditions.push(`media_type=$${params.length}`);
  }
  if (category) {
    params.push(category);
    conditions.push(`category=$${params.length}`);
  }
  if (featured) {
    params.push(featured === "true");
    conditions.push(`is_featured=$${params.length}`);
  }
  if (collection_id) {
    params.push(collection_id);
    conditions.push(`collection_id=$${params.length}`);
  }

  const where = `WHERE ${conditions.join(" AND ")}`;

  try {
    const count = await db.query(
      `SELECT COUNT(*) FROM media_assets ${where}`,
      params,
    );
    params.push(parseInt(limit), offset);
    const data = await db.query(
      `SELECT * FROM media_assets ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );

    const resolved = await resolveMediaList(data.rows);
    res.json({
      data: resolved,
      total: parseInt(count.rows[0].count),
      page: parseInt(page),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch media assets." });
  }
});

// GET single media asset
router.get("/:refId", authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM media_assets WHERE reference_id=$1 AND deleted_at IS NULL`,
      [req.params.refId],
    );
    if (!result.rows[0])
      return res.status(404).json({ error: "Media not found." });

    const resolved = await resolveMediaRecord(result.rows[0]);
    res.json(resolved);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch media asset." });
  }
});

// UPLOAD / CREATE media asset
router.post(
  "/",
  authenticate,
  canEdit,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req, res) => {
    const uploadedFile = req.files?.file?.[0];
    const thumbFile = req.files?.thumbnail?.[0];
    const body = req.body;

    let storageKey = null;
    let thumbnailKey = null;

    try {
      const refId = await generateReferenceId("MEDI", new Date());

      let mediaType = body.media_type || "image";
      let fileUrl = body.external_url || null;
      let fileName = null;
      let fileSize = null;
      let mimeType = null;

      if (uploadedFile) {
        fileName = uploadedFile.originalname;
        fileSize = uploadedFile.size;
        mimeType = uploadedFile.mimetype;

        if (!body.media_type) mediaType = detectMediaType(mimeType);

        // Validate per-type max size
        const maxAllowed = MAX_SIZES[mediaType] || MAX_SIZES.image;
        if (fileSize > maxAllowed) {
          throw new Error(
            `File size (${(fileSize / 1024 / 1024).toFixed(1)}MB) exceeds limit of ${(maxAllowed / 1024 / 1024).toFixed(0)}MB for ${mediaType}`,
          );
        }

        if (isB2Configured()) {
          storageKey = generateObjectKey(mediaType, fileName, false);
          await uploadToB2({
            filePath: uploadedFile.path,
            key: storageKey,
            mimeType,
          });
        } else {
          // Fallback to local
          const subDir = DIRS[mediaType] || "misc";
          const targetDir = path.join(__dirname, "..", "uploads", subDir);
          if (!fs.existsSync(targetDir))
            fs.mkdirSync(targetDir, { recursive: true });
          const targetPath = path.join(
            targetDir,
            path.basename(uploadedFile.path),
          );
          fs.renameSync(uploadedFile.path, targetPath);
          fileUrl = buildFileUrl(
            req,
            `${subDir}/${path.basename(uploadedFile.path)}`,
          );
        }
      }

      let thumbUrl = body.thumbnail_url || null;
      if (thumbFile) {
        if (isB2Configured()) {
          thumbnailKey = generateObjectKey(
            mediaType,
            thumbFile.originalname,
            true,
          );
          await uploadToB2({
            filePath: thumbFile.path,
            key: thumbnailKey,
            mimeType: thumbFile.mimetype,
          });
        } else {
          // Fallback to local
          const targetDir = path.join(__dirname, "..", "uploads", "images");
          if (!fs.existsSync(targetDir))
            fs.mkdirSync(targetDir, { recursive: true });
          const targetPath = path.join(
            targetDir,
            path.basename(thumbFile.path),
          );
          fs.renameSync(thumbFile.path, targetPath);
          thumbUrl = buildFileUrl(
            req,
            `images/${path.basename(thumbFile.path)}`,
          );
        }
      }

      const externalProvider = body.external_url
        ? detectProvider(body.external_url)
        : null;

      const row = {
        reference_id: refId,
        title: body.title || fileName || "Untitled",
        description: body.description || null,
        media_type: mediaType,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize ? parseInt(fileSize) : null,
        mime_type: mimeType,
        storage_key: storageKey,
        thumbnail_key: thumbnailKey,
        alt_text: body.alt_text || null,
        caption: body.caption || null,
        thumbnail_url: thumbUrl,
        external_url: body.external_url || null,
        external_provider: externalProvider,
        category: body.category || "General",
        tags: body.tags ? JSON.parse(body.tags) : [],
        status: body.status || "draft",
        visibility: body.visibility || "public",
        is_featured: body.is_featured === "true",
        display_order: parseInt(body.display_order || 0),
        collection_id: body.collection_id || null,
        related_project: body.related_project || null,
        related_case_study: body.related_case_study || null,
        related_blog: body.related_blog || null,
        related_service: body.related_service || null,
        created_by: req.user.id,
      };

      const cols = Object.keys(row).filter(
        (k) => row[k] !== undefined && row[k] !== null,
      );
      const vals = cols.map((k) => row[k]);
      const phs = cols.map((_, i) => `$${i + 1}`).join(",");

      let result;
      try {
        result = await db.query(
          `INSERT INTO media_assets (${cols.join(",")}) VALUES (${phs}) RETURNING *`,
          vals,
        );
      } catch (dbErr) {
        // Rollback B2 objects if DB insert fails
        console.error(
          "Neon DB insert failed after B2 upload, rolling back B2 files:",
          dbErr.message,
        );
        if (storageKey) await deleteFromB2(storageKey).catch(() => {});
        if (thumbnailKey) await deleteFromB2(thumbnailKey).catch(() => {});
        throw dbErr;
      }

      const createdRecord = await resolveMediaRecord(result.rows[0]);
      res.status(201).json(createdRecord);
    } catch (err) {
      console.error("Media upload error:", err);
      res.status(500).json({ error: err.message || "Upload failed." });
    } finally {
      cleanupTempFile(uploadedFile);
      cleanupTempFile(thumbFile);
    }
  },
);

// UPDATE media metadata
router.put("/:refId", authenticate, canEdit, async (req, res) => {
  try {
    const existing = await db.query(
      `SELECT * FROM media_assets WHERE reference_id=$1 AND deleted_at IS NULL`,
      [req.params.refId],
    );
    if (!existing.rows[0]) return res.status(404).json({ error: "Not found." });

    const body = { ...req.body };
    delete body.reference_id; // immutable
    delete body.storage_key;
    delete body.thumbnail_key;

    const sets = Object.keys(body).map((k, i) => `${k}=$${i + 1}`);
    sets.push(`updated_at=NOW()`);
    const vals = [...Object.values(body), req.params.refId];

    const result = await db.query(
      `UPDATE media_assets SET ${sets.join(",")} WHERE reference_id=$${vals.length} AND deleted_at IS NULL RETURNING *`,
      vals,
    );

    const resolved = await resolveMediaRecord(result.rows[0]);
    res.json(resolved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update." });
  }
});

// REPLACE file/thumbnail for existing media (preserves reference_id)
router.post(
  "/:refId/replace",
  authenticate,
  canEdit,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req, res) => {
    const file = req.files?.file?.[0];
    const thumbFile = req.files?.thumbnail?.[0];

    let newStorageKey = null;
    let newThumbnailKey = null;

    try {
      const existing = await db.query(
        `SELECT * FROM media_assets WHERE reference_id=$1 AND deleted_at IS NULL`,
        [req.params.refId],
      );
      if (!existing.rows[0])
        return res.status(404).json({ error: "Not found." });

      const oldRecord = existing.rows[0];

      if (!file && !thumbFile) {
        return res
          .status(400)
          .json({ error: "No files provided for replacement." });
      }

      const mediaType = oldRecord.media_type;
      let querySets = [];
      let queryVals = [];
      let paramIndex = 1;

      if (file) {
        const maxAllowed = MAX_SIZES[mediaType] || MAX_SIZES.image;
        if (file.size > maxAllowed) {
          throw new Error(
            `Replacement file size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds limit of ${(maxAllowed / 1024 / 1024).toFixed(0)}MB`,
          );
        }

        if (isB2Configured()) {
          newStorageKey = generateObjectKey(
            mediaType,
            file.originalname,
            false,
          );
          await uploadToB2({
            filePath: file.path,
            key: newStorageKey,
            mimeType: file.mimetype,
          });

          querySets.push(
            `storage_key=$${paramIndex++}`,
            `file_name=$${paramIndex++}`,
            `file_size=$${paramIndex++}`,
            `mime_type=$${paramIndex++}`,
          );
          queryVals.push(
            newStorageKey,
            file.originalname,
            file.size,
            file.mimetype,
          );
        } else {
          const subDir = DIRS[mediaType] || "misc";
          const targetDir = path.join(__dirname, "..", "uploads", subDir);
          if (!fs.existsSync(targetDir))
            fs.mkdirSync(targetDir, { recursive: true });
          const targetPath = path.join(targetDir, path.basename(file.path));
          fs.renameSync(file.path, targetPath);
          const fileUrl = buildFileUrl(
            req,
            `${subDir}/${path.basename(file.path)}`,
          );

          querySets.push(
            `file_url=$${paramIndex++}`,
            `file_name=$${paramIndex++}`,
            `file_size=$${paramIndex++}`,
            `mime_type=$${paramIndex++}`,
          );
          queryVals.push(fileUrl, file.originalname, file.size, file.mimetype);
        }
      }

      if (thumbFile) {
        if (isB2Configured()) {
          newThumbnailKey = generateObjectKey(
            mediaType,
            thumbFile.originalname,
            true,
          );
          await uploadToB2({
            filePath: thumbFile.path,
            key: newThumbnailKey,
            mimeType: thumbFile.mimetype,
          });

          querySets.push(`thumbnail_key=$${paramIndex++}`);
          queryVals.push(newThumbnailKey);
        } else {
          const targetDir = path.join(__dirname, "..", "uploads", "images");
          if (!fs.existsSync(targetDir))
            fs.mkdirSync(targetDir, { recursive: true });
          const targetPath = path.join(
            targetDir,
            path.basename(thumbFile.path),
          );
          fs.renameSync(thumbFile.path, targetPath);
          const thumbUrl = buildFileUrl(
            req,
            `images/${path.basename(thumbFile.path)}`,
          );

          querySets.push(`thumbnail_url=$${paramIndex++}`);
          queryVals.push(thumbUrl);
        }
      }

      querySets.push(`updated_at=NOW()`);
      queryVals.push(req.params.refId);

      const result = await db.query(
        `UPDATE media_assets SET ${querySets.join(", ")}
       WHERE reference_id=$${paramIndex} AND deleted_at IS NULL RETURNING *`,
        queryVals,
      );

      // ── Safe Cleanup of Old B2 Objects (ONLY AFTER DB UPDATE SUCCEEDS) ──
      if (newStorageKey && oldRecord.storage_key) {
        await deleteFromB2(oldRecord.storage_key).catch((err) =>
          console.error("Failed to clean old B2 file:", err),
        );
      }
      if (newThumbnailKey && oldRecord.thumbnail_key) {
        await deleteFromB2(oldRecord.thumbnail_key).catch((err) =>
          console.error("Failed to clean old B2 thumbnail:", err),
        );
      }

      const resolved = await resolveMediaRecord(result.rows[0]);
      res.json(resolved);
    } catch (err) {
      console.error("Replace failed:", err);
      // If update failed, delete the newly uploaded objects to avoid orphaned files
      if (newStorageKey) await deleteFromB2(newStorageKey).catch(() => {});
      if (newThumbnailKey) await deleteFromB2(newThumbnailKey).catch(() => {});
      res.status(500).json({ error: err.message || "Replace failed." });
    } finally {
      cleanupTempFile(file);
      cleanupTempFile(thumbFile);
    }
  },
);

// SOFT DELETE / HARD DELETE MEDIA
router.delete("/:refId", authenticate, canEdit, async (req, res) => {
  try {
    const existing = await db.query(
      `SELECT * FROM media_assets WHERE reference_id=$1 AND deleted_at IS NULL`,
      [req.params.refId],
    );

    if (!existing.rows[0]) {
      return res.status(404).json({ error: "Media asset not found." });
    }

    const record = existing.rows[0];

    // Delete associated B2 objects first or simultaneously
    if (isB2Configured()) {
      if (record.storage_key) {
        await deleteFromB2(record.storage_key).catch((err) =>
          console.error("B2 file delete error:", err.message),
        );
      }
      if (record.thumbnail_key) {
        await deleteFromB2(record.thumbnail_key).catch((err) =>
          console.error("B2 thumbnail delete error:", err.message),
        );
      }
    }

    await db.query(
      `UPDATE media_assets SET deleted_at=NOW() WHERE reference_id=$1`,
      [req.params.refId],
    );

    res.json({ message: "Media asset deleted successfully." });
  } catch (err) {
    console.error("Delete failed:", err);
    res.status(500).json({ error: "Delete failed." });
  }
});

// BULK ACTIONS
router.post("/bulk/action", authenticate, canEdit, async (req, res) => {
  const { action, refIds } = req.body;
  if (!Array.isArray(refIds) || refIds.length === 0)
    return res.status(400).json({ error: "No items selected." });

  try {
    const placeholders = refIds.map((_, i) => `$${i + 1}`).join(",");

    if (action === "delete") {
      // Clean B2 objects if configured
      if (isB2Configured()) {
        const records = await db.query(
          `SELECT storage_key, thumbnail_key FROM media_assets WHERE reference_id IN (${placeholders})`,
          refIds,
        );
        for (const row of records.rows) {
          if (row.storage_key)
            await deleteFromB2(row.storage_key).catch(() => {});
          if (row.thumbnail_key)
            await deleteFromB2(row.thumbnail_key).catch(() => {});
        }
      }
      await db.query(
        `UPDATE media_assets SET deleted_at=NOW() WHERE reference_id IN (${placeholders})`,
        refIds,
      );
    } else if (action === "publish") {
      await db.query(
        `UPDATE media_assets SET status='published', updated_at=NOW() WHERE reference_id IN (${placeholders})`,
        refIds,
      );
    } else if (action === "archive") {
      await db.query(
        `UPDATE media_assets SET status='archived', updated_at=NOW() WHERE reference_id IN (${placeholders})`,
        refIds,
      );
    } else if (action === "draft") {
      await db.query(
        `UPDATE media_assets SET status='draft', updated_at=NOW() WHERE reference_id IN (${placeholders})`,
        refIds,
      );
    }
    res.json({ message: `Bulk ${action} applied to ${refIds.length} items.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Bulk action failed." });
  }
});

// ─────────────────────────────────────────────────────────────────
// COLLECTIONS
// ─────────────────────────────────────────────────────────────────

router.get("/collections/list", authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM media_collections ORDER BY name ASC`,
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch collections." });
  }
});

router.post("/collections/create", authenticate, canEdit, async (req, res) => {
  try {
    const refId = await generateReferenceId("MCOL", new Date());
    const { name, description } = req.body;
    const result = await db.query(
      `INSERT INTO media_collections (reference_id, name, description, created_by) VALUES ($1,$2,$3,$4) RETURNING *`,
      [refId, name, description || null, req.user.id],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create collection." });
  }
});

export default router;
