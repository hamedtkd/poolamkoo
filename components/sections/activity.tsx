"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { RiFileList3Line, RiFundsLine, RiHistoryLine, RiSafe2Line, RiSearch2Line, RiWallet3Line } from "react-icons/ri";
import { Reveal, RevealGrid } from "@/components/animation/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KpiIcon } from "@/components/ui/kpi-icon";
import { SensitiveValue } from "@/components/ui/sensitive-value";
import {
  buildFinancialActivity,
  filterFinancialActivity,
  groupFinancialActivityByDay,
  summarizeFinancialActivity,
  type FinancialActivityCategory,
  type FinancialActivityItem,
} from "@/lib/activity";
import { formatMoney, toPersianDate } from "@/lib/format";
import type { AppSettings, Asset, FundMovement, GoalFund, IncomeEvent, InvestmentTransaction } from "@/lib/types";
import { cn } from "@/lib/utils";

const FILTERS: Array<{ value: FinancialActivityCategory | "all"; label: string }> = [
  { value: "all", label: "همه" },
  { value: "income", label: "ورودی‌ها" },
  { value: "fund", label: "صندوق‌ها" },
  { value: "investment", label: "سرمایه‌گذاری" },
];

export function ActivitySection({ settings, incomes, funds, fundMovements, assets, transactions }: {
  settings: AppSettings;
  incomes: IncomeEvent[];
  funds: GoalFund[];
  fundMovements: FundMovement[];
  assets: Asset[];
  transactions: InvestmentTransaction[];
}) {
  const [category, setCategory] = useState<FinancialActivityCategory | "all">("all");
  const [query, setQuery] = useState("");
  const activity = useMemo(() => buildFinancialActivity({ incomes, funds, fundMovements, assets, transactions }), [assets, fundMovements, funds, incomes, transactions]);
  const visible = useMemo(() => filterFinancialActivity(activity, category, query), [activity, category, query]);
  const summary = useMemo(() => summarizeFinancialActivity(activity), [activity]);
  const groups = useMemo(() => groupFinancialActivityByDay(visible), [visible]);

  return <div className="space-y-5">
    <Reveal direction="down" step={1}>
      <div>
        <div className="type-caption type-body-strong text-primary">رد پول</div>
        <h1 className="mt-1 type-page-title">تاریخچه یکپارچه فعالیت‌ها</h1>
        <p className="mt-1 max-w-3xl type-body text-muted-foreground">ورود پول، گردش صندوق و خریدوفروش‌های ثبت‌شده را کنار هم ببین. این Timeline از Ledgerهای واقعی ساخته می‌شود و زمان یا جریان نقدیِ ثبت‌نشده را حدس نمی‌زند.</p>
      </div>
    </Reveal>

    <RevealGrid className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" startStep={2}>
      <SummaryCard icon={<RiHistoryLine />} label="رویدادهای این بازه" value={summary.eventCount.toLocaleString("fa-IR")} detail="رکورد واقعی ثبت‌شده" />
      <SummaryCard icon={<RiWallet3Line />} label="پول ورودی" value={formatMoney(summary.incomeTotal, settings.displayUnit, true)} detail="جمع ورودی‌های ثبت‌شده" sensitive />
      <SummaryCard icon={<RiSafe2Line />} label="گردش صندوق" value={formatMoney(summary.fundTurnover, settings.displayUnit, true)} detail="جمع واریز، برداشت و افتتاح" sensitive />
      <SummaryCard icon={<RiFundsLine />} label="گردش سرمایه‌گذاری" value={formatMoney(summary.investmentTurnover, settings.displayUnit, true)} detail="جمع مبلغ خرید و فروش" sensitive />
    </RevealGrid>

    <Reveal step={6}>
      <div className="rounded-2xl border bg-card p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" aria-label="فیلتر نوع فعالیت">
            {FILTERS.map((item) => <Button key={item.value} type="button" size="sm" variant={category === item.value ? "default" : "outline"} onClick={() => setCategory(item.value)}>{item.label}</Button>)}
          </div>
          <div className="relative w-full lg:max-w-sm">
            <RiSearch2Line className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجوی عنوان، یادداشت یا منبع..." className="pe-9" aria-label="جست‌وجوی تاریخچه فعالیت" />
          </div>
        </div>
      </div>
    </Reveal>

    <Reveal step={7}>
      {groups.length ? <div className="space-y-5">{groups.map((group) => <ActivityDay key={group.day} day={group.day} rows={group.items} settings={settings} />)}</div> : <EmptyActivity filtered={Boolean(query || category !== "all")} />}
    </Reveal>
  </div>;
}

