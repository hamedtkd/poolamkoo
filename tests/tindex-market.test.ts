import assert from "node:assert/strict";
import test from "node:test";
import { parseTindexBoardsPayload, parseTindexOverviewPayload, parseTindexSearchPayload } from "../lib/market/tindex.ts";

test("Tindex stock search converts exchange rial prices to toman", () => {
  const rows = parseTindexSearchPayload({
    success: true,
    data: { rows: [{ slug: "stock-34144395039913458", ticker: "عیار", name: "صندوق طلای عیار مفید", last_price: 611_990, change: 3.78 }] },
  });
  assert.equal(rows.length, 1);
  assert.equal(rows[0]?.id, "stock-34144395039913458");
  assert.equal(rows[0]?.symbol, "عیار");
  assert.equal(rows[0]?.priceToman, 61_199);
  assert.equal(rows[0]?.source, "tindex");
});

test("Tindex overview produces a portfolio quote in toman", () => {
  const quote = parseTindexOverviewPayload({
    success: true,
    data: {
      symbol: { slug: "عیار", ticker: "عیار", name: "صندوق طلای عیار مفید" },
      quote: { last_price: 611_990, last_change: 22_310, last_change_percent: 3.78, nav: 588_000, updated_at: "2026-08-24T12:30:00+03:30" },
    },
  });
  assert.ok(quote);
  assert.equal(quote.priceToman, 61_199);
  assert.equal(quote.changeValueToman, 2_231);
  assert.equal(quote.changePercent, 3.78);
  assert.equal(quote.navToman, 58_800);
  assert.equal(quote.source, "tindex");
});

test("Tindex boards provide toman fallback quotes for dollar, gold and bitcoin", () => {
  const quotes = parseTindexBoardsPayload({
    success: true,
    data: [
      { key: "currency", rows: [{ slug: "USD-EXCHANGE-RATE", name: "دلار آمریکا", price: 100_000, change: 1, updated_at: "2026-08-24T10:00:00Z" }] },
      { key: "gold", rows: [{ slug: "GOLD-18K", name: "طلای ۱۸ عیار", price: 8_000_000, change: 2, updated_at: "2026-08-24T10:00:00Z" }] },
      { key: "crypto", rows: [{ slug: "btc", name: "بیت‌کوین", price: 60_000, change: 3, updated_at: "2026-08-24T10:00:00Z" }] },
    ],
  });
  assert.equal(quotes.find((item) => item.symbol === "USD")?.priceToman, 100_000);
  assert.equal(quotes.find((item) => item.symbol === "IR_GOLD_18K")?.priceToman, 8_000_000);
  assert.equal(quotes.find((item) => item.symbol === "BTC")?.priceToman, 6_000_000_000);
  assert.ok(quotes.every((item) => item.source === "tindex"));
});

test("Tindex indicator candles keep toman prices and decode delta dates", async () => {
  const { parseTindexCandlesPayload } = await import("../lib/market/tindex.ts");
  const candles = parseTindexCandlesPayload({
    success: true,
    data: {
      unit: "تومان",
      t: [20560, 1, 2],
      o: [89_000, 89_400, 90_100],
      h: [89_600, 90_200, 91_300],
      l: [88_700, 89_100, 89_900],
      c: [89_400, 90_100, 92_100],
    },
  });
  assert.equal(candles.length, 3);
  assert.equal(candles[0]?.time, "2026-04-17");
  assert.equal(candles[1]?.time, "2026-04-18");
  assert.equal(candles[2]?.time, "2026-04-20");
  assert.equal(candles[2]?.close, 92_100);
});

test("Tindex exchange candles convert official rial prices to toman", async () => {
  const { parseTindexCandlesPayload } = await import("../lib/market/tindex.ts");
  const candles = parseTindexCandlesPayload({
    success: true,
    data: {
      unit: "ریال",
      t: [20620, 1],
      o: [3210, 3254],
      h: [3260, 3310],
      l: [3180, 3240],
      c: [3250, 3268],
    },
  });
  assert.equal(candles.length, 2);
  assert.equal(candles[0]?.open, 321);
  assert.equal(candles[1]?.close, 326.8);
});

test("Tindex candles reject incomplete or non-positive rows", async () => {
  const { parseTindexCandlesPayload } = await import("../lib/market/tindex.ts");
  const candles = parseTindexCandlesPayload({
    success: true,
    data: { unit: "تومان", t: [20560, 1], o: [100, 0], h: [110, 10], l: [90, 5], c: [105, 8] },
  });
  assert.equal(candles.length, 1);
});
