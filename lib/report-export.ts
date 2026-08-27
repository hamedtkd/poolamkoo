import { formatPercent } from "./format.ts";
import { formatPersianDate } from "./persian-date.ts";
import { reportBucketLabel, type ReportDecisionSnapshot } from "./report-insights.ts";
import type { AppDateRange } from "./date-range.ts";
import type { MoneyUnit } from "./types.ts";

export interface ReportExportPerformanceRow {
  name: string;
  target: number;
  actual: number;
  value: number;
  pnl: number;
  pnlPct: number;
}

export interface ReportExportInput {
  range: AppDateRange;
  unit: MoneyUnit;
  decision: ReportDecisionSnapshot;
  performance: ReportExportPerformanceRow[];
}

export function formatReportRange(range: AppDateRange) {
  if (!range.from && !range.to) return "همه زمان";
  if (range.from && range.to) return `${formatPersianDate(range.from)} تا ${formatPersianDate(range.to)}`;
  if (range.from) return `از ${formatPersianDate(range.from)}`;
  return range.to ? `تا ${formatPersianDate(range.to)}` : "همه زمان";
}

export function buildReportShareText(input: ReportExportInput) {
  const { decision } = input;
  const bucketLines = decision.buckets.map((row) => {
    const target = decision.allocationTargetsValid ? ` · هدف ${formatPercent(row.targetPct, 0)}` : "";
    return `• ${reportBucketLabel(row.bucket)}: ${formatPercent(row.actualPct, 0)}${target}`;
  });
  const followUp = decision.largestUnderTarget
    ? `بیشترین فاصله از قانون پول: ${reportBucketLabel(decision.largestUnderTarget.bucket)} (${formatPercent(Math.abs(decision.largestUnderTarget.driftPct), 0)} کمتر از هدف)`
    : decision.allocationReliable && decision.allocationTargetsValid
      ? "تخصیص ثبت‌شده نزدیک به قانون پول است."
      : "برای مقایسه دقیق با قانون پول، داده کامل‌تری لازم است.";

  return [
    "خلاصه تصمیمی پولم‌کو",
    `بازه: ${formatReportRange(input.range)}`,
    "",
    `اجرای برنامه: ${formatPercent(decision.plan.pct, 0)}`,
    `پوشش صندوق‌ها: ${formatPercent(decision.funds.pct, 0)}`,
    `پوشش تخصیص پول ورودی: ${formatPercent(decision.allocationCoveragePct, 0)}`,
    "",
    ...bucketLines,
    "",
    followUp,
    "",
    "این متن عمداً مبلغ‌ها و نام دارایی‌ها را برای اشتراک‌گذاری عمومی‌تر حذف کرده است.",
  ].join("\n");
}

export function buildReportCsv(input: ReportExportInput) {
  const unitLabel = input.unit === "rial" ? "ریال" : "تومان";
  const rows: Array<Array<string | number>> = [
    ["بخش", "شاخص", "نام", "مقدار", "واحد", "هدف درصد", "سهم فعلی درصد", "فاصله درصد"],
    ["خلاصه", "بازه", formatReportRange(input.range), "", "", "", "", ""],
    ["خلاصه", "کل پول ورودی", "", amountForUnit(input.decision.totalIncome, input.unit), unitLabel, "", "", ""],
    ["خلاصه", "برنامه اجراشده", "", amountForUnit(input.decision.plan.executed, input.unit), unitLabel, "", input.decision.plan.pct, ""],
    ["خلاصه", "برنامه باقی‌مانده", "", amountForUnit(input.decision.plan.remaining, input.unit), unitLabel, "", "", ""],
    ["خلاصه", "ذخیره صندوق‌ها", "", amountForUnit(input.decision.funds.funded, input.unit), unitLabel, "", input.decision.funds.pct, ""],
    ["خلاصه", "فاصله تا هدف صندوق‌ها", "", amountForUnit(input.decision.funds.remaining, input.unit), unitLabel, "", "", ""],
    ["خلاصه", "پول تخصیص‌نیافته", "", amountForUnit(input.decision.unallocatedToman, input.unit), unitLabel, "", "", ""],
  ];

  for (const bucket of input.decision.buckets) {
    rows.push([
      "قانون پول",
      reportBucketLabel(bucket.bucket),
      "",
      "",
      "درصد",
      bucket.targetPct,
      bucket.actualPct,
      bucket.driftPct,
    ]);
  }

  for (const asset of input.performance) {
    rows.push([
      "سبد سرمایه‌گذاری",
      "وضعیت دارایی",
      asset.name,
      amountForUnit(asset.value, input.unit),
      unitLabel,
      asset.target,
      asset.actual,
      asset.actual - asset.target,
    ]);
    rows.push([
      "سبد سرمایه‌گذاری",
      "سود/زیان باز",
      asset.name,
      amountForUnit(asset.pnl, input.unit),
      unitLabel,
      "",
      asset.pnlPct,
      "",
    ]);
  }

  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}

export function reportExportFilename(extension: "csv" | "txt", now = new Date()) {
  const stamp = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
  return `poolamkoo-report-${stamp}.${extension}`;
}

function amountForUnit(toman: number, unit: MoneyUnit) {
  const safe = Number.isFinite(toman) ? toman : 0;
  return Math.round(unit === "rial" ? safe * 10 : safe);
}

function csvCell(value: string | number) {
  let text = String(value ?? "");
  if (typeof value === "string" && /^[\t ]*[=+\-@]/.test(text)) text = `'${text}`;
  if (!/[",\r\n]/.test(text)) return text;
  return `"${text.replaceAll('"', '""')}"`;
}
