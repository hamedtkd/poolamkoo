import { NextRequest, NextResponse } from "next/server";
import { TsetmcProvider } from "@/lib/market/tsetmc";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return NextResponse.json({ results: [] });

  try {
    const results = await new TsetmcProvider().search(query.slice(0, 80));
    return NextResponse.json({
      mode: "live",
      results,
      warning: results.length ? undefined : "نمادی در TSETMC پیدا نشد؛ می‌توانی نماد و قیمت را دستی ثبت کنی.",
    });
  } catch (error) {
    return NextResponse.json({
      mode: "unavailable",
      results: [],
      warning: error instanceof Error
        ? `${error.message} قیمت دستی و Snapshotهای قبلی همچنان قابل استفاده‌اند.`
        : "جست‌وجوی TSETMC در دسترس نیست؛ قیمت دستی همچنان قابل استفاده است.",
    }, { status: 502 });
  }
}
