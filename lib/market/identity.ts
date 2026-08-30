import type { ExchangeMarketSource } from "../types.ts";

export type ExchangeMarketIdentity = {
  source: ExchangeMarketSource;
  marketId: string;
};

export const MARKET_IDENTITY_INDEX = "[source+marketId]";

export function marketIdentityKey(target: ExchangeMarketIdentity) {
  return `${target.source}:${target.marketId}`;
}

export function marketIdentityTuple(target: ExchangeMarketIdentity) {
  return [target.source, target.marketId] as [ExchangeMarketSource, string];
}

export function legacyExchangeSource(value: unknown): ExchangeMarketSource {
  return value === "tsetmc" ? "tsetmc" : "tindex";
}

export function normalizeLegacyExchangeIdentityRow(row: Record<string, unknown>) {
  const marketId = normalizedMarketId(row.marketId);
  if (!marketId) return;
  row.marketId = marketId;
  row.source = legacyExchangeSource(row.source);
}

export function normalizeLegacyAssetIdentityRow(row: Record<string, unknown>) {
  const marketId = normalizedMarketId(row.marketId);
  if (!marketId) return;
  row.marketId = marketId;
  row.marketSource = legacyExchangeSource(row.marketSource);
}

export function normalizePortableMarketIdentities(data: Record<string, unknown>) {
  const normalized = { ...data };
  normalized.assets = normalizeRows(data.assets, normalizeLegacyAssetIdentityRow);
  normalized.marketWatchlist = normalizeRows(data.marketWatchlist, normalizeLegacyExchangeIdentityRow);
  normalized.marketAlerts = normalizeRows(data.marketAlerts, normalizeLegacyExchangeIdentityRow);
  return normalized;
}

export function assertPortableMarketIdentities(data: Record<string, unknown>) {
  const seen = new Set<string>();
  for (const row of rows(data.marketWatchlist)) {
    const identity = portableIdentity(row, "source");
    if (!identity) throw new Error("داده دیده‌بان بازار شناسه معتبر ندارد.");
    const key = marketIdentityKey(identity);
    if (seen.has(key)) throw new Error("داده دیده‌بان بازار شناسه تکراری برای یک Provider دارد.");
    seen.add(key);
  }
  for (const row of rows(data.marketAlerts)) {
    if (!portableIdentity(row, "source")) throw new Error("داده هشدار بازار شناسه معتبر ندارد.");
  }
  for (const row of rows(data.assets)) {
    if (row.marketId != null && row.marketId !== "" && !portableIdentity(row, "marketSource")) {
      throw new Error("داده دارایی متصل به بازار شناسه معتبر ندارد.");
    }
  }
}

function portableIdentity(row: Record<string, unknown>, sourceField: "source" | "marketSource") {
  const marketId = normalizedMarketId(row.marketId);
  const source = portableExchangeSource(row[sourceField]);
  if (!marketId || !source) return null;
  return { source, marketId } satisfies ExchangeMarketIdentity;
}

function portableExchangeSource(value: unknown): ExchangeMarketSource | null {
  if (value == null || value === "") return "tindex";
  return value === "tsetmc" || value === "tindex" ? value : null;
}

function normalizedMarketId(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function rows(value: unknown) {
  return Array.isArray(value) ? value.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object") : [];
}

function normalizeRows(value: unknown, normalize: (row: Record<string, unknown>) => void) {
  if (!Array.isArray(value)) return value;
  return value.map((valueRow) => {
    if (!valueRow || typeof valueRow !== "object") return valueRow;
    const row = { ...(valueRow as Record<string, unknown>) };
    normalize(row);
    return row;
  });
}
