import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import pool from "../db/connection.js";
import { body, param } from "express-validator";
import { handleValidation } from "../middleware/validate.js";
import { isConfigured, uploadStream } from "../lib/cloudinary.js";

const router = Router();

const memory = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const type = req.params.type;
  if (type === "photo") {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes (JPEG, PNG, WebP, GIF)"), false);
    }
  } else {
    const allowed = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten videos (MP4, MOV, AVI, WebM)"), false);
    }
  }
};

const upload = multer({
  storage: memory,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});

const uploadRules = [
  param("type").isIn(["photo", "video"]).withMessage("type must be 'photo' or 'video'"),
  body("title").optional({ values: "falsy" }).trim().isLength({ max: 255 }).withMessage("title max 255 chars"),
  body("titleEn").optional({ values: "falsy" }).trim().isLength({ max: 255 }).withMessage("titleEn max 255 chars"),
  body("sortOrder").optional().isInt({ min: 0 }).withMessage("sortOrder must be a positive integer"),
];

async function saveFile(file, type) {
  if (isConfigured()) {
    const folder = type === "photo" ? "jeffmusic/photos" : "jeffmusic/videos";
    const result = await uploadStream(file.buffer, { folder });
    return result.secure_url;
  }
  const dir = path.join(process.cwd(), "uploads", type === "photo" ? "photos" : "videos");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
  fs.writeFileSync(path.join(dir, uniqueName), file.buffer);
  return `/api/uploads/${type === "photo" ? "photos" : "videos"}/${uniqueName}`;
}

router.post("/section-media/:type", (req, res) => {
  const { type } = req.params;
  if (!["photo", "video"].includes(type)) {
    return res.status(400).json({ error: "type must be 'photo' or 'video'" });
  }
  upload.single("file")(req, res, async (err) => {
    if (err instanceof multer.MulterError) return res.status(400).json({ error: err.message });
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    try {
      const url = await saveFile(req.file, type);
      res.json({ url });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
});

router.post("/:type", uploadRules, handleValidation, upload.single("file"), async (req, res) => {
  try {
    const { type } = req.params;
    const { title, titleEn, sortOrder } = req.body;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const url = await saveFile(req.file, type);

    const table = type === "photo" ? "photos" : "videos";
    const [result] = await pool.query(
      `INSERT INTO ${table} (url, title, title_en, sort_order) VALUES (?, ?, ?, ?)`,
      [url, title || req.file.originalname, titleEn || null, parseInt(sortOrder) || 0]
    );

    res.status(201).json({
      id: result.insertId,
      url,
      title: title || req.file.originalname,
      title_en: titleEn || null,
      sort_order: parseInt(sortOrder) || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
