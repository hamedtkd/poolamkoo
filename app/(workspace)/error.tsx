"use client";

import Link from "next/link";
import { useState } from "react";
import { RiRefreshLine, RiShieldCheckLine, RiToolsLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { repairLocalData } from "@/lib/db";
import { toPersianUiError } from "@/lib/errors";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [repairing, setRepairing] = useState(false);
  const [repairError, setRepairError] = useState<string | null>(null);

  const repair = async () => {
    setRepairing(true);
    setRepairError(null);
    try {
      await repairLocalData();
      reset();
    } catch (reason) {
      setRepairError(toPersianUiError(reason, "بازسازی داده کامل نشد. داده را پاک نکن و ابتدا راهنمای بازیابی را بررسی کن."));
    } finally {
      setRepairing(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-[65svh] max-w-xl place-items-center p-5 text-center">
      <div className="w-full rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><RiToolsLine className="size-6" /></div>
        <h1 className="type-section-title">این بخش کامل بارگذاری نشد</h1>
        <p className="mt-2 type-body text-muted-foreground">اول تلاش دوباره را بزن. اگر خطا مربوط به داده قدیمی باشد، «بازسازی داده» فقط ساختارهای شناخته‌شده را normalize می‌کند و قرار نیست اطلاعات مالی اصلی را reset کند.</p>
        {repairError && <div className="mt-4 rounded-xl border border-destructive/25 bg-destructive/5 p-3 text-sm leading-6 text-destructive">{repairError}</div>}
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Button type="button" variant="outline" onClick={reset}><RiRefreshLine /> تلاش دوباره</Button>
          <Button type="button" onClick={() => void repair()} disabled={repairing}><RiToolsLine />{repairing ? "در حال بازسازی..." : "بازسازی داده"}</Button>
        </div>
        <Link href="/data-safety" className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-[590] text-muted-foreground hover:bg-accent hover:text-foreground"><RiShieldCheckLine /> راهنمای Backup و Recovery</Link>
        {process.env.NODE_ENV === "development" && <details className="mt-5 text-start type-caption text-muted-foreground"><summary>جزئیات فنی</summary><pre className="mt-2 overflow-auto whitespace-pre-wrap rounded-xl bg-muted p-3" dir="ltr">{error.message}</pre></details>}
      </div>
    </div>
  );
}
