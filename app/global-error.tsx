"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <main className="grid min-h-svh place-items-center bg-background p-5 text-foreground">
          <div className="w-full max-w-lg rounded-3xl border bg-card p-6 text-center shadow-sm sm:p-8">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-destructive/10 text-xl text-destructive">!</div>
            <h1 className="mt-4 text-xl font-bold">پولم‌کو نتوانست این صفحه را کامل اجرا کند</h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">اول دوباره تلاش کن. اگر مشکل ادامه داشت، صفحه را تازه کن. برای حفظ داده Local-first از پاک‌کردن Site Data به‌عنوان راه‌حل اولیه استفاده نکن.</p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={reset} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">تلاش دوباره</button>
              <button type="button" onClick={() => window.location.reload()} className="h-10 rounded-lg border px-4 text-sm font-semibold">تازه‌کردن صفحه</button>
            </div>
            {error.digest && <p className="mt-5 text-xs text-muted-foreground" dir="ltr">Reference: {error.digest}</p>}
          </div>
        </main>
      </body>
    </html>
  );
}
