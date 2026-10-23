// In development, use proxy. In production, use environment variable or fallback
export const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
