"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { RiDeleteBin6Line, RiEditLine, RiExchangeLine, RiRestartLine } from "react-icons/ri";
import { DataTable, type DataTableFeatures } from "@/components/data-table";
import { MarketSourceLabel } from "@/components/market/market-source-label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SensitiveValue } from "@/components/ui/sensitive-value";
import type { PositionRow } from "@/hooks/use-investment-portfolio";
import { assetKindLabel } from "@/lib/assets";
import { formatMoney, formatNumber, formatPercent, toPersianDate } from "@/lib/format";
import { valuationPriceSourceLabel } from "@/lib/market/valuation";
import type { PortfolioAllocationRow } from "@/lib/portfolio-allocation";
import type { AppSettings, Asset, InvestmentTransaction } from "@/lib/types";
import { cn } from "@/lib/utils";

const allocationStatus = {
  underweight: "کمتر از هدف",
  "near-target": "نزدیک هدف",
  overweight: "بیشتر از هدف",
  "no-target": "بدون هدف",
} as const;

export function PortfolioTables({ positions, allocationRows, transactions, assets, settings, onTransaction, onEditAsset, onArchiveAsset, onRestoreAsset, onEditTransaction, onDeleteTransaction }: {
  positions: PositionRow[];
  allocationRows: PortfolioAllocationRow[];
  transactions: InvestmentTransaction[];
  assets: Asset[];
  settings: AppSettings;
  onTransaction: (asset: Asset) => void;
  onEditAsset: (asset: Asset) => void;
  onArchiveAsset: (asset: Asset) => void;
  onRestoreAsset: (asset: Asset) => void;
  onEditTransaction: (transaction: InvestmentTransaction) => void;
  onDeleteTransaction: (id: number) => void;
}) {
  const allocationMap = new Map(allocationRows.map((row) => [row.asset.id, row]));
  const positionColumns: ColumnDef<DataTableFeatures, PositionRow, unknown>[] = [
    { id: "asset", header: "دارایی", cell: ({ row }) => <div><div className="type-strong">{row.original.asset.name}</div><div className="text-[10px] text-muted-foreground">{row.original.asset.symbol || assetKindLabel(row.original.asset.kind)}</div></div> },
    { accessorKey: "qty", header: "مقدار", cell: ({ row }) => <span dir="ltr">{formatNumber(row.original.qty, 6)}</span> },
    { accessorKey: "avgPrice", header: "میانگین خرید", cell: ({ row }) => <SensitiveValue>{formatMoney(row.original.avgPrice, settings.displayUnit, true)}</SensitiveValue> },
    { accessorKey: "price", header: "قیمت فعلی", cell: ({ row }) => <PriceCell row={row.original} settings={settings} /> },
    { accessorKey: "currentValue", header: "ارزش فعلی", cell: ({ row }) => <SensitiveValue className="type-strong">{formatMoney(row.original.currentValue, settings.displayUnit)}</SensitiveValue> },
    { accessorKey: "returnPct", header: "بازده از خرید", cell: ({ row }) => <div className={cn("type-strong", row.original.returnPct >= 0 ? "text-primary" : "text-destructive")}><SensitiveValue>{row.original.returnPct >= 0 ? "+" : ""}{formatPercent(row.original.returnPct)}</SensitiveValue><div className="type-caption text-[10px]"><SensitiveValue>{formatMoney(row.original.unrealized, settings.displayUnit, true)}</SensitiveValue></div></div> },
    { id: "allocation", header: "ترکیب", cell: ({ row }) => <AllocationCell row={allocationMap.get(row.original.asset.id)} /> },
    { id: "actions", header: "", cell: ({ row }) => row.original.asset.archived ? <div className="flex justify-end"><Button size="sm" variant="outline" onClick={() => onRestoreAsset(row.original.asset)}><RiRestartLine /> بازگردانی</Button></div> : <div className="flex justify-end gap-1"><Button size="sm" variant="outline" onClick={() => onTransaction(row.original.asset)}><RiExchangeLine /> خرید/فروش</Button><Button size="icon" variant="ghost" className="size-8" aria-label={`ویرایش ${row.original.asset.name}`} onClick={() => onEditAsset(row.original.asset)}><RiEditLine /></Button><Button size="icon" variant="ghost" className="size-8 text-destructive" aria-label={`آرشیو ${row.original.asset.name}`} onClick={() => onArchiveAsset(row.original.asset)}><RiDeleteBin6Line /></Button></div> },
  ];

  const transactionColumns: ColumnDef<DataTableFeatures, InvestmentTransaction, unknown>[] = [
    { accessorKey: "happenedAt", header: "تاریخ", cell: ({ row }) => toPersianDate(row.original.happenedAt) },
    { id: "asset", header: "دارایی", cell: ({ row }) => assets.find((asset) => asset.id === row.original.assetId)?.name || "دارایی حذف‌شده" },
    { accessorKey: "type", header: "نوع", cell: ({ row }) => <Badge className={row.original.type === "buy" ? "text-primary" : "text-destructive"}>{row.original.type === "buy" ? "خرید" : "فروش"}</Badge> },
    { accessorKey: "amountToman", header: "مبلغ", cell: ({ row }) => <SensitiveValue>{formatMoney(row.original.amountToman, settings.displayUnit)}</SensitiveValue> },
    { accessorKey: "unitPriceToman", header: "قیمت واحد", cell: ({ row }) => <SensitiveValue>{formatMoney(row.original.unitPriceToman, settings.displayUnit, true)}</SensitiveValue> },
    { accessorKey: "quantity", header: "مقدار", cell: ({ row }) => <span dir="ltr">{formatNumber(row.original.quantity, 8)}</span> },
    { id: "actions", header: "", cell: ({ row }) => <div className="flex justify-end gap-1"><Button size="icon" variant="ghost" className="size-8" aria-label="ویرایش تراکنش" onClick={() => onEditTransaction(row.original)}><RiEditLine /></Button><Button size="icon" variant="ghost" className="size-8 text-destructive" aria-label="حذف تراکنش" onClick={() => row.original.id && onDeleteTransaction(row.original.id)}><RiDeleteBin6Line /></Button></div> },
  ];

  return <><Card><CardHeader><CardTitle>دارایی‌های سبد</CardTitle></CardHeader><CardContent><DataTable data={positions} columns={positionColumns} searchPlaceholder="جست‌وجوی دارایی..." mobileCard={(row) => <AssetMobileCard row={row} allocation={allocationMap.get(row.asset.id)} settings={settings} onTx={() => onTransaction(row.asset)} onEdit={() => onEditAsset(row.asset)} onArchive={() => onArchiveAsset(row.asset)} onRestore={() => onRestoreAsset(row.asset)} />} /></CardContent></Card><Card><CardHeader><CardTitle>تراکنش‌های سرمایه‌گذاری</CardTitle></CardHeader><CardContent><DataTable data={[...transactions].sort((a, b) => b.happenedAt.localeCompare(a.happenedAt))} columns={transactionColumns} searchPlaceholder="جست‌وجوی تراکنش..." mobileCard={(row) => <TransactionMobileCard row={row} assets={assets} settings={settings} onEdit={() => onEditTransaction(row)} onDelete={() => row.id && onDeleteTransaction(row.id)} />} /></CardContent></Card></>;
}

