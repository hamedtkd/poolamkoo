"use client";

import { useState } from "react";
import { RiDeviceLine, RiDownload2Line, RiLock2Line, RiSendPlane2Line, RiWifiLine } from "react-icons/ri";
import { DeviceTransferDialog } from "@/components/transfer/device-transfer-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DeviceTransferCard() {
  const [open, setOpen] = useState(false);
  const [initialTab, setInitialTab] = useState<"sender" | "receiver">("sender");

  function launch(tab: "sender" | "receiver") { setInitialTab(tab); setOpen(true); }

  return <>
    <Card className="xl:col-span-2"><CardHeader><CardTitle className="flex items-center gap-2"><RiDeviceLine className="text-primary" /> انتقال بین دستگاه‌ها</CardTitle></CardHeader><CardContent className="space-y-4">
      <div className="flex flex-wrap gap-2"><Badge><RiLock2Line /> رمزنگاری‌شده</Badge><Badge><RiWifiLine /> مستقیم بین دو مرورگر</Badge><Badge>بدون حساب و فضای ابری پولم‌کو</Badge></div>
      <p className="text-sm leading-7 text-muted-foreground">برای جابه‌جایی به موبایل یا کامپیوتر جدید، دو دستگاه را ترجیحاً روی یک Wi‑Fi نگه دار. پولم‌کو یک کانال WebRTC مستقیم می‌سازد؛ هیچ دیتابیس مرکزی برای اطلاعات مالی ساخته نمی‌شود.</p>
      <div className="grid gap-2 sm:grid-cols-2"><Button onClick={() => launch("sender")}><RiSendPlane2Line /> انتقال به دستگاه جدید</Button><Button variant="outline" onClick={() => launch("receiver")}><RiDownload2Line /> دریافت از دستگاه قبلی</Button></div>
      <div className="rounded-2xl bg-muted/35 p-3 text-xs leading-6 text-muted-foreground">روش مستقیم نیاز دارد هر دو صفحه تا پایان کار باز بمانند. اگر شبکه یا مرورگر اجازه اتصال نداد، فایل Backup رمزنگاری‌شده بالای همین بخش fallback مطمئن و همیشگی است.</div>
    </CardContent></Card>
    <DeviceTransferDialog key={`${initialTab}-${open ? "open" : "closed"}`} open={open} onOpenChange={setOpen} initialTab={initialTab} />
  </>;
}
