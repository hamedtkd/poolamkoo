import { NextRequest, NextResponse } from "next/server";
import { BrsApiProvider } from "@/lib/market/brsapi";
import { parseExchangeTargets, type ExchangeQuoteTarget } from "@/lib/market/exchange-target";
import { marketIdentityKey } from "@/lib/market/identity";
import { mergeMarketQuotes, missingCoreSymbols, needsCoreFallback } from "@/lib/market/priority";
import {
  mergeProviderHealth,
  providerIdle,
  runMarketProvider,
  summarizeMarketHealth,
  type MarketProviderHealth,
} from "@/lib/market/reliability";
import { TindexProvider } from "@/lib/market/tindex";
import { TsetmcProvider } from "@/lib/market/tsetmc";
import type { MarketQuote } from "@/lib/types";

export const dynamic = "force-dynamic";

function targetKey(target: Pick<ExchangeQuoteTarget, "source" | "id">) {
  return marketIdentityKey({ source: target.source, marketId: target.id });
}

function quoteTargetKey(quote: MarketQuote) {
  if (!quote.marketId) return null;
  const source = quote.marketSource ?? (quote.source === "tsetmc" || quote.source === "tindex" ? quote.source : undefined);
  return source ? marketIdentityKey({ source, marketId: quote.marketId }) : null;
}

function missingTargets(targets: readonly ExchangeQuoteTarget[], quotes: readonly MarketQuote[]) {
  const covered = new Set(quotes.map(quoteTargetKey).filter((value): value is string => Boolean(value)));
  return targets.filter((target) => !covered.has(targetKey(target)));
}

function legacyTargets(request: NextRequest) {
  const targets: ExchangeQuoteTarget[] = [];
  for (const id of request.nextUrl.searchParams.getAll("tsetmc").filter((value) => /^\d+$/.test(value)).slice(0, 20)) {
    targets.push({ source: "tsetmc", id, symbol: id, name: id });
  }
  for (const id of request.nextUrl.searchParams.getAll("tindex").filter(Boolean).slice(0, 20)) {
    targets.push({ source: "tindex", id, symbol: id, name: id });
  }
  return targets;
}

function mergedHealth(current: MarketProviderHealth, next: MarketProviderHealth) {
  return mergeProviderHealth(current, next);
}

export async function GET(request: NextRequest) {
  const brsKey = process.env.BRS_API_KEY?.trim();
  const tindexToken = process.env.TINDEX_API_TOKEN?.trim();
  const parsedTargets = parseExchangeTargets(request.nextUrl.searchParams.getAll("target"));
  const targets = parsedTargets.length ? parsedTargets : legacyTargets(request);
  const brs = brsKey ? new BrsApiProvider(brsKey) : null;
  const tindex = tindexToken ? new TindexProvider(tindexToken) : null;

  const coreRunPromise = runMarketProvider({
    provider: "brsapi",
    configured: Boolean(brs),
    requestedCount: 3,
    operation: () => brs!.getQuotes(),
    itemCount: (quotes) => quotes.filter((quote) => ["USD", "IR_GOLD_18K", "BTC"].includes(quote.symbol)).length,
  });

  const tsetmcRun = targets.length
    ? await runMarketProvider({
        provider: "tsetmc",
        requestedCount: targets.length,
        operation: () => new TsetmcProvider().getTargetQuotes(targets),
        itemCount: (quotes) => quotes.length,
      })
    : { value: [] as MarketQuote[], health: providerIdle("tsetmc", true) };

  const exchangeQuotes: MarketQuote[] = [...(tsetmcRun.value ?? [])];
  let remaining = missingTargets(targets, exchangeQuotes);
  let brsHealth = providerIdle("brsapi", Boolean(brs));

  if (remaining.length && brs) {
    const brsExchangeRun = await runMarketProvider({
      provider: "brsapi",
      requestedCount: remaining.length,
      operation: () => brs.getExchangeQuotes(remaining.filter((target) => target.symbol !== target.id)),
      itemCount: (quotes) => quotes.length,
    });
    exchangeQuotes.push(...(brsExchangeRun.value ?? []));
    brsHealth = brsExchangeRun.health;
    remaining = missingTargets(targets, exchangeQuotes);
  }

  const coreRun = await coreRunPromise;
  brsHealth = mergedHealth(brsHealth, coreRun.health);
  const corePrimary = coreRun.value ?? [];
  let coreSecondary: MarketQuote[] = [];
  let tindexHealth = providerIdle("tindex", Boolean(tindex));
  let tindexUsed = false;

  // For exchange-linked assets, preserve the public resilience chain:
  // TSETMC first, then BrsApi, then Tindex. Tindex is limited to one
  // upstream request per route execution to respect the domain plan.
  if (remaining.length && tindex) {
    const tindexExchangeRun = await runMarketProvider({
      provider: "tindex",
      requestedCount: 1,
      operation: () => tindex.getTargetQuotes(remaining),
      itemCount: (quotes) => quotes.length,
    });
    exchangeQuotes.push(...(tindexExchangeRun.value ?? []));
    tindexHealth = tindexExchangeRun.health;
    tindexUsed = true;
    remaining = missingTargets(targets, exchangeQuotes);
  }

  // TSETMC does not expose equivalent public spot feeds for the app's
  // USD/gold/BTC cards, so those core quotes use BrsApi and then Tindex.
  if (needsCoreFallback(corePrimary) && tindex && !tindexUsed) {
    const missing = missingCoreSymbols(corePrimary);
    const tindexCoreRun = await runMarketProvider({
      provider: "tindex",
      requestedCount: missing.length,
      operation: () => tindex.getCoreQuotes(),
      itemCount: (quotes) => missing.filter((symbol) => quotes.some((quote) => quote.symbol === symbol)).length,
    });
    coreSecondary = tindexCoreRun.value ?? [];
    tindexHealth = tindexCoreRun.health;
    tindexUsed = true;
  }

  const coreQuotes = mergeMarketQuotes({ fallback: coreSecondary, primary: corePrimary });
  const quotes = mergeMarketQuotes({ primary: coreQuotes, exchange: exchangeQuotes });
  const missingCore = missingCoreSymbols(coreQuotes);
  const warnings: string[] = [];
  const providerHealth = [brsHealth, tsetmcRun.health, tindexHealth];
  const someProviderFailed = providerHealth.some((item) => item.status === "degraded" || item.status === "unavailable");

  if (someProviderFailed && !remaining.length && !missingCore.length) {
    warnings.push("بعضی منابع داده در این نوبت پاسخ کامل ندادند و قیمت‌ها از منابع دیگر تکمیل شدند.");
  }
  if (remaining.length || missingCore.length) {
    warnings.push("بعضی قیمت‌های تازه از منابع بازار دریافت نشدند؛ آخرین Snapshot معتبر یا قیمت دستی حفظ می‌شود.");
  }

  const configured = Boolean(brsKey || tindexToken || targets.length);
  const health = summarizeMarketHealth(providerHealth);
  const cacheControl = targets.length
    ? "private, no-store"
    : "public, max-age=0, s-maxage=60, stale-while-revalidate=300";

  return NextResponse.json({
    mode: quotes.length ? "live" : configured ? "unavailable" : "unconfigured",
    quotes,
    health,
    warning: warnings.length ? [...new Set(warnings)].join(" ") : undefined,
    fetchedAt: new Date().toISOString(),
  }, { headers: { "Cache-Control": cacheControl } });
}
