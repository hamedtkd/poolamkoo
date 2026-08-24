"use client";

import { useState } from "react";
import { RiRefreshLine, RiToolsLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { repairLocalData } from "@/lib/db";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [repairing, setRepairing] = useState(false);
  const repair = async () => {
    setRepairing(true);
    try {
      await repairLocalData();
      reset();
    } finally {
      setRepairing(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-[65svh] max-w-xl place-items-center p-5 text-center">
      <div className="w-full rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><RiToolsLine className="size-6" /></div>
        <h1 className="type-section-title">این بخش نیاز به بازیابی داده دارد</h1>
        <p className="mt-2 type-body text-muted-foreground">داده‌های Local-First حذف نمی‌شوند. پولم‌کو ساختار داده‌های قدیمی را اصلاح می‌کند و دوباره این صفحه را باز می‌کند.</p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Button type="button" onClick={() => void repair()} disabled={repairing}><RiToolsLine />{repairing ? "در حال بازسازی..." : "بازسازی داده"}</Button>
          <Button type="button" variant="outline" onClick={reset}><RiRefreshLine />تلاش دوباره</Button>
        </div>
        {process.env.NODE_ENV === "development" && <details className="mt-5 text-start type-caption text-muted-foreground"><summary>جزئیات فنی</summary><pre className="mt-2 overflow-auto whitespace-pre-wrap rounded-xl bg-muted p-3" dir="ltr">{error.message}</pre></details>}
      </div>
    </div>
  );
}
