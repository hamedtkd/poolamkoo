"use client";

import { RiPieChartLine } from "react-icons/ri";
import { ArcGauge } from "@/components/charts/arc-gauge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney, formatPercent } from "@/lib/format";
import type { AppSettings } from "@/lib/types";
import { SensitiveValue } from "@/components/ui/sensitive-value";

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
    <Card className="xl:sticky xl:top-6">
      <CardHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
        <CardTitle className="flex items-center gap-2 type-section-title"><RiPieChartLine /> پایبندی به برنامه</CardTitle>
      </CardHeader>
      <CardContent className="grid place-items-center px-5 pb-6 pt-3 sm:px-6">
        <ArcGauge value={pct} label="پایبندی به برنامه" size={200} stroke={23} />
        <div className="mt-4 text-center type-body text-muted-foreground">
          <SensitiveValue className="type-data">{formatMoney(executed, settings.displayUnit)}</SensitiveValue> / <SensitiveValue className="type-data">{formatMoney(planned, settings.displayUnit)}</SensitiveValue>
        </div>
        <div className="mt-1 type-caption type-body-strong text-primary">{formatPercent(pct, 0)} اجرا شده</div>
      </CardContent>
    </Card>
  );
}