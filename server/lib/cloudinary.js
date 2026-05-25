import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

function ensureConfigured() {
  if (cloudinary.config().cloud_name) return true;
  const c = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME;
  const k = process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY;
  const s = process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET;
  if (c && k && s) {
    cloudinary.config({ cloud_name: c, api_key: k, api_secret: s });
    return true;
  }
  return false;
}

export function isConfigured() { return ensureConfigured(); }

export async function uploadStream(buffer, opts = {}) {
  if (!ensureConfigured()) throw new Error("Cloudinary not configured");
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", ...opts },
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
}
