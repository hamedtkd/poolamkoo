import assert from "node:assert/strict";
import test from "node:test";
import { parseTsetmcHistoryPayload, parseTsetmcQuotePayload, parseTsetmcSearchPayload } from "../lib/market/tsetmc.ts";

test("TSETMC search maps InsCode, symbol and name without an API key model", () => {
  const results = parseTsetmcSearchPayload({
    instrumentSearch: [
      { insCode: "46348559193224090", lVal18AFC: "فولاد", lVal30: "فولاد مبارکه اصفهان", flowTitle: "بورس" },
      { insCode: "bad", lVal18AFC: "نامعتبر", lVal30: "رد شود" },
    ],
  });
  assert.deepEqual(results, [{
    id: "46348559193224090",
    symbol: "فولاد",
    name: "فولاد مبارکه اصفهان",
    source: "tsetmc",
  }]);
});

test("TSETMC current quote converts rial to toman and computes daily change", () => {
  const quote = parseTsetmcQuotePayload({
    closingPriceInfo: {
      insCode: "46348559193224090",
      pDrCotVal: 23810,
      pClosing: 23600,
      priceYesterday: 23120,
      dEven: 20260827,
      hEven: 123456,
    },
  }, "46348559193224090", { symbol: "فولاد", name: "فولاد مبارکه" });

  assert.ok(quote);
  assert.equal(quote.source, "tsetmc");
  assert.equal(quote.marketId, "46348559193224090");
  assert.equal(quote.symbol, "فولاد");
  assert.equal(quote.priceToman, 2381);
  assert.equal(quote.changeValueToman, 69);
  assert.ok(Math.abs(quote.changePercent - (690 / 23120) * 100) < 1e-10);
  assert.match(quote.asOf, /^2026-08-27T/);
});

test("TSETMC quote safely falls back to closing price and rejects non-positive prices", () => {
  const fallback = parseTsetmcQuotePayload({ closingPriceInfo: { pDrCotVal: 0, pClosing: 10000, priceYesterday: 10000 } }, "1");
  assert.equal(fallback?.priceToman, 1000);
  assert.equal(fallback?.changePercent, 0);
  assert.equal(parseTsetmcQuotePayload({ closingPriceInfo: { pDrCotVal: 0, pClosing: 0 } }, "1"), null);
});

test("TSETMC daily history converts OHLC rial to toman and sorts ascending", () => {
  const candles = parseTsetmcHistoryPayload({
    closingPriceDaily: [
      { dEven: 20260827, priceFirst: 24000, priceMax: 25000, priceMin: 23500, pClosing: 24800 },
      { dEven: 20260826, priceFirst: 23000, priceMax: 24200, priceMin: 22800, pClosing: 23800 },
    ],
  });
  assert.deepEqual(candles, [
    { time: "2026-08-26", open: 2300, high: 2420, low: 2280, close: 2380 },
    { time: "2026-08-27", open: 2400, high: 2500, low: 2350, close: 2480 },
  ]);
});

test("TSETMC history ignores invalid rows and never returns NaN or Infinity", () => {
  const candles = parseTsetmcHistoryPayload({
    closingPriceDaily: [
      { dEven: "bad", priceFirst: 100, priceMax: 110, priceMin: 90, pClosing: 105 },
      { dEven: 20260827, priceFirst: "x", priceMax: 110, priceMin: 90, pClosing: 0 },
      { dEven: 20260828, priceFirst: 100, priceMax: 110, priceMin: 90, pClosing: 105 },
    ],
  });
  assert.equal(candles.length, 1);
  assert.ok(Object.values(candles[0]).slice(1).every((value) => Number.isFinite(value)));
});
