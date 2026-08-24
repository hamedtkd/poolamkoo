"use client";

import { RiBarChartBoxLine } from "react-icons/ri";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartLegend } from "@/components/charts/chart-legend";
import { SensitiveValue } from "@/components/ui/sensitive-value";
import { formatMoney } from "@/lib/format";
import type { MoneyUnit } from "@/lib/types";

const items = [
  { label: "زندگی", color: "var(--chart-1)" },
  { label: "امنیت", color: "var(--chart-2)" },
  { label: "رشد", color: "var(--chart-3)" },
];

export function MonthlyBars({ data, unit }: { data: Array<{ month: string; life: number; safety: number; growth: number }>; unit: MoneyUnit }) {
  const hasData = data.some((row) => row.life + row.safety + row.growth > 0);
  if (!hasData) return <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed bg-muted/15 p-6 text-center"><div><RiBarChartBoxLine className="mx-auto size-8 text-primary" /><div className="mt-3 type-strong">هنوز داده ماهانه‌ای نداریم</div><p className="mt-2 max-w-sm type-caption text-muted-foreground">با ثبت پول ورودی و برنامه‌ریزی آن، نمودار ماهانه از داده واقعی خودت ساخته می‌شود.</p></div></div>;
  return (
    <div>
      <ChartLegend items={items} className="mb-3" />
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={3} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 5" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
            <YAxis hide />
            <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.35 }} content={({ active, payload, label }) => active && payload?.length ? <div className="glass rounded-xl p-3 text-xs"><div className="mb-2 type-strong">{label}</div>{payload.map((entry) => <div key={String(entry.dataKey)} className="flex min-w-36 justify-between gap-4"><span className="text-muted-foreground">{entry.dataKey === "life" ? "زندگی" : entry.dataKey === "safety" ? "امنیت" : "رشد"}</span><SensitiveValue className="type-strong">{formatMoney(Number(entry.value), unit, true)}</SensitiveValue></div>)}</div> : null} />
            <Bar dataKey="life" stackId="a" fill="var(--chart-1)" radius={[0, 0, 6, 6]} />
            <Bar dataKey="safety" stackId="a" fill="var(--chart-2)" />
            <Bar dataKey="growth" stackId="a" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
