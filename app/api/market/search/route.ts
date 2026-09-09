import { NextRequest, NextResponse } from "next/server";
import { BrsApiProvider } from "@/lib/market/brsapi";
import { normalizeExchangeSymbol } from "@/lib/market/exchange-target";
import { providerIdle, runMarketProvider, summarizeMarketHealth, type MarketProviderHealth } from "@/lib/market/reliability";
import { TindexProvider } from "@/lib/market/tindex";
import { TsetmcProvider } from "@/lib/market/tsetmc";
import type { MarketInstrument } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim().slice(0, 80) ?? "";
  if (query.length < 2) return NextResponse.json({ results: [] });

  const brsKey = process.env.BRS_API_KEY?.trim();
  const tindexToken = process.env.TINDEX_API_TOKEN?.trim();
  const health: MarketProviderHealth[] = [];

  const tsetmcRun = await runMarketProvider({
    provider: "tsetmc",
    operation: () => new TsetmcProvider().search(query),
    itemCount: (results) => results.length,
  });
  health.push(tsetmcRun.health);
  if (tsetmcRun.value?.length) {
    health.push(providerIdle("brsapi", Boolean(brsKey)), providerIdle("tindex", Boolean(tindexToken)));
    return NextResponse.json({ mode: "live", results: tsetmcRun.value, health: summarizeMarketHealth(health) });
  }

  if (tsetmcRun.health.status === "unavailable" && brsKey) {
    const syntheticId = `brs:${normalizeExchangeSymbol(query)}`;
    const brsRun = await runMarketProvider({
      provider: "brsapi",
      requestedCount: 1,
      operation: () => new BrsApiProvider(brsKey).getExchangeQuote({ source: "tsetmc", id: syntheticId, symbol: query, name: query }),
      itemCount: (quote) => quote ? 1 : 0,
    });
    health.push(brsRun.health);
    if (brsRun.value) {
      const result: MarketInstrument = {
        id: syntheticId,
        symbol: query,
        name: query,
        priceToman: brsRun.value.priceToman,
        changePercent: brsRun.value.changePercent,
        source: "tsetmc",
      };
      health.push(providerIdle("tindex", Boolean(tindexToken)));
      return NextResponse.json({
        mode: "live",
        results: [result],
        health: summarizeMarketHealth(health),
        warning: "جست‌وجوی اصلی بازار در دسترس نبود و نماد از یک منبع داده دیگر تأیید شد.",
      });
    }
  } else {
    health.push(providerIdle("brsapi", Boolean(brsKey)));
  }

  if (tindexToken) {
    const tindexRun = await runMarketProvider({
      provider: "tindex",
      operation: () => new TindexProvider(tindexToken).search(query),
      itemCount: (results) => results.length,
    });
    health.push(tindexRun.health);
    if (tindexRun.value?.length) {
      return NextResponse.json({
        mode: "live",
        results: tindexRun.value,
        health: summarizeMarketHealth(health),
        warning: tsetmcRun.health.status === "unavailable" ? "جست‌وجوی نماد از یکی از منابع فعال بازار انجام شد." : undefined,
      });
    }
  } else {
    health.push(providerIdle("tindex", false));
  }

  return NextResponse.json({
    mode: "unavailable",
    results: [],
    health: summarizeMarketHealth(health),
    warning: "جست‌وجوی خودکار از منابع بازار نتیجه نداد؛ می‌توانی نماد و قیمت را دستی ثبت کنی.",
  });
}
