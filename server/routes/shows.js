import { Router } from "express";
import pool from "../db/connection.js";
import { showRules, partialShowRules, idRule, handleValidation } from "../middleware/validate.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, place, day, time, available, created_at, updated_at FROM shows ORDER BY created_at ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", showRules, handleValidation, async (req, res) => {
  try {
    const { place, day, time, available } = req.body;
    const [result] = await pool.query(
      "INSERT INTO shows (place, day, time, available) VALUES (?, ?, ?, ?)",
      [place, day, time || null, available !== undefined ? available : true]
    );
    res.status(201).json({
      id: result.insertId,
      place,
      day,
      time: time || null,
      available: available !== undefined ? available : true,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", idRule, partialShowRules, handleValidation, async (req, res) => {
  try {
    const { id } = req.params;
    const { place, day, time, available } = req.body;
    const [result] = await pool.query(
      "UPDATE shows SET place = COALESCE(?, place), day = COALESCE(?, day), time = COALESCE(?, time), available = COALESCE(?, available) WHERE id = ?",
      [place ?? null, day ?? null, time ?? null, available ?? null, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Show not found" });
    const [updated] = await pool.query("SELECT id, place, day, time, available, created_at, updated_at FROM shows WHERE id = ?", [id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", idRule, handleValidation, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM shows WHERE id = ?", [id]);
    res.json({ message: "Show deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
