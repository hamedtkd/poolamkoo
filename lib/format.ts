import type { MoneyUnit } from "@/lib/types";

const fa = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 });

export function formatNumber(value: number, maxFractionDigits = 0) {
  return new Intl.NumberFormat("fa-IR", { maximumFractionDigits: maxFractionDigits }).format(value || 0);
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
  return `${fa.format(Math.round(value))} ${suffix}`;
}

export function formatPercent(value: number, digits = 1) {
  return `${new Intl.NumberFormat("fa-IR", { maximumFractionDigits: digits }).format(value)}٪`;
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
