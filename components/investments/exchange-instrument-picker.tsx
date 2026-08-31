"use client";

import { useEffect, useRef, useState } from "react";
import { RiCloseLine, RiSearch2Line, RiStockLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarketSourceLabel } from "@/components/market/market-source-label";
import { formatMoney, formatSignedPercent } from "@/lib/format";
import type { AppSettings, ExchangeMarketSource, MarketInstrument } from "@/lib/types";

interface SelectedInstrument {
  id: string;
  symbol: string;
  name: string;
  source: ExchangeMarketSource;
}

export function ExchangeInstrumentPicker({ selected, settings, onSelect, onClear }: {
  selected?: SelectedInstrument;
  settings: AppSettings;
  onSelect: (instrument: MarketInstrument) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MarketInstrument[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const timerRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    requestIdRef.current += 1;
  }, []);

  function search(value: string) {
    setQuery(value);
    setMessage("");
    setResults([]);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    const requestId = ++requestIdRef.current;
    if (value.trim().length < 2) {
      setLoading(false);
      return;
    }

    setLoading(true);
    timerRef.current = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/market/search?q=${encodeURIComponent(value.trim())}`, { cache: "no-store" });
        const data = await response.json() as { results?: MarketInstrument[]; warning?: string };
        if (requestIdRef.current !== requestId) return;
        setResults(Array.isArray(data.results) ? data.results : []);
        setMessage(data.warning ?? (!data.results?.length ? "نمادی پیدا نشد." : ""));
      } catch (error) {
        if (requestIdRef.current === requestId) setMessage(error instanceof Error ? error.message : "جست‌وجوی بازار ناموفق بود.");
      } finally {
        if (requestIdRef.current === requestId) setLoading(false);
      }
    }, 320);
  }

  return <div className="space-y-2">
    {selected && <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
      <div className="min-w-0"><div className="flex items-center gap-2"><RiStockLine className="shrink-0 text-primary" /><span className="type-strong">{selected.symbol}</span><span className="truncate type-caption text-muted-foreground">{selected.name}</span></div><div className="mt-1 text-[10px] text-muted-foreground">قیمت خودکار بازار فعال است · <MarketSourceLabel source={selected.source} /></div></div>
      <Button type="button" size="icon" variant="ghost" className="size-8 shrink-0" onClick={onClear} title="قطع اتصال بازار" aria-label="قطع اتصال بازار"><RiCloseLine /></Button>
    </div>}
    <div className="relative"><RiSearch2Line className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => search(event.target.value)} className="pe-9" placeholder={selected ? "برای تغییر نماد جست‌وجو کن…" : "مثلاً عیار، سیمین، فولاد یا شستا"} /></div>
    {loading && <div className="rounded-xl bg-muted/40 px-3 py-2 type-caption text-muted-foreground">در حال جست‌وجوی بازار…</div>}
    {!loading && results.length > 0 && <div className="max-h-56 overflow-y-auto rounded-xl border bg-background p-1 shadow-sm">{results.map((item) => <button key={item.id} type="button" onClick={() => { onSelect(item); setQuery(""); setResults([]); setMessage(""); }} className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-start transition hover:bg-accent"><div className="min-w-0"><div className="type-strong">{item.symbol}</div><div className="truncate type-caption text-muted-foreground">{item.name}</div></div><div className="shrink-0 text-end">{item.priceToman ? <div className="type-label">{formatMoney(item.priceToman, settings.displayUnit, true)}</div> : null}{item.changePercent !== undefined && <div className={item.changePercent >= 0 ? "text-[10px] text-profit" : "text-[10px] text-loss"}>{formatSignedPercent(item.changePercent, 2)}</div>}</div></button>)}</div>}
    {!loading && message && <div className="rounded-xl bg-muted/45 px-3 py-2 type-caption leading-6 text-muted-foreground">{message}</div>}
    <p className="text-[10px] leading-5 text-muted-foreground">جست‌وجوی بورس و صندوق‌های قابل معامله مستقیماً از <MarketSourceLabel source="tsetmc" /> انجام می‌شود و API Key نمی‌خواهد. اگر سرویس در دسترس نباشد، Snapshot واقعی یا قیمت پشتیبان دستی حفظ می‌شود.</p>
  </div>;
}
