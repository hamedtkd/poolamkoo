"use client";

import { useState } from "react";
import { RiAddLine, RiDeleteBin6Line, RiEyeLine, RiWallet3Line } from "react-icons/ri";
import { ExchangeInstrumentPicker } from "@/components/investments/exchange-instrument-picker";
import { MarketSourceLabel } from "@/components/market/market-source-label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SensitiveValue } from "@/components/ui/sensitive-value";
import { db } from "@/lib/db";
import { formatMoney, formatPercent } from "@/lib/format";
import { premiumToNavPercent } from "@/lib/market/nav";
import type { AppSettings, Asset, MarketInstrument, MarketQuote, MarketWatchItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MarketWatchlistCard({ watchlist, quotes, assets, settings, onCreateAsset }: {
  watchlist: MarketWatchItem[];
  quotes: MarketQuote[];
  assets: Asset[];
  settings: AppSettings;
  onCreateAsset: (instrument: MarketInstrument) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const quoteMap = new Map(quotes.map((quote) => [quote.symbol, quote]));
  const assetIds = new Set(assets.map((asset) => asset.marketId).filter(Boolean));

  async function add(instrument: MarketInstrument) {
    const current = await db.marketWatchlist.where("marketId").equals(instrument.id).first();
    const now = new Date().toISOString();
    if (current?.id) {
      await db.marketWatchlist.update(current.id, { symbol: instrument.symbol, name: instrument.name, updatedAt: now });
    } else {
      await db.marketWatchlist.add({
        marketId: instrument.id,
        symbol: instrument.symbol,
        name: instrument.name,
        source: instrument.source,
        createdAt: now,
        updatedAt: now,
      });
    }
    setPickerOpen(false);
  }

  return <Card>
    <CardHeader className="gap-3 sm:flex sm:flex-row sm:items-center sm:justify-between">
      <div>
        <CardTitle className="flex items-center gap-2"><RiEyeLine className="text-primary" /> دیده‌بان بازار</CardTitle>
        <p className="mt-1 type-caption text-muted-foreground">عیار، سیمین، سهام و ETFها را قبل از خرید زیر نظر بگیر. اگر NAV از بازار منتشر شود، حباب قیمت هم نمایش داده می‌شود.</p>
      </div>
      <Button variant="outline" onClick={() => setPickerOpen(true)}><RiAddLine /> افزودن نماد</Button>
    </CardHeader>
    <CardContent>
      {watchlist.length ? <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
        {watchlist.map((item) => {
          const quote = quoteMap.get(item.symbol);
          const premium = quote ? premiumToNavPercent(quote.priceToman, quote.navToman) : null;
          const owned = assetIds.has(item.marketId);
          return <div key={item.marketId} className="rounded-2xl border bg-muted/15 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><div className="flex items-center gap-2"><span className="type-section-title">{item.symbol}</span>{owned && <Badge>در سبد</Badge>}</div><div className="mt-1 truncate type-caption text-muted-foreground">{item.name}</div></div>
              <Button size="icon" variant="ghost" className="size-8 shrink-0 text-destructive" onClick={() => item.id && void db.marketWatchlist.delete(item.id)} title="حذف از دیده‌بان"><RiDeleteBin6Line /></Button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric label="قیمت بازار" value={quote ? formatMoney(quote.priceToman, settings.displayUnit, true) : "—"} />
              <Metric label="تغییر روز" value={quote ? `${quote.changePercent >= 0 ? "+" : ""}${formatPercent(quote.changePercent)}` : "—"} tone={quote ? (quote.changePercent >= 0 ? "positive" : "negative") : undefined} />
              <Metric label="NAV" value={quote?.navToman ? formatMoney(quote.navToman, settings.displayUnit, true) : "—"} />
              <Metric label="حباب نسبت به NAV" value={premium === null ? "—" : `${premium >= 0 ? "+" : ""}${formatPercent(premium)}`} tone={premium === null ? undefined : premium > 0 ? "negative" : "positive"} />
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3">
              <MarketSourceLabel source={quote?.source ?? item.source} compact className="text-[10px] text-muted-foreground" />
              {!owned && <Button size="sm" onClick={() => onCreateAsset({ id: item.marketId, symbol: item.symbol, name: item.name, priceToman: quote?.priceToman, changePercent: quote?.changePercent, source: item.source })}><RiWallet3Line /> افزودن به سبد</Button>}
            </div>
          </div>;
        })}
      </div> : <div className="rounded-2xl border border-dashed p-7 text-center"><RiEyeLine className="mx-auto size-7 text-muted-foreground" /><div className="mt-2 type-strong">هنوز نمادی در دیده‌بان نیست</div><p className="mt-1 type-caption text-muted-foreground">مثلاً عیار، سیمین یا سهمی که قصد خریدش را داری اضافه کن.</p><Button className="mt-4" variant="outline" onClick={() => setPickerOpen(true)}><RiAddLine /> اولین نماد</Button></div>}
    </CardContent>
    <Dialog open={pickerOpen} onOpenChange={setPickerOpen}><DialogContent><DialogHeader><DialogTitle>افزودن به دیده‌بان</DialogTitle><DialogDescription>نماد بورسی یا صندوق قابل معامله را جست‌وجو کن. فقط نماد ذخیره می‌شود و هنوز خریدی ثبت نخواهد شد.</DialogDescription></DialogHeader><ExchangeInstrumentPicker settings={settings} onSelect={(instrument) => void add(instrument)} onClear={() => undefined} /></DialogContent></Dialog>
  </Card>;
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) {
  return <div className="rounded-xl bg-background/65 p-3"><div className="text-[10px] text-muted-foreground">{label}</div><SensitiveValue className={cn("mt-1 type-strong", tone === "positive" && "text-primary", tone === "negative" && "text-destructive")}>{value}</SensitiveValue></div>;
}
