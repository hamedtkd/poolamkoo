import { NextRequest, NextResponse } from "next/server";
import { TindexProvider } from "@/lib/market/tindex";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return NextResponse.json({ results: [] });

  const token = process.env.TINDEX_API_TOKEN?.trim();
  if (!token) {
    return NextResponse.json({
      mode: "unconfigured",
      results: [],
      warning: "برای جست‌وجوی خودکار بورس، TINDEX_API_TOKEN را تنظیم کن.",
    });
  }

  try {
    const results = await new TindexProvider(token).search(query);
    return NextResponse.json({ mode: "live", results });
  } catch (error) {
    return NextResponse.json({
      mode: "unavailable",
      results: [],
      warning: error instanceof Error ? error.message : "جست‌وجوی بازار در دسترس نیست.",
    }, { status: 502 });
  }
}
