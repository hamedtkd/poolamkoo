import { NextRequest, NextResponse } from "next/server";
import {
  marketProviderWarning,
  providerIdle,
  runMarketProvider,
  summarizeMarketHealth,
} from "@/lib/market/reliability";
import { TindexProvider } from "@/lib/market/tindex";
import { TsetmcProvider } from "@/lib/market/tsetmc";
import type { ExchangeMarketSource, MarketHistoryRange } from "@/lib/types";

export const dynamic = "force-dynamic";

const CORE_HISTORY_SLUGS: Record<string, string> = {
  USD: "USD-EXCHANGE-RATE",
  IR_GOLD_18K: "GOLD-18K",
};

function historyRange(value: string | null): MarketHistoryRange {
  return value === "1m" ? "1m" : "3m";
}

function exchangeSource(value: string | null, marketId: string): ExchangeMarketSource {
  if (value === "tindex" || value === "tsetmc") return value;
  return /^\d+$/.test(marketId) ? "tsetmc" : "tindex";
}

function response(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}

export async function GET(request: NextRequest) {
  const token = process.env.TINDEX_API_TOKEN?.trim();
  const symbol = request.nextUrl.searchParams.get("symbol")?.trim() ?? "";
  const marketId = request.nextUrl.searchParams.get("marketId")?.trim().slice(0, 120) ?? "";
  const range = historyRange(request.nextUrl.searchParams.get("range"));
  const source = exchangeSource(request.nextUrl.searchParams.get("source"), marketId);

  if (marketId && source === "tsetmc") {
    const run = await runMarketProvider({
      provider: "tsetmc",
      requestedCount: 1,
      operation: () => new TsetmcProvider().getCandles(marketId, range),
      itemCount: (candles) => candles.length ? 1 : 0,
    });
    const candles = run.value ?? [];
    const health = summarizeMarketHealth([run.health]);
    if (candles.length) return response({ mode: "live", candles, source: "tsetmc", range, health, fetchedAt: new Date().toISOString() });
    return response({
      mode: "unavailable",
      candles: [],
      range,
      health,
      warning: marketProviderWarning(run.health, "TSETMC برای این بازه تاریخچه قابل استفاده‌ای برنگرداند."),
    }, run.health.status === "unavailable" ? 502 : 200);
  }

  if (marketId && source === "tindex") {
    if (!token) {
      const health = summarizeMarketHealth([providerIdle("tindex", false)]);
      return response({ mode: "unconfigured", candles: [], range, health, warning: "این اتصال قدیمی Tindex است؛ برای تاریخچه پایدارتر نماد را به TSETMC دوباره متصل کن." });
    }
    const run = await runMarketProvider({
      provider: "tindex",
      requestedCount: 1,
      operation: () => new TindexProvider(token).getExchangeCandles(marketId, range),
      itemCount: (candles) => candles.length ? 1 : 0,
    });
    const candles = run.value ?? [];
    const health = summarizeMarketHealth([run.health]);
    if (candles.length) return response({ mode: "live", candles, source: "tindex", range, health, fetchedAt: new Date().toISOString() });
    return response({
      mode: "unavailable",
      candles: [],
      range,
      health,
      warning: marketProviderWarning(run.health, "Tindex برای این بازه تاریخچه قابل استفاده‌ای برنگرداند."),
    }, run.health.status === "unavailable" ? 502 : 200);
  }

  const coreSlug = CORE_HISTORY_SLUGS[symbol];
  if (!coreSlug) return response({ mode: "unavailable", candles: [], range, health: summarizeMarketHealth([]), warning: "تاریخچه آنلاین این نماد فعلاً پشتیبانی نمی‌شود." });
  if (!token) {
    const health = summarizeMarketHealth([providerIdle("tindex", false)]);
    return response({ mode: "unconfigured", candles: [], range, health, warning: "تاریخچه آنلاین دلار/طلا به Tindex اختیاری نیاز دارد؛ Snapshotهای واقعی دستگاه fallback هستند." });
  }

  const run = await runMarketProvider({
    provider: "tindex",
    requestedCount: 1,
    operation: () => new TindexProvider(token).getIndicatorCandles(coreSlug, range),
    itemCount: (candles) => candles.length ? 1 : 0,
  });
  const candles = run.value ?? [];
  const health = summarizeMarketHealth([run.health]);
  if (candles.length) return response({ mode: "live", candles, source: "tindex", range, health, fetchedAt: new Date().toISOString() });
  return response({
    mode: "unavailable",
    candles: [],
    range,
    health,
    warning: marketProviderWarning(run.health, "برای این بازه تاریخچه قابل استفاده‌ای دریافت نشد."),
  }, run.health.status === "unavailable" ? 502 : 200);
}
