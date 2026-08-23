"use client";

import { RiCheckLine, RiDeleteBin6Line, RiExchangeLine, RiTimeLine } from "react-icons/ri";
import { formatMoney, formatPercent } from "@/lib/format";
import { planProgress, planRemaining, planStatus } from "@/lib/plan-execution";
import type { AppSettings, PlanItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const LABELS = {
  pending: "انجام نشده",
  partial: "بخشی انجام شده",
  done: "انجام شده",
  planned: "پیشنهاد",
  executed: "اجراشده",
  remaining: "باقی‌مانده",
  buy: "ثبت خرید",
  execute: "ثبت اجرا",
};

export function PlanItemCard({
  item,
  settings,
  onAction,
  onDelete,
}: {
  item: PlanItem;
  settings: AppSettings;
  onAction: () => void;
  onDelete: () => void;
}) {
  const status = planStatus(item);
  const pct = planProgress(item);
  const remaining = planRemaining(item);
  const isAsset = item.targetType === "asset";

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm transition hover:border-primary/25">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-black">{item.label}</div>
          <div className="mt-1 text-xs text-muted-foreground">{LABELS.planned}: {formatMoney(item.plannedToman, settings.displayUnit)}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge className={status === "done" ? "text-primary" : status === "partial" ? "text-amber-500" : "text-muted-foreground"}>
            {status === "done" ? LABELS.done : status === "partial" ? LABELS.partial : LABELS.pending}
          </Badge>
          <Button type="button" size="icon" variant="ghost" className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={onDelete} title="حذف کارت برنامه" aria-label={`حذف ${item.label}`}>
            <RiDeleteBin6Line className="size-4" />
          </Button>
        </div>
      </div>
      <Progress value={pct} className="mt-4" />
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
        <Metric label={LABELS.executed} value={formatMoney(item.executedToman, settings.displayUnit, true)} />
        <Metric label={LABELS.remaining} value={formatMoney(remaining, settings.displayUnit, true)} />
        <Metric label="درصد" value={formatPercent(pct, 0)} />
      </div>
      {remaining > 0 && (
        <Button className="mt-4 w-full" variant={isAsset ? "default" : "outline"} onClick={onAction}>
          {isAsset ? <RiExchangeLine /> : <RiTimeLine />}{isAsset ? LABELS.buy : LABELS.execute}
        </Button>
      )}
      {remaining <= 0 && <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary/8 p-3 text-xs font-bold text-primary"><RiCheckLine />{LABELS.done}</div>}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-muted/45 p-2"><div className="font-bold">{value}</div><div className="mt-1 text-[9px] text-muted-foreground">{label}</div></div>;
}
