"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, type DataTableFeatures } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatNumber, toPersianDate } from "@/lib/format";
import type { PreparedHistoricalRow } from "@/lib/historical-import";
import type { AppSettings } from "@/lib/types";

export function HistoryImportPreview({ rows, settings }: { rows: PreparedHistoricalRow[]; settings: AppSettings }) {
  const columns: ColumnDef<DataTableFeatures, PreparedHistoricalRow, unknown>[] = [
    { accessorKey: "line", header: "ردیف", cell: ({ row }) => new Intl.NumberFormat("fa-IR").format(row.original.line) },
    { id: "asset", header: "دارایی", cell: ({ row }) => <div><div className="type-strong">{(row.original.asset?.name ?? row.original.assetName) || "—"}</div>{row.original.symbol && <div dir="ltr" className="text-[10px] text-muted-foreground">{row.original.symbol}</div>}</div> },
    { accessorKey: "type", header: "نوع", cell: ({ row }) => row.original.type ? <Badge>{row.original.type === "buy" ? "خرید" : "فروش"}</Badge> : "—" },
    { accessorKey: "quantity", header: "مقدار", cell: ({ row }) => row.original.quantity ? <span dir="ltr">{formatNumber(row.original.quantity, 8)}</span> : "—" },
    { accessorKey: "unitPriceToman", header: "قیمت واحد", cell: ({ row }) => row.original.unitPriceToman ? formatMoney(row.original.unitPriceToman, settings.displayUnit, true) : "—" },
    { accessorKey: "happenedAt", header: "تاریخ", cell: ({ row }) => row.original.happenedAt ? toPersianDate(row.original.happenedAt) : "—" },
    { id: "status", header: "وضعیت", cell: ({ row }) => <ImportStatus row={row.original} /> },
  ];

  return <DataTable data={rows} columns={columns} searchPlaceholder="جست‌وجو در پیش‌نمایش..." emptyText="ردیفی برای پیش‌نمایش وجود ندارد." mobileCard={(row) => <MobileRow row={row} settings={settings} />} />;
}

function ImportStatus({ row }: { row: PreparedHistoricalRow }) {
  if (row.status === "valid") return <Badge className="text-primary">آماده ثبت</Badge>;
  if (row.status === "duplicate") return <div><Badge>تکراری</Badge><div className="mt-1 max-w-56 text-[10px] leading-5 text-muted-foreground">قبلاً ثبت شده و دوباره وارد نمی‌شود.</div></div>;
  return <div><Badge className="text-destructive">نیاز به اصلاح</Badge><div className="mt-1 max-w-64 text-[10px] leading-5 text-destructive">{row.errors.join(" · ")}</div></div>;
}

function MobileRow({ row, settings }: { row: PreparedHistoricalRow; settings: AppSettings }) {
  return <div className="space-y-3 p-4"><div className="flex items-start justify-between gap-3"><div><div className="type-strong">{(row.asset?.name ?? row.assetName) || "دارایی نامشخص"}</div><div className="mt-1 type-caption text-muted-foreground">ردیف {new Intl.NumberFormat("fa-IR").format(row.line)}{row.happenedAt ? ` · ${toPersianDate(row.happenedAt)}` : ""}</div></div><ImportStatus row={row} /></div><div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/45 p-3 type-caption"><div><div className="text-muted-foreground">نوع</div><div className="mt-1 type-strong">{row.type === "sell" ? "فروش" : row.type === "buy" ? "خرید" : "—"}</div></div><div><div className="text-muted-foreground">مقدار</div><div dir="ltr" className="mt-1 type-strong">{row.quantity ? formatNumber(row.quantity, 6) : "—"}</div></div><div><div className="text-muted-foreground">قیمت</div><div className="mt-1 type-strong">{row.unitPriceToman ? formatMoney(row.unitPriceToman, settings.displayUnit, true) : "—"}</div></div></div></div>;
}
