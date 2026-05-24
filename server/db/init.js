import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function init() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    port: parseInt(process.env.DB_PORT || "3306"),
    multipleStatements: true,
  });

  try {
    const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    await conn.query(schema);
    console.log("✅ Database and tables created successfully");

    // Optionally seed data
    const dataPath = path.join(__dirname, "data.sql");
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, "utf8");
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
