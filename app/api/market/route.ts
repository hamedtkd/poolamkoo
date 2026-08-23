import { NextResponse } from "next/server";
import { BrsApiProvider } from "@/lib/market/brsapi";

export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.BRS_API_KEY;
  if (!key) {
    return NextResponse.json({
      mode: "unconfigured",
      quotes: [],
      warning: "\u06a9\u0644\u06cc\u062f BrsApi \u062a\u0646\u0638\u06cc\u0645 \u0646\u0634\u062f\u0647 \u0627\u0633\u062a.",
      fetchedAt: new Date().toISOString(),
    });
  }

  try {
    const provider = new BrsApiProvider(key);
    const quotes = await provider.getQuotes();
    return NextResponse.json({
      mode: quotes.length ? "live" : "unavailable",
      quotes,
      warning: quotes.length ? undefined : "\u0642\u06cc\u0645\u062a \u0645\u0639\u062a\u0628\u0631\u06cc \u0627\u0632 BrsApi \u062f\u0631\u06cc\u0627\u0641\u062a \u0646\u0634\u062f.",
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      mode: "unavailable",
      quotes: [],
      warning: error instanceof Error ? error.message : "\u0633\u0631\u0648\u06cc\u0633 \u0628\u0627\u0632\u0627\u0631 \u062f\u0631 \u062f\u0633\u062a\u0631\u0633 \u0646\u06cc\u0633\u062a.",
      fetchedAt: new Date().toISOString(),
    }, { status: 502 });
  }
}
