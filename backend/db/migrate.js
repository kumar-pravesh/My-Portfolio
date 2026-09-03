import db from "./index.js";
import { backfillReferenceIds } from "./referenceId.js";
import bcrypt from "bcryptjs";
import { generateReferenceId } from "./referenceId.js";
import { seedInitialData } from "./seedData.js";

export async function runMigrations() {
  const client = await db.pool.connect();
  try {
    console.log("🔄 Running database migrations...");

    // ── Core system tables ──────────────────────────────────────
    await client.query(`CREATE TABLE IF NOT EXISTS ref_sequences (
      prefix VARCHAR(10) NOT NULL,
      year   INTEGER NOT NULL,
      last_seq INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (prefix, year)
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS users (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reference_id  VARCHAR(20) UNIQUE,
      full_name     VARCHAR(100) NOT NULL,
      email         VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role          VARCHAR(50) NOT NULL DEFAULT 'VIEWER',
      avatar_url    VARCHAR(255),
      is_active     BOOLEAN DEFAULT true,
      last_login    TIMESTAMP WITH TIME ZONE,
      created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`);

    // ── Migrate existing projects table ──────────────────────────
    const projectAlters = [
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS reference_id   VARCHAR(20) UNIQUE`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug           VARCHAR(200)`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS short_description TEXT`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS full_description  TEXT`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_name    VARCHAR(100)`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS industry       VARCHAR(100)`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS category       VARCHAR(100)`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type   VARCHAR(100)`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS services_provided TEXT[]`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date     DATE`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS completion_date DATE`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_url     VARCHAR(255)`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS hero_image     VARCHAR(255)`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS gallery        TEXT[]`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS challenges     TEXT`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS solutions      TEXT`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS results        TEXT`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS key_metrics    JSONB DEFAULT '{}'`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_featured    BOOLEAN DEFAULT false`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS display_order  INTEGER DEFAULT 0`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS seo_title      VARCHAR(200)`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS seo_description TEXT`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS seo_keywords   TEXT[]`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS published_at   TIMESTAMP WITH TIME ZONE`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_by     UUID`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS deleted_at     TIMESTAMP WITH TIME ZONE`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS show_on_home_current_work BOOLEAN DEFAULT false`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS home_display_order INTEGER DEFAULT 0`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS progress       INTEGER DEFAULT 0`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS expected_completion DATE`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS cta_enabled    BOOLEAN DEFAULT true`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS cta_label      VARCHAR(100) DEFAULT 'View Details'`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS visibility     VARCHAR(20) DEFAULT 'public'`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS visibility_config JSONB DEFAULT '{}'`,
    ];
    for (const sql of projectAlters) await client.query(sql);

    // Map old 'Live' → 'published'
    await client.query(
      `UPDATE projects SET status = 'published' WHERE status = 'Live'`,
    );
    // Set published_at for existing live records
    await client.query(
      `UPDATE projects SET published_at = created_at WHERE status = 'published' AND published_at IS NULL`,
    );

    // ── Migrate existing messages table ──────────────────────────
    const msgAlters = [
      `ALTER TABLE messages ADD COLUMN IF NOT EXISTS reference_id   VARCHAR(20) UNIQUE`,
      `ALTER TABLE messages ADD COLUMN IF NOT EXISTS phone          VARCHAR(30)`,
      `ALTER TABLE messages ADD COLUMN IF NOT EXISTS subject        VARCHAR(255)`,
      `ALTER TABLE messages ADD COLUMN IF NOT EXISTS status         VARCHAR(30) DEFAULT 'unread'`,
      `ALTER TABLE messages ADD COLUMN IF NOT EXISTS assigned_to    UUID`,
      `ALTER TABLE messages ADD COLUMN IF NOT EXISTS internal_notes TEXT`,
      `ALTER TABLE messages ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()`,
      `ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at     TIMESTAMP WITH TIME ZONE`,
    ];
    for (const sql of msgAlters) await client.query(sql);

    // ── CRM: Leads ──────────────────────────────────────────────
    await client.query(`CREATE TABLE IF NOT EXISTS leads (
      id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reference_id      VARCHAR(20) UNIQUE,
      source_contact_id INTEGER REFERENCES messages(id) ON DELETE SET NULL,
      full_name         VARCHAR(100) NOT NULL,
      company           VARCHAR(100),
      email             VARCHAR(100) NOT NULL,
      phone             VARCHAR(30),
      service_interested VARCHAR(100),
      budget            VARCHAR(50),
      message           TEXT,
      lead_source       VARCHAR(50) DEFAULT 'website',
      priority          VARCHAR(20) DEFAULT 'medium',
      status            VARCHAR(30) DEFAULT 'new',
      assigned_to       UUID REFERENCES users(id) ON DELETE SET NULL,
      follow_up_date    DATE,
      notes             TEXT,
      created_by        UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      deleted_at        TIMESTAMP WITH TIME ZONE
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS lead_activities (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lead_id    UUID REFERENCES leads(id) ON DELETE CASCADE,
      user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
      user_name  VARCHAR(100),
      action     VARCHAR(100) NOT NULL,
      old_value  VARCHAR(200),
      new_value  VARCHAR(200),
      notes      TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`);

    // ── Content: Services ────────────────────────────────────────
    await client.query(`CREATE TABLE IF NOT EXISTS services (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reference_id     VARCHAR(20) UNIQUE,
      name             VARCHAR(150) NOT NULL,
      slug             VARCHAR(200) UNIQUE,
      short_description TEXT,
      full_description  TEXT,
      icon             VARCHAR(100),
      features         TEXT[],
      technologies     TEXT[],
      image            VARCHAR(255),
      display_order    INTEGER DEFAULT 0,
      status           VARCHAR(20) DEFAULT 'draft',
      seo_title        VARCHAR(200),
      seo_description  TEXT,
      seo_keywords     TEXT[],
      created_by       UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      deleted_at       TIMESTAMP WITH TIME ZONE
    )`);

    // ── Content: Case Studies ────────────────────────────────────
    await client.query(`CREATE TABLE IF NOT EXISTS case_studies (
      id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reference_id      VARCHAR(20) UNIQUE,
      project_id        UUID,
      title             VARCHAR(200) NOT NULL,
      slug              VARCHAR(250) UNIQUE,
      client            VARCHAR(100),
      industry          VARCHAR(100),
      short_description TEXT,
      challenge         TEXT,
      solution          TEXT,
      technologies      TEXT[],
      results           TEXT,
      metrics           JSONB DEFAULT '{}',
      images            TEXT[],
      testimonial       TEXT,
      testimonial_author VARCHAR(100),
      is_featured       BOOLEAN DEFAULT false,
      status            VARCHAR(20) DEFAULT 'draft',
      seo_title         VARCHAR(200),
      seo_description   TEXT,
      seo_keywords      TEXT[],
      created_by        UUID REFERENCES users(id) ON DELETE SET NULL,
      published_at      TIMESTAMP WITH TIME ZONE,
      created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      deleted_at        TIMESTAMP WITH TIME ZONE
    )`);

    const caseStudyAlters = [
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS short_description        TEXT`,
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS business_challenge        TEXT`,
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS problem_statement         TEXT`,
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS pain_points                TEXT`,
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS objectives                 TEXT`,
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS solution_overview        TEXT`,
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS proposed_solution        TEXT`,
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS key_features              TEXT`,
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS implementation_approach   TEXT`,
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS architecture_overview    TEXT`,
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS integrations               TEXT`,
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS architecture_diagram     TEXT`,
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS results_summary           TEXT`,
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS business_impact           TEXT`,
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS performance_improvements  TEXT`,
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS key_metrics               TEXT`,
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS roi_cost_savings          TEXT`,
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS before_state              TEXT`,
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS after_state               TEXT`,
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS cover_image               TEXT`,
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS hero_image                TEXT`,
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS screenshots               TEXT[]`,
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS gallery                   TEXT[]`,
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS related_project           VARCHAR(100)`,
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS related_services          TEXT`,
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS related_testimonial       TEXT`,
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS related_blogs             TEXT`,
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS social_share_image        TEXT`,
    ];
    for (const sql of caseStudyAlters) await client.query(sql);

    // ── Content: Blog ────────────────────────────────────────────
    await client.query(`CREATE TABLE IF NOT EXISTS blog_posts (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reference_id    VARCHAR(20) UNIQUE,
      title           VARCHAR(250) NOT NULL,
      slug            VARCHAR(300) UNIQUE,
      excerpt         TEXT,
      content         TEXT,
      featured_image  VARCHAR(255),
      author_id       UUID REFERENCES users(id) ON DELETE SET NULL,
      category        VARCHAR(100),
      tags            TEXT[],
      status          VARCHAR(20) DEFAULT 'draft',
      scheduled_at    TIMESTAMP WITH TIME ZONE,
      seo_title       VARCHAR(200),
      seo_description TEXT,
      seo_keywords    TEXT[],
      published_at    TIMESTAMP WITH TIME ZONE,
      created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      deleted_at      TIMESTAMP WITH TIME ZONE
    )`);

    const blogAlters = [
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS image_alt             TEXT`,
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS image_caption         TEXT`,
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_name           TEXT`,
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS is_featured           BOOLEAN DEFAULT false`,
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS reading_time          VARCHAR(50)`,
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS canonical_url         TEXT`,
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS robots_meta           VARCHAR(100)`,
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS og_title              TEXT`,
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS og_description        TEXT`,
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS og_image              TEXT`,
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS social_title          TEXT`,
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS social_description    TEXT`,
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS social_image          TEXT`,
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS related_projects      TEXT[]`,
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS related_case_studies   TEXT[]`,
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS related_services       TEXT[]`,
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS related_blogs          TEXT[]`,
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS cta_title             TEXT`,
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS cta_description       TEXT`,
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS cta_button_text       TEXT`,
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS cta_url               TEXT`,
    ];
    for (const sql of blogAlters) await client.query(sql);

    // ── Content: Testimonials ─────────────────────────────────────
    await client.query(`CREATE TABLE IF NOT EXISTS testimonials (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reference_id  VARCHAR(20) UNIQUE,
      client_name   VARCHAR(100) NOT NULL,
      designation   VARCHAR(100),
      company       VARCHAR(100),
      profile_image VARCHAR(255),
      company_logo  VARCHAR(255),
      testimonial   TEXT NOT NULL,
      rating        INTEGER DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
      is_featured   BOOLEAN DEFAULT false,
      display_order INTEGER DEFAULT 0,
      status        VARCHAR(20) DEFAULT 'draft',
      created_by    UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      deleted_at    TIMESTAMP WITH TIME ZONE
    )`);

    // ── Media Library ─────────────────────────────────────────────
    await client.query(`CREATE TABLE IF NOT EXISTS media (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reference_id  VARCHAR(20) UNIQUE,
      filename      VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      mime_type     VARCHAR(100) NOT NULL,
      size_bytes    BIGINT,
      url           VARCHAR(500) NOT NULL,
      folder        VARCHAR(100) DEFAULT 'general',
      alt_text      VARCHAR(255),
      uploaded_by   UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      deleted_at    TIMESTAMP WITH TIME ZONE
    )`);

    // ── Notifications ─────────────────────────────────────────────
    await client.query(`CREATE TABLE IF NOT EXISTS notifications (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reference_id    VARCHAR(20) UNIQUE,
      user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
      title           VARCHAR(255) NOT NULL,
      body            TEXT,
      type            VARCHAR(50),
      related_table   VARCHAR(50),
      related_ref_id  VARCHAR(20),
      is_read         BOOLEAN DEFAULT false,
      created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`);

    // ── Activity / Audit Log ──────────────────────────────────────
    await client.query(`CREATE TABLE IF NOT EXISTS activity_logs (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reference_id  VARCHAR(20) UNIQUE,
      user_id       UUID,
      user_name     VARCHAR(100),
      action        VARCHAR(50) NOT NULL,
      module        VARCHAR(50) NOT NULL,
      record_ref_id VARCHAR(20),
      record_title  VARCHAR(255),
      changes       JSONB,
      ip_address    VARCHAR(45),
      user_agent    TEXT,
      created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`);

    // ── Settings ──────────────────────────────────────────────────
    await client.query(`CREATE TABLE IF NOT EXISTS settings (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      key        VARCHAR(100) UNIQUE NOT NULL,
      value      JSONB,
      updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`);

    // ── Media Library ─────────────────────────────────────────────
    await client.query(`CREATE TABLE IF NOT EXISTS media_assets (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reference_id    VARCHAR(20) UNIQUE,
      title           VARCHAR(250) NOT NULL,
      description     TEXT,
      media_type      VARCHAR(50) NOT NULL DEFAULT 'image',
      file_url        VARCHAR(500),
      file_name       VARCHAR(300),
      file_size       BIGINT,
      mime_type       VARCHAR(100),
      width           INTEGER,
      height          INTEGER,
      duration        VARCHAR(50),
      aspect_ratio    VARCHAR(20),
      alt_text        TEXT,
      caption         TEXT,
      thumbnail_url   VARCHAR(500),
      external_url    VARCHAR(500),
      external_provider VARCHAR(50),
      category        VARCHAR(100),
      tags            TEXT[],
      status          VARCHAR(20) DEFAULT 'draft',
      visibility      VARCHAR(20) DEFAULT 'public',
      is_featured     BOOLEAN DEFAULT false,
      display_order   INTEGER DEFAULT 0,
      collection_id   UUID,
      related_project    VARCHAR(20),
      related_case_study VARCHAR(20),
      related_blog       VARCHAR(20),
      related_service    VARCHAR(20),
      created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
      published_at    TIMESTAMP WITH TIME ZONE,
      created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      deleted_at      TIMESTAMP WITH TIME ZONE
    )`);

    await client.query(
      `ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS storage_key VARCHAR(500)`,
    );
    await client.query(
      `ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS thumbnail_key VARCHAR(500)`,
    );

    await client.query(`CREATE TABLE IF NOT EXISTS media_collections (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reference_id VARCHAR(20) UNIQUE,
      name         VARCHAR(200) NOT NULL,
      description  TEXT,
      cover_image  VARCHAR(500),
      status       VARCHAR(20) DEFAULT 'active',
      created_by   UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`);

    const mediaIndexes = [
      `CREATE INDEX IF NOT EXISTS idx_media_ref     ON media_assets(reference_id)`,
      `CREATE INDEX IF NOT EXISTS idx_media_type    ON media_assets(media_type)`,
      `CREATE INDEX IF NOT EXISTS idx_media_status  ON media_assets(status)`,
      `CREATE INDEX IF NOT EXISTS idx_media_deleted ON media_assets(deleted_at)`,
      `CREATE INDEX IF NOT EXISTS idx_media_colln   ON media_assets(collection_id)`,
    ];
    for (const sql of mediaIndexes) await client.query(sql);

    // ── Indexes ───────────────────────────────────────────────────
    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_projects_ref      ON projects(reference_id)`,
      `CREATE INDEX IF NOT EXISTS idx_projects_status   ON projects(status)`,
      `CREATE INDEX IF NOT EXISTS idx_projects_deleted  ON projects(deleted_at)`,
      `CREATE INDEX IF NOT EXISTS idx_messages_ref      ON messages(reference_id)`,
      `CREATE INDEX IF NOT EXISTS idx_messages_status   ON messages(status)`,
      `CREATE INDEX IF NOT EXISTS idx_leads_ref         ON leads(reference_id)`,
      `CREATE INDEX IF NOT EXISTS idx_leads_status      ON leads(status)`,
      `CREATE INDEX IF NOT EXISTS idx_leads_assigned    ON leads(assigned_to)`,
      `CREATE INDEX IF NOT EXISTS idx_notifs_user       ON notifications(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_notifs_read       ON notifications(is_read)`,
      `CREATE INDEX IF NOT EXISTS idx_logs_module       ON activity_logs(module)`,
      `CREATE INDEX IF NOT EXISTS idx_logs_user         ON activity_logs(user_id)`,
    ];
    for (const sql of indexes) await client.query(sql);

    console.log("✅ Schema migrations complete.");

    // ── Column Alterations ─────────────────────────────────────────
    await client.query(
      `ALTER TABLE services ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0`,
    );
    await client.query(
      `ALTER TABLE services ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false`,
    );
    await client.query(
      `ALTER TABLE services ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'public'`,
    );
    await client.query(
      `ALTER TABLE services ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE`,
    );

    await client.query(
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0`,
    );
    await client.query(
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false`,
    );
    await client.query(
      `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'public'`,
    );

    await client.query(
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0`,
    );
    await client.query(
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false`,
    );
    await client.query(
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'public'`,
    );

    await client.query(
      `ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0`,
    );
    await client.query(
      `ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false`,
    );
    await client.query(
      `ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'public'`,
    );
    await client.query(
      `ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE`,
    );

    await client.query(
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0`,
    );
    await client.query(
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false`,
    );
    await client.query(
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'public'`,
    );

    // ── Backfill reference IDs ────────────────────────────────────
    await backfillReferenceIds("projects", "PROJ");
    await backfillReferenceIds("messages", "CONT");

    // ── Seed default admin user ───────────────────────────────────
    const adminEmail = process.env.ADMIN_EMAIL || "praveshkumar5502@gmail.com";
    const adminPass = process.env.ADMIN_PASSWORD || "Admin@123456";
    const existing = await client.query(
      `SELECT id FROM users WHERE email = $1`,
      [adminEmail],
    );

    if (existing.rows.length === 0) {
      const hash = await bcrypt.hash(adminPass, 12);
      const refId = await generateReferenceId("USER", new Date());
      await client.query(
        `INSERT INTO users (reference_id, full_name, email, password_hash, role)
         VALUES ($1, $2, $3, $4, 'SUPER_ADMIN')`,
        [refId, "Pravesh Kumar", adminEmail, hash],
      );
      console.log(`✅ Admin user seeded: ${adminEmail} / ${adminPass}`);
    } else {
      console.log("✅ Admin user already exists, skipping seed.");
    }

    // ── Seed default settings ─────────────────────────────────────
    await client.query(
      `UPDATE settings SET value = '"Portfolio"'::jsonb WHERE key = 'company_name' AND (value = '"Pravesh Kumar"'::jsonb OR value IS NULL)`,
    );

    const defaultSettings = [
      { key: "site_logo_text", value: "Portfolio" },
      { key: "owner_name", value: "Pravesh Kumar" },
      { key: "hero_greeting", value: "Hello, It's Me" },
      {
        key: "hero_professional_title",
        value: "Software Engineer · Full-Stack Developer",
      },
      {
        key: "hero_tagline",
        value:
          "Architecting scalable applications, intelligent systems & digital experiences.",
      },
      { key: "company_name", value: "Portfolio" },
      { key: "company_email", value: "praveshkumar5502@gmail.com" },
      { key: "company_phone", value: "+91 9128521727" },
      { key: "company_address", value: "Banka, Bihar, India" },
      {
        key: "seo_title",
        value: "Pravesh Kumar — Java Full Stack Developer Portfolio",
      },
      {
        key: "seo_description",
        value:
          "Portfolio of Pravesh Kumar, Java Full Stack Developer specializing in Spring Boot, React, and Enterprise Architecture.",
      },
      {
        key: "hero_badge",
        value: "Available for Senior Full Stack & Lead Roles",
      },
      {
        key: "hero_title",
        value: "Building Enterprise Digital Experiences That Matter",
      },
      { key: "hero_highlight", value: "Java Full Stack Developer" },
      {
        key: "hero_subtitle",
        value:
          "Architecting scalable web applications, enterprise microservices, modern UIs, and robust cloud solutions.",
      },
      {
        key: "hero_typed_words",
        value: [
          "Java Full Stack Developer",
          "Spring Boot & Microservices Specialist",
          "React JS Frontend Architect",
          "Enterprise REST API Developer",
          "Cloud Systems Integrator",
        ],
      },
      { key: "resume_url", value: "/resume.pdf" },
      { key: "hero_cta_primary", value: "Download CV" },
      { key: "hero_cta_secondary", value: "Explore Projects" },
      {
        key: "about_heading",
        value: "Associate IT Engineer & Full Stack Architect",
      },
      {
        key: "about_text",
        value:
          "Dedicated software engineer with expertise in Java 21, Spring Boot microservices, React 19, Neon PostgreSQL, and clean architecture. Experienced in delivering production-grade enterprise software.",
      },
      { key: "github_url", value: "https://github.com/kumar-pravesh" },
      { key: "linkedin_url", value: "https://linkedin.com/in/pravesh-kumar" },
    ];
    for (const s of defaultSettings) {
      await client.query(
        `INSERT INTO settings (key, value) VALUES ($1, $2::jsonb)
         ON CONFLICT (key) DO NOTHING`,
        [s.key, JSON.stringify(s.value)],
      );
    }

    // ── Seed initial content tables ──────────────────────────────
    await seedInitialData();

    console.log("✅ All migrations and seeds complete.");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    throw err;
  } finally {
    client.release();
  }
}
