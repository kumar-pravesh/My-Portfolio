import db from "./index.js";

const createTablesSQL = `
  CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      image VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'Live',
      icon VARCHAR(50) DEFAULT 'Monitor',
      tech_stack TEXT[] NOT NULL,
      live_link VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`;

const seedProjectsSQL = `
  INSERT INTO projects (title, image, description, status, icon, tech_stack, live_link)
  VALUES
  (
      'Go-Easy — Premium Urban Mobility',
      '/go-easy.png',
      'A full-stack luxury ride-hailing platform featuring a tiered pricing engine, secure OTP-based handshake protocol, and dedicated real-time dashboards for customers and drivers.',
      'Live',
      'Car',
      ARRAY['React', 'Spring Boot', 'PostgreSQL', 'TailwindCSS'],
      'https://go-easy-woad.vercel.app/'
  ),
  (
      'SiviOn Global Technologies',
      '/sivion.jpg',
      'A comprehensive corporate web portal serving as the face of SiviOn Global Technologies. Showcases services, company mission, and provides a streamlined interface for clients connecting with the firm.',
      'Live',
      'Monitor',
      ARRAY['ReactJS', 'Tailwind CSS', 'Vercel'],
      'https://sivion-global-technologies.vercel.app/'
  ),
  (
      'Clinixa – HMS (Public Web)',
      '/clinixa-public.jpg',
      'The public-facing portal for Clinixa Hospital Management System. Empowers patients to effortlessly discover hospital services, view specialized doctors, and engage with healthcare resources online.',
      'Live',
      'Activity',
      ARRAY['ReactJS', 'Node.js', 'PostgreSQL', 'Render'],
      'https://clinixa-frontend-sage.vercel.app/'
  ),
  (
      'Clinixa – Staff Portal',
      '/clinixa-staff.jpg',
      'A secure, role-based backend administrative interface. Enables hospital administration and medical staff to manage patient records securely, schedule appointments, and maintain clinical workflows.',
      'Live',
      'Users',
      ARRAY['ReactJS', 'JWT', 'PostgreSQL', 'REST API'],
      'https://clinixa-staff-portal.vercel.app/login'
  ),
  (
      'Aapthi Marketing Solutions',
      '/aapthi.jpg',
      'A dedicated platform for a digital marketing agency, built to showcase their portfolio of campaigns, lead generation strategies, and digital SEO services to prospective high-value clients.',
      'Live',
      'ShoppingCart',
      ARRAY['ReactJS', 'CSS3', 'Vite', 'Vercel'],
      'https://aapthi-marketing-solutions.vercel.app/'
  );
`;

export async function initDb() {
  if (!process.env.DATABASE_URL) {
    console.log(
      "Database initialization skipped: DATABASE_URL not configured.",
    );
    return;
  }

  try {
    console.log("Initializing database schema...");
    // Create tables
    await db.query(createTablesSQL);
    console.log("Database tables verified/created successfully.");

    // Check if projects table is empty
    const checkResult = await db.query("SELECT COUNT(*) FROM projects");
    const count = parseInt(checkResult.rows[0].count, 10);

    if (count === 0) {
      console.log("Projects table is empty. Seeding initial portfolio data...");
      await db.query(seedProjectsSQL);
      console.log("Successfully seeded initial projects.");
    } else {
      console.log(
        `Database already has ${count} project(s). Skipping seeding.`,
      );
    }
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
}