function ActivityDay({ day, rows, settings }: { day: string; rows: FinancialActivityItem[]; settings: AppSettings }) {
  return <section aria-label={`فعالیت‌های ${toPersianDate(day)}`}>
    <div className="mb-2 flex items-center gap-3"><div className="type-label">{toPersianDate(day)}</div><div className="h-px flex-1 bg-border" /><span className="type-caption text-muted-foreground">{rows.length.toLocaleString("fa-IR")} رویداد</span></div>
    <div className="overflow-hidden rounded-2xl border bg-card">{rows.map((row, index) => <ActivityRow key={row.id} row={row} settings={settings} divided={index > 0} />)}</div>
  </section>;
}

function ActivityRow({ row, settings, divided }: { row: FinancialActivityItem; settings: AppSettings; divided: boolean }) {
  const Icon = row.category === "income" ? RiWallet3Line : row.category === "fund" ? RiSafe2Line : RiFundsLine;
  return <div className={cn("flex flex-col gap-3 p-4 sm:flex-row sm:items-center", divided && "border-t")}>
    <div className="flex min-w-0 flex-1 items-start gap-3">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2"><div className="type-strong">{row.title}</div><Badge className="bg-background">{row.detail}</Badge>{row.sourceLabel ? <Badge>{row.sourceLabel}</Badge> : null}</div>
        {row.note ? <p className="mt-1 line-clamp-2 type-caption leading-5 text-muted-foreground">{row.note}</p> : null}
      </div>
    </div>
    <div className="flex items-center justify-between gap-3 sm:justify-end">
      <SensitiveValue className="type-strong tabular-nums">{formatMoney(row.amountToman, settings.displayUnit)}</SensitiveValue>
      <Link href={row.href} className="inline-flex h-8 shrink-0 items-center justify-center gap-2 rounded-lg px-3 type-button text-xs transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><RiFileList3Line /> باز کردن</Link>
    </div>
  </div>;
}

function SummaryCard({ icon, label, value, detail, sensitive = false }: { icon: React.ReactNode; label: string; value: string; detail: string; sensitive?: boolean }) {
  return <div className="rounded-2xl border bg-card p-4"><div className="flex items-start gap-3"><KpiIcon>{icon}</KpiIcon><div className="min-w-0"><div className="type-caption text-muted-foreground">{label}</div>{sensitive ? <SensitiveValue className="mt-1 block type-section-title">{value}</SensitiveValue> : <div className="mt-1 type-section-title">{value}</div>}<div className="mt-1 type-caption text-muted-foreground">{detail}</div></div></div></div>;
}

function EmptyActivity({ filtered }: { filtered: boolean }) {
  return <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed bg-card/50 p-6 text-center"><div><RiHistoryLine className="mx-auto size-7 text-muted-foreground" /><div className="mt-3 type-strong">{filtered ? "چیزی با این فیلتر پیدا نشد" : "هنوز فعالیت مالی ثبت نشده"}</div><p className="mt-1 type-caption text-muted-foreground">{filtered ? "فیلتر یا عبارت جست‌وجو را تغییر بده." : "با ثبت پول ورودی، گردش صندوق یا معامله، Timeline به‌صورت خودکار ساخته می‌شود."}</p></div></div>;
}
