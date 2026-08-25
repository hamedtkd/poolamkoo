export const CLOUDFLARE_WEB_ANALYTICS_SRC = "https://static.cloudflareinsights.com/beacon.min.js";

export type AnalyticsRuntimeStatus = "enabled" | "development" | "disabled";

export function normalizeCloudflareAnalyticsToken(value?: string | null) {
  const token = value?.trim();
  if (!token || token.length < 16 || token.length > 128) return null;
  if (!/^[A-Za-z0-9_-]+$/.test(token)) return null;
  return token;
}

export function cloudflareAnalyticsStatus(value?: string | null, nodeEnv = process.env.NODE_ENV): AnalyticsRuntimeStatus {
  if (!normalizeCloudflareAnalyticsToken(value)) return "disabled";
  return nodeEnv === "production" ? "enabled" : "development";
}

export function cloudflareAnalyticsEnabled(value?: string | null, nodeEnv = process.env.NODE_ENV) {
  return cloudflareAnalyticsStatus(value, nodeEnv) === "enabled";
}
