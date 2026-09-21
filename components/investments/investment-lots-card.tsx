"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { RiInformationLine } from "react-icons/ri";
import { DataTable, type DataTableFeatures } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { SensitiveValue } from "@/components/ui/sensitive-value";
import { useInvestmentAnalytics } from "@/hooks/use-investment-analytics";
import { formatMoney, formatNumber, formatSignedMoney, formatSignedPercent, toPersianDate } from "@/lib/format";
import type { InvestmentLot } from "@/lib/investment-lots";
import type { AppSettings, Asset, InvestmentTransaction, MarketQuote } from "@/lib/types";
import { cn } from "@/lib/utils";

type LotRow = { asset: Asset; lot: InvestmentLot };
type LotFilter = "all" | "open" | "closed";

export function InvestmentLotsCard({ assets, transactions, quotes, settings, title = "جزئیات هر خرید" }: {
  assets: Asset[];
  transactions: InvestmentTransaction[];
  quotes: MarketQuote[];
  settings: AppSettings;
  title?: string;
}) {
  const analytics = useInvestmentAnalytics(assets, transactions, quotes);
  const [assetId, setAssetId] = useState("all");
  const [filter, setFilter] = useState<LotFilter>("all");
  const rows = useMemo(() => analytics.assets.flatMap((assetRow) => assetRow.lots.map((lot) => ({ asset: assetRow.asset, lot }))).filter((row) => {
    if (assetId !== "all" && String(row.asset.id) !== assetId) return false;
    if (filter === "open" && row.lot.remainingQuantity <= 1e-10) return false;
    if (filter === "closed" && row.lot.remainingQuantity > 1e-10) return false;
    return true;
  }).sort((a, b) => b.lot.happenedAt.localeCompare(a.lot.happenedAt)), [analytics.assets, assetId, filter]);

  const columns: ColumnDef<DataTableFeatures, LotRow, unknown>[] = [
    { id: "date", header: "تاریخ خرید", cell: ({ row }) => toPersianDate(row.original.lot.happenedAt) },
    { id: "asset", header: "دارایی", cell: ({ row }) => <strong>{row.original.asset.name}</strong> },
    { id: "cost", header: "هزینه خرید", cell: ({ row }) => <SensitiveValue>{formatMoney(row.original.lot.originalCostToman, settings.displayUnit)}</SensitiveValue> },
    { id: "unit", header: "قیمت تمام‌شده واحد", cell: ({ row }) => <SensitiveValue>{formatMoney(row.original.lot.unitCostToman, settings.displayUnit, true)}</SensitiveValue> },
    { id: "remaining", header: "باقی‌مانده", cell: ({ row }) => <div><span dir="ltr">{formatNumber(row.original.lot.remainingQuantity, 8)}</span><div className="mt-1 text-[10px] text-muted-foreground">از {formatNumber(row.original.lot.originalQuantity, 8)}</div></div> },
    { id: "status", header: "وضعیت", cell: ({ row }) => <Badge>{row.original.lot.remainingQuantity > 1e-10 ? "باز" : "فروخته‌شده"}</Badge> },
    { id: "openPnl", header: "سود/زیان باز", cell: ({ row }) => <LotOpenPnl lot={row.original.lot} settings={settings} /> },
    { id: "realized", header: "سود/زیان قطعی", cell: ({ row }) => <SignedMoney value={row.original.lot.realizedPnlToman} settings={settings} /> },
  ];

  return <Card>
    <CardHeader className="gap-3">
      <div><CardTitle>{title}</CardTitle><p className="mt-1 type-caption leading-6 text-muted-foreground">هر خرید جدا نگه داشته می‌شود. هنگام فروش، مقدار فروخته‌شده به‌صورت پیش‌فرض از قدیمی‌ترین خریدهای باز کم می‌شود تا سود هر خرید قابل پیگیری باشد.</p></div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Select value={assetId} onValueChange={setAssetId} options={[{ value: "all", label: "همه دارایی‌ها" }, ...assets.filter((asset) => asset.id).map((asset) => ({ value: String(asset.id), label: asset.name }))]} />
        <Select value={filter} onValueChange={(value) => setFilter(value as LotFilter)} options={[{ value: "all", label: "همه خریدها" }, { value: "open", label: "فقط خریدهای باز" }, { value: "closed", label: "فقط خریدهای فروخته‌شده" }]} />
      </div>
    </CardHeader>
    <CardContent>
      <div className="mb-4 flex gap-2 rounded-xl border border-primary/15 bg-primary/5 p-3 type-caption leading-6 text-muted-foreground"><RiInformationLine className="mt-0.5 size-4 shrink-0 text-primary" /><span>اگر قیمت تازه یا قیمت دستی نداشته باشیم، مقدار و بهای خرید همچنان نمایش داده می‌شود اما سود/زیان باز ساخته نمی‌شود.</span></div>
      <DataTable data={rows} columns={columns} searchPlaceholder="جست‌وجوی خرید..." mobileCard={(row) => <LotMobileCard row={row} settings={settings} />} />
    </CardContent>
  </Card>;
}

function LotOpenPnl({ lot, settings }: { lot: InvestmentLot; settings: AppSettings }) {
  if (lot.unrealizedPnlToman === undefined) return <span className="text-muted-foreground">قیمت فعلی نداریم</span>;
  return <div className={cn("type-strong", lot.unrealizedPnlToman >= 0 ? "text-profit" : "text-loss")}><SensitiveValue>{formatSignedMoney(lot.unrealizedPnlToman, settings.displayUnit, true)}</SensitiveValue><div className="mt-1 text-[10px]"><SensitiveValue>{formatSignedPercent(lot.unrealizedReturnPct ?? 0)}</SensitiveValue></div></div>;
}

function SignedMoney({ value, settings }: { value: number; settings: AppSettings }) {
  return <SensitiveValue className={cn("type-strong", value > 0 && "text-profit", value < 0 && "text-loss")}>{formatSignedMoney(value, settings.displayUnit, true)}</SensitiveValue>;
}

function LotMobileCard({ row, settings }: { row: LotRow; settings: AppSettings }) {
  return <div className="p-4"><div className="flex items-start justify-between gap-3"><div><div className="type-strong">{row.asset.name}</div><div className="mt-1 type-caption text-muted-foreground">خرید {toPersianDate(row.lot.happenedAt)}</div></div><Badge>{row.lot.remainingQuantity > 1e-10 ? "باز" : "بسته"}</Badge></div><div className="mt-3 grid grid-cols-2 gap-2 text-xs"><Mini label="هزینه خرید" value={formatMoney(row.lot.originalCostToman, settings.displayUnit, true)} /><Mini label="باقی‌مانده" value={formatNumber(row.lot.remainingQuantity, 6)} /></div><div className="mt-3 flex items-center justify-between border-t pt-3"><span className="type-caption text-muted-foreground">سود/زیان باز</span><LotOpenPnl lot={row.lot} settings={settings} /></div>{Math.abs(row.lot.realizedPnlToman) > 0.01 && <div className="mt-2 flex items-center justify-between"><span className="type-caption text-muted-foreground">سود/زیان قطعی</span><SignedMoney value={row.lot.realizedPnlToman} settings={settings} /></div>}</div>;
}

function Mini({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-muted/45 p-2"><SensitiveValue className="type-strong">{value}</SensitiveValue><div className="mt-1 text-[10px] text-muted-foreground">{label}</div></div>;
}
