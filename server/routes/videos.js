import { Router } from "express";
import path from "path";
import fs from "fs";
import pool from "../db/connection.js";
import { mediaRules, partialMediaRules, idRule, handleValidation } from "../middleware/validate.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, url, title, title_en, sort_order, created_at, updated_at FROM videos ORDER BY sort_order ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", mediaRules, handleValidation, async (req, res) => {
  try {
    const { url, title, titleEn, sortOrder } = req.body;
    const [result] = await pool.query(
      "INSERT INTO videos (url, title, title_en, sort_order) VALUES (?, ?, ?, ?)",
      [url, title, titleEn || null, sortOrder || 0]
    );
    res.status(201).json({
      id: result.insertId,
      url,
      title,
      title_en: titleEn || null,
      sort_order: sortOrder || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", idRule, partialMediaRules, handleValidation, async (req, res) => {
  try {
    const { id } = req.params;
    const { url, title, titleEn, sortOrder } = req.body;
    const [result] = await pool.query(
      "UPDATE videos SET url = COALESCE(?, url), title = COALESCE(?, title), title_en = COALESCE(?, title_en), sort_order = COALESCE(?, sort_order) WHERE id = ?",
      [url ?? null, title ?? null, titleEn ?? null, sortOrder ?? null, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Video not found" });
    const [updated] = await pool.query("SELECT id, url, title, title_en, sort_order, created_at, updated_at FROM videos WHERE id = ?", [id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", idRule, handleValidation, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT url FROM videos WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Video not found" });
    const url = rows[0].url;
    if (url?.startsWith("/api/uploads/")) {
      const filePath = path.join(process.cwd(), "uploads", url.replace("/api/uploads/", ""));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await pool.query("DELETE FROM videos WHERE id = ?", [id]);
    res.json({ message: "Video deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
