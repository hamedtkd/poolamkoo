"use client";

import { RiCalendarLine } from "react-icons/ri";
import { useHydrated } from "@/hooks/use-hydrated";
import { formatPersianDate } from "@/lib/persian-date";
import { cn } from "@/lib/utils";

export function TodayDate({ compact = false, className }: { compact?: boolean; className?: string }) {
  const hydrated = useHydrated();
  const today = hydrated ? new Date() : null;

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <RiCalendarLine className="size-3.5" />
      </div>
      <div className="min-w-0 leading-none">
        <div className="text-[10px] text-muted-foreground">امروز</div>
        <div className={cn("mt-1 truncate font-medium", compact ? "text-[11px]" : "text-xs")}>{today ? formatPersianDate(today, true) : "—"}</div>
      </div>
    </div>
  );
}
