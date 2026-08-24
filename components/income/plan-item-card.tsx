"use client";

import { RiCheckLine, RiDeleteBin6Line, RiEdit2Line, RiExchangeLine, RiTimeLine } from "react-icons/ri";
import { formatMoney, formatPercent } from "@/lib/format";
import { planProgress, planRemaining, planStatus } from "@/lib/plan-execution";
import type { AppSettings, PlanItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SensitiveValue } from "@/components/ui/sensitive-value";

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
  onEdit,
  onDelete,
}: {
  item: PlanItem;
  settings: AppSettings;
  onAction: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const status = planStatus(item);
  const pct = planProgress(item);
  const remaining = planRemaining(item);
  const isAsset = item.targetType === "asset";

  return (
    <div className="rounded-[20px] border bg-card p-4 shadow-sm transition hover:border-primary/25 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="type-card-title truncate">{item.label}</div>
          <div className="mt-1 type-caption text-muted-foreground">{LABELS.planned}: <SensitiveValue className="type-data">{formatMoney(item.plannedToman, settings.displayUnit)}</SensitiveValue></div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Badge className={status === "done" ? "text-primary" : status === "partial" ? "text-amber-500" : "text-muted-foreground"}>
            {status === "done" ? LABELS.done : status === "partial" ? LABELS.partial : LABELS.pending}
          </Badge>
          <IconAction label={`ویرایش ${item.label}`} onClick={onEdit}><RiEdit2Line className="size-4" /></IconAction>
          <IconAction label={`حذف ${item.label}`} destructive onClick={onDelete}><RiDeleteBin6Line className="size-4" /></IconAction>
        </div>
      </div>
      <Progress value={pct} className="mt-5" />
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Metric label={LABELS.executed} value={formatMoney(item.executedToman, settings.displayUnit, true)} />
        <Metric label={LABELS.remaining} value={formatMoney(remaining, settings.displayUnit, true)} />
        <Metric label="درصد" value={formatPercent(pct, 0)} />
      </div>
      {remaining > 0 && (
        <Button className="mt-5 w-full" variant={isAsset ? "default" : "outline"} onClick={onAction}>
          {isAsset ? <RiExchangeLine /> : <RiTimeLine />}{isAsset ? LABELS.buy : LABELS.execute}
        </Button>
      )}
      {remaining <= 0 && <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-primary/8 p-3 type-caption type-body-strong text-primary"><RiCheckLine />{LABELS.done}</div>}
    </div>
  );
}

function IconAction({ label, onClick, destructive = false, children }: { label: string; onClick: () => void; destructive?: boolean; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" size="icon" variant="ghost" className={destructive ? "size-8 text-destructive hover:bg-destructive/10 hover:text-destructive" : "size-8 text-muted-foreground"} onClick={onClick} aria-label={label}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-muted/45 p-2.5"><SensitiveValue className="type-data text-[12px]">{value}</SensitiveValue><div className="mt-1 type-caption text-[10px] text-muted-foreground">{label}</div></div>;
}