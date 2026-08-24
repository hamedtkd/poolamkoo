"use client";

import { RiFilter3Line } from "react-icons/ri";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import type { AppDateRange } from "@/lib/date-range";

export function PageDateFilterBar({
  title,
  description,
  value,
  onValueChange,
}: {
  title: string;
  description?: string;
  value: AppDateRange;
  onValueChange: (value: AppDateRange) => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border bg-card/72 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <RiFilter3Line className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="type-label">{title}</div>
          {description ? <p className="mt-0.5 hidden truncate type-caption text-muted-foreground lg:block">{description}</p> : null}
        </div>
      </div>
      <DateRangePicker value={value} onValueChange={onValueChange} className="w-full justify-start sm:w-auto" />
    </div>
  );
}
