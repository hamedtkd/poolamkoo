import { NextRequest, NextResponse } from "next/server";
import { marketProviderWarning, runMarketProvider, summarizeMarketHealth } from "@/lib/market/reliability";
import { TsetmcProvider } from "@/lib/market/tsetmc";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return NextResponse.json({ results: [] });

  const run = await runMarketProvider({
    provider: "tsetmc",
    operation: () => new TsetmcProvider().search(query.slice(0, 80)),
    itemCount: (results) => results.length,
  });
  const results = run.value ?? [];
  const health = summarizeMarketHealth([run.health]);
  if (run.health.status === "unavailable") {
    return NextResponse.json({
      mode: "unavailable",
      results: [],
      health,
      warning: `${marketProviderWarning(run.health) ?? "جست‌وجوی TSETMC در دسترس نیست."} قیمت دستی و Snapshotهای قبلی همچنان قابل استفاده‌اند.`,
    }, { status: 502 });
  }

  return NextResponse.json({
    mode: "live",
    results,
    health,
    warning: results.length ? undefined : "نمادی در TSETMC پیدا نشد؛ می‌توانی نماد و قیمت را دستی ثبت کنی.",
  });
}
