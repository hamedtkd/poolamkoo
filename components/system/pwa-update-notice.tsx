"use client";

import { RiCloseLine, RiRefreshLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { usePwaUpdate } from "@/hooks/use-pwa-update";

export function PwaUpdateNotice() {
  const update = usePwaUpdate();
  if (update.status === "idle") return null;
  const applying = update.status === "applying";

  return (
    <aside
      aria-live="polite"
      className="fixed inset-x-3 bottom-24 z-[80] mx-auto max-w-lg rounded-2xl border bg-card/95 p-3 shadow-lg backdrop-blur md:bottom-5"
    >
      <div className="flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><RiRefreshLine className="size-5" /></div>
        <div className="min-w-0 flex-1">
          <div className="type-strong">نسخه جدید پولم‌کو آماده است</div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">با یک تازه‌سازی امن اعمال می‌شود؛ داده‌های Local-first روی دستگاه پاک نمی‌شوند.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" disabled={applying} onClick={update.applyUpdate}>{applying ? "در حال به‌روزرسانی…" : "به‌روزرسانی"}</Button>
            <Button size="sm" variant="ghost" disabled={applying} onClick={update.dismissUpdate}><RiCloseLine /> بعداً</Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
