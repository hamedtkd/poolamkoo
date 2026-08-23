const persianDateParts = new Intl.DateTimeFormat("en-US-u-ca-persian", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

const persianLongDate = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export const PERSIAN_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
] as const;

export function toLatinDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)));
}

export function toPersianDigits(value: string | number) {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

export function getPersianParts(date: Date) {
  const values: Record<string, number> = {};
  for (const part of persianDateParts.formatToParts(date)) {
    if (part.type === "year" || part.type === "month" || part.type === "day") {
      values[part.type] = Number(part.value);
    }
  }
  return { year: values.year, month: values.month, day: values.day };
}

export function startOfPersianMonth(date: Date) {
  const parts = getPersianParts(date);
  const result = new Date(date);
  result.setHours(12, 0, 0, 0);
  result.setDate(result.getDate() - (parts.day - 1));
  return result;
}

export function shiftPersianMonth(date: Date, amount: number) {
  let current = startOfPersianMonth(date);
  const direction = amount >= 0 ? 1 : -1;
  for (let index = 0; index < Math.abs(amount); index += 1) {
    if (direction > 0) {
      current.setDate(current.getDate() + 32);
      current = startOfPersianMonth(current);
    } else {
      current.setDate(current.getDate() - 1);
      current = startOfPersianMonth(current);
    }
  }
  return current;
}

export function getPersianMonthDays(monthDate: Date) {
  const start = startOfPersianMonth(monthDate);
  const month = getPersianParts(start).month;
  const days: Date[] = [];
  for (let day = 0; day < 32; day += 1) {
    const current = new Date(start);
    current.setDate(start.getDate() + day);
    if (getPersianParts(current).month !== month) break;
    days.push(current);
  }
  return days;
}

export function formatPersianDate(date: Date, long = false) {
  if (long) return persianLongDate.format(date);
  const { year, month, day } = getPersianParts(date);
  return `${toPersianDigits(year)}/${toPersianDigits(String(month).padStart(2, "0"))}/${toPersianDigits(String(day).padStart(2, "0"))}`;
}

export function isSameDay(a?: Date | null, b?: Date | null) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
