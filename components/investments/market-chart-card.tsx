"use client";

import { useState } from "react";
import { RiInformationLine, RiLineChartLine } from "react-icons/ri";
import { FinancialChart } from "@/components/charts/financial-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useMarketHistory } from "@/hooks/use-market-history";
import { formatMoney } from "@/lib/format";
import type { AppSettings, MarketQuote, MarketSnapshot } from "@/lib/types";
import { cn } from "@/lib/utils";

const T = {
  title: "\u0646\u0645\u0648\u062f\u0627\u0631 \u0628\u0627\u0632\u0627\u0631",
  desc: "\u0641\u0642\u0637 \u062f\u0627\u062f\u0647 \u0648\u0627\u0642\u0639\u06cc Snapshot\u200c\u0647\u0627\u06cc \u0630\u062e\u06cc\u0631\u0647\u200c\u0634\u062f\u0647 \u0631\u0648\u06cc \u0647\u0645\u06cc\u0646 \u062f\u0633\u062a\u06af\u0627\u0647 \u0646\u0645\u0627\u06cc\u0634 \u062f\u0627\u062f\u0647 \u0645\u06cc\u200c\u0634\u0648\u062f.",
  local: "\u0646\u0645\u0648\u062f\u0627\u0631 \u0627\u0632 Snapshot\u200c\u0647\u0627\u06cc \u0648\u0627\u0642\u0639\u06cc \u0630\u062e\u06cc\u0631\u0647\u200c\u0634\u062f\u0647 \u0631\u0648\u06cc \u0627\u06cc\u0646 \u062f\u0633\u062a\u06af\u0627\u0647",
  emptyTitle: "\u062f\u0627\u062f\u0647 \u062a\u0627\u0631\u06cc\u062e\u06cc \u0648\u0627\u0642\u0639\u06cc \u06a9\u0627\u0641\u06cc \u0646\u062f\u0627\u0631\u06cc\u0645",
  emptyDesc: "\u067e\u0648\u0644\u200c\u06cc\u0627\u0631 \u062f\u0627\u062f\u0647 \u0645\u0635\u0646\u0648\u0639\u06cc \u0646\u0645\u0627\u06cc\u0634 \u0646\u0645\u06cc\u200c\u062f\u0647\u062f. \u0628\u0627 \u0647\u0631 \u0628\u0647\u200c\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06cc \u0628\u0627\u0632\u0627\u0631\u060c Snapshot \u0648\u0627\u0642\u0639\u06cc \u0631\u0648\u06cc \u062f\u0633\u062a\u06af\u0627\u0647 \u0630\u062e\u06cc\u0631\u0647 \u0645\u06cc\u200c\u0634\u0648\u062f. \u067e\u0633 \u0627\u0632 \u062c\u0645\u0639 \u0634\u062f\u0646 \u062f\u0627\u062f\u0647 \u0686\u0646\u062f \u0631\u0648\u0632\u060c \u0646\u0645\u0648\u062f\u0627\u0631 \u0648\u0627\u0642\u0639\u06cc \u0641\u0639\u0627\u0644 \u0645\u06cc\u200c\u0634\u0648\u062f.",
  current: "\u0642\u06cc\u0645\u062a \u0641\u0639\u0644\u06cc",
};

export function MarketChartCard({ settings, snapshots, quotes }: { settings: AppSettings; snapshots: MarketSnapshot[]; quotes: MarketQuote[] }) {
  const [symbol, setSymbol] = useState("USD");
  const [days, setDays] = useState<30 | 60 | 90>(90);
  const history = useMarketHistory(symbol, snapshots);
  const candles = history.candles.slice(-days);
  const last = candles.at(-1);
  const currentQuote = quotes.find((quote) => quote.symbol === symbol);

  return <Card className="overflow-hidden">
    <CardHeader className="gap-3 sm:flex sm:flex-row sm:items-center sm:justify-between">
      <div><CardTitle className="flex items-center gap-2"><RiLineChartLine className="text-primary" />{T.title}</CardTitle><p className="mt-1 text-xs text-muted-foreground">{T.desc}</p></div>
      <div className="w-full sm:w-44"><Select value={symbol} onValueChange={setSymbol} options={[{ value: "USD", label: "\u062f\u0644\u0627\u0631" }, { value: "IR_GOLD_18K", label: "\u0637\u0644\u0627\u06cc \u06f1\u06f8 \u0639\u06cc\u0627\u0631" }, { value: "BTC", label: "\u0628\u06cc\u062a\u200c\u06a9\u0648\u06cc\u0646" }, { value: "USDT", label: "\u062a\u062a\u0631" }]} /></div>
    </CardHeader>
    <CardContent>
      {candles.length >= 2 ? <>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div className="text-[10px] text-muted-foreground">{T.local}</div><div className="flex rounded-xl bg-muted/55 p-1">{([30, 60, 90] as const).map((value) => <button key={value} type="button" onClick={() => setDays(value)} className={cn("min-w-14 rounded-lg px-2 py-1.5 text-[10px] font-bold transition", days === value ? "bg-background text-primary shadow-sm" : "text-muted-foreground")}>{new Intl.NumberFormat("fa-IR").format(value)} {"\u0631\u0648\u0632"}</button>)}</div></div>
        {last && <div className="hide-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1" dir="ltr"><Ohlc label="O" value={last.open} settings={settings} /><Ohlc label="H" value={last.high} settings={settings} /><Ohlc label="L" value={last.low} settings={settings} /><Ohlc label="C" value={last.close} settings={settings} /></div>}
        <FinancialChart candles={candles} />
      </> : <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed bg-muted/15 p-6 text-center"><div className="max-w-xl"><RiInformationLine className="mx-auto size-8 text-primary" /><div className="mt-3 font-black">{T.emptyTitle}</div><p className="mt-2 text-xs leading-6 text-muted-foreground">{T.emptyDesc}</p>{currentQuote && <div className="mx-auto mt-4 w-fit rounded-xl border bg-background/65 px-4 py-3"><div className="text-[10px] text-muted-foreground">{T.current}</div><div className="mt-1 font-black">{formatMoney(currentQuote.priceToman, settings.displayUnit)}</div></div>}</div></div>}
    </CardContent>
  </Card>;
}

function Ohlc({ label, value, settings }: { label: string; value: number; settings: AppSettings }) {
  return <div className="min-w-[112px] rounded-xl border bg-background/55 px-3 py-2 text-left"><div className="text-[9px] font-bold text-muted-foreground">{label}</div><div className="mt-0.5 text-xs font-black tabular-nums">{formatMoney(value, settings.displayUnit, true)}</div></div>;
}
