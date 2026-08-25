"use client";

import { useState } from "react";
import { RiAlarmWarningLine, RiNotification3Line } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { db } from "@/lib/db";
import { marketAlertKindOptions, suggestedMarketAlertThreshold, type MarketAlertTarget } from "@/lib/market/alerts";
import { toLatinDigits } from "@/lib/persian-date";
import type { AppSettings, MarketAlertKind } from "@/lib/types";

export function MarketAlertDialog({ open, target, settings, onOpenChange }: {
  open: boolean;
  target: MarketAlertTarget | null;
  settings: AppSettings;
  onOpenChange: (open: boolean) => void;
}) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-lg">
    {open && target && <MarketAlertDialogSession key={`${target.marketId}-${target.symbol}`} target={target} settings={settings} onDone={() => onOpenChange(false)} />}
  </DialogContent></Dialog>;
}

function MarketAlertDialogSession({ target, settings, onDone }: { target: MarketAlertTarget; settings: AppSettings; onDone: () => void }) {
  const [kind, setKind] = useState<MarketAlertKind>(target.navToman ? "nav_discount" : "price_below");
  const [threshold, setThreshold] = useState(() => suggestedMarketAlertThreshold(target.navToman ? "nav_discount" : "price_below", target));
  const [notifyBrowser, setNotifyBrowser] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const percentage = kind.startsWith("change_") || kind.startsWith("nav_");

  function changeKind(next: MarketAlertKind) {
    setKind(next);
    setThreshold(suggestedMarketAlertThreshold(next, target));
    setMessage("");
  }

  async function toggleNotification(next: boolean) {
    if (!next) { setNotifyBrowser(false); return; }
    if (typeof Notification === "undefined") {
      setMessage("این مرورگر اعلان سیستم را پشتیبانی نمی‌کند؛ خود هشدار داخل اپ همچنان کار می‌کند.");
      return;
    }
    try {
      const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
      if (permission === "granted") setNotifyBrowser(true);
      else setMessage("مجوز اعلان مرورگر داده نشد. هشدار داخل اپ ذخیره می‌شود ولی Notification سیستم ارسال نمی‌شود.");
    } catch {
      setMessage("دریافت مجوز اعلان در این مرورگر ممکن نشد. هشدار داخل اپ همچنان قابل استفاده است.");
    }
  }

  async function save() {
    if (!Number.isFinite(threshold) || threshold <= 0) { setMessage("یک آستانه معتبر بزرگ‌تر از صفر وارد کن."); return; }
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const duplicate = await db.marketAlerts.where("marketId").equals(target.marketId).and((row) => row.kind === kind && row.threshold === threshold).first();
      if (duplicate?.id) {
        await db.marketAlerts.update(duplicate.id, { enabled: true, notifyBrowser, armed: true, symbol: target.symbol, name: target.name, updatedAt: now });
      } else {
        await db.marketAlerts.add({ marketId: target.marketId, symbol: target.symbol, name: target.name, source: target.source, kind, threshold, enabled: true, notifyBrowser, armed: true, createdAt: now, updatedAt: now });
      }
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return <>
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2"><RiAlarmWarningLine className="text-primary" /> هشدار برای {target.symbol}</DialogTitle>
      <DialogDescription>{target.name} · هشدارها هنگام باز بودن اپ و بعد از دریافت قیمت جدید بررسی می‌شوند.</DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      <label className="space-y-1.5"><span className="type-label">نوع هشدار</span><Select value={kind} onValueChange={(value) => changeKind(value as MarketAlertKind)} options={marketAlertKindOptions} /></label>
      <label className="space-y-1.5"><span className="type-label">آستانه {percentage ? "(درصد)" : "قیمت"}</span>{percentage ? <Input dir="ltr" inputMode="decimal" value={threshold || ""} onChange={(event) => setThreshold(Number(toLatinDigits(event.target.value).replace(",", ".")) || 0)} placeholder="۲" /> : <MoneyInput value={threshold || null} onValueChange={(value) => setThreshold(value ?? 0)} unit={settings.displayUnit} min={1} />}</label>
      {kind.startsWith("nav_") && !target.navToman && <p className="rounded-xl bg-muted/45 px-3 py-2 text-[10px] leading-5 text-muted-foreground">NAV در نتیجه جست‌وجوی فعلی موجود نیست. بعد از ذخیره، Quote کامل نماد دریافت می‌شود و اگر NAV منتشر شده باشد شرط ارزیابی خواهد شد.</p>}
      <div className="flex items-center justify-between gap-4 rounded-2xl border p-3"><div><div className="flex items-center gap-2 type-strong"><RiNotification3Line className="text-primary" /> اعلان مرورگر</div><p className="mt-1 text-[10px] leading-5 text-muted-foreground">اختیاری است. بدون اجازه Notification هم وضعیت هشدار داخل پولم‌کو ثبت می‌شود.</p></div><Switch checked={notifyBrowser} onCheckedChange={(value) => void toggleNotification(value)} /></div>
      {message && <p className="rounded-xl bg-muted/50 px-3 py-2 text-xs leading-6 text-muted-foreground">{message}</p>}
    </div>
    <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" onClick={onDone}>انصراف</Button><Button onClick={() => void save()} disabled={saving}>{saving ? "در حال ذخیره…" : "فعال‌کردن هشدار"}</Button></div>
  </>;
}
