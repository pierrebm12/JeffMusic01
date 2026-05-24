import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const DB_NAME = process.env.DB_NAME || process.env.MYSQL_DB_NAME || process.env.MYSQL_DATABASE || "jeffmusic";

async function init() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || process.env.MYSQL_DB_HOST || process.env.MYSQL_HOST || "localhost",
    user: process.env.DB_USER || process.env.MYSQL_DB_USER || process.env.MYSQL_USER || "root",
    password: process.env.DB_PASSWORD || process.env.MYSQL_DB_PASSWORD || process.env.MYSQL_PASSWORD || "",
    port: parseInt(process.env.DB_PORT || process.env.MYSQL_DB_PORT || process.env.MYSQL_PORT || "3306"),
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
