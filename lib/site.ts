export const SITE_NAME = "پولم‌کو";
export const SITE_DESCRIPTION = "مدیریت پول‌های ورودی، صندوق‌های هدف و سرمایه‌گذاری به‌صورت Local-First";
export const DEFAULT_SITE_URL = "https://poolamkoo.vercel.app";
export const APP_ENTRY_PATH = "/dashboard";

export const PUBLIC_INDEX_ROUTES = [
  "/",
  "/guide",
  "/about",
  "/privacy",
  "/data-safety",
  "/security",
  "/license",
  "/analytics",
] as const;

export function siteUrl(value = process.env.NEXT_PUBLIC_SITE_URL) {
  const raw = value?.trim();
  if (!raw) return DEFAULT_SITE_URL;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return DEFAULT_SITE_URL;
    return url.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}
