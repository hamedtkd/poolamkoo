"use client";

import Link from "next/link";
import { RiDatabase2Line, RiRefreshLine, RiShieldCheckLine, RiToolsLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto grid min-h-[65svh] max-w-xl place-items-center p-5 text-center">
      <div className="w-full rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><RiToolsLine className="size-6" /></div>
        <h1 className="type-section-title">این بخش کامل بارگذاری نشد</h1>
        <p className="mt-2 type-body text-muted-foreground">اول دوباره تلاش کن. این خطا لزوماً به معنی خرابی داده محلی نیست؛ اگر مشکل ادامه داشت، سلامت داده را در تنظیمات بررسی کن و فقط از مسیرهای بازیابی صریح استفاده کن.</p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Button type="button" variant="outline" onClick={reset}><RiRefreshLine /> تلاش دوباره</Button>
          <Link href="/settings#local-data-health" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 type-button text-primary-foreground shadow-sm transition-[transform,filter] duration-150 hover:brightness-[.97] active:scale-[.985]"><RiDatabase2Line /> بررسی سلامت داده</Link>
        </div>
        <Link href="/data-safety" className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-[590] text-muted-foreground hover:bg-accent hover:text-foreground"><RiShieldCheckLine /> راهنمای Backup و Recovery</Link>
        {process.env.NODE_ENV === "development" && <details className="mt-5 text-start type-caption text-muted-foreground"><summary>جزئیات فنی</summary><pre className="mt-2 overflow-auto whitespace-pre-wrap rounded-xl bg-muted p-3" dir="ltr">{error.message}</pre></details>}
      </div>
    </div>
  );
}
