import pool from "./connection.js";

async function migrate() {
  try {
    await pool.query("ALTER TABLE site_sections ADD COLUMN data_json TEXT DEFAULT NULL COMMENT 'JSON data for flexible fields (e.g. per-month calendar backgrounds)' AFTER text3_en");
    console.log("✅ data_json column added to site_sections");
  } catch (err) {
    console.error("Migration error:", err.message);
  } finally {
    await pool.end();
  }
}

migrate();
