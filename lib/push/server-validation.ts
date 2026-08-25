import type { RemoteMarketAlert, WebPushSubscriptionData } from "@/lib/push/types";
import type { MarketAlertKind } from "@/lib/types";

const kinds = new Set<MarketAlertKind>(["price_above", "price_below", "change_above", "change_below", "nav_discount", "nav_premium"]);

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try { return new URL(origin).origin === new URL(request.url).origin; } catch { return false; }
}

export function validDeviceToken(value: string | null) {
  return Boolean(value && /^[A-Za-z0-9_-]{32,160}$/.test(value));
}

export function parseSubscription(value: unknown): WebPushSubscriptionData | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<WebPushSubscriptionData>;
  if (typeof row.endpoint !== "string" || !row.endpoint.startsWith("https://") || row.endpoint.length > 2048) return null;
  if (!row.keys || typeof row.keys.p256dh !== "string" || typeof row.keys.auth !== "string") return null;
  if (row.keys.p256dh.length > 512 || row.keys.auth.length > 256) return null;
  return { endpoint: row.endpoint, expirationTime: row.expirationTime ?? null, keys: { p256dh: row.keys.p256dh, auth: row.keys.auth } };
}

export function parseRemoteAlerts(value: unknown): RemoteMarketAlert[] | null {
  if (!Array.isArray(value) || value.length > 40) return null;
  const alerts: RemoteMarketAlert[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const row = item as Partial<RemoteMarketAlert>;
    if (!Number.isInteger(row.id) || Number(row.id) <= 0 || typeof row.marketId !== "string" || typeof row.symbol !== "string") return null;
    if (!row.kind || !kinds.has(row.kind) || !(Number(row.threshold) > 0) || typeof row.updatedAt !== "string") return null;
    alerts.push({
      id: Number(row.id), marketId: row.marketId.slice(0, 120), symbol: row.symbol.slice(0, 40),
      kind: row.kind, threshold: Math.abs(Number(row.threshold)), enabled: Boolean(row.enabled), armed: Boolean(row.armed),
      lastTriggeredAt: typeof row.lastTriggeredAt === "string" ? row.lastTriggeredAt : undefined, updatedAt: row.updatedAt,
    });
  }
  return alerts;
}
