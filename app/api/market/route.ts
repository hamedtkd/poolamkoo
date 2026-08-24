import { NextRequest, NextResponse } from "next/server";
import { BrsApiProvider } from "@/lib/market/brsapi";
import { mergeMarketQuotes, needsCoreFallback } from "@/lib/market/priority";
import { TindexProvider } from "@/lib/market/tindex";
import type { MarketQuote } from "@/lib/types";

export const dynamic = "force-dynamic";

function issueText(source: string, error: unknown) {
  return `${source}: ${error instanceof Error ? error.message : "در دسترس نیست."}`;
}

export async function GET(request: NextRequest) {
  const brsKey = process.env.BRS_API_KEY?.trim();
  const tindexToken = process.env.TINDEX_API_TOKEN?.trim();
  const tindexIds = request.nextUrl.searchParams.getAll("tindex").filter(Boolean).slice(0, 20);
  const warnings: string[] = [];
  let primary: MarketQuote[] = [];
  let fallback: MarketQuote[] = [];
  let exchange: MarketQuote[] = [];
  let brsIssue: string | undefined;

  if (brsKey) {
    try {
      primary = await new BrsApiProvider(brsKey).getQuotes();
    } catch (error) {
      brsIssue = issueText("BrsApi", error);
    }
  } else {
    brsIssue = "کلید BrsApi تنظیم نشده است.";
  }

  const tindex = tindexToken ? new TindexProvider(tindexToken) : null;
  if (needsCoreFallback(primary)) {
    if (tindex) {
      try {
        fallback = await tindex.getFallbackQuotes();
      } catch (error) {
        warnings.push(issueText("Tindex fallback", error));
      }
      if (needsCoreFallback(mergeMarketQuotes({ fallback, primary }))) {
        if (brsIssue) warnings.push(brsIssue);
        warnings.push("بعضی نرخ‌های پایه از هیچ Provider فعالی دریافت نشدند.");
      }
    } else {
      if (brsIssue) warnings.push(brsIssue);
      warnings.push("توکن Tindex تنظیم نشده؛ منبع پشتیبان بازار فعال نیست.");
    }
  }

  if (tindex && tindexIds.length) {
    try {
      exchange = await tindex.getQuotes(tindexIds);
      if (exchange.length < tindexIds.length) warnings.push("قیمت بعضی نمادهای بورسی دریافت نشد.");
    } catch (error) {
      warnings.push(issueText("Tindex", error));
    }
  } else if (tindexIds.length && !tindexToken) {
    warnings.push("توکن Tindex تنظیم نشده؛ قیمت سهام و صندوق‌های بورسی دستی می‌ماند.");
  }

  const quotes = mergeMarketQuotes({ fallback, primary, exchange });
  const configured = Boolean(brsKey || tindexToken);
  return NextResponse.json({
    mode: quotes.length ? "live" : configured ? "unavailable" : "unconfigured",
    quotes,
    warning: warnings.length ? warnings.join(" ") : undefined,
    fetchedAt: new Date().toISOString(),
  });
}
