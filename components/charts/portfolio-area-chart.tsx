"use client";
import { useReducedMotion } from "motion/react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMoney } from "@/lib/format";
import type { MoneyUnit } from "@/lib/types";

export function PortfolioAreaChart({ data, unit = "toman" }: { data: Array<{ date: string; value: number }>; unit?: MoneyUnit }) {
  const reduced = useReducedMotion();
  return <div className="h-[245px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 8, right: 2, left: 2, bottom: 0 }}><defs><linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={.28}/><stop offset="75%" stopColor="var(--primary)" stopOpacity={.04}/><stop offset="100%" stopColor="var(--primary)" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 5" opacity={.65}/><XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} minTickGap={28}/><YAxis hide domain={["dataMin - 100000", "dataMax + 100000"]}/><Tooltip cursor={{ stroke: "var(--primary)", strokeDasharray: "4 4", opacity: .35 }} content={({ active, payload, label }) => active && payload?.[0] ? <div className="glass rounded-xl px-3 py-2 text-xs"><div className="text-muted-foreground">{label}</div><div className="mt-1 type-strong">{formatMoney(Number(payload[0].value), unit)}</div></div> : null}/><Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} fill="url(#portfolioFill)" dot={false} activeDot={{ r: 5, fill: "var(--background)", stroke: "var(--primary)", strokeWidth: 3 }} isAnimationActive={!reduced} /></AreaChart></ResponsiveContainer></div>;
}
