import { Router } from "express";
import pool from "../db/connection.js";
import { sectionRules, idRule, handleValidation } from "../middleware/validate.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT section_key, media_url, media_type, title_es, title_en, subtitle_es, subtitle_en, text1_es, text1_en, text2_es, text2_en, text3_es, text3_en, data_json, updated_at FROM site_sections ORDER BY section_key ASC");
    const map = {};
    for (const row of rows) {
      map[row.section_key] = row;
    }
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const [rows] = await pool.query("SELECT section_key, media_url, media_type, title_es, title_en, subtitle_es, subtitle_en, text1_es, text1_en, text2_es, text2_en, text3_es, text3_en, data_json, updated_at FROM site_sections WHERE section_key = ?", [key]);
    if (rows.length === 0) return res.status(404).json({ error: "Section not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:key", sectionRules, handleValidation, async (req, res) => {
  try {
    const { key } = req.params;
    const { mediaUrl, mediaType, titleEs, titleEn, subtitleEs, subtitleEn, text1Es, text1En, text2Es, text2En, text3Es, text3En, dataJson } = req.body;

    const dataJsonStr = dataJson ? (typeof dataJson === "string" ? dataJson : JSON.stringify(dataJson)) : null;

    await pool.query(
      `INSERT INTO site_sections (section_key, media_url, media_type, title_es, title_en, subtitle_es, subtitle_en, text1_es, text1_en, text2_es, text2_en, text3_es, text3_en, data_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        media_url = COALESCE(VALUES(media_url), media_url),
        media_type = COALESCE(VALUES(media_type), media_type),
        title_es = COALESCE(VALUES(title_es), title_es),
        title_en = COALESCE(VALUES(title_en), title_en),
        subtitle_es = COALESCE(VALUES(subtitle_es), subtitle_es),
        subtitle_en = COALESCE(VALUES(subtitle_en), subtitle_en),
        text1_es = COALESCE(VALUES(text1_es), text1_es),
        text1_en = COALESCE(VALUES(text1_en), text1_en),
        text2_es = COALESCE(VALUES(text2_es), text2_es),
        text2_en = COALESCE(VALUES(text2_en), text2_en),
        text3_es = COALESCE(VALUES(text3_es), text3_es),
        text3_en = COALESCE(VALUES(text3_en), text3_en),
        data_json = COALESCE(VALUES(data_json), data_json)`,
      [key, mediaUrl ?? null, mediaType ?? null, titleEs ?? null, titleEn ?? null, subtitleEs ?? null, subtitleEn ?? null, text1Es ?? null, text1En ?? null, text2Es ?? null, text2En ?? null, text3Es ?? null, text3En ?? null, dataJsonStr]
    );
    const [updated] = await pool.query("SELECT section_key, media_url, media_type, title_es, title_en, subtitle_es, subtitle_en, text1_es, text1_en, text2_es, text2_en, text3_es, text3_en, data_json, updated_at FROM site_sections WHERE section_key = ?", [key]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
