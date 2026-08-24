import { isoToDate } from "./format.ts";
import { getPersianMonthDays, shiftPersianMonth, startOfPersianMonth } from "./persian-date.ts";

export interface AppDateRange {
  from: Date | null;
  to: Date | null;
}

export type DateRangePreset = "all" | "today" | "7d" | "30d" | "month" | "previous-month" | "90d";

export function emptyDateRange(): AppDateRange {
  return { from: null, to: null };
}

export function normalizeRange(range: AppDateRange): AppDateRange {
  if (!range.from || !range.to || range.from <= range.to) return range;
  return { from: range.to, to: range.from };
}

export function presetRange(preset: DateRangePreset, today = new Date()): AppDateRange {
  const end = endOfDay(today);
  if (preset === "all") return emptyDateRange();
  if (preset === "today") return { from: startOfDay(today), to: end };
  if (preset === "month") {
    const from = startOfPersianMonth(today);
    const days = getPersianMonthDays(from);
    return { from: startOfDay(from), to: endOfDay(days.at(-1) ?? today) };
  }
  if (preset === "previous-month") {
    const month = shiftPersianMonth(today, -1);
    const days = getPersianMonthDays(month);
    return { from: startOfDay(month), to: endOfDay(days.at(-1) ?? month) };
  }
  const days = preset === "7d" ? 6 : preset === "30d" ? 29 : 89;
  const from = new Date(today);
  from.setDate(from.getDate() - days);
  return { from: startOfDay(from), to: end };
}

export function dateInRange(value: string | Date | null | undefined, range: AppDateRange) {
  if (!range.from && !range.to) return true;
  const date = value instanceof Date ? value : isoToDate(value) ?? (value ? new Date(value) : null);
  if (!date || Number.isNaN(date.getTime())) return false;
  const time = date.getTime();
  if (range.from && time < startOfDay(range.from).getTime()) return false;
  if (range.to && time > endOfDay(range.to).getTime()) return false;
  return true;
}

export function startOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function endOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}
