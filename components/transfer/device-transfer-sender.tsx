"use client";

import { useState } from "react";
import { RiArrowRightLine, RiCheckDoubleLine, RiSendPlane2Line } from "react-icons/ri";
import { TransferCodeField } from "@/components/transfer/transfer-code-field";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { useDeviceTransfer } from "@/hooks/use-device-transfer";

type Controller = ReturnType<typeof useDeviceTransfer>;

export function DeviceTransferSender({ transfer }: { transfer: Controller }) {
  const [answer, setAnswer] = useState("");

  if (transfer.mode !== "sender") return <div className="space-y-4">
    <div className="rounded-2xl bg-muted/40 p-4 text-sm leading-7 text-muted-foreground">روی دستگاه فعلی اتصال را بساز، کد را با دستگاه جدید به اشتراک بگذار و پاسخ آن دستگاه را برگردان. داده مالی روی سرور پولم‌کو ذخیره نمی‌شود.</div>
    <Button className="w-full" onClick={() => void transfer.startSender()}><RiSendPlane2Line /> شروع انتقال از این دستگاه</Button>
  </div>;

  return <div className="space-y-4">
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center"><div className="type-caption text-muted-foreground">رمز یک‌بارمصرف انتقال</div><div dir="ltr" className="mt-2 font-mono text-2xl font-black tracking-[0.35em] text-primary">{transfer.pin}</div><p className="mt-2 text-xs leading-5 text-muted-foreground">این رمز را جداگانه به دستگاه جدید بده؛ داده ارسالی علاوه بر رمزنگاری WebRTC با همین رمز AES-GCM می‌شود.</p></div>
    <TransferCodeField label="۱. کد اتصال این دستگاه" value={transfer.offerCode} />
    <TransferCodeField label="۲. پاسخ دستگاه جدید را اینجا بگذار" value={answer} onChange={setAnswer} placeholder="کد پاسخ دستگاه جدید" />
    {transfer.status === "pairing" && <Button className="w-full" disabled={!answer.trim()} onClick={() => void transfer.acceptAnswer(answer)}><RiArrowRightLine /> اتصال با پاسخ دستگاه جدید</Button>}
    {transfer.status === "connected" && transfer.progress < 100 && <Button className="w-full" onClick={() => void transfer.sendData()}><RiSendPlane2Line /> ارسال امن داده</Button>}
    {(transfer.status === "sending" || transfer.progress > 0) && <div className="rounded-2xl bg-muted/35 p-3"><div className="mb-2 flex items-center justify-between text-xs"><span>{transfer.progress >= 100 ? "داده ارسال شد؛ منتظر تأیید دستگاه جدید" : "در حال انتقال مستقیم"}</span><span>{transfer.progress}٪</span></div><Progress value={transfer.progress} /></div>}
    {transfer.acknowledged && <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-3 text-sm text-emerald-700 dark:text-emerald-300"><RiCheckDoubleLine className="size-5" /> دستگاه جدید داده را با موفقیت وارد کرد.</div>}
    {transfer.error && <p className="rounded-xl bg-destructive/8 p-3 text-xs leading-5 text-destructive">{transfer.error}</p>}
    <Button className="w-full" variant="ghost" onClick={transfer.reset}>شروع دوباره</Button>
  </div>;
}
