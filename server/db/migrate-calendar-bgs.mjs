// Run this locally to upload existing calendar backgrounds to Cloudinary
// Usage:  node server/db/migrate-calendar-bgs.mjs

import pool from "../db/connection.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error("Cloudinary credentials not found in server/.env");
  process.exit(1);
}

cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

async function uploadStream(filePath) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, { folder: "jeffmusic/photos" }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

async function migrate() {
  const [r] = await pool.query("SELECT data_json FROM site_sections WHERE section_key = 'calendar'");
  const raw = r[0]?.data_json;
  if (!raw) { console.log("No calendar data found"); await pool.end(); return; }

  const data = typeof raw === "string" ? JSON.parse(raw) : raw;
  const uploadsDir = path.join(process.cwd(), "uploads", "photos");

  for (const key of Object.keys(data)) {
    const val = data[key];
    if (typeof val === "string" && val.startsWith("/api/uploads/") && !val.startsWith("https://")) {
      const filename = path.basename(val);
      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        console.log("Uploading", filename, "to Cloudinary...");
        const result = await uploadStream(filePath);
        data[key] = result.secure_url;
        console.log("  ->", result.secure_url);
      } else {
        console.log("File not found locally:", filePath, "(skipping)");
        data[key] = "";
      }
    }
  }

  await pool.query("UPDATE site_sections SET data_json = ? WHERE section_key = 'calendar'", [JSON.stringify(data)]);
  console.log("\nUpdated calendar data_json with Cloudinary URLs");
  await pool.end();
}

migrate().catch(e => console.error(e.message));
