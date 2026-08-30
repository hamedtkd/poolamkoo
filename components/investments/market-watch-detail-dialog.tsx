"use client";

import { useState } from "react";
import { RiLineChartLine, RiLoader4Line, RiNotification3Line, RiWallet3Line } from "react-icons/ri";
import { LazyFinancialChart } from "@/components/charts/lazy-financial-chart";
import { MarketSourceLabel } from "@/components/market/market-source-label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SensitiveValue } from "@/components/ui/sensitive-value";
import { useMarketHistory } from "@/hooks/use-market-history";
import { formatMoney, formatPercent } from "@/lib/format";
import type { MarketAlertTarget } from "@/lib/market/alerts";
import { navSignal, type WatchlistRow } from "@/lib/market/watchlist";
import type { AppSettings, MarketHistoryRange, MarketInstrument, MarketSnapshot } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MarketWatchDetailDialog({ row, snapshots, settings, onClose, onCreateAsset, onCreateAlert }: {
  row: WatchlistRow | null;
  snapshots: MarketSnapshot[];
  settings: AppSettings;
  onClose: () => void;
  onCreateAsset: (instrument: MarketInstrument) => void;
  onCreateAlert: (target: MarketAlertTarget) => void;
}) {
  const [range, setRange] = useState<MarketHistoryRange>("3m");
  const history = useMarketHistory({ symbol: row?.item.symbol ?? "", marketId: row?.item.marketId, marketSource: row?.item.source, snapshots, range });
  const signal = navSignal(row?.premium ?? null);
  const quote = row?.quote;

  return <Dialog open={!!row} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
      {row && <>
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2"><span>{row.item.symbol}</span>{row.owned && <Badge>در سبد</Badge>}<NavBadge label={signal.label} tone={signal.tone} /></DialogTitle>
          <DialogDescription>{row.item.name} · <MarketSourceLabel source={quote?.source ?? row.item.source} snapshot={quote?.runtimeSource === "snapshot"} snapshotAt={quote?.snapshotCapturedAt} /></DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-4">
          <Metric label="قیمت بازار" value={quote ? formatMoney(quote.priceToman, settings.displayUnit, true) : "—"} />
          <Metric label="تغییر امروز" value={quote ? `${quote.changePercent >= 0 ? "+" : ""}${formatPercent(quote.changePercent)}` : "—"} tone={quote ? (quote.changePercent >= 0 ? "positive" : "negative") : undefined} />
          <Metric label="NAV" value={quote?.navToman ? formatMoney(quote.navToman, settings.displayUnit, true) : "—"} />
          <Metric label="فاصله از NAV" value={row.premium === null ? "—" : `${row.premium >= 0 ? "+" : ""}${formatPercent(row.premium)}`} tone={row.premium === null ? undefined : row.premium <= 0 ? "positive" : "negative"} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <RangePicker value={range} onChange={setRange} />
          <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => onCreateAlert({ marketId: row.item.marketId, symbol: row.item.symbol, name: row.item.name, source: row.item.source, priceToman: quote?.priceToman, navToman: quote?.navToman, changePercent: quote?.changePercent })}><RiNotification3Line /> ساخت هشدار</Button>{!row.owned && <Button size="sm" onClick={() => onCreateAsset({ id: row.item.marketId, symbol: row.item.symbol, name: row.item.name, priceToman: quote?.priceToman, changePercent: quote?.changePercent, source: row.item.source })}><RiWallet3Line /> افزودن به سبد</Button>}</div>
        </div>
        {history.loading && !history.candles.length ? <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed"><div className="text-center"><RiLoader4Line className="mx-auto size-7 animate-spin text-primary" /><div className="mt-2 type-strong">در حال دریافت نمودار…</div></div></div> : history.candles.length >= 2 ? <LazyFinancialChart candles={history.candles} variant="candles" height={360} /> : <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed p-6 text-center"><div><RiLineChartLine className="mx-auto size-7 text-muted-foreground" /><div className="mt-2 type-strong">برای این بازه داده کافی نداریم</div><p className="mt-1 type-caption text-muted-foreground">بازه دیگر را امتحان کن؛ Snapshotهای واقعی دستگاه هم به‌عنوان fallback استفاده می‌شوند.</p></div></div>}
        {history.warning && <p className="rounded-xl bg-muted/45 px-3 py-2 text-[10px] leading-5 text-muted-foreground">{history.warning}</p>}
      </>}
    </DialogContent>
  </Dialog>;
}

function RangePicker({ value, onChange }: { value: MarketHistoryRange; onChange: (value: MarketHistoryRange) => void }) {
  return <div className="flex rounded-xl bg-muted/55 p-1" aria-label="بازه جزئیات دیده‌بان">{(["1m", "3m"] as const).map((item) => <button key={item} type="button" aria-pressed={value === item} onClick={() => onChange(item)} className={cn("min-w-16 rounded-lg px-2 py-1.5 text-[10px] type-strong transition", value === item ? "bg-background text-primary shadow-sm" : "text-muted-foreground")}>{item === "1m" ? "۱ ماه" : "۳ ماه"}</button>)}</div>;
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) {
  return <div className="rounded-xl border bg-muted/15 p-3"><div className="text-[10px] text-muted-foreground">{label}</div><SensitiveValue className={cn("mt-1 type-strong", tone === "positive" && "text-primary", tone === "negative" && "text-destructive")}>{value}</SensitiveValue></div>;
}

function NavBadge({ label, tone }: { label: string; tone: "positive" | "negative" | "neutral" }) {
  return <Badge className={cn(tone === "positive" && "border-primary/25 bg-primary/8 text-primary", tone === "negative" && "border-destructive/25 bg-destructive/8 text-destructive", tone === "neutral" && "text-muted-foreground")}>{label}</Badge>;
}
