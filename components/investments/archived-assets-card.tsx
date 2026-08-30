"use client";

import { RiArchiveLine, RiRestartLine } from "react-icons/ri";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { assetArchiveBlockers } from "@/lib/asset-lifecycle";
import { assetKindLabel } from "@/lib/assets";
import { formatNumber, formatPercent } from "@/lib/format";
import type { Asset, InvestmentTransaction, PlanItem } from "@/lib/types";

export function ArchivedAssetsCard({ assets, transactions, planItems, onRestore }: {
  assets: Asset[];
  transactions: InvestmentTransaction[];
  planItems: PlanItem[];
  onRestore: (asset: Asset) => void;
}) {
  if (!assets.length) return null;

  return <Card className="border-dashed">
    <CardHeader>
      <CardTitle className="flex items-center gap-2"><RiArchiveLine />دارایی‌های آرشیوشده</CardTitle>
      <p className="mt-1 type-caption leading-6 text-muted-foreground">آرشیو فقط دارایی بسته‌شده را از جریان روزمره پنهان می‌کند؛ تاریخچه حذف نمی‌شود و هر زمان می‌توانی آن را برگردانی.</p>
    </CardHeader>
    <CardContent className="grid gap-2 md:grid-cols-2">
      {assets.map((asset) => {
        const blockers = asset.id ? assetArchiveBlockers(asset.id, transactions, planItems) : { openQuantity: 0, pendingPlanCount: 0, blocked: false };
        const needsRestore = blockers.openQuantity > 0 || blockers.pendingPlanCount > 0;
        return <div key={asset.id ?? asset.name} className="rounded-2xl border bg-muted/20 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0"><div className="truncate type-strong">{asset.name}</div><div className="mt-1 type-caption text-muted-foreground">{asset.symbol || assetKindLabel(asset.kind)} · هدف قبلی {formatPercent(asset.targetPct, 0)}</div></div>
            <Badge className={needsRestore ? "border-amber-500/35 bg-amber-500/10" : ""}>{needsRestore ? "نیاز به بازگردانی" : "آرشیو"}</Badge>
          </div>
          {blockers.openQuantity > 0 && <p className="mt-3 text-xs leading-6 text-amber-700 dark:text-amber-300">این رکورد از نسخه‌های قبلی هنوز {formatNumber(blockers.openQuantity, 6)} واحد موجودی باز دارد؛ برای جلوگیری از حذف ارزش سبد آن را بازگردان.</p>}
          {blockers.pendingPlanCount > 0 && <p className="mt-2 text-xs leading-6 text-amber-700 dark:text-amber-300">{new Intl.NumberFormat("fa-IR").format(blockers.pendingPlanCount)} آیتم برنامه مالی هنوز به این دارایی متصل است.</p>}
          <Button className="mt-3 w-full" variant="outline" onClick={() => onRestore(asset)}><RiRestartLine />بازگردانی به سبد</Button>
        </div>;
      })}
    </CardContent>
  </Card>;
}
