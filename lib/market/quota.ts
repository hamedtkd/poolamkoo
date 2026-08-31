import type { MarketProviderFailureKind, MarketProviderId } from "./reliability.ts";

export const MARKET_CACHE_SECONDS = {
  brsapiCoreQuotes: 180,
  tsetmcQuote: 120,
  tsetmcSearch: 600,
  tsetmcHistory: 3600,
  tindexCoreFallback: 1800,
  tindexLegacyQuote: 3600,
  tindexHistory: 3600,
} as const;

export const MARKET_CLIENT_REUSE_MS = 30_000;

export type ProviderCooldown = {
  failure: MarketProviderFailureKind;
  until: number;
};

const cooldowns = new Map<MarketProviderId, ProviderCooldown>();

const DEFAULT_COOLDOWN_SECONDS: Partial<Record<MarketProviderId, Partial<Record<MarketProviderFailureKind, number>>>> = {
  brsapi: { rate_limited: 900, unauthorized: 3600 },
  tsetmc: { rate_limited: 300, blocked: 300 },
  tindex: { rate_limited: 75, unauthorized: 3600 },
};

export function parseRetryAfterSeconds(value: string | null, now = Date.now()) {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.min(21_600, Math.ceil(seconds));
  const date = Date.parse(value);
  if (!Number.isFinite(date)) return undefined;
  return Math.min(21_600, Math.max(0, Math.ceil((date - now) / 1000)));
}

export function activeProviderCooldown(provider: MarketProviderId, now = Date.now()) {
  const cooldown = cooldowns.get(provider);
  if (!cooldown) return undefined;
  if (cooldown.until <= now) {
    cooldowns.delete(provider);
    return undefined;
  }
  return cooldown;
}

export function recordProviderCooldown(
  provider: MarketProviderId,
  failure: MarketProviderFailureKind,
  retryAfterSeconds?: number,
  now = Date.now(),
) {
  const defaultSeconds = DEFAULT_COOLDOWN_SECONDS[provider]?.[failure];
  const requestedSeconds = retryAfterSeconds === undefined ? undefined : Math.max(0, Math.ceil(retryAfterSeconds));
  const seconds = Math.max(defaultSeconds ?? 0, requestedSeconds ?? 0);
  if (!seconds) return undefined;
  const cooldown = { failure, until: now + Math.min(seconds, 21_600) * 1000 } satisfies ProviderCooldown;
  cooldowns.set(provider, cooldown);
  return cooldown;
}

export function clearProviderCooldown(provider: MarketProviderId) {
  cooldowns.delete(provider);
}

export function resetProviderCooldownsForTests() {
  cooldowns.clear();
}

export function marketLaunchGuardrails() {
  return [
    `BrsApi: کش مشترک ${MARKET_CACHE_SECONDS.brsapiCoreQuotes} ثانیه`,
    `TSETMC: کش Quote/Search/History برابر ${MARKET_CACHE_SECONDS.tsetmcQuote}/${MARKET_CACHE_SECONDS.tsetmcSearch}/${MARKET_CACHE_SECONDS.tsetmcHistory} ثانیه`,
    `Tindex: fallback/legacy با کش ${MARKET_CACHE_SECONDS.tindexCoreFallback}/${MARKET_CACHE_SECONDS.tindexLegacyQuote} ثانیه`,
    `Browser: reuse درخواست یکسان تا ${Math.round(MARKET_CLIENT_REUSE_MS / 1000)} ثانیه`,
    "429/blocked: cooldown محافظتی روی runtime گرم",
  ];
}
