import { NextRequest, NextResponse } from "next/server";

export const revalidate = 1800;

function demoCandles(base = 100_000) {
  const result = [];
  let close = base;
  const start = new Date();
  start.setDate(start.getDate() - 89);
  for (let i = 0; i < 90; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const wave = Math.sin(i / 4) * 0.012 + Math.sin(i / 13) * 0.018;
    const open = close;
    close = Math.max(1, open * (1 + wave / 3 + (i % 7 - 3) * 0.0012));
    const high = Math.max(open, close) * (1 + 0.006 + (i % 3) * 0.002);
    const low = Math.min(open, close) * (1 - 0.005 - (i % 4) * 0.0015);
    result.push({ time: date.toISOString().slice(0, 10), open: Math.round(open), high: Math.round(high), low: Math.round(low), close: Math.round(close) });
  }
  return result;
}

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol") || "USD";
  const key = process.env.BRS_API_PRO_KEY;
  const bases: Record<string, number> = { USD: 103_000, IR_GOLD_18K: 7_200_000, BTC: 9_000_000_000, USDT: 103_000 };
  if (!key) return NextResponse.json({ mode: "demo", symbol, candles: demoCandles(bases[symbol] ?? 100_000) });

  try {
    const url = `https://Api.BrsApi.ir/Market/Gold_Currency_Pro.php?key=${encodeURIComponent(key)}&history=2&symbol=${encodeURIComponent(symbol)}`;
    const response = await fetch(url, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw new Error(`BRS Pro ${response.status}`);
    const payload = await response.json();
    const rows = Array.isArray(payload) ? payload : payload?.data ?? payload?.result ?? [];
    const candles = rows.map((row: Record<string, unknown>) => ({
      time: String(row.date || "").replaceAll("/", "-"),
      open: Number(row.open || 0), high: Number(row.high || 0), low: Number(row.low || 0), close: Number(row.close || 0),
    })).filter((x: { time: string; close: number }) => x.time && x.close > 0);
    if (candles.length) return NextResponse.json({ mode: "live", symbol, candles });
    return NextResponse.json({ mode: "fallback", symbol, candles: demoCandles(bases[symbol] ?? 100_000), warning: "تاریخچه واقعی خالی بود؛ داده نمونه نمایش داده شد." });
  } catch {
    return NextResponse.json({ mode: "fallback", symbol, candles: demoCandles(bases[symbol] ?? 100_000) });
  }
}
