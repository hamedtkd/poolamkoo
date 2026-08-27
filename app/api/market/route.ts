import { NextRequest, NextResponse } from "next/server";
import { BrsApiProvider } from "@/lib/market/brsapi";
import { mergeMarketQuotes, needsCoreFallback } from "@/lib/market/priority";
import { TindexProvider } from "@/lib/market/tindex";
import { TsetmcProvider } from "@/lib/market/tsetmc";
import type { MarketQuote } from "@/lib/types";

export const dynamic = "force-dynamic";

function issueText(source: string, error: unknown) {
  return `${source}: ${error instanceof Error ? error.message : "در دسترس نیست."}`;
}

export async function GET(request: NextRequest) {
  const brsKey = process.env.BRS_API_KEY?.trim();
  const tindexToken = process.env.TINDEX_API_TOKEN?.trim();
  const tsetmcIds = request.nextUrl.searchParams.getAll("tsetmc").filter((id) => /^\d+$/.test(id)).slice(0, 20);
  const tindexIds = request.nextUrl.searchParams.getAll("tindex").filter(Boolean).slice(0, 20);
  const warnings: string[] = [];
  let primary: MarketQuote[] = [];
  let fallback: MarketQuote[] = [];
  const exchange: MarketQuote[] = [];
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
    } else if (brsIssue) {
      warnings.push(brsIssue);
    }
  }

  if (tsetmcIds.length) {
    try {
      const tsetmcQuotes = await new TsetmcProvider().getQuotes(tsetmcIds);
      exchange.push(...tsetmcQuotes);
      if (tsetmcQuotes.length < tsetmcIds.length) {
        warnings.push("قیمت بعضی نمادهای TSETMC دریافت نشد؛ Snapshot یا قیمت دستی حفظ می‌شود.");
      }
    } catch (error) {
      warnings.push(issueText("TSETMC", error));
    }
  }

  if (tindexIds.length) {
    if (tindex) {
      try {
        const legacyQuotes = await tindex.getQuotes(tindexIds);
        exchange.push(...legacyQuotes);
        if (tindexIds.length > 1) {
          warnings.push("اتصال‌های قدیمی Tindex برای حفاظت از سهمیه رایگان فقط محدود refresh می‌شوند؛ بهتر است به TSETMC دوباره متصل شوند.");
        } else if (!legacyQuotes.length) {
          warnings.push("قیمت اتصال قدیمی Tindex دریافت نشد؛ Snapshot یا قیمت دستی حفظ می‌شود.");
        }
      } catch (error) {
        warnings.push(issueText("Tindex legacy", error));
      }
    } else {
      warnings.push("این دارایی هنوز به Tindex قدیمی وصل است؛ برای قیمت خودکار پایدارتر آن را به TSETMC دوباره متصل کن.");
    }
  }

  const quotes = mergeMarketQuotes({ fallback, primary, exchange });
  const configured = Boolean(brsKey || tindexToken || tsetmcIds.length);
  return NextResponse.json({
    mode: quotes.length ? "live" : configured ? "unavailable" : "unconfigured",
    quotes,
    warning: warnings.length ? warnings.join(" ") : undefined,
    fetchedAt: new Date().toISOString(),
  });
}
