-- Clear existing projects before seeding
TRUNCATE TABLE projects RESTART IDENTITY CASCADE;

-- Insert initial projects
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
