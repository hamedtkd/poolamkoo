"use client";

import {
  columnFilteringFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowData,
  type Table as TanStackTable,
} from "@tanstack/react-table";
import {
  RiArrowDownSLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowUpDownLine,
  RiArrowUpSLine,
  RiSearch2Line,
} from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMediaQuery } from "@/hooks/use-media-query";

export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
  filterFns: { includesString: filterFn_includesString },
});

export type DataTableFeatures = typeof dataTableFeatures;

export function DataTable<TData extends RowData>({
  data,
  columns,
  searchPlaceholder = "جست‌وجو...",
  mobileCard,
  emptyText = "داده‌ای ثبت نشده است.",
}: {
  data: TData[];
  columns: ColumnDef<DataTableFeatures, TData, unknown>[];
  searchPlaceholder?: string;
  mobileCard?: (row: TData) => React.ReactNode;
  emptyText?: string;
}) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const table = useTable(
    {
      features: dataTableFeatures,
      data,
      columns,
      globalFilterFn: "includesString",
      initialState: { pagination: { pageIndex: 0, pageSize: 8 } },
    },
    (state) => state,
  );

  const visibleRows = table.getRowModel().rows;
  const filter = String(table.store.state.globalFilter ?? "");

  return (
    <div className="space-y-3">
      <div className="relative max-w-sm">
        <RiSearch2Line className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="جست‌وجوی جدول"
          value={filter}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          placeholder={searchPlaceholder}
          className="pe-9"
        />
      </div>

      {isMobile && mobileCard ? (
        <div className="space-y-2" role="list" aria-label="نتایج جدول">
          {visibleRows.length ? visibleRows.map((row) => (
            <Card key={row.id} className="overflow-hidden" role="listitem">{mobileCard(row.original)}</Card>
          )) : (
            <EmptyState text={emptyText} />
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => {
                    const sorted = header.column.getIsSorted();
                    const SortIcon = sorted === "asc" ? RiArrowUpSLine : sorted === "desc" ? RiArrowDownSLine : RiArrowUpDownLine;
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : header.column.getCanSort() ? "none" : undefined}
                      >
                        {header.isPlaceholder ? null : (
                          <div className="flex min-h-9 items-center gap-1.5">
                            <span className="min-w-0 flex-1 type-body-strong">
                              <table.FlexRender header={header} />
                            </span>
                            {header.column.getCanSort() && (
                              <button
                                type="button"
                                className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                onClick={header.column.getToggleSortingHandler()}
                                aria-label={`مرتب‌سازی ستون ${typeof header.column.columnDef.header === "string" ? header.column.columnDef.header : ""}`.trim()}
                              >
                                <SortIcon className="size-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {visibleRows.length ? visibleRows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}><table.FlexRender cell={cell} /></TableCell>
                  ))}
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={columns.length} className="h-28 text-center text-muted-foreground">{emptyText}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination table={table} />
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed p-10 text-center type-body text-muted-foreground">{text}</div>;
}

function Pagination<TData extends RowData>({ table }: { table: TanStackTable<DataTableFeatures, TData> }) {
  return (
    <nav aria-label="صفحه‌بندی جدول" className="flex items-center justify-between type-caption text-muted-foreground">
      <span>
        صفحه {new Intl.NumberFormat("fa-IR").format(table.store.state.pagination.pageIndex + 1)} از{" "}
        {new Intl.NumberFormat("fa-IR").format(Math.max(1, table.getPageCount()))}
      </span>
      <div className="flex gap-1">
        <Button size="icon" variant="outline" className="size-8" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()} aria-label="صفحه قبل">
          <RiArrowRightSLine />
        </Button>
        <Button size="icon" variant="outline" className="size-8" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()} aria-label="صفحه بعد">
          <RiArrowLeftSLine />
        </Button>
      </div>
    </nav>
  );
}
