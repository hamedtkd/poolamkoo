"use client";

import { RiAddLine } from "react-icons/ri";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlanItemCard } from "@/components/income/plan-item-card";
import type { AppSettings, PlanItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PlanGroupCard({
  title,
  items,
  settings,
  wide = false,
  onAction,
  onDelete,
  onQuickAdd,
}: {
  title: string;
  items: PlanItem[];
  settings: AppSettings;
  wide?: boolean;
  onAction: (item: PlanItem) => void;
  onDelete: (item: PlanItem) => void;
  onQuickAdd: () => void;
}) {
  return (
    <Card className={cn(wide && "2xl:col-span-2")}>
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">{new Intl.NumberFormat("fa-IR").format(items.length)} کارت در این بخش</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onQuickAdd}><RiAddLine /> کارت سریع</Button>
      </CardHeader>
      <CardContent>
        {items.length ? (
          <div className={cn("grid gap-3", wide ? "md:grid-cols-2 min-[1760px]:grid-cols-3" : "min-[1180px]:grid-cols-2 2xl:grid-cols-1 min-[1900px]:grid-cols-2")}>
            {items.map((item) => (
              <PlanItemCard key={item.id} item={item} settings={settings} onAction={() => onAction(item)} onDelete={() => onDelete(item)} />
            ))}
          </div>
        ) : (
          <button type="button" onClick={onQuickAdd} className="grid min-h-32 w-full place-items-center rounded-2xl border border-dashed bg-muted/20 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground">
            <span className="flex items-center gap-2"><RiAddLine className="size-5" /> اولین کارت این بخش را بساز</span>
          </button>
        )}
      </CardContent>
    </Card>
  );
}
