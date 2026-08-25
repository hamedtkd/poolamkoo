import test from "node:test";
import assert from "node:assert/strict";
import { marketWatchlistRows, navSignal, watchlistSummary } from "../lib/market/watchlist.ts";
import type { Asset, MarketQuote, MarketWatchItem } from "../lib/types.ts";

const watchlist: MarketWatchItem[] = [
  { marketId: "a", symbol: "عیار", name: "صندوق طلای عیار", source: "tindex", createdAt: "2026-08-01", updatedAt: "2026-08-01" },
  { marketId: "b", symbol: "سیمین", name: "صندوق نقره سیمین", source: "tindex", createdAt: "2026-08-02", updatedAt: "2026-08-02" },
  { marketId: "c", symbol: "فولاد", name: "فولاد مبارکه", source: "tindex", createdAt: "2026-08-03", updatedAt: "2026-08-03" },
];

const quotes: MarketQuote[] = [
  { symbol: "عیار", name: "عیار", priceToman: 97, navToman: 100, changePercent: 1.2, changeValueToman: 1, asOf: "2026-08-25", source: "tindex" },
  { symbol: "سیمین", name: "سیمین", priceToman: 104, navToman: 100, changePercent: -2, changeValueToman: -2, asOf: "2026-08-25", source: "tindex" },
  { symbol: "فولاد", name: "فولاد", priceToman: 80, changePercent: 0.4, changeValueToman: 1, asOf: "2026-08-25", source: "tindex" },
];

const assets: Asset[] = [{ id: 1, name: "عیار", kind: "fund", symbol: "عیار", marketId: "a", marketSource: "tindex", targetPct: 20, icon: "fund", archived: false, createdAt: "x", updatedAt: "x" }];

test("watchlist can filter by portfolio membership and NAV opportunity", () => {
  assert.deepEqual(marketWatchlistRows({ watchlist, quotes, assets, filter: "owned" }).map((row) => row.item.symbol), ["عیار"]);
  assert.deepEqual(marketWatchlistRows({ watchlist, quotes, assets, filter: "discount" }).map((row) => row.item.symbol), ["عیار"]);
  assert.deepEqual(marketWatchlistRows({ watchlist, quotes, assets, filter: "premium" }).map((row) => row.item.symbol), ["سیمین"]);
});

test("watchlist sorts movers and normalizes Persian search", () => {
  assert.deepEqual(marketWatchlistRows({ watchlist, quotes, assets, sort: "gain" }).map((row) => row.item.symbol), ["عیار", "فولاد", "سیمین"]);
  assert.deepEqual(marketWatchlistRows({ watchlist, quotes, assets, query: "طلا" }).map((row) => row.item.symbol), ["عیار"]);
});

test("watchlist summary and NAV labels are decision oriented", () => {
  const rows = marketWatchlistRows({ watchlist, quotes, assets });
  assert.deepEqual(watchlistSummary(rows), { total: 3, gainers: 2, discounts: 1, premiums: 1 });
  assert.equal(navSignal(-3).tone, "positive");
  assert.equal(navSignal(4).tone, "negative");
  assert.equal(navSignal(0.2).label, "نزدیک NAV");
});
