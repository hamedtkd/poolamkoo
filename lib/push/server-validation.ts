import type { RemoteLoanReminder, RemoteLoanRiskAlert, RemoteMarketAlert, WebPushSubscriptionData } from "@/lib/push/types";
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

function validDateOnly(value: unknown) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T12:00:00Z`));
}

function validTimeZone(value: unknown) {
  if (typeof value !== "string" || value.length > 80) return false;
  try { new Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date()); return true; }
  catch { return false; }
}

export function parseRemoteLoanReminders(value: unknown): RemoteLoanReminder[] | null {
  if (!Array.isArray(value) || value.length > 20) return null;
  const reminders: RemoteLoanReminder[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const row = item as Partial<RemoteLoanReminder>;
    if (!Number.isInteger(row.loanId) || Number(row.loanId) <= 0 || !Number.isInteger(row.installmentNo) || Number(row.installmentNo) <= 0) return null;
    if (!validDateOnly(row.dueAt) || !validTimeZone(row.timeZone) || typeof row.updatedAt !== "string" || !Array.isArray(row.reminderDays)) return null;
    const reminderDays = [...new Set(row.reminderDays.map(Number).filter((day) => Number.isInteger(day) && day >= 0 && day <= 90))].sort((a, b) => b - a);
    if (!reminderDays.length && row.enabled) return null;
    reminders.push({
      loanId: Number(row.loanId), installmentNo: Number(row.installmentNo), dueAt: row.dueAt as string,
      reminderDays, timeZone: row.timeZone as string, enabled: Boolean(row.enabled), sentKeys: [], updatedAt: row.updatedAt,
    });
  }
  return reminders;
}

export function parseRemoteLoanRiskAlerts(value: unknown): RemoteLoanRiskAlert[] | null {
  if (!Array.isArray(value) || value.length > 30) return null;
  const alerts: RemoteLoanRiskAlert[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const row = item as Partial<RemoteLoanRiskAlert>;
    if (!Number.isInteger(row.id) || Number(row.id) <= 0 || !Number.isInteger(row.loanId) || Number(row.loanId) <= 0) return null;
    if (!Number.isInteger(row.assetId) || Number(row.assetId) <= 0 || typeof row.marketId !== "string" || !row.marketId) return null;
    if (!(Number(row.thresholdHours) > 0) || !(Number(row.rearmHours) > 0) || typeof row.updatedAt !== "string") return null;
    alerts.push({
      id: Number(row.id), loanId: Number(row.loanId), assetId: Number(row.assetId), marketId: row.marketId.slice(0, 120),
      thresholdHours: Math.min(168, Math.max(0.5, Number(row.thresholdHours))),
      rearmHours: Math.min(168, Math.max(0.25, Number(row.rearmHours))),
      enabled: Boolean(row.enabled), armed: Boolean(row.armed),
      lastTriggeredAt: typeof row.lastTriggeredAt === "string" ? row.lastTriggeredAt : undefined, updatedAt: row.updatedAt,
    });
  }
  return alerts;
}
