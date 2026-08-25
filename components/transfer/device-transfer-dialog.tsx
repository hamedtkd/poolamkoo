"use client";

import { useEffect, useState } from "react";
import { DeviceTransferReceiver } from "@/components/transfer/device-transfer-receiver";
import { DeviceTransferSender } from "@/components/transfer/device-transfer-sender";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { useDeviceTransfer } from "@/hooks/use-device-transfer";

export function DeviceTransferDialog({ open, onOpenChange, initialTab = "sender" }: { open: boolean; onOpenChange: (open: boolean) => void; initialTab?: "sender" | "receiver" }) {
  const transfer = useDeviceTransfer();
  const [tab, setTab] = useState<"sender" | "receiver">(initialTab);

  useEffect(() => {
    if (transfer.status === "complete") toast({ tone: "success", title: "انتقال دستگاه کامل شد", description: transfer.mode === "receiver" ? "داده روی این دستگاه با موفقیت وارد شد." : "دستگاه جدید دریافت و ورود داده را تأیید کرد." });
  }, [transfer.mode, transfer.status]);

  function changeOpen(next: boolean) {
    if (!next) transfer.reset();
    onOpenChange(next);
  }

  function changeTab(value: string) {
    transfer.reset();
    setTab(value as "sender" | "receiver");
  }

  return <Dialog open={open} onOpenChange={changeOpen}><DialogContent className="sm:w-[min(100%,42rem)]"><DialogHeader><DialogTitle>انتقال داده بین دستگاه‌ها</DialogTitle><DialogDescription>انتقال مستقیم WebRTC، بدون حساب کاربری و بدون ذخیره مالی روی سرور. بسته داده با رمز یک‌بارمصرف هم رمزنگاری می‌شود.</DialogDescription></DialogHeader>
    {!transfer.supported && <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/8 p-3 text-xs leading-6 text-amber-800 dark:text-amber-200">این مرورگر انتقال مستقیم WebRTC را پشتیبانی نمی‌کند. از بکاپ رمزنگاری‌شده به‌عنوان روش عمومی انتقال استفاده کن.</div>}
    <Tabs value={tab} onValueChange={changeTab} dir="rtl"><TabsList className="mb-5 grid w-full grid-cols-2"><TabsTrigger value="sender">ارسال از این دستگاه</TabsTrigger><TabsTrigger value="receiver">دریافت روی این دستگاه</TabsTrigger></TabsList><TabsContent value="sender"><DeviceTransferSender transfer={transfer} /></TabsContent><TabsContent value="receiver"><DeviceTransferReceiver transfer={transfer} /></TabsContent></Tabs>
    <p className="mt-5 border-t pt-4 text-[11px] leading-6 text-muted-foreground">اگر اتصال مستقیم برقرار نشد، از «بکاپ و بازیابی» همین صفحه استفاده کن: بکاپ رمزنگاری‌شده را دانلود، با روش دلخواه به دستگاه جدید منتقل و آنجا بازیابی کن.</p>
  </DialogContent></Dialog>;
}
