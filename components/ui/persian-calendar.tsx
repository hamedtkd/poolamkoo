"use client";

import * as React from "react";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import type { AppDateRange } from "@/lib/date-range";
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

type SingleProps = {
  mode?: "single";
  value?: Date | null;
  onValueChange: (value: Date) => void;
};

type RangeProps = {
  mode: "range";
  range: AppDateRange;
  onRangeChange: (value: AppDateRange) => void;
};

export function PersianCalendar(props: SingleProps | RangeProps) {
  const selectedDate = props.mode === "range" ? props.range.from : props.value;
  const [navigationMonth, setNavigationMonth] = React.useState<Date | null>(null);
  const month = navigationMonth ?? startOfPersianMonth(selectedDate ?? new Date());
  const days = getPersianMonthDays(month);
  const parts = getPersianParts(month);
  const firstWeekday = (days[0]?.getDay() + 1) % 7;
  const today = new Date();
  const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

  function selectDay(day: Date) {
    if (props.mode !== "range") {
      setNavigationMonth(null);
      props.onValueChange(day);
      return;
    }
    const { from, to } = props.range;
    if (!from || to) {
      setNavigationMonth(null);
      props.onRangeChange({ from: day, to: null });
      return;
    }
    if (day.getTime() < from.getTime()) {
      setNavigationMonth(null);
      props.onRangeChange({ from: day, to: from });
    } else {
      props.onRangeChange({ from, to: day });
    }
  }

  return (
    <div className="w-[300px] max-w-full select-none" dir="rtl">
      <div className="mb-3 flex items-center justify-between">
        <Button type="button" variant="ghost" size="icon" className="size-9" onClick={() => setNavigationMonth(shiftPersianMonth(month, -1))} aria-label="ماه قبل"><RiArrowRightSLine /></Button>
        <div className="text-center">
          <div className="text-sm type-strong">{PERSIAN_MONTHS[parts.month - 1]} {toPersianDigits(parts.year)}</div>
          <button type="button" className="mt-0.5 text-[10px] type-label text-primary" onClick={() => setNavigationMonth(startOfPersianMonth(today))}>امروز</button>
        </div>
        <Button type="button" variant="ghost" size="icon" className="size-9" onClick={() => setNavigationMonth(shiftPersianMonth(month, 1))} aria-label="ماه بعد"><RiArrowLeftSLine /></Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] type-strong text-muted-foreground">
        {weekDays.map((day) => <div key={day} className={cn("py-1", day === "ج" && "text-destructive")}>{day}</div>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: firstWeekday }, (_, index) => <div key={`blank-${index}`} />)}
        {days.map((day) => <CalendarDay key={day.toISOString()} day={day} today={today} props={props} onSelect={selectDay} />)}
      </div>
    </div>
  );
}

function CalendarDay({ day, today, props, onSelect }: { day: Date; today: Date; props: SingleProps | RangeProps; onSelect: (day: Date) => void }) {
  const dayParts = getPersianParts(day);
  const friday = day.getDay() === 5;
  const isToday = isSameDay(today, day);
  const singleSelected = props.mode !== "range" && isSameDay(props.value, day);
  const rangeStart = props.mode === "range" && isSameDay(props.range.from, day);
  const rangeEnd = props.mode === "range" && isSameDay(props.range.to, day);
  const between = props.mode === "range" && props.range.from && props.range.to
    ? day.getTime() > props.range.from.getTime() && day.getTime() < props.range.to.getTime()
    : false;
  const selected = singleSelected || rangeStart || rangeEnd;

  return (
    <button
      type="button"
      onClick={() => onSelect(day)}
      className={cn(
        "grid size-9 place-items-center rounded-xl type-caption type-body-strong transition hover:bg-accent",
        between && "rounded-md bg-primary/10 text-foreground",
        friday && !selected && !between && "text-destructive",
        isToday && !selected && !between && "ring-1 ring-primary/35",
        selected && "bg-primary text-primary-foreground shadow-sm shadow-primary/20",
      )}
      aria-pressed={Boolean(selected || between)}
    >
      {toPersianDigits(dayParts.day)}
    </button>
  );
}