function PriceCell({ row, settings }: { row: PositionRow; settings: AppSettings }) {
  return <div><SensitiveValue>{formatMoney(row.price, settings.displayUnit, true)}</SensitiveValue><PriceProvenance row={row} /></div>;
}

function PriceProvenance({ row }: { row: PositionRow }) {
  if ((row.priceSource === "live-market" || row.priceSource === "snapshot-market") && row.quote) {
    return <div className="mt-1 flex items-center gap-1"><Badge className={row.priceSource === "snapshot-market" ? "border-amber-500/35 bg-amber-500/10" : "text-primary"}>{row.priceSource === "snapshot-market" ? "Snapshot" : "بازار"}</Badge><MarketSourceLabel source={row.quote.source} compact snapshot={row.priceSource === "snapshot-market"} snapshotAt={row.quote.snapshotCapturedAt} className="text-[9px] text-muted-foreground" /></div>;
  }
  if (row.priceSource === "manual") return <div className="mt-1 text-[9px] text-muted-foreground">{valuationPriceSourceLabel(row.priceSource)}</div>;
  if (row.priceSource === "cost-basis" && row.qty > 0) return <div className="mt-1 text-[9px] text-muted-foreground">{valuationPriceSourceLabel(row.priceSource)}</div>;
  return null;
}

