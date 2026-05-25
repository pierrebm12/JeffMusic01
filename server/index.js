import { spawn } from "child_process";
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

// Railway runs behind a proxy — trust X-Forwarded-* headers
app.set("trust proxy", 1);

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json({ limit: "1mb" }));

// Request logging middleware
app.use((req, res, next) => {
  console.error(`📥 ${req.method} ${req.url}`);
  next();
});

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

app.get("/api/health", async (req, res) => {
  let dbStatus = "unknown";
  try {
    const conn = await pool.getConnection();
    await conn.query("SELECT 1");
    conn.release();
    dbStatus = "connected";
  } catch (e) { dbStatus = `error: ${e.message}`; }
  res.json({ status: "ok", db: dbStatus, timestamp: new Date().toISOString() });
});

// Debug endpoint to check DB and env
app.get("/api/debug", async (req, res) => {
  const dbInfo = {};
  try {
    const conn = await pool.getConnection();
    const [r] = await conn.query("SELECT DATABASE() AS db, VERSION() AS ver, NOW() AS now");
    dbInfo.connection = "ok";
    dbInfo.database = r[0].db;
    dbInfo.version = r[0].ver;
    dbInfo.time = r[0].now;
    const tables = ["site_sections", "shows", "photos", "videos"];
    for (const t of tables) {
      const [cnt] = await conn.query("SELECT COUNT(*) AS c FROM ??", [t]);
      dbInfo[t] = cnt[0].c;
    }
    conn.release();
  } catch (e) { dbInfo.error = e.message; }

  const envVars = {};
  for (const [key, value] of Object.entries(process.env)) {
    const k = key.toLowerCase();
    if (k.includes("mysql") || k.includes("database") || k.includes("db_") || k.includes("password") || k.includes("admin")) {
      envVars[key] = (k.includes("pass") || k.includes("password")) ? "***" : value;
    }
  }
  res.json({ db: dbInfo, env: envVars });
});

// Serve built frontend (works even if dist/ is created after startup)
const distPath = path.join(process.cwd(), "dist");
app.use(express.static(distPath));

// Always respond to root requests — even before build completes
app.get("/", (req, res) => {
  const indexPath = path.join(distPath, "index.html");
  if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
  res.send("<!doctype html><html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>JeffMusic</title></head><body style='background:#000;color:#d4af37;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif'><h1>🎵 JeffMusic</h1><p>Loading...</p></body></html>");
});

// Catch-all for client-side routing (non-API, non-root)
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  const indexPath = path.join(distPath, "index.html");
  if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
  next();
});

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

// Start server FIRST so Railway health check succeeds immediately
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at /api`);

  // Then build client in background (non-blocking)
  setTimeout(() => {
    console.log("🏗️ Building client...");
    const child = spawn("npx", ["vite", "build"], {
      cwd: path.join(process.cwd()),
      stdio: "inherit",
      shell: true,
    });
    child.on("exit", (code) => {
      if (code === 0) console.log("✅ Client built");
      else console.error("❌ Client build failed with code", code);
    });
  }, 100);

  // And test DB in background
  setTimeout(async () => {
    try {
      const conn = await pool.getConnection();
      await conn.query("SELECT 1");
      conn.release();
      console.log("✅ DB connected");
    } catch (err) {
      console.error("❌ DB connection failed:", JSON.stringify({
        message: err?.message, code: err?.code, errno: err?.errno,
        sqlState: err?.sqlState, sqlMessage: err?.sqlMessage,
      }));
    }
  }, 200);
});

server.on("close", () => {
  console.error("⚠️ Server closed, but staying alive for debug");
});

// Log DB env vars
const dbEnvVars = {};
for (const [key, value] of Object.entries(process.env)) {
  const k = key.toLowerCase();
  if (k.includes("mysql") || k.includes("database") || k.includes("db_") || k.includes("datasource") || key === "DATABASE_URL") {
    dbEnvVars[key] = key.toLowerCase().includes("pass") || key.toLowerCase().includes("password") ? "***" : value;
  }
}
console.error("📋 DB env vars found:", JSON.stringify(dbEnvVars));
