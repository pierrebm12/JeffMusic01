import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:3001/api").replace("/api", "");

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function resolveMediaUrl(url) {
  if (!url) return url;
  return url.startsWith("/") ? `${API_ORIGIN}${url}` : url;
}
