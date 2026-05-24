import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "url";
import dotenv from "dotenv";

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

const DB_NAME = mysqlUrlConfig.database || process.env.DB_NAME || process.env.MYSQLDB_DATABASE || process.env.MYSQL_DB_NAME || process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || "jeffmusic";

async function init() {
  const conn = await mysql.createConnection({
    host: mysqlUrlConfig.host || process.env.DB_HOST || process.env.MYSQLDB_HOST || process.env.MYSQL_DB_HOST || process.env.MYSQL_HOST || process.env.MYSQLHOST || "localhost",
    user: mysqlUrlConfig.user || process.env.DB_USER || process.env.MYSQLDB_USER || process.env.MYSQL_DB_USER || process.env.MYSQL_USER || process.env.MYSQLUSER || "root",
    password: mysqlUrlConfig.password || process.env.DB_PASSWORD || process.env.MYSQLDB_PASSWORD || process.env.MYSQL_DB_PASSWORD || process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD || "",
    port: mysqlUrlConfig.port || parseInt(process.env.DB_PORT || process.env.MYSQLDB_PORT || process.env.MYSQL_DB_PORT || process.env.MYSQL_PORT || process.env.MYSQLPORT || "3306"),
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    multipleStatements: true,
  });

  try {
    const schema = fs
      .readFileSync(path.join(__dirname, "schema.sql"), "utf8")
      .replace(/__DB_NAME__/g, DB_NAME);
    await conn.query(schema);
    console.log("✅ Database and tables created successfully");

    // Optionally seed data
    const dataPath = path.join(__dirname, "data.sql");
    if (fs.existsSync(dataPath)) {
      const data = fs
        .readFileSync(dataPath, "utf8")
        .replace(/__DB_NAME__/g, DB_NAME);
      await conn.query(data);
      console.log("✅ Seed data inserted successfully");
    }
  } catch (err) {
    console.error("❌ Error initializing database:", err.message);
  } finally {
    await conn.end();
  }
}

init();
