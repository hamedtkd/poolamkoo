import { NextRequest, NextResponse } from "next/server";
import { BrsApiProvider } from "@/lib/market/brsapi";
import {
  providerIdle,
  runMarketProvider,
  summarizeMarketHealth,
  type MarketProviderHealth,
  type MarketProviderId,
} from "@/lib/market/reliability";
import { TindexProvider } from "@/lib/market/tindex";
import { TsetmcProvider } from "@/lib/market/tsetmc";
import type { ExchangeMarketSource, MarketCandle, MarketHistoryRange, MarketSource } from "@/lib/types";

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

function response(body: Record<string, unknown>) {
  return NextResponse.json(body, {
    status: 200,
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}

async function historyRun(
  provider: MarketProviderId,
  configured: boolean,
  operation: () => Promise<MarketCandle[]>,
) {
  return runMarketProvider({
    provider,
    configured,
    requestedCount: 1,
    operation,
    itemCount: (candles) => candles.length ? 1 : 0,
  });
}

function liveHistory(candles: MarketCandle[], source: MarketSource, range: MarketHistoryRange, health: MarketProviderHealth[]) {
  return response({
    mode: "live",
    candles,
    source,
    range,
    health: summarizeMarketHealth(health),
    fetchedAt: new Date().toISOString(),
  });
}

export async function GET(request: NextRequest) {
  const token = process.env.TINDEX_API_TOKEN?.trim();
  const brsKey = process.env.BRS_API_KEY?.trim();
  const symbol = request.nextUrl.searchParams.get("symbol")?.trim().slice(0, 80) ?? "";
  const marketId = request.nextUrl.searchParams.get("marketId")?.trim().slice(0, 120) ?? "";
  const range = historyRange(request.nextUrl.searchParams.get("range"));
  const source = exchangeSource(request.nextUrl.searchParams.get("source"), marketId);

  if (marketId) {
    const health: MarketProviderHealth[] = [];
    const tsetmc = new TsetmcProvider();
    const tsetmcRun = await historyRun(
      "tsetmc",
      true,
      () => source === "tsetmc" && /^\d+$/.test(marketId)
        ? tsetmc.getCandles(marketId, range)
        : tsetmc.getCandlesBySymbol(symbol, range),
    );
    health.push(tsetmcRun.health);
    if (tsetmcRun.value?.length) return liveHistory(tsetmcRun.value, "tsetmc", range, health);

    const brsRun = await historyRun(
      "brsapi",
      Boolean(brsKey && symbol),
      () => new BrsApiProvider(brsKey!).getExchangeCandles(symbol, range),
    );
    health.push(brsRun.health);
    if (brsRun.value?.length) return liveHistory(brsRun.value, "brsapi", range, health);

    if (source === "tindex") {
      const tindexRun = await historyRun(
        "tindex",
        Boolean(token),
        () => new TindexProvider(token!).getExchangeCandles(marketId, range),
      );
      health.push(tindexRun.health);
      if (tindexRun.value?.length) return liveHistory(tindexRun.value, "tindex", range, health);
    } else {
      health.push(providerIdle("tindex", Boolean(token)));
    }

    return response({
      mode: brsKey || token ? "unavailable" : "unconfigured",
      candles: [],
      range,
      health: summarizeMarketHealth(health),
      warning: "تاریخچه تازه از منابع فعال دریافت نشد؛ Snapshotهای واقعی ذخیره‌شده روی دستگاه همچنان قابل استفاده‌اند.",
    });
  }

  const coreSlug = CORE_HISTORY_SLUGS[symbol];
  if (!coreSlug) {
    return response({
      mode: "unavailable",
      candles: [],
      range,
      health: summarizeMarketHealth([]),
      warning: "تاریخچه آنلاین این نماد فعلاً پشتیبانی نمی‌شود.",
    });
  }

  const tindexRun = await historyRun(
    "tindex",
    Boolean(token),
    () => new TindexProvider(token!).getIndicatorCandles(coreSlug, range),
  );
  const health = [providerIdle("tsetmc", true), providerIdle("brsapi", Boolean(brsKey)), tindexRun.health];
  if (tindexRun.value?.length) return liveHistory(tindexRun.value, "tindex", range, health);

  return response({
    mode: token ? "unavailable" : "unconfigured",
    candles: [],
    range,
    health: summarizeMarketHealth(health),
    warning: "برای این بازه تاریخچه تازه دریافت نشد؛ Snapshotهای واقعی ذخیره‌شده روی دستگاه حفظ می‌شوند.",
  });
}
