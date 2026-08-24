"use client";

import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

export function PrivacyToggle({
  hidden,
  showLabel = true,
  className,
}: {
  hidden: boolean;
  showLabel?: boolean;
  className?: string;
}) {
  async function toggle() {
    await db.settings.update("settings", {
      hideFinancialData: !hidden,
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      aria-label={hidden ? "نمایش داده‌های مالی" : "مخفی کردن داده‌های مالی"}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-xl border bg-background/70 px-3 type-label text-muted-foreground transition hover:bg-accent hover:text-foreground",
        className,
      )}
    >
      {hidden ? <RiEyeOffLine className="size-4" /> : <RiEyeLine className="size-4" />}
      {showLabel && <span>{hidden ? "نمایش اعداد" : "مخفی کردن اعداد"}</span>}
    </button>
  );
}
