"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RiDashboardLine, RiRefreshLine, RiWifiOffLine } from "react-icons/ri";
import { APP_ENTRY_PATH } from "@/lib/site";

export function OfflineScreen() {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return (
    <main className="grid min-h-svh place-items-center p-6">
      <div className="w-full max-w-md rounded-3xl border bg-card p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><RiWifiOffLine className="size-6" /></div>
        <h1 className="mt-4 type-page-title">اتصال اینترنت در دسترس نیست</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">داده‌های Local-first روی همین دستگاه می‌مانند. بخش‌هایی که قبلاً باز شده‌اند ممکن است از Cache در دسترس باشند؛ قیمت لحظه‌ای بازار تا اتصال بعدی به‌روز نمی‌شود.</p>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={() => window.location.reload()} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-[590] text-primary-foreground"><RiRefreshLine /> {online ? "اتصال برگشته؛ تلاش دوباره" : "تلاش دوباره"}</button>
          <Link href={APP_ENTRY_PATH} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-[590] hover:bg-accent"><RiDashboardLine /> داشبورد</Link>
        </div>
      </div>
    </main>
  );
}
