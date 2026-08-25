"use client";

import { useMemo, useState } from "react";
import { RiAddLine, RiAlarmWarningLine, RiDeleteBin6Line, RiNotification3Line, RiPauseCircleLine, RiPlayCircleLine } from "react-icons/ri";
import { ExchangeInstrumentPicker } from "@/components/investments/exchange-instrument-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { db } from "@/lib/db";
import { formatMoney, formatPercent } from "@/lib/format";
import { marketAlertConditionMet, marketAlertKindLabel, type MarketAlertTarget } from "@/lib/market/alerts";
import type { AppSettings, MarketAlert, MarketInstrument, MarketQuote } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MarketAlertsCard({ alerts, quotes, settings, onCreateAlert }: {
  alerts: MarketAlert[];
  quotes: MarketQuote[];
  settings: AppSettings;
  onCreateAlert: (target: MarketAlertTarget) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const quoteMap = useMemo(() => new Map(quotes.map((quote) => [quote.symbol, quote])), [quotes]);
  const activeCount = alerts.filter((alert) => alert.enabled).length;
  const firedCount = alerts.filter((alert) => alert.enabled && !alert.armed).length;

  function selectInstrument(instrument: MarketInstrument) {
    setPickerOpen(false);
    onCreateAlert({ marketId: instrument.id, symbol: instrument.symbol, name: instrument.name, source: instrument.source, priceToman: instrument.priceToman, changePercent: instrument.changePercent });
  }

  return <Card>
    <CardHeader className="gap-3 sm:flex sm:flex-row sm:items-center sm:justify-between">
      <div><CardTitle className="flex items-center gap-2"><RiAlarmWarningLine className="text-primary" /> هشدارهای بازار</CardTitle><p className="mt-1 type-caption text-muted-foreground">شرط قیمت، تغییر روزانه یا NAV را تعریف کن؛ با هر Refresh بازار دوباره بررسی می‌شود.</p></div>
      <Button variant="outline" onClick={() => setPickerOpen(true)}><RiAddLine /> هشدار جدید</Button>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:max-w-md"><Summary label="هشدار فعال" value={activeCount} /><Summary label="شرط برقرار" value={firedCount} tone={firedCount ? "attention" : undefined} /></div>
      {alerts.length ? <div className="grid gap-3 lg:grid-cols-2">{alerts.map((alert) => <AlertRow key={alert.id ?? `${alert.marketId}-${alert.kind}-${alert.threshold}`} alert={alert} quote={quoteMap.get(alert.symbol)} settings={settings} />)}</div> : <div className="rounded-2xl border border-dashed p-7 text-center"><RiNotification3Line className="mx-auto size-7 text-muted-foreground" /><div className="mt-2 type-strong">هنوز هشداری نداری</div><p className="mt-1 type-caption text-muted-foreground">مثلاً برای عیار بگو اگر ۲٪ زیر NAV رفت یا قیمت از عدد مشخصی پایین‌تر آمد.</p></div>}
    </CardContent>
    <Dialog open={pickerOpen} onOpenChange={setPickerOpen}><DialogContent><DialogHeader><DialogTitle>نماد هشدار</DialogTitle><DialogDescription>نماد یا صندوق را پیدا کن؛ لازم نیست قبلاً در دیده‌بان یا سبد باشد.</DialogDescription></DialogHeader><ExchangeInstrumentPicker settings={settings} onSelect={selectInstrument} onClear={() => undefined} /></DialogContent></Dialog>
  </Card>;
}

function AlertRow({ alert, quote, settings }: { alert: MarketAlert; quote?: MarketQuote; settings: AppSettings }) {
  const met = marketAlertConditionMet(alert, quote);
  const threshold = alert.kind.startsWith("price_") ? formatMoney(alert.threshold, settings.displayUnit, true) : formatPercent(alert.threshold);
  const status = !alert.enabled ? "متوقف" : !quote ? "در انتظار قیمت" : met ? "شرط برقرار" : "در انتظار";
  const statusTone = alert.enabled && met ? "text-destructive" : "text-muted-foreground";
  const lastTriggered = alert.lastTriggeredAt ? new Intl.DateTimeFormat("fa-IR", { dateStyle: "short", timeStyle: "short" }).format(new Date(alert.lastTriggeredAt)) : null;

  async function toggle() {
    if (!alert.id) return;
    await db.marketAlerts.update(alert.id, { enabled: !alert.enabled, armed: true, updatedAt: new Date().toISOString() });
  }

  return <div className={cn("rounded-2xl border p-4", !alert.enabled && "opacity-65") }>
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="type-section-title">{alert.symbol}</span><Badge>{marketAlertKindLabel(alert.kind)}</Badge>{alert.notifyBrowser && <Badge className="text-muted-foreground"><RiNotification3Line /> اعلان</Badge>}</div><div className="mt-1 truncate type-caption text-muted-foreground">{alert.name}</div></div><div className="flex shrink-0 gap-1"><Button size="icon" variant="ghost" className="size-8" onClick={() => void toggle()} title={alert.enabled ? "توقف هشدار" : "فعال‌سازی هشدار"}>{alert.enabled ? <RiPauseCircleLine /> : <RiPlayCircleLine />}</Button><Button size="icon" variant="ghost" className="size-8 text-destructive" onClick={() => alert.id && void db.marketAlerts.delete(alert.id)} title="حذف هشدار"><RiDeleteBin6Line /></Button></div></div>
    <div className="mt-4 grid grid-cols-2 gap-2"><Metric label="آستانه" value={threshold} /><Metric label="وضعیت" value={status} className={statusTone} /></div>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-[10px] text-muted-foreground"><span>{lastTriggered ? `آخرین اجرا: ${lastTriggered}` : "هنوز اجرا نشده"}</span><span>{alert.armed ? "آماده اجرا" : "تا خروج شرط دوباره اجرا نمی‌شود"}</span></div>
  </div>;
}

function Metric({ label, value, className }: { label: string; value: string; className?: string }) {
  return <div className="rounded-xl bg-muted/35 p-3"><div className="text-[10px] text-muted-foreground">{label}</div><div className={cn("mt-1 type-strong", className)}>{value}</div></div>;
}

function Summary({ label, value, tone }: { label: string; value: number; tone?: "attention" }) {
  return <div className="rounded-xl border bg-background/55 px-3 py-2"><div className="text-[10px] text-muted-foreground">{label}</div><div className={cn("mt-0.5 type-strong", tone === "attention" && "text-destructive")}>{new Intl.NumberFormat("fa-IR").format(value)}</div></div>;
}
