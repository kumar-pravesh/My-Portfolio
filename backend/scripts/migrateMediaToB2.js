import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import db from "../db/index.js";
import {
  isB2Configured,
  generateObjectKey,
  uploadToB2,
} from "../services/b2Service.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

async function migrateMediaToB2() {
  console.log("🚀 Starting Media Storage Migration to Backblaze B2...\n");

  if (!isB2Configured()) {
    console.error(
      "❌ Migration aborted: Backblaze B2 credentials (B2_KEY_ID, B2_APPLICATION_KEY, B2_BUCKET_NAME) are missing in environment variables.",
    );
    process.exit(1);
  }

  try {
    const result = await db.query(
      `SELECT * FROM media_assets WHERE deleted_at IS NULL ORDER BY created_at ASC`,
    );

    const assets = result.rows;
    console.log(
      `📋 Found ${assets.length} total media asset records in Neon PostgreSQL.\n`,
    );

    let migratedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const item of assets) {
      console.log(`--------------------------------------------------`);
      console.log(
        `Processing Asset [${item.reference_id}] - "${item.title}" (${item.media_type})`,
      );

      let updatedStorageKey = item.storage_key;
      let updatedThumbnailKey = item.thumbnail_key;
      let needsDbUpdate = false;

      // 1. Migrate main file if storage_key is missing
      if (!updatedStorageKey && item.file_url) {
        let relativePath = null;

        if (item.file_url.includes("/uploads/")) {
          relativePath = item.file_url.split("/uploads/")[1];
        }

        if (relativePath) {
          const localPath = path.join(UPLOAD_DIR, relativePath);

          if (fs.existsSync(localPath)) {
            const originalName = item.file_name || path.basename(localPath);
            const key = generateObjectKey(item.media_type, originalName, false);
            console.log(
              ` 📤 Uploading main file to B2: ${localPath} -> ${key}`,
            );

            try {
              await uploadToB2({
                filePath: localPath,
                key,
                mimeType: item.mime_type || "application/octet-stream",
              });
              updatedStorageKey = key;
              needsDbUpdate = true;
              console.log(`  ✅ B2 Upload Successful: ${key}`);
            } catch (err) {
              console.error(
                `  ❌ Failed to upload main file for ${item.reference_id}:`,
                err.message,
              );
              failedCount++;
              continue;
            }
          } else {
            console.log(
              `  ⚠️ Local file not found at ${localPath}, skipping file upload.`,
            );
          }
        }
      } else if (updatedStorageKey) {
        console.log(
          `  ℹ️ Main file already migrated (key: ${updatedStorageKey}).`,
        );
      }

      // 2. Migrate thumbnail if thumbnail_key is missing
      if (!updatedThumbnailKey && item.thumbnail_url) {
        let relativeThumbPath = null;

        if (item.thumbnail_url.includes("/uploads/")) {
          relativeThumbPath = item.thumbnail_url.split("/uploads/")[1];
        }

        if (relativeThumbPath) {
          const localThumbPath = path.join(UPLOAD_DIR, relativeThumbPath);

          if (fs.existsSync(localThumbPath)) {
            const thumbKey = generateObjectKey(
              item.media_type,
              path.basename(localThumbPath),
              true,
            );
            console.log(
              `  📤 Uploading thumbnail to B2: ${localThumbPath} -> ${thumbKey}`,
            );

            try {
              await uploadToB2({
                filePath: localThumbPath,
                key: thumbKey,
                mimeType: "image/jpeg",
              });
              updatedThumbnailKey = thumbKey;
              needsDbUpdate = true;
              console.log(`  ✅ B2 Thumbnail Upload Successful: ${thumbKey}`);
            } catch (err) {
              console.error(
                `  ⚠️ Failed to upload thumbnail for ${item.reference_id}:`,
                err.message,
              );
            }
          }
        }
      } else if (updatedThumbnailKey) {
        console.log(
          `  ℹ️ Thumbnail already migrated (key: ${updatedThumbnailKey}).`,
        );
      }

      // 3. Update Neon PostgreSQL record
      if (needsDbUpdate) {
        await db.query(
          `UPDATE media_assets 
           SET storage_key = $1, thumbnail_key = $2, updated_at = NOW() 
           WHERE id = $3`,
          [updatedStorageKey, updatedThumbnailKey, item.id],
        );
        console.log(`  💾 Updated Neon metadata for [${item.reference_id}].`);
        migratedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log(`\n==================================================`);
    console.log(`🎉 Migration Complete Summary:`);
    console.log(` - Total Processed: ${assets.length}`);
    console.log(` - Migrated:        ${migratedCount}`);
    console.log(` - Skipped/Current: ${skippedCount}`);
    console.log(` - Failed:          ${failedCount}`);
    console.log(`==================================================\n`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Migration process error:", err);
    process.exit(1);
  }
}

migrateMediaToB2();
