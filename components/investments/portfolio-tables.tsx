"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { RiDeleteBin6Line, RiEditLine, RiExchangeLine } from "react-icons/ri";
import { DataTable, type DataTableFeatures } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PositionRow } from "@/hooks/use-investment-portfolio";
import { formatMoney, formatNumber, formatPercent, toPersianDate } from "@/lib/format";
import { assetKindLabel } from "@/lib/assets";
import type { AppSettings, Asset, InvestmentTransaction } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SensitiveValue } from "@/components/ui/sensitive-value";

export function PortfolioTables({ positions, transactions, assets, settings, onTransaction, onEditAsset, onArchiveAsset, onDeleteTransaction }: {
  positions: PositionRow[];
  transactions: InvestmentTransaction[];
  assets: Asset[];
  settings: AppSettings;
  onTransaction: (asset: Asset) => void;
  onEditAsset: (asset: Asset) => void;
  onArchiveAsset: (asset: Asset) => void;
  onDeleteTransaction: (id: number) => void;
}) {
  const positionColumns: ColumnDef<DataTableFeatures, PositionRow, unknown>[] = [
    { id: "asset", header: "دارایی", cell: ({ row }) => <div><div className="type-strong">{row.original.asset.name}</div><div className="text-[10px] text-muted-foreground">{row.original.asset.symbol || assetKindLabel(row.original.asset.kind)}</div></div> },
    { accessorKey: "qty", header: "مقدار", cell: ({ row }) => <span dir="ltr">{formatNumber(row.original.qty, 6)}</span> },
    { accessorKey: "avgPrice", header: "میانگین خرید", cell: ({ row }) => <SensitiveValue>{formatMoney(row.original.avgPrice, settings.displayUnit, true)}</SensitiveValue> },
    { accessorKey: "price", header: "قیمت فعلی", cell: ({ row }) => <SensitiveValue>{formatMoney(row.original.price, settings.displayUnit, true)}</SensitiveValue> },
    { accessorKey: "currentValue", header: "ارزش فعلی", cell: ({ row }) => <SensitiveValue className="type-strong">{formatMoney(row.original.currentValue, settings.displayUnit)}</SensitiveValue> },
    { accessorKey: "returnPct", header: "بازده از خرید", cell: ({ row }) => <div className={cn("type-strong", row.original.returnPct >= 0 ? "text-primary" : "text-destructive")}><SensitiveValue>{row.original.returnPct >= 0 ? "+" : ""}{formatPercent(row.original.returnPct)}</SensitiveValue><div className="type-caption text-[10px]"><SensitiveValue>{formatMoney(row.original.unrealized, settings.displayUnit, true)}</SensitiveValue></div></div> },
    { id: "target", header: "هدف", cell: ({ row }) => formatPercent(row.original.asset.targetPct, 0) },
    { id: "actions", header: "", cell: ({ row }) => <div className="flex justify-end gap-1"><Button size="sm" variant="outline" onClick={() => onTransaction(row.original.asset)}><RiExchangeLine /> خرید/فروش</Button><Button size="icon" variant="ghost" className="size-8" onClick={() => onEditAsset(row.original.asset)}><RiEditLine /></Button><Button size="icon" variant="ghost" className="size-8 text-destructive" onClick={() => onArchiveAsset(row.original.asset)}><RiDeleteBin6Line /></Button></div> },
  ];

  const transactionColumns: ColumnDef<DataTableFeatures, InvestmentTransaction, unknown>[] = [
    { accessorKey: "happenedAt", header: "تاریخ", cell: ({ row }) => toPersianDate(row.original.happenedAt) },
    { id: "asset", header: "دارایی", cell: ({ row }) => assets.find((asset) => asset.id === row.original.assetId)?.name || "دارایی حذف‌شده" },
    { accessorKey: "type", header: "نوع", cell: ({ row }) => <Badge className={row.original.type === "buy" ? "text-primary" : "text-destructive"}>{row.original.type === "buy" ? "خرید" : "فروش"}</Badge> },
    { accessorKey: "amountToman", header: "مبلغ", cell: ({ row }) => <SensitiveValue>{formatMoney(row.original.amountToman, settings.displayUnit)}</SensitiveValue> },
    { accessorKey: "unitPriceToman", header: "قیمت واحد", cell: ({ row }) => <SensitiveValue>{formatMoney(row.original.unitPriceToman, settings.displayUnit, true)}</SensitiveValue> },
    { accessorKey: "quantity", header: "مقدار", cell: ({ row }) => <span dir="ltr">{formatNumber(row.original.quantity, 8)}</span> },
    { id: "actions", header: "", cell: ({ row }) => <Button size="icon" variant="ghost" className="size-8 text-destructive" onClick={() => row.original.id && onDeleteTransaction(row.original.id)}><RiDeleteBin6Line /></Button> },
  ];

  return <><Card><CardHeader><CardTitle>دارایی‌های سبد</CardTitle></CardHeader><CardContent><DataTable data={positions} columns={positionColumns} searchPlaceholder="جست‌وجوی دارایی..." mobileCard={(row) => <AssetMobileCard row={row} settings={settings} onTx={() => onTransaction(row.asset)} onEdit={() => onEditAsset(row.asset)} onArchive={() => onArchiveAsset(row.asset)} />} /></CardContent></Card><Card><CardHeader><CardTitle>تراکنش‌های سرمایه‌گذاری</CardTitle></CardHeader><CardContent><DataTable data={[...transactions].sort((a, b) => b.happenedAt.localeCompare(a.happenedAt))} columns={transactionColumns} searchPlaceholder="جست‌وجوی تراکنش..." mobileCard={(row) => <TransactionMobileCard row={row} assets={assets} settings={settings} onDelete={() => row.id && onDeleteTransaction(row.id)} />} /></CardContent></Card></>;
}

