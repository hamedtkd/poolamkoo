import { premiumToNavPercent } from "./nav.ts";
import { marketIdentityKey } from "./identity.ts";
import { marketQuoteForTarget } from "./valuation.ts";
import { normalizeSearchText } from "../search.ts";
import type { Asset, MarketQuote, MarketWatchItem } from "../types.ts";

export type WatchlistFilter = "all" | "owned" | "unowned" | "discount" | "premium";
export type WatchlistSort = "newest" | "gain" | "loss" | "discount" | "premium" | "symbol";

export interface WatchlistRow {
  item: MarketWatchItem;
  quote?: MarketQuote;
  owned: boolean;
  premium: number | null;
}

export function marketWatchlistRows({ watchlist, quotes, assets, query = "", filter = "all", sort = "newest" }: {
  watchlist: MarketWatchItem[];
  quotes: MarketQuote[];
  assets: Asset[];
  query?: string;
  filter?: WatchlistFilter;
  sort?: WatchlistSort;
}) {
  const ownedMarketKeys = new Set(assets.flatMap((asset) => asset.marketId && asset.marketSource ? [marketIdentityKey({ source: asset.marketSource, marketId: asset.marketId })] : []));
  const normalizedQuery = normalizeSearchText(query);
  const rows: WatchlistRow[] = watchlist.map((item) => {
    const quote = marketQuoteForTarget({ source: item.source, marketId: item.marketId, symbol: item.symbol }, quotes);
    return {
      item,
      quote,
      owned: ownedMarketKeys.has(marketIdentityKey(item)),
      premium: quote?.runtimeSource === "snapshot" ? null : quote ? premiumToNavPercent(quote.priceToman, quote.navToman) : null,
    };
  }).filter((row) => {
    if (normalizedQuery) {
      const haystack = normalizeSearchText(`${row.item.symbol} ${row.item.name}`);
      if (!haystack.includes(normalizedQuery)) return false;
    }
    if (filter === "owned") return row.owned;
    if (filter === "unowned") return !row.owned;
    if (filter === "discount") return row.premium !== null && row.premium < -0.5;
    if (filter === "premium") return row.premium !== null && row.premium > 0.5;
    return true;
  });

  return rows.sort((a, b) => compareRows(a, b, sort));
}

export function watchlistSummary(rows: WatchlistRow[]) {
  return {
    total: rows.length,
    gainers: rows.filter((row) => row.quote?.runtimeSource !== "snapshot" && (row.quote?.changePercent ?? 0) > 0).length,
    discounts: rows.filter((row) => row.premium !== null && row.premium < -0.5).length,
    premiums: rows.filter((row) => row.premium !== null && row.premium > 0.5).length,
  };
}

export function navSignal(premium: number | null) {
  if (premium === null) return { label: "NAV منتشر نشده", tone: "neutral" as const };
  const formatted = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(Math.abs(premium));
  if (premium < -0.5) return { label: `تخفیف ${formatted}٪`, tone: "positive" as const };
  if (premium > 0.5) return { label: `حباب +${formatted}٪`, tone: "negative" as const };
  return { label: "نزدیک NAV", tone: "neutral" as const };
}

function compareRows(a: WatchlistRow, b: WatchlistRow, sort: WatchlistSort) {
  if (sort === "gain") return (freshChange(b) ?? Number.NEGATIVE_INFINITY) - (freshChange(a) ?? Number.NEGATIVE_INFINITY);
  if (sort === "loss") return (freshChange(a) ?? Number.POSITIVE_INFINITY) - (freshChange(b) ?? Number.POSITIVE_INFINITY);
  if (sort === "discount") return (a.premium ?? Number.POSITIVE_INFINITY) - (b.premium ?? Number.POSITIVE_INFINITY);
  if (sort === "premium") return (b.premium ?? Number.NEGATIVE_INFINITY) - (a.premium ?? Number.NEGATIVE_INFINITY);
  if (sort === "symbol") return a.item.symbol.localeCompare(b.item.symbol, "fa");
  return b.item.updatedAt.localeCompare(a.item.updatedAt);
}

function freshChange(row: WatchlistRow) {
  return row.quote?.runtimeSource === "snapshot" ? undefined : row.quote?.changePercent;
}
