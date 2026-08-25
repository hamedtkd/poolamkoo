"use client";

import { useMemo, useState } from "react";
import { RiAddLine, RiDeleteBin6Line, RiEyeLine, RiLineChartLine, RiWallet3Line } from "react-icons/ri";
import { ExchangeInstrumentPicker } from "@/components/investments/exchange-instrument-picker";
import { MarketWatchDetailDialog } from "@/components/investments/market-watch-detail-dialog";
import { MarketWatchlistToolbar } from "@/components/investments/market-watchlist-toolbar";
import { MarketSourceLabel } from "@/components/market/market-source-label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SensitiveValue } from "@/components/ui/sensitive-value";
import { db } from "@/lib/db";
import { formatMoney, formatPercent } from "@/lib/format";
import { marketWatchlistRows, navSignal, watchlistSummary, type WatchlistFilter, type WatchlistRow, type WatchlistSort } from "@/lib/market/watchlist";
import type { AppSettings, Asset, MarketInstrument, MarketQuote, MarketSnapshot, MarketWatchItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MarketWatchlistCard({ watchlist, quotes, snapshots, assets, settings, onCreateAsset }: {
  watchlist: MarketWatchItem[];
  quotes: MarketQuote[];
  snapshots: MarketSnapshot[];
  assets: Asset[];
  settings: AppSettings;
  onCreateAsset: (instrument: MarketInstrument) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<WatchlistFilter>("all");
  const [sort, setSort] = useState<WatchlistSort>("newest");
  const [detailId, setDetailId] = useState<string | null>(null);
  const allRows = useMemo(() => marketWatchlistRows({ watchlist, quotes, assets }), [assets, quotes, watchlist]);
  const rows = useMemo(() => marketWatchlistRows({ watchlist, quotes, assets, query, filter, sort }), [assets, filter, query, quotes, sort, watchlist]);
  const summary = useMemo(() => watchlistSummary(allRows), [allRows]);
  const detailRow = detailId ? allRows.find((row) => row.item.marketId === detailId) ?? null : null;

  async function add(instrument: MarketInstrument) {
    const current = await db.marketWatchlist.where("marketId").equals(instrument.id).first();
    const now = new Date().toISOString();
    if (current?.id) await db.marketWatchlist.update(current.id, { symbol: instrument.symbol, name: instrument.name, updatedAt: now });
    else await db.marketWatchlist.add({ marketId: instrument.id, symbol: instrument.symbol, name: instrument.name, source: instrument.source, createdAt: now, updatedAt: now });
    setPickerOpen(false);
  }

  return <Card>
    <CardHeader className="gap-3 sm:flex sm:flex-row sm:items-center sm:justify-between">
      <div>
        <CardTitle className="flex items-center gap-2"><RiEyeLine className="text-primary" /> دیده‌بان بازار</CardTitle>
        <p className="mt-1 type-caption text-muted-foreground">نمادها را مقایسه کن، فرصت‌های زیر NAV را پیدا کن و قبل از خرید نمودار واقعی بازار را ببین.</p>
      </div>
      <Button variant="outline" onClick={() => setPickerOpen(true)}><RiAddLine /> افزودن نماد</Button>
    </CardHeader>
    <CardContent className="space-y-4">
      {watchlist.length ? <>
        <WatchlistSummary total={summary.total} gainers={summary.gainers} discounts={summary.discounts} premiums={summary.premiums} />
        <MarketWatchlistToolbar query={query} onQueryChange={setQuery} filter={filter} onFilterChange={setFilter} sort={sort} onSortChange={setSort} />
        {rows.length ? <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">{rows.map((row) => <WatchCard key={row.item.marketId} row={row} settings={settings} onDetail={() => setDetailId(row.item.marketId)} onCreateAsset={onCreateAsset} />)}</div> : <div className="rounded-2xl border border-dashed p-7 text-center"><div className="type-strong">چیزی با این فیلتر پیدا نشد</div><p className="mt-1 type-caption text-muted-foreground">فیلتر یا عبارت جست‌وجو را تغییر بده.</p></div>}
      </> : <EmptyWatchlist onAdd={() => setPickerOpen(true)} />}
    </CardContent>
    <Dialog open={pickerOpen} onOpenChange={setPickerOpen}><DialogContent><DialogHeader><DialogTitle>افزودن به دیده‌بان</DialogTitle><DialogDescription>نماد بورسی یا صندوق قابل معامله را جست‌وجو کن. فقط نماد ذخیره می‌شود و هنوز خریدی ثبت نخواهد شد.</DialogDescription></DialogHeader><ExchangeInstrumentPicker settings={settings} onSelect={(instrument) => void add(instrument)} onClear={() => undefined} /></DialogContent></Dialog>
    <MarketWatchDetailDialog row={detailRow} snapshots={snapshots} settings={settings} onClose={() => setDetailId(null)} onCreateAsset={(instrument) => { setDetailId(null); onCreateAsset(instrument); }} />
  </Card>;
}

function WatchCard({ row, settings, onDetail, onCreateAsset }: { row: WatchlistRow; settings: AppSettings; onDetail: () => void; onCreateAsset: (instrument: MarketInstrument) => void }) {
  const signal = navSignal(row.premium);
  const quote = row.quote;
  return <div className="rounded-2xl border bg-muted/15 p-4 transition hover:border-primary/20 hover:bg-muted/25">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="type-section-title">{row.item.symbol}</span>{row.owned && <Badge>در سبد</Badge>}<NavBadge label={signal.label} tone={signal.tone} /></div><div className="mt-1 truncate type-caption text-muted-foreground">{row.item.name}</div></div>
      <Button size="icon" variant="ghost" className="size-8 shrink-0 text-destructive" onClick={() => row.item.id && void db.marketWatchlist.delete(row.item.id)} title="حذف از دیده‌بان"><RiDeleteBin6Line /></Button>
    </div>
    <div className="mt-4 grid grid-cols-2 gap-3">
      <Metric label="قیمت بازار" value={quote ? formatMoney(quote.priceToman, settings.displayUnit, true) : "—"} />
      <Metric label="تغییر روز" value={quote ? `${quote.changePercent >= 0 ? "+" : ""}${formatPercent(quote.changePercent)}` : "—"} tone={quote ? (quote.changePercent >= 0 ? "positive" : "negative") : undefined} />
      <Metric label="NAV" value={quote?.navToman ? formatMoney(quote.navToman, settings.displayUnit, true) : "—"} />
      <Metric label="فاصله از NAV" value={row.premium === null ? "—" : `${row.premium >= 0 ? "+" : ""}${formatPercent(row.premium)}`} tone={row.premium === null ? undefined : row.premium <= 0 ? "positive" : "negative"} />
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
      <MarketSourceLabel source={quote?.source ?? row.item.source} compact className="text-[10px] text-muted-foreground" />
      <div className="flex gap-1.5"><Button size="sm" variant="outline" onClick={onDetail}><RiLineChartLine /> جزئیات</Button>{!row.owned && <Button size="sm" onClick={() => onCreateAsset({ id: row.item.marketId, symbol: row.item.symbol, name: row.item.name, priceToman: quote?.priceToman, changePercent: quote?.changePercent, source: row.item.source })}><RiWallet3Line /> افزودن به سبد</Button>}</div>
    </div>
  </div>;
}

function WatchlistSummary({ total, gainers, discounts, premiums }: { total: number; gainers: number; discounts: number; premiums: number }) {
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><SummaryMetric label="نماد زیر نظر" value={total} /><SummaryMetric label="مثبت امروز" value={gainers} tone="positive" /><SummaryMetric label="زیر NAV" value={discounts} tone="positive" /><SummaryMetric label="بالای NAV" value={premiums} tone="negative" /></div>;
}

function SummaryMetric({ label, value, tone }: { label: string; value: number; tone?: "positive" | "negative" }) {
  return <div className="rounded-xl border bg-background/55 px-3 py-2"><div className="text-[10px] text-muted-foreground">{label}</div><div className={cn("mt-0.5 type-strong", tone === "positive" && "text-primary", tone === "negative" && "text-destructive")}>{new Intl.NumberFormat("fa-IR").format(value)}</div></div>;
}

function EmptyWatchlist({ onAdd }: { onAdd: () => void }) {
  return <div className="rounded-2xl border border-dashed p-7 text-center"><RiEyeLine className="mx-auto size-7 text-muted-foreground" /><div className="mt-2 type-strong">هنوز نمادی در دیده‌بان نیست</div><p className="mt-1 type-caption text-muted-foreground">مثلاً عیار، سیمین یا سهمی که قصد خریدش را داری اضافه کن.</p><Button className="mt-4" variant="outline" onClick={onAdd}><RiAddLine /> اولین نماد</Button></div>;
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) {
  return <div className="rounded-xl bg-background/65 p-3"><div className="text-[10px] text-muted-foreground">{label}</div><SensitiveValue className={cn("mt-1 type-strong", tone === "positive" && "text-primary", tone === "negative" && "text-destructive")}>{value}</SensitiveValue></div>;
}

function NavBadge({ label, tone }: { label: string; tone: "positive" | "negative" | "neutral" }) {
  return <Badge className={cn(tone === "positive" && "border-primary/25 bg-primary/8 text-primary", tone === "negative" && "border-destructive/25 bg-destructive/8 text-destructive", tone === "neutral" && "text-muted-foreground")}>{label}</Badge>;
}
