"use client";

import { useState } from "react";
import { RiDownload2Line, RiLockUnlockLine, RiRefreshLine } from "react-icons/ri";
import { TransferCodeField } from "@/components/transfer/transfer-code-field";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { useDeviceTransfer } from "@/hooks/use-device-transfer";

type Controller = ReturnType<typeof useDeviceTransfer>;

export function DeviceTransferReceiver({ transfer }: { transfer: Controller }) {
  const [offer, setOffer] = useState("");
  const [pin, setPin] = useState("");
  const [confirmImport, setConfirmImport] = useState(false);

  if (transfer.mode !== "receiver") return <div className="space-y-4">
    <TransferCodeField label="۱. کد دستگاه قبلی را اینجا بگذار" value={offer} onChange={setOffer} placeholder="کد اتصال دستگاه قبلی" />
    <Button className="w-full" disabled={!offer.trim()} onClick={() => void transfer.startReceiver(offer)}><RiDownload2Line /> ساخت پاسخ اتصال</Button>
    <p className="text-xs leading-6 text-muted-foreground">برای بیشترین شانس اتصال بدون سرور، هر دو دستگاه را روی یک Wi‑Fi نگه دار و این صفحه را تا پایان انتقال باز بگذار.</p>
  </div>;

  return <div className="space-y-4">
    <TransferCodeField label="۲. این پاسخ را به دستگاه قبلی برگردان" value={transfer.answerCode} />
    {(transfer.status === "pairing" || transfer.status === "connected") && transfer.progress === 0 && <div className="rounded-2xl bg-muted/35 p-3 text-xs leading-6 text-muted-foreground">بعد از وارد شدن این پاسخ در دستگاه قبلی، اتصال مستقیم برقرار می‌شود و فرستنده می‌تواند داده را ارسال کند.</div>}
    {(transfer.status === "receiving" || transfer.progress > 0) && <div className="rounded-2xl bg-muted/35 p-3"><div className="mb-2 flex items-center justify-between text-xs"><span>{transfer.status === "locked" || transfer.progress >= 100 ? "بسته انتقال دریافت شد" : "در حال دریافت"}</span><span>{transfer.progress}٪</span></div><Progress value={transfer.progress} /></div>}
    {transfer.status === "locked" && <div className="space-y-2"><label className="type-label">۳. رمز یک‌بارمصرف انتقال</label><Input dir="ltr" value={pin} onChange={(event) => setPin(event.target.value.toUpperCase())} maxLength={6} className="text-center font-mono text-lg tracking-[0.3em]" placeholder="XXXXXX" /><Button className="w-full" disabled={pin.trim().length !== 6} onClick={() => void transfer.unlockReceived(pin)}><RiLockUnlockLine /> بازکردن و پیش‌نمایش</Button></div>}
    {transfer.preview && transfer.status === "ready" && <Preview preview={transfer.preview} onImport={() => setConfirmImport(true)} />}
    {transfer.status === "importing" && <div className="rounded-2xl bg-muted/35 p-3 text-sm">در حال ساخت Recovery Snapshot و جایگزینی امن داده...</div>}
    {transfer.status === "complete" && <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-4 text-sm leading-6 text-emerald-700 dark:text-emerald-300">انتقال کامل شد. داده دستگاه قبلی روی این دستگاه قرار گرفت.</div>}
    {transfer.error && <p className="rounded-xl bg-destructive/8 p-3 text-xs leading-5 text-destructive">{transfer.error}</p>}
    <Button className="w-full" variant="ghost" onClick={transfer.reset}><RiRefreshLine /> شروع دوباره</Button>
    <AlertDialog open={confirmImport} onOpenChange={setConfirmImport}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>داده این دستگاه جایگزین شود؟</AlertDialogTitle><AlertDialogDescription>قبل از جایگزینی، یک Recovery Snapshot از وضعیت فعلی ساخته می‌شود. انتقال به‌صورت Replace انجام می‌شود تا رکورد تکراری ایجاد نشود.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel /><AlertDialogAction onClick={() => { setConfirmImport(false); void transfer.importReceived(); }}>جایگزینی و وارد کردن</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}

function Preview({ preview, onImport }: { preview: NonNullable<Controller["preview"]>; onImport: () => void }) {
  const rows = [["پول‌های ورودی", preview.incomes], ["صندوق‌ها", preview.funds], ["گردش صندوق", preview.fundMovements], ["دارایی‌ها", preview.assets], ["تراکنش‌ها", preview.transactions], ["کارت‌های برنامه", preview.planItems], ["دیده‌بان", preview.watchlist], ["هشدارها", preview.alerts]] as const;
  return <div className="space-y-3 rounded-2xl border p-4"><div><div className="type-strong">پیش‌نمایش داده دریافتی</div><p className="mt-1 text-xs text-muted-foreground">{new Intl.NumberFormat("fa-IR").format(preview.total)} رکورد قابل انتقال شناسایی شد.</p></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{rows.map(([label, value]) => <div key={label} className="rounded-xl bg-muted/45 p-2"><div className="text-[10px] text-muted-foreground">{label}</div><div className="mt-1 type-strong">{new Intl.NumberFormat("fa-IR").format(value)}</div></div>)}</div><Button className="w-full" onClick={onImport}>وارد کردن روی این دستگاه</Button></div>;
}
