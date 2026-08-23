"use client";
import { ResponsiveContainer, Area, AreaChart, YAxis } from "recharts";
export function Sparkline({ data, positive = true }: { data: number[]; positive?: boolean }) {
  const rows = data.map((value, i) => ({ i, value }));
  return <div className="h-12 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={rows} margin={{ top: 3, right: 1, left: 1, bottom: 2 }}><defs><linearGradient id={`spark-${positive ? "p" : "n"}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={positive ? "var(--primary)" : "var(--destructive)"} stopOpacity={.22}/><stop offset="100%" stopColor={positive ? "var(--primary)" : "var(--destructive)"} stopOpacity={0}/></linearGradient></defs><YAxis hide domain={["dataMin - 1", "dataMax + 1"]}/><Area type="monotone" dataKey="value" stroke={positive ? "var(--primary)" : "var(--destructive)"} strokeWidth={2} fill={`url(#spark-${positive ? "p" : "n"})`} dot={false} isAnimationActive /></AreaChart></ResponsiveContainer></div>;
}
