import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Parse MYSQL_URL if provided (Railway auto-injects this)
let mysqlUrlConfig = {};
if (process.env.MYSQL_URL) {
  try {
    const u = parse(process.env.MYSQL_URL);
    mysqlUrlConfig = {
      host: u.hostname,
      user: decodeURIComponent(u.auth?.split(":")[0] || ""),
      password: decodeURIComponent(u.auth?.split(":")[1] || ""),
      database: u.pathname?.replace(/^\//, "") || "",
      port: parseInt(u.port || "3306"),
    };
  } catch { /* ignore invalid URL */ }
}

// Enable SSL by default when MYSQL_URL is present (Railway MySQL requires SSL)
const isRailway = !!(mysqlUrlConfig.host || process.env.MYSQL_URL || process.env.MYSQL_HOST || process.env.MYSQLHOST);
const sslEnabled = process.env.DB_SSL === "true" || (isRailway && process.env.DB_SSL !== "false");

const pool = mysql.createPool({
  host: mysqlUrlConfig.host || process.env.DB_HOST  || "localhost",
  user: mysqlUrlConfig.user || process.env.DB_USER  || "root",
  password: mysqlUrlConfig.password || process.env.DB_PASSWORD || "",
  database: mysqlUrlConfig.database || process.env.DB_NAME || "jeffmusic",
  port: mysqlUrlConfig.port || parseInt(process.env.DB_PORT || "3306"),
  ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
  connectTimeout: 15000,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 5,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

pool.on("connection", () => console.log("🔌 DB connection acquired"));
pool.on("release", () => console.log("🔌 DB connection released"));
pool.on("acquire", () => {});
pool.on("enqueue", () => console.warn("⚠️ DB query queued - all connections busy"));

export default pool;
