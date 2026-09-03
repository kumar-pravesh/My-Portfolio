import db from "./index.js";

// Prefix map for all entities
export const REF_PREFIXES = {
  projects: "PROJ",
  leads: "LEAD",
  messages: "CONT",
  services: "SERV",
  case_studies: "CASE",
  blog_posts: "BLOG",
  testimonials: "TEST",
  media: "MEDI",
  users: "USER",
  notifications: "NOTI",
  activity_logs: "AUDT",
};

/**
 * Generates a unique, atomic, human-readable reference ID.
 * Format: PREFIX-YYYY-XXXXX (e.g. PROJ-2026-00001)
 * Uses DB-level atomic upsert to prevent duplicates under concurrency.
 * @param {string} prefix - e.g. 'PROJ'
 * @param {Date} createdAt - determines the YYYY portion
 */
export async function generateReferenceId(
  prefix,
  createdAt = new Date(),
  clientOverride = null,
) {
  const year =
    createdAt instanceof Date && !isNaN(createdAt)
      ? createdAt.getFullYear()
      : new Date().getFullYear();
  const client = clientOverride || (await db.pool.connect());
  const isSelfClient = !clientOverride;
  try {
    if (isSelfClient) await client.query("BEGIN");
    const result = await client.query(
      `INSERT INTO ref_sequences (prefix, year, last_seq)
       VALUES ($1, $2, 1)
       ON CONFLICT (prefix, year)
       DO UPDATE SET last_seq = ref_sequences.last_seq + 1
       RETURNING last_seq`,
      [prefix, year],
    );
    if (isSelfClient) await client.query("COMMIT");
    const seq = result.rows[0].last_seq;
    return `${prefix}-${year}-${String(seq).padStart(5, "0")}`;
  } catch (err) {
    if (isSelfClient) await client.query("ROLLBACK");
    throw err;
  } finally {
    if (isSelfClient) client.release();
  }
}

/**
 * Backfills reference IDs for records that don't have one yet.
 * Safe to run multiple times (idempotent).
 */
export async function backfillReferenceIds(tableName, prefix) {
  try {
    const rows = await db.query(
      `SELECT id, created_at FROM ${tableName} WHERE reference_id IS NULL ORDER BY created_at ASC`,
    );
    for (const row of rows.rows) {
      const refId = await generateReferenceId(prefix, new Date(row.created_at));
      await db.query(
        `UPDATE ${tableName} SET reference_id = $1 WHERE id = $2`,
        [refId, row.id],
      );
    }
    console.log(
      `Backfilled ${rows.rows.length} reference IDs for ${tableName}`,
    );
  } catch (err) {
    console.warn(
      `Warning: Backfill reference IDs skipped for ${tableName}:`,
      err.message,
    );
  }
}
