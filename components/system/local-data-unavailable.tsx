"use client";

import Link from "next/link";
import { RiDatabase2Line, RiRefreshLine, RiShieldCheckLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { toPersianUiError } from "@/lib/errors";
import { classifyLocalDataIssue } from "@/lib/local-data-issues";

export function LocalDataUnavailable({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const issue = classifyLocalDataIssue(error);
  const message = issue.message ?? toPersianUiError(error, "دسترسی به پایگاه داده محلی ممکن نشد. داده را پاک نکن؛ ابتدا دوباره تلاش کن یا راهنمای ماندگاری داده را ببین.");
  const actionLabel = issue.action === "reload" ? "بارگذاری نسخه جدید" : "تلاش دوباره";

  return (
    <main className="grid min-h-svh place-items-center p-5">
      <div className="w-full max-w-xl rounded-3xl border bg-card p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><RiDatabase2Line className="size-6" /></div>
        <h1 className="mt-4 type-section-title">فضای داده محلی آماده نشد</h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">{message}</p>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Button type="button" onClick={onRetry}><RiRefreshLine /> {actionLabel}</Button>
          <Link href="/data-safety" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border bg-background/70 px-4 text-sm font-[590] transition hover:bg-accent"><RiShieldCheckLine /> راهنمای ماندگاری داده</Link>
        </div>
        <p className="mt-5 text-xs leading-6 text-muted-foreground">پاک‌کردن Site Data یا Reset مرورگر را به‌عنوان اولین راه‌حل انجام نده؛ این کار می‌تواند داده Local-first را حذف کند.</p>
      </div>
    </main>
  );
}
