export type MarketProviderId = "brsapi" | "tsetmc" | "tindex";
export type MarketProviderFailureKind =
  | "timeout"
  | "rate_limited"
  | "unauthorized"
  | "blocked"
  | "not_found"
  | "invalid_response"
  | "network"
  | "upstream";
export type MarketProviderStatus = "ok" | "degraded" | "unavailable" | "unconfigured" | "idle";

export interface MarketProviderHealth {
  provider: MarketProviderId;
  status: MarketProviderStatus;
  configured: boolean;
  attempted: boolean;
  itemCount?: number;
  requestedCount?: number;
  latencyMs?: number;
  failure?: MarketProviderFailureKind;
}

export interface MarketHealthSummary {
  degraded: boolean;
  providers: Partial<Record<MarketProviderId, MarketProviderHealth>>;
}

export class MarketProviderError extends Error {
  readonly provider: MarketProviderId;
  readonly failure: MarketProviderFailureKind;
  readonly status?: number;

  constructor(provider: MarketProviderId, failure: MarketProviderFailureKind, status?: number) {
    super(`${provider}:${failure}`);
    this.name = "MarketProviderError";
    this.provider = provider;
    this.failure = failure;
    this.status = status;
  }
}

export function providerErrorFromStatus(provider: MarketProviderId, status: number) {
  if (status === 401) return new MarketProviderError(provider, "unauthorized", status);
  if (status === 403) return new MarketProviderError(provider, provider === "tsetmc" ? "blocked" : "unauthorized", status);
  if (status === 404) return new MarketProviderError(provider, "not_found", status);
  if (status === 408 || status === 504) return new MarketProviderError(provider, "timeout", status);
  if (status === 429) return new MarketProviderError(provider, "rate_limited", status);
  return new MarketProviderError(provider, "upstream", status);
}

export function classifyMarketProviderError(provider: MarketProviderId, error: unknown): MarketProviderError {
  if (error instanceof MarketProviderError) return error;
  if (error instanceof SyntaxError) return new MarketProviderError(provider, "invalid_response");
  if (error instanceof TypeError) return new MarketProviderError(provider, "network");
  if (error && typeof error === "object" && "name" in error) {
    const name = String((error as { name?: unknown }).name ?? "");
    if (name === "TimeoutError" || name === "AbortError") return new MarketProviderError(provider, "timeout");
  }
  return new MarketProviderError(provider, "upstream");
}

export function providerIdle(provider: MarketProviderId, configured: boolean): MarketProviderHealth {
  return { provider, status: configured ? "idle" : "unconfigured", configured, attempted: false };
}

export async function runMarketProvider<T>({
  provider,
  configured = true,
  requestedCount,
  operation,
  itemCount,
}: {
  provider: MarketProviderId;
  configured?: boolean;
  requestedCount?: number;
  operation: () => Promise<T>;
  itemCount?: (value: T) => number;
}): Promise<{ value?: T; health: MarketProviderHealth }> {
  if (!configured) return { health: providerIdle(provider, false) };
  const startedAt = Date.now();
  try {
    const value = await operation();
    const count = itemCount?.(value);
    const degraded = requestedCount !== undefined && count !== undefined && count < requestedCount;
    return {
      value,
      health: {
        provider,
        status: degraded ? "degraded" : "ok",
        configured: true,
        attempted: true,
        itemCount: count,
        requestedCount,
        latencyMs: Math.max(0, Date.now() - startedAt),
      },
    };
  } catch (error) {
    const classified = classifyMarketProviderError(provider, error);
    return {
      health: {
        provider,
        status: "unavailable",
        configured: true,
        attempted: true,
        requestedCount,
        latencyMs: Math.max(0, Date.now() - startedAt),
        failure: classified.failure,
      },
    };
  }
}

export function summarizeMarketHealth(items: readonly MarketProviderHealth[]): MarketHealthSummary {
  const providers: Partial<Record<MarketProviderId, MarketProviderHealth>> = {};
  for (const item of items) providers[item.provider] = item;
  return {
    degraded: items.some((item) => item.status === "degraded" || item.status === "unavailable"),
    providers,
  };
}

export function mergeProviderHealth(a: MarketProviderHealth, b: MarketProviderHealth): MarketProviderHealth {
  if (a.provider !== b.provider) throw new Error("provider health mismatch");
  const statuses = [a.status, b.status];
  let status: MarketProviderStatus;
  if (statuses.every((value) => value === "idle")) status = "idle";
  else if (statuses.every((value) => value === "unconfigured" || value === "idle")) status = statuses.includes("unconfigured") ? "unconfigured" : "idle";
  else if (statuses.every((value) => value === "ok" || value === "idle")) status = "ok";
  else if (statuses.every((value) => value === "unavailable")) status = "unavailable";
  else status = "degraded";
  return {
    provider: a.provider,
    status,
    configured: a.configured || b.configured,
    attempted: a.attempted || b.attempted,
    itemCount: (a.itemCount ?? 0) + (b.itemCount ?? 0),
    requestedCount: (a.requestedCount ?? 0) + (b.requestedCount ?? 0) || undefined,
    latencyMs: Math.max(a.latencyMs ?? 0, b.latencyMs ?? 0) || undefined,
    failure: a.failure ?? b.failure,
  };
}

const PROVIDER_LABEL: Record<MarketProviderId, string> = {
  brsapi: "BrsApi",
  tsetmc: "TSETMC",
  tindex: "Tindex",
};

const FAILURE_TEXT: Record<MarketProviderFailureKind, string> = {
  timeout: "پاسخ در زمان مجاز نرسید.",
  rate_limited: "محدودیت تعداد درخواست فعال شده است.",
  unauthorized: "دسترسی Provider معتبر نیست یا نیاز به بازبینی دارد.",
  blocked: "دسترسی این سرور موقتاً پذیرفته نشد.",
  not_found: "داده درخواستی در Provider پیدا نشد.",
  invalid_response: "پاسخ Provider قابل پردازش نبود.",
  network: "ارتباط با Provider برقرار نشد.",
  upstream: "Provider موقتاً در دسترس نیست.",
};

export function marketProviderWarning(health: MarketProviderHealth, fallback?: string) {
  if (health.status === "degraded") {
    return fallback ?? `${PROVIDER_LABEL[health.provider]} فقط بخشی از داده تازه را برگرداند؛ آخرین Snapshot یا قیمت دستی برای بقیه حفظ می‌شود.`;
  }
  if (health.status === "unavailable") {
    return `${PROVIDER_LABEL[health.provider]}: ${FAILURE_TEXT[health.failure ?? "upstream"]}`;
  }
  if (health.status === "unconfigured") return fallback;
  return undefined;
}
