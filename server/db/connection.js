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

const pool = mysql.createPool({
  host: mysqlUrlConfig.host || process.env.DB_HOST || process.env.MYSQLHOST || process.env.MYSQL_DB_HOST || process.env.MYSQL_HOST || "localhost",
  user: mysqlUrlConfig.user || process.env.DB_USER || process.env.MYSQLUSER || process.env.MYSQL_DB_USER || process.env.MYSQL_USER || "root",
  password: mysqlUrlConfig.password || process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || process.env.MYSQL_DB_PASSWORD || process.env.MYSQL_PASSWORD || "",
  database: mysqlUrlConfig.database || process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.MYSQL_DB_NAME || process.env.MYSQL_DATABASE || "jeffmusic",
  port: mysqlUrlConfig.port || parseInt(process.env.DB_PORT || process.env.MYSQLPORT || process.env.MYSQL_DB_PORT || process.env.MYSQL_PORT || "3306"),
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

pool.on("connection", () => console.log("🔌 DB connection acquired"));
pool.on("release", () => console.log("🔌 DB connection released"));
pool.on("acquire", () => {});
pool.on("enqueue", () => console.warn("⚠️ DB query queued - all connections busy"));

export default pool;
