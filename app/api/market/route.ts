import { NextRequest, NextResponse } from "next/server";
import { BrsApiProvider } from "@/lib/market/brsapi";
import { mergeMarketQuotes, missingCoreSymbols, needsCoreFallback } from "@/lib/market/priority";
import {
  marketProviderWarning,
  mergeProviderHealth,
  providerIdle,
  runMarketProvider,
  summarizeMarketHealth,
} from "@/lib/market/reliability";
import { TindexProvider } from "@/lib/market/tindex";
import { TsetmcProvider } from "@/lib/market/tsetmc";
import type { MarketQuote } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const brsKey = process.env.BRS_API_KEY?.trim();
  const tindexToken = process.env.TINDEX_API_TOKEN?.trim();
  const tsetmcIds = request.nextUrl.searchParams.getAll("tsetmc").filter((id) => /^\d+$/.test(id)).slice(0, 20);
  const tindexIds = request.nextUrl.searchParams.getAll("tindex").filter(Boolean).slice(0, 20);
  const warnings: string[] = [];
  const tindex = tindexToken ? new TindexProvider(tindexToken) : null;

  const [brsRun, tsetmcRun, legacyRun] = await Promise.all([
    runMarketProvider({
      provider: "brsapi",
      configured: Boolean(brsKey),
      requestedCount: 3,
      operation: () => new BrsApiProvider(brsKey!).getQuotes(),
      itemCount: (quotes) => quotes.filter((quote) => ["USD", "IR_GOLD_18K", "BTC"].includes(quote.symbol)).length,
    }),
    tsetmcIds.length
      ? runMarketProvider({
          provider: "tsetmc",
          requestedCount: tsetmcIds.length,
          operation: () => new TsetmcProvider().getQuotes(tsetmcIds),
          itemCount: (quotes) => quotes.length,
        })
      : Promise.resolve({ value: [] as MarketQuote[], health: providerIdle("tsetmc", true) }),
    tindexIds.length && tindex
      ? runMarketProvider({
          provider: "tindex",
          requestedCount: tindexIds.length,
          operation: () => tindex.getQuotes(tindexIds),
          itemCount: (quotes) => quotes.length,
        })
      : Promise.resolve({ value: [] as MarketQuote[], health: providerIdle("tindex", Boolean(tindex)) }),
  ]);

  const primary = brsRun.value ?? [];
  let fallback: MarketQuote[] = [];
  const exchange = [...(tsetmcRun.value ?? []), ...(legacyRun.value ?? [])];
  let tindexHealth = legacyRun.health;

  if (tsetmcIds.length) {
    const warning = marketProviderWarning(tsetmcRun.health);
    if (warning) warnings.push(warning);
  }

  if (tindexIds.length) {
    if (!tindex) {
      warnings.push("این دارایی هنوز به Tindex قدیمی وصل است؛ برای قیمت خودکار پایدارتر آن را به TSETMC دوباره متصل کن.");
    } else {
      const legacyWarning = marketProviderWarning(
        legacyRun.health,
        tindexIds.length > 1
          ? "اتصال‌های قدیمی Tindex برای حفاظت از سهمیه رایگان محدود refresh می‌شوند؛ بهتر است به TSETMC دوباره متصل شوند."
          : "قیمت اتصال قدیمی Tindex دریافت نشد؛ Snapshot یا قیمت دستی حفظ می‌شود.",
      );
      if (legacyWarning) warnings.push(legacyWarning);
    }
  }

  if (needsCoreFallback(primary)) {
    const missingBeforeFallback = missingCoreSymbols(primary);
    if (tindex) {
      const fallbackRun = await runMarketProvider({
        provider: "tindex",
        requestedCount: missingBeforeFallback.length,
        operation: () => tindex.getFallbackQuotes(),
        itemCount: (quotes) => missingBeforeFallback.filter((symbol) => quotes.some((quote) => quote.symbol === symbol)).length,
      });
      fallback = fallbackRun.value ?? [];
      tindexHealth = mergeProviderHealth(tindexHealth, fallbackRun.health);
      const fallbackWarning = marketProviderWarning(fallbackRun.health);
      if (fallbackWarning) warnings.push(fallbackWarning);
      if (!needsCoreFallback(mergeMarketQuotes({ fallback, primary })) && brsRun.health.status !== "ok") {
        warnings.push("نرخ‌های پایه ناقص BrsApi با fallback اختیاری Tindex تکمیل شد.");
      }
    }

    if (needsCoreFallback(mergeMarketQuotes({ fallback, primary }))) {
      const brsWarning = marketProviderWarning(
        brsRun.health,
        brsKey ? undefined : "کلید BrsApi تنظیم نشده است و همه نرخ‌های پایه قابل دریافت نیستند.",
      );
      if (brsWarning) warnings.push(brsWarning);
      warnings.push("بعضی نرخ‌های پایه از هیچ Provider فعالی دریافت نشدند؛ آخرین Snapshot معتبر حفظ می‌شود.");
    }
  }

  const quotes = mergeMarketQuotes({ fallback, primary, exchange });
  const configured = Boolean(brsKey || tindexToken || tsetmcIds.length);
  const health = summarizeMarketHealth([brsRun.health, tsetmcRun.health, tindexHealth]);
  return NextResponse.json({
    mode: quotes.length ? "live" : configured ? "unavailable" : "unconfigured",
    quotes,
    health,
    warning: warnings.length ? [...new Set(warnings)].join(" ") : undefined,
    fetchedAt: new Date().toISOString(),
  });
}