function AllocationCell({ row }: { row?: PortfolioAllocationRow }) {
  if (!row) return <span className="text-muted-foreground">—</span>;
  return <div><div className="type-strong">{formatPercent(row.currentPct, 1)} <span className="text-muted-foreground">/ هدف {formatPercent(row.targetPct, 0)}</span></div><div className={cn("mt-1 text-[10px]", row.status === "underweight" && "text-primary", row.status === "overweight" && "text-destructive", (row.status === "near-target" || row.status === "no-target") && "text-muted-foreground")}>{allocationStatus[row.status]}</div></div>;
}

function AssetMobileCard({ row, allocation, settings, onTx, onEdit, onArchive, onRestore }: { row: PositionRow; allocation?: PortfolioAllocationRow; settings: AppSettings; onTx: () => void; onEdit: () => void; onArchive: () => void; onRestore: () => void }) {
  return <div className="p-4"><div className="flex items-start justify-between gap-3"><div><div className="type-strong">{row.asset.name}</div><div className="mt-1 text-[10px] text-muted-foreground">مقدار {formatNumber(row.qty, 6)}</div></div><div className="text-end"><SensitiveValue className="type-strong">{formatMoney(row.currentValue, settings.displayUnit)}</SensitiveValue><div className={cn("mt-1 text-xs type-strong", row.returnPct >= 0 ? "text-primary" : "text-destructive")}>{row.returnPct >= 0 ? "+" : ""}{formatPercent(row.returnPct)}</div></div></div>{allocation && <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/40 p-3 text-[11px]"><span>سهم فعلی <b>{formatPercent(allocation.currentPct, 1)}</b> · هدف <b>{formatPercent(allocation.targetPct, 0)}</b></span><Badge>{allocationStatus[allocation.status]}</Badge></div>}<div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-muted/40 p-3 text-[11px]"><div><span className="text-muted-foreground">میانگین خرید</span><SensitiveValue className="mt-1 type-strong">{formatMoney(row.avgPrice, settings.displayUnit, true)}</SensitiveValue></div><div><span className="text-muted-foreground">قیمت فعلی</span><SensitiveValue className="mt-1 type-strong">{formatMoney(row.price, settings.displayUnit, true)}</SensitiveValue><PriceProvenance row={row} /></div></div>{row.asset.archived ? <div className="mt-3"><Button className="w-full" size="sm" variant="outline" onClick={onRestore}><RiRestartLine /> بازگردانی به سبد</Button></div> : <div className="mt-3 flex flex-wrap gap-1"><Button size="sm" onClick={onTx}><RiExchangeLine /> خرید/فروش</Button><Button size="sm" variant="ghost" onClick={onEdit}><RiEditLine /> ویرایش</Button><Button size="sm" variant="ghost" className="text-destructive" onClick={onArchive}><RiDeleteBin6Line /> آرشیو</Button></div>}</div>;
}

function TransactionMobileCard({ row, assets, settings, onEdit, onDelete }: { row: InvestmentTransaction; assets: Asset[]; settings: AppSettings; onEdit: () => void; onDelete: () => void }) {
  return <div className="p-4"><div className="flex justify-between gap-3"><div><div className="type-strong">{assets.find((asset) => asset.id === row.assetId)?.name || "دارایی"}</div><div className="mt-1 type-caption text-muted-foreground">{toPersianDate(row.happenedAt)}</div></div><div className="text-end"><Badge>{row.type === "buy" ? "خرید" : "فروش"}</Badge><SensitiveValue className="mt-1 type-strong">{formatMoney(row.amountToman, settings.displayUnit)}</SensitiveValue></div></div>{row.note && <div className="mt-2 type-caption text-muted-foreground">{row.note}</div>}<div className="mt-3 flex items-center justify-between border-t pt-3 type-caption text-muted-foreground"><span>مقدار: {formatNumber(row.quantity, 6)}</span><div className="flex gap-1"><Button size="icon" variant="ghost" className="size-8" aria-label="ویرایش تراکنش" onClick={onEdit}><RiEditLine /></Button><Button size="icon" variant="ghost" className="size-8 text-destructive" aria-label="حذف تراکنش" onClick={onDelete}><RiDeleteBin6Line /></Button></div></div></div>;
}
