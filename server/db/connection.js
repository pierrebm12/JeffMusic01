import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const pool = mysql.createPool({
  host: process.env.DB_HOST || process.env.MYSQL_DB_HOST || process.env.MYSQL_HOST || "localhost",
  user: process.env.DB_USER || process.env.MYSQL_DB_USER || process.env.MYSQL_USER || "root",
  password: process.env.DB_PASSWORD || process.env.MYSQL_DB_PASSWORD || process.env.MYSQL_PASSWORD || "",
  database: process.env.DB_NAME || process.env.MYSQL_DB_NAME || process.env.MYSQL_DATABASE || "jeffmusic",
  port: parseInt(process.env.DB_PORT || process.env.MYSQL_DB_PORT || process.env.MYSQL_PORT || "3306"),
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
