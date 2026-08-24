"use client";

import * as React from "react";
import { RiCalendar2Line, RiCloseLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { PersianCalendar } from "@/components/ui/persian-calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMediaQuery } from "@/hooks/use-media-query";
import { emptyDateRange, presetRange, type AppDateRange, type DateRangePreset } from "@/lib/date-range";
import { formatPersianDate } from "@/lib/persian-date";
import { cn } from "@/lib/utils";

const PRESETS: Array<{ key: DateRangePreset; label: string }> = [
  { key: "all", label: "همه زمان" },
  { key: "today", label: "امروز" },
  { key: "7d", label: "۷ روز اخیر" },
  { key: "30d", label: "۳۰ روز اخیر" },
  { key: "month", label: "این ماه" },
  { key: "previous-month", label: "ماه قبل" },
  { key: "90d", label: "۹۰ روز اخیر" },
];

export function DateRangePicker({ value, onValueChange, className }: {
  value: AppDateRange;
  onValueChange: (value: AppDateRange) => void;
  className?: string;
}) {
  const mobile = useMediaQuery("(max-width: 799px)");
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<AppDateRange>(value);
  React.useEffect(() => { if (!open) setDraft(value); }, [open, value]);

  const trigger = (
    <Button type="button" variant="outline" className={cn("h-10 gap-2 bg-background/75", className)}>
      <RiCalendar2Line className="size-4" />
      <span className="min-w-0 max-w-[210px] truncate">{rangeLabel(value)}</span>
    </Button>
  );

  function applyPreset(key: DateRangePreset, commit = !mobile) {
    const next = presetRange(key);
    setDraft(next);
    if (commit) {
      onValueChange(next);
      setOpen(false);
    }
  }

  if (mobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="px-4">
          <DrawerTitle className="mb-1 text-start">بازه زمانی</DrawerTitle>
          <p className="mb-3 type-caption text-muted-foreground">داده‌های صفحه‌ها بر اساس این بازه فیلتر می‌شوند.</p>
          <PresetGrid onSelect={(key) => applyPreset(key, false)} />
          <div className="mt-3 flex justify-center rounded-2xl border bg-background/62 p-2">
            <PersianCalendar mode="range" range={draft} onRangeChange={setDraft} />
          </div>
          <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
            <Button type="button" onClick={() => { onValueChange(draft); setOpen(false); }}>اعمال بازه</Button>
            <Button type="button" variant="outline" size="icon" onClick={() => setDraft(emptyDateRange())} aria-label="پاک کردن بازه"><RiCloseLine /></Button>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <div className="flex items-stretch">
          <div className="w-40 border-e bg-muted/28 p-2">
            <p className="px-2 py-2 type-caption text-muted-foreground">انتخاب سریع</p>
            <PresetList onSelect={applyPreset} />
          </div>
          <div className="p-3">
            <PersianCalendar mode="range" range={draft} onRangeChange={setDraft} />
            <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
              <Button type="button" variant="ghost" size="sm" onClick={() => setDraft(emptyDateRange())}>پاک کردن</Button>
              <Button type="button" size="sm" onClick={() => { onValueChange(draft); setOpen(false); }}>اعمال بازه</Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function rangeLabel(value: AppDateRange) {
  if (!value.from && !value.to) return "همه زمان";
  if (value.from && value.to) return `${formatPersianDate(value.from)} تا ${formatPersianDate(value.to)}`;
  if (value.from) return `از ${formatPersianDate(value.from)}`;
  return value.to ? `تا ${formatPersianDate(value.to)}` : "همه زمان";
}

function PresetList({ onSelect }: { onSelect: (key: DateRangePreset) => void }) {
  return <div className="grid gap-1">{PRESETS.map((preset) => (
    <Button key={preset.key} type="button" variant="ghost" size="sm" className="justify-start" onClick={() => onSelect(preset.key)}>{preset.label}</Button>
  ))}</div>;
}

function PresetGrid({ onSelect }: { onSelect: (key: DateRangePreset) => void }) {
  return <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">{PRESETS.map((preset) => (
    <Button key={preset.key} type="button" variant="outline" size="sm" className="shrink-0 bg-background/55" onClick={() => onSelect(preset.key)}>{preset.label}</Button>
  ))}</div>;
}
