import { NextRequest, NextResponse } from "next/server";
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

  try {
    if (marketId && source === "tsetmc") {
      const candles = await new TsetmcProvider().getCandles(marketId, range);
      return candles.length
        ? response({ mode: "live", candles, source: "tsetmc", range, fetchedAt: new Date().toISOString() })
        : response({ mode: "unavailable", candles: [], range, warning: "TSETMC برای این بازه تاریخچه قابل استفاده‌ای برنگرداند." });
    }

    if (marketId && source === "tindex") {
      if (!token) return response({ mode: "unconfigured", candles: [], range, warning: "این اتصال قدیمی Tindex است؛ برای تاریخچه پایدارتر نماد را به TSETMC دوباره متصل کن." });
      const candles = await new TindexProvider(token).getExchangeCandles(marketId, range);
      return candles.length
        ? response({ mode: "live", candles, source: "tindex", range, fetchedAt: new Date().toISOString() })
        : response({ mode: "unavailable", candles: [], range, warning: "Tindex برای این بازه تاریخچه قابل استفاده‌ای برنگرداند." });
    }

    const coreSlug = CORE_HISTORY_SLUGS[symbol];
    if (!coreSlug) return response({ mode: "unavailable", candles: [], range, warning: "تاریخچه آنلاین این نماد فعلاً پشتیبانی نمی‌شود." });
    if (!token) return response({ mode: "unconfigured", candles: [], range, warning: "تاریخچه آنلاین دلار/طلا به Tindex اختیاری نیاز دارد؛ Snapshotهای واقعی دستگاه fallback هستند." });

    const candles = await new TindexProvider(token).getIndicatorCandles(coreSlug, range);
    return candles.length
      ? response({ mode: "live", candles, source: "tindex", range, fetchedAt: new Date().toISOString() })
      : response({ mode: "unavailable", candles: [], range, warning: "برای این بازه تاریخچه قابل استفاده‌ای دریافت نشد." });
  } catch (error) {
    const provider = marketId ? (source === "tsetmc" ? "TSETMC" : "Tindex") : "Tindex";
    return response({
      mode: "unavailable",
      candles: [],
      range,
      warning: error instanceof Error ? `${provider}: ${error.message}` : "تاریخچه بازار در دسترس نیست.",
    }, 502);
  }
}
