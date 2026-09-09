import assert from "node:assert/strict";
import test from "node:test";
import { parseBrsTsetmcHistoryPayload, parseBrsTsetmcQuote } from "../lib/market/brsapi.ts";

const row = {
  date: "1405/06/18",
  time: "12:30:00",
  pmin: 24_000,
  pmax: 25_500,
  py: 24_000,
  pf: 24_500,
  pl: 25_000,
  pc: 25_000,
  pcc: 1_000,
  pcp: 4.1667,
};

test("BrsApi TSETMC history normalizes Jalali dates and rial OHLC values", () => {
  const candles = parseBrsTsetmcHistoryPayload({ data: [row] });
  assert.deepEqual(candles, [{ time: "2026-09-09", open: 2_450, high: 2_550, low: 2_400, close: 2_500 }]);
});

test("BrsApi exchange quote retains the linked market identity while exposing the actual provider", () => {
  const quote = parseBrsTsetmcQuote([row], { source: "tsetmc", id: "123", symbol: "فولاد", name: "فولاد مبارکه اصفهان" });
  assert.equal(quote?.source, "brsapi");
  assert.equal(quote?.marketSource, "tsetmc");
  assert.equal(quote?.marketId, "123");
  assert.equal(quote?.priceToman, 2_500);
  assert.equal(quote?.changeValueToman, 100);
  assert.ok((quote?.asOf ?? "").startsWith("2026-09-09T09:00:00"));
});

test("BrsApi exchange parser rejects payloads without a positive market close", () => {
  assert.equal(parseBrsTsetmcQuote([{ date: "1405/06/18", pc: 0, pl: 0 }], { source: "tsetmc", id: "123", symbol: "فولاد", name: "فولاد" }), null);
});
