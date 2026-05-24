import { Router } from "express";
import pool from "../db/connection.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const [shows, photos, videos, sections] = await Promise.all([
      pool.query("SELECT id, place, day, time, available, created_at, updated_at FROM shows ORDER BY created_at ASC"),
      pool.query("SELECT id, url, title, title_en, sort_order, created_at, updated_at FROM photos ORDER BY sort_order ASC"),
      pool.query("SELECT id, url, title, title_en, sort_order, created_at, updated_at FROM videos ORDER BY sort_order ASC"),
      pool.query("SELECT section_key, media_url, media_type, title_es, title_en, subtitle_es, subtitle_en, text1_es, text1_en, text2_es, text2_en, text3_es, text3_en, data_json FROM site_sections"),
    ]);
    const sectionsMap = {};
    for (const row of sections[0]) {
      sectionsMap[row.section_key] = row;
    }
    res.json({ shows: shows[0], photos: photos[0], videos: videos[0], sections: sectionsMap });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
