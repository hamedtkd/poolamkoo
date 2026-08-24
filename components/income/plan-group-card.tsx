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
  onEdit,
  onDelete,
  onQuickAdd,
}: {
  title: string;
  items: PlanItem[];
  settings: AppSettings;
  wide?: boolean;
  onAction: (item: PlanItem) => void;
  onEdit: (item: PlanItem) => void;
  onDelete: (item: PlanItem) => void;
  onQuickAdd: () => void;
}) {
  return (
    <Card className={cn("overflow-hidden", wide && "xl:col-span-2")}>
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0 px-5 pt-5 sm:px-6 sm:pt-6">
        <div>
          <CardTitle className="type-section-title">{title}</CardTitle>
          <p className="mt-1 type-caption text-muted-foreground">{new Intl.NumberFormat("fa-IR").format(items.length)} کارت در این بخش</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onQuickAdd}><RiAddLine /> کارت سریع</Button>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
        {items.length ? (
          <div className={cn("grid gap-4", wide ? "lg:grid-cols-2 2xl:grid-cols-3" : "min-[1180px]:grid-cols-2 xl:grid-cols-1 min-[1800px]:grid-cols-2")}>
            {items.map((item) => (
              <PlanItemCard
                key={item.id}
                item={item}
                settings={settings}
                onAction={() => onAction(item)}
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item)}
              />
            ))}
          </div>
        ) : (
          <button type="button" onClick={onQuickAdd} className="grid min-h-36 w-full place-items-center rounded-2xl border border-dashed bg-muted/20 type-body text-muted-foreground transition hover:border-primary/40 hover:text-foreground">
            <span className="flex items-center gap-2"><RiAddLine className="size-5" /> اولین کارت این بخش را بساز</span>
          </button>
        )}
      </CardContent>
    </Card>
  );
}
