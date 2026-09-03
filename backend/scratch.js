import db from "./db/index.js";
async function run() {
  try {
    const slug = "go-easy-premium-urban-mobility-00001";
    const result = await db.query(
      `SELECT * FROM projects
       WHERE (slug = $1 OR reference_id = $1) 
         AND status IN ('published', 'in_progress', 'upcoming') 
         AND (visibility = 'public' OR visibility IS NULL)
         AND deleted_at IS NULL`,
      [slug],
    );
    if (!result.rows[0]) {
      console.log("Project not found");
      process.exit();
    }

    console.log("Project found", result.rows[0].reference_id);

    const media = await db.query(
      `SELECT * FROM media_assets
       WHERE related_project = $1 AND status = 'published' AND visibility = 'public' AND deleted_at IS NULL
       ORDER BY display_order ASC`,
      [result.rows[0].reference_id],
    );
    console.log("Media found", media.rows.length);

    const caseStudy = await db.query(
      `SELECT reference_id, slug, title, short_description, client_name FROM case_studies
       WHERE related_project = $1 AND status = 'published' AND deleted_at IS NULL LIMIT 1`,
      [result.rows[0].reference_id],
    );
    console.log("Case study found", caseStudy.rows.length);
  } catch (e) {
    console.error("ERROR", e.message);
  }
  process.exit();
}
run();
