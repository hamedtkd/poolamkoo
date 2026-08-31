import type { MoneyUnit } from "@/lib/types";

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
function toPersianDigits(value: string) {
  return value.replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit);
}

export function formatGroupedNumber(value: number, maxFractionDigits = 0) {
  const safe = Number.isFinite(value) ? value : 0;
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: maxFractionDigits,
    useGrouping: true,
  }).format(safe);
  return toPersianDigits(formatted);
}

export function formatNumber(value: number, maxFractionDigits = 0) {
  return formatGroupedNumber(value || 0, maxFractionDigits);
}

export function formatMoney(toman: number, unit: MoneyUnit = "toman", compact = false) {
  const value = unit === "rial" ? toman * 10 : toman;
  const suffix = unit === "rial" ? "ریال" : "تومان";
  if (compact) {
    const formatter = new Intl.NumberFormat("fa-IR", {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    });
    return `${formatter.format(value)} ${suffix}`;
  }
  return `${formatGroupedNumber(Math.round(value))} ${suffix}`;
}

export function formatSignedMoney(toman: number, unit: MoneyUnit = "toman", compact = false) {
  if (toman === 0) return formatMoney(0, unit, compact);
  const sign = toman > 0 ? "+" : "−";
  return `${sign}${formatMoney(Math.abs(toman), unit, compact)}`;
}

export function formatPercent(value: number, digits = 1) {
  return `${formatGroupedNumber(value, digits)}٪`;
}

export function formatSignedPercent(value: number, digits = 1) {
  if (value === 0) return formatPercent(0, digits);
  const sign = value > 0 ? "+" : "−";
  return `${sign}${formatPercent(Math.abs(value), digits)}`;
}

export function toPersianDate(date: string | Date) {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric", month: "short", day: "numeric" }).format(new Date(date));
}

export function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function dateToISO(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function isoToDate(value?: string | null) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}
