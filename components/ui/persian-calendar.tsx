"use client";

import * as React from "react";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import {
  PERSIAN_MONTHS,
  getPersianMonthDays,
  getPersianParts,
  isSameDay,
  shiftPersianMonth,
  startOfPersianMonth,
  toPersianDigits,
} from "@/lib/persian-date";
import { cn } from "@/lib/utils";

export function PersianCalendar({ value, onValueChange }: { value?: Date | null; onValueChange: (value: Date) => void }) {
  const [month, setMonth] = React.useState(() => startOfPersianMonth(value ?? new Date()));
  React.useEffect(() => { if (value) setMonth(startOfPersianMonth(value)); }, [value]);

  const days = getPersianMonthDays(month);
  const parts = getPersianParts(month);
  const firstWeekday = (days[0]?.getDay() + 1) % 7;
  const today = new Date();
  const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

  return (
    <div className="w-[300px] max-w-full select-none" dir="rtl">
      <div className="mb-3 flex items-center justify-between">
        <Button type="button" variant="ghost" size="icon" className="size-9" onClick={() => setMonth((current) => shiftPersianMonth(current, -1))} aria-label="ماه قبل"><RiArrowRightSLine /></Button>
        <div className="text-center">
          <div className="text-sm font-black">{PERSIAN_MONTHS[parts.month - 1]} {toPersianDigits(parts.year)}</div>
          <button type="button" className="mt-0.5 text-[10px] font-semibold text-primary" onClick={() => setMonth(startOfPersianMonth(today))}>امروز</button>
        </div>
        <Button type="button" variant="ghost" size="icon" className="size-9" onClick={() => setMonth((current) => shiftPersianMonth(current, 1))} aria-label="ماه بعد"><RiArrowLeftSLine /></Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted-foreground">
        {weekDays.map((day) => <div key={day} className={cn("py-1", day === "ج" && "text-destructive")}>{day}</div>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: firstWeekday }, (_, index) => <div key={`blank-${index}`} />)}
        {days.map((day) => {
          const dayParts = getPersianParts(day);
          const selected = isSameDay(value, day);
          const isToday = isSameDay(today, day);
          const friday = day.getDay() === 5;
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onValueChange(day)}
              className={cn(
                "grid size-9 place-items-center rounded-xl text-xs font-semibold transition hover:bg-accent",
                friday && !selected && "text-destructive",
                isToday && !selected && "ring-1 ring-primary/35",
                selected && "bg-primary text-primary-foreground shadow-sm shadow-primary/20",
              )}
            >
              {toPersianDigits(dayParts.day)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