function AssetMobileCard({ row, settings, onTx, onEdit, onArchive }: { row: PositionRow; settings: AppSettings; onTx: () => void; onEdit: () => void; onArchive: () => void }) {
  return <div className="p-4"><div className="flex items-start justify-between gap-3"><div><div className="type-strong">{row.asset.name}</div><div className="mt-1 text-[10px] text-muted-foreground">هدف {formatPercent(row.asset.targetPct, 0)} · مقدار {formatNumber(row.qty, 6)}</div></div><div className="text-end"><SensitiveValue className="type-strong">{formatMoney(row.currentValue, settings.displayUnit)}</SensitiveValue><div className={cn("mt-1 text-xs type-strong", row.returnPct >= 0 ? "text-primary" : "text-destructive")}>{row.returnPct >= 0 ? "+" : ""}{formatPercent(row.returnPct)}</div></div></div><div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-muted/40 p-3 text-[11px]"><div><span className="text-muted-foreground">میانگین خرید</span><SensitiveValue className="mt-1 type-strong">{formatMoney(row.avgPrice, settings.displayUnit, true)}</SensitiveValue></div><div><span className="text-muted-foreground">قیمت فعلی</span><SensitiveValue className="mt-1 type-strong">{formatMoney(row.price, settings.displayUnit, true)}</SensitiveValue></div></div><div className="mt-3 flex flex-wrap gap-1"><Button size="sm" onClick={onTx}><RiExchangeLine /> خرید/فروش</Button><Button size="sm" variant="ghost" onClick={onEdit}><RiEditLine /> ویرایش</Button><Button size="sm" variant="ghost" className="text-destructive" onClick={onArchive}><RiDeleteBin6Line /> آرشیو</Button></div></div>;
}

function TransactionMobileCard({ row, assets, settings, onDelete }: { row: InvestmentTransaction; assets: Asset[]; settings: AppSettings; onDelete: () => void }) {
  return <div className="p-4"><div className="flex justify-between gap-3"><div><div className="type-strong">{assets.find((asset) => asset.id === row.assetId)?.name || "دارایی"}</div><div className="mt-1 type-caption text-muted-foreground">{toPersianDate(row.happenedAt)}</div></div><div className="text-end"><Badge>{row.type === "buy" ? "خرید" : "فروش"}</Badge><SensitiveValue className="mt-1 type-strong">{formatMoney(row.amountToman, settings.displayUnit)}</SensitiveValue></div></div><div className="mt-3 flex justify-between border-t pt-3 type-caption text-muted-foreground"><span>مقدار: {formatNumber(row.quantity, 6)}</span><Button size="icon" variant="ghost" className="size-7 text-destructive" onClick={onDelete}><RiDeleteBin6Line /></Button></div></div>;
}
