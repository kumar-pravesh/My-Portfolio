import pg from "pg";
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import dotenv from "dotenv";

dotenv.config();

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    "WARNING: DATABASE_URL is not set in environment variables. Database operations will fail.",
  );
}

const isNeon = connectionString && connectionString.includes("neon.tech");
const Pool = isNeon ? NeonPool : pg.Pool;

const pool = new Pool({
  connectionString,
  ...(isNeon
    ? {}
    : {
        ssl:
          connectionString && connectionString.includes("render.com")
            ? { rejectUnauthorized: false }
            : false,
      }),
});

pool.on("connect", () => {
  console.log("PostgreSQL database connection pool established.");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle database client", err);
});

export default {
  query: (text, params) => pool.query(text, params),
  pool,
};
