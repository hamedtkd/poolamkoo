"use client";

import { useState } from "react";
import { RiInformationLine, RiLineChartLine, RiLoader4Line } from "react-icons/ri";
import { LazyFinancialChart } from "@/components/charts/lazy-financial-chart";
import { MarketSourceLabel } from "@/components/market/market-source-label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useMarketHistory } from "@/hooks/use-market-history";
import { formatMoney, formatPercent } from "@/lib/format";
import type { AppSettings, Asset, MarketHistoryRange, MarketQuote, MarketSnapshot, MarketWatchItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const T = {
  title: "نمودار بازار",
  desc: "نمادهای بورسی جدید تاریخچه واقعی را مستقیم از TSETMC می‌گیرند؛ دلار/طلا و اتصال‌های قدیمی می‌توانند از Tindex اختیاری استفاده کنند و Snapshotهای واقعی دستگاه fallback هستند.",
  remote: "تاریخچه واقعی بازار",
  local: "Fallback از Snapshotهای واقعی این دستگاه",
  emptyTitle: "داده تاریخی کافی نداریم",
  emptyDesc: "برای نمادهای بورسی متصل به TSETMC تاریخچه مستقیم بازار در دسترس است. دلار/طلا فقط در صورت تنظیم Tindex تاریخچه آنلاین دارند و بیت‌کوین/تتر فعلاً از Snapshotهای واقعی دستگاه استفاده می‌کنند.",
  current: "قیمت فعلی",
  loading: "در حال دریافت تاریخچه بازار…",
};

export function MarketChartCard({ settings, snapshots, quotes, assets, watchlist = [] }: {
  settings: AppSettings;
  snapshots: MarketSnapshot[];
  quotes: MarketQuote[];
  assets: Asset[];
  watchlist?: MarketWatchItem[];
}) {
  const [symbol, setSymbol] = useState("USD");
  const [range, setRange] = useState<MarketHistoryRange>("3m");
  const exchangeAssets = assets.filter((asset) => asset.symbol && (asset.kind === "stock" || asset.kind === "fund"));
  const exchangeItems = dedupeMarketItems([
    ...exchangeAssets.map((asset) => ({ symbol: asset.symbol as string, name: asset.name, marketId: asset.marketId, marketSource: asset.marketSource })),
    ...watchlist.map((item) => ({ symbol: item.symbol, name: item.name, marketId: item.marketId, marketSource: item.source })),
  ]);
  const options = dedupeOptions([
    { value: "USD", label: "دلار" },
    { value: "IR_GOLD_18K", label: "طلای ۱۸ عیار" },
    { value: "BTC", label: "بیت‌کوین" },
    { value: "USDT", label: "تتر" },
    ...exchangeItems.map((item) => ({ value: item.symbol, label: item.name })),
  ]);
  const selectedMarketItem = exchangeItems.find((item) => item.symbol === symbol);
  const history = useMarketHistory({ symbol, marketId: selectedMarketItem?.marketId, marketSource: selectedMarketItem?.marketSource, snapshots, range });
  const candles = history.candles;
  const first = candles[0];
  const last = candles.at(-1);
  const currentQuote = quotes.find((quote) => quote.symbol === symbol);
  const chartVariant = selectedMarketItem?.marketId ? "candles" as const : "line" as const;
  const periodChange = first && last && first.close > 0 ? ((last.close - first.close) / first.close) * 100 : 0;

  return <Card className="overflow-hidden">
    <CardHeader className="gap-3 sm:flex sm:flex-row sm:items-center sm:justify-between">
      <div>
        <CardTitle className="flex items-center gap-2"><RiLineChartLine className="text-primary" />{T.title}</CardTitle>
        <p className="mt-1 max-w-3xl type-caption text-muted-foreground">{T.desc}</p>
      </div>
      <div className="w-full sm:w-48"><Select value={symbol} onValueChange={setSymbol} options={options} /></div>
    </CardHeader>
    <CardContent>
      <div className="mb-3 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-h-6 flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
          {candles.length >= 2 ? <>
            <span>{history.mode === "remote" ? T.remote : T.local}</span>
            <span aria-hidden>•</span>
            <MarketSourceLabel source={history.source} />
            {history.loading && <RiLoader4Line className="animate-spin" aria-label={T.loading} />}
          </> : history.loading ? <>
            <span>{T.loading}</span>
            <RiLoader4Line className="animate-spin" aria-label={T.loading} />
          </> : <span>بازه انتخابی: {range === "1m" ? "۱ ماه" : "۳ ماه"}</span>}
        </div>
        <RangePicker value={range} onChange={setRange} />
      </div>
      {candles.length >= 2 ? <>
        {chartVariant === "candles" && last ? <div className="hide-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1" dir="ltr">
          <Ohlc label="O" value={last.open} settings={settings} />
          <Ohlc label="H" value={last.high} settings={settings} />
          <Ohlc label="L" value={last.low} settings={settings} />
          <Ohlc label="C" value={last.close} settings={settings} />
        </div> : last ? <div className="mb-3 flex flex-wrap gap-2">
          <Stat label="آخرین قیمت" value={formatMoney(last.close, settings.displayUnit, true)} />
          <Stat label="تغییر بازه" value={formatPercent(periodChange)} tone={periodChange >= 0 ? "positive" : "negative"} />
        </div> : null}
        {history.warning && <p className="mb-3 rounded-xl bg-muted/50 px-3 py-2 text-[10px] leading-5 text-muted-foreground">{history.warning}</p>}
        <LazyFinancialChart candles={candles} variant={chartVariant} />
      </> : history.loading ? <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed bg-muted/15 p-6 text-center">
        <div><RiLoader4Line className="mx-auto size-8 animate-spin text-primary" /><div className="mt-3 type-strong">{T.loading}</div><p className="mt-2 text-xs text-muted-foreground">برای کاهش مصرف سهمیه، پاسخ تاریخچه تا یک ساعت در لایه سرور cache می‌شود.</p></div>
      </div> : <EmptyState currentQuote={currentQuote} settings={settings} warning={history.warning} range={range} />}
    </CardContent>
  </Card>;
}

function RangePicker({ value, onChange }: { value: MarketHistoryRange; onChange: (value: MarketHistoryRange) => void }) {
  return <div className="flex rounded-xl bg-muted/55 p-1" aria-label="بازه نمودار بازار">
    {(["1m", "3m"] as const).map((range) => <button key={range} type="button" aria-pressed={value === range} onClick={() => onChange(range)} className={cn("min-w-16 rounded-lg px-2 py-1.5 text-[10px] type-strong transition", value === range ? "bg-background text-primary shadow-sm" : "text-muted-foreground")}>{range === "1m" ? "۱ ماه" : "۳ ماه"}</button>)}
  </div>;
}

function EmptyState({ currentQuote, settings, warning, range }: { currentQuote?: MarketQuote; settings: AppSettings; warning?: string; range: MarketHistoryRange }) {
  const rangeLabel = range === "1m" ? "۱ ماه" : "۳ ماه";
  return <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed bg-muted/15 p-6 text-center"><div className="max-w-xl">
    <RiInformationLine className="mx-auto size-8 text-primary" />
    <div className="mt-3 type-strong">{T.emptyTitle}</div>
    <p className="mt-2 text-xs leading-6 text-muted-foreground">برای بازه {rangeLabel} داده کافی نداریم. می‌توانی بدون خروج از این حالت، بازه دیگر را از بالای نمودار انتخاب کنی.</p>
    <p className="mt-1 text-[10px] leading-5 text-muted-foreground">{T.emptyDesc}</p>
    {warning && <p className="mt-2 text-[10px] leading-5 text-muted-foreground">{warning}</p>}
    {currentQuote && <div className="mx-auto mt-4 w-fit rounded-xl border bg-background/65 px-4 py-3"><div className="text-[10px] text-muted-foreground">{T.current}</div><div className="mt-1 type-strong">{formatMoney(currentQuote.priceToman, settings.displayUnit)}</div><div className="mt-1 text-[9px] text-muted-foreground"><MarketSourceLabel source={currentQuote.source} /></div></div>}
  </div></div>;
}

function Ohlc({ label, value, settings }: { label: string; value: number; settings: AppSettings }) {
  return <div className="min-w-[112px] rounded-xl border bg-background/55 px-3 py-2 text-left"><div className="text-[9px] type-strong text-muted-foreground">{label}</div><div className="mt-0.5 text-xs type-strong tabular-nums">{formatMoney(value, settings.displayUnit, true)}</div></div>;
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) {
  return <div className="min-w-36 rounded-xl border bg-background/55 px-3 py-2"><div className="text-[9px] text-muted-foreground">{label}</div><div className={cn("mt-0.5 text-xs type-strong", tone === "positive" && "text-primary", tone === "negative" && "text-destructive")}>{value}</div></div>;
}

function dedupeOptions(options: Array<{ value: string; label: string }>) {
  return [...new Map(options.map((option) => [option.value, option])).values()];
}

function dedupeMarketItems(items: Array<{ symbol: string; name: string; marketId?: string; marketSource?: Asset["marketSource"] }>) {
  return [...new Map(items.map((item) => [item.symbol, item])).values()];
}
