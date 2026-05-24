import pool from "./connection.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function escape(val) {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number") return val;
  return `'${String(val).replace(/'/g, "''").replace(/\\/g, "\\\\")}'`;
}

function rowsToInsert(table, columns, rows) {
  if (rows.length === 0) return "";
  const cols = columns.map(c => `\`${c}\``).join(", ");
  const values = rows.map(row => {
    const vals = columns.map(col => escape(row[col])).join(", ");
    return `(${vals})`;
  }).join(",\n");
  return `INSERT IGNORE INTO \`${table}\` (${cols}) VALUES\n${values};\n`;
}

async function dumpTable(table, orderCol) {
  const [rows] = await pool.query(`SELECT * FROM \`${table}\` ORDER BY \`${orderCol}\` ASC`);
  if (rows.length === 0) return { sql: "", count: 0 };
  const columns = Object.keys(rows[0]).filter(c => c !== "id" && c !== "created_at" && c !== "updated_at");
  return { sql: rowsToInsert(table, columns, rows), count: rows.length };
}

async function dump() {
  try {
    let output = "USE __DB_NAME__;\n\n";

    const { sql: sectionsSql, count: sectionsCount } = await dumpTable("site_sections", "section_key");
    output += `-- ============================================================\n-- SITE SECTIONS (${sectionsCount} rows)\n-- ============================================================\n`;
    output += sectionsSql + "\n";

    const { sql: showsSql, count: showsCount } = await dumpTable("shows", "day");
    output += `-- ============================================================\n-- SHOWS (${showsCount} rows)\n-- ============================================================\n`;
    output += showsSql + "\n";

    const { sql: photosSql, count: photosCount } = await dumpTable("photos", "sort_order");
    output += `-- ============================================================\n-- PHOTOS (${photosCount} rows)\n-- ============================================================\n`;
    output += photosSql + "\n";

    const { sql: videosSql, count: videosCount } = await dumpTable("videos", "sort_order");
    output += `-- ============================================================\n-- VIDEOS (${videosCount} rows)\n-- ============================================================\n`;
    output += videosSql + "\n";

    const filePath = path.join(__dirname, "data.sql");
    fs.writeFileSync(filePath, output, "utf8");
    console.log(`✅ data.sql generated successfully`);
    console.log(`   - ${sectionsCount} site_sections`);
    console.log(`   - ${showsCount} shows`);
    console.log(`   - ${photosCount} photos`);
    console.log(`   - ${videosCount} videos`);
  } catch (err) {
    console.error("❌ Error dumping data:", err.message);
  } finally {
    await pool.end();
  }
}

dump();
