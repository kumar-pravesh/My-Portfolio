import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { logger } from "./utils/logger.js";
import { runMigrations } from "./db/migrate.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.js";

dotenv.config();

Sentry.init({
  dsn: process.env.SENTRY_DSN || "",
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// ── Sentry Request Handler ────────────────────────────────────────
Sentry.setupExpressErrorHandler(app);

// ── Logging ───────────────────────────────────────────────────────
app.use(pinoHttp({ logger }));
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CORS_ORIGIN || "http://localhost:5173",
  "http://localhost:5174", // admin app
];
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ── Rate Limiting ─────────────────────────────────────────────────
app.use(
  "/api/auth/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: "Too many login attempts. Try again later." },
  }),
);
app.use(
  "/api/contact/public",
  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: { error: "Too many submissions. Try again later." },
  }),
);

// ── Body parsing ──────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Static uploads ────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ────────────────────────────────────────────────────────
// Auth
app.use("/api/auth", authRoutes);

// Admin dashboard
app.use("/api/admin", adminRoutes);

// Content (public + admin)
app.use("/api/projects", projectRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/leads", leadRoutes);

// Shared content CMS (services, case_studies, blog_posts, testimonials)
app.use("/api/content", contentRoutes);

// Administration
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/activity-logs", activityRoutes);

// Global search
app.use("/api/search", searchRoutes);

// Media Library
app.use("/api/media", mediaRoutes);

// Settings
app.use("/api/settings", settingsRoutes);

// ── API Documentation ─────────────────────────────────────────────
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Health check ──────────────────────────────────────────────────
app.get("/health", (req, res) =>
  res.json({ status: "UP", timestamp: new Date().toISOString() }),
);

app.get("/", (req, res) => res.send("Portfolio API Server is running."));

// ── Global error handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error({ err }, err.message);
  res
    .status(500)
    .json({
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error."
          : err.message,
    });
});

// ── Start ─────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  if (process.env.DATABASE_URL) {
    await runMigrations();
  } else {
    console.warn("⚠️  DATABASE_URL not set — skipping migrations.");
  }
});
// Auto-trigger migrations & seed on server start
