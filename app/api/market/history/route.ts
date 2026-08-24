import { NextRequest, NextResponse } from "next/server";
import { TindexProvider } from "@/lib/market/tindex";
import type { MarketHistoryRange } from "@/lib/types";

export const dynamic = "force-dynamic";

const CORE_HISTORY_SLUGS: Record<string, string> = {
  USD: "USD-EXCHANGE-RATE",
  IR_GOLD_18K: "GOLD-18K",
};

function historyRange(value: string | null): MarketHistoryRange {
  return value === "1m" ? "1m" : "3m";
}

function response(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

export async function GET(request: NextRequest) {
  const token = process.env.TINDEX_API_TOKEN?.trim();
  const symbol = request.nextUrl.searchParams.get("symbol")?.trim() ?? "";
  const marketId = request.nextUrl.searchParams.get("marketId")?.trim() ?? "";
  const range = historyRange(request.nextUrl.searchParams.get("range"));

  if (!token) {
    return response({ mode: "unconfigured", candles: [], range, warning: "توکن Tindex برای تاریخچه بازار تنظیم نشده است." });
  }

  const provider = new TindexProvider(token);
  try {
    const candles = marketId
      ? await provider.getExchangeCandles(marketId.slice(0, 120), range)
      : CORE_HISTORY_SLUGS[symbol]
        ? await provider.getIndicatorCandles(CORE_HISTORY_SLUGS[symbol], range)
        : [];

    if (!candles.length) {
      return response({
        mode: "unavailable",
        candles: [],
        range,
        warning: marketId || CORE_HISTORY_SLUGS[symbol]
          ? "برای این بازه تاریخچه قابل استفاده‌ای دریافت نشد."
          : "تاریخچه آنلاین این نماد فعلاً پشتیبانی نمی‌شود.",
      });
    }

    return response({
      mode: "live",
      candles,
      source: "tindex",
      range,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return response({
      mode: "unavailable",
      candles: [],
      range,
      warning: error instanceof Error ? `Tindex: ${error.message}` : "تاریخچه بازار در دسترس نیست.",
    }, 502);
  }
}
