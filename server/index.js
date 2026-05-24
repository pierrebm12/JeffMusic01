import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import showsRouter from "./routes/shows.js";
import photosRouter from "./routes/photos.js";
import videosRouter from "./routes/videos.js";
import adminRouter from "./routes/admin.js";
import uploadRouter from "./routes/upload.js";
import homeRouter from "./routes/home.js";
import sectionsRouter from "./routes/sections.js";
import pool from "./db/connection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json({ limit: "1mb" }));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many uploads, please try again later." },
});

app.use("/api", apiLimiter);
app.use("/api/upload", uploadLimiter);
app.use("/api/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/shows", showsRouter);
app.use("/api/photos", photosRouter);
app.use("/api/videos", videosRouter);
app.use("/api/admin", adminRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/home", homeRouter);
app.use("/api/sections", sectionsRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve built frontend in production
const distPath = path.join(process.cwd(), "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });
  console.log("🌐 Serving built frontend from dist/");
}

// 404 handler for unmatched API routes
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, _next) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);

  // Log DB config (without password)
  console.log("📋 DB config:", JSON.stringify({
    host: process.env.DB_HOST || process.env.MYSQL_HOST || "not set",
    user: process.env.DB_USER || process.env.MYSQL_USER || "not set",
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || "not set",
    port: process.env.DB_PORT || process.env.MYSQL_PORT || "not set",
    hasMysqlUrl: !!process.env.MYSQL_URL,
  }));

  // Test DB connection
  try {
    const conn = await pool.getConnection();
    await conn.query("SELECT 1");
    conn.release();
    console.log("✅ DB connected");
  } catch (err) {
    console.error("❌ DB connection failed:", JSON.stringify({
      message: err?.message,
      code: err?.code,
      errno: err?.errno,
      sqlState: err?.sqlState,
      sqlMessage: err?.sqlMessage,
    }));
  }
});
