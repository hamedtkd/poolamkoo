"use client";

import { RiPieChartLine } from "react-icons/ri";
import { ArcGauge } from "@/components/charts/arc-gauge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney, formatPercent } from "@/lib/format";
import type { AppSettings } from "@/lib/types";

export function PlanProgressCard({
  planned,
  executed,
  pct,
  settings,
}: {
  planned: number;
  executed: number;
  pct: number;
  settings: AppSettings;
}) {
  return (
    <Card className="xl:sticky xl:top-24">
      <CardHeader><CardTitle className="flex items-center gap-2"><RiPieChartLine /> پایبندی به برنامه</CardTitle></CardHeader>
      <CardContent className="grid place-items-center">
        <ArcGauge value={pct} label="پایبندی به برنامه" size={210} stroke={24} />
        <div className="mt-3 text-center text-sm text-muted-foreground">
          {formatMoney(executed, settings.displayUnit)} / {formatMoney(planned, settings.displayUnit)}
        </div>
        <div className="mt-1 text-xs font-bold text-primary">{formatPercent(pct, 0)} اجرا شده</div>
      </CardContent>
    </Card>
  );
}
