"use client";

import { usePathname } from "next/navigation";
import { RiPieChartLine } from "react-icons/ri";
import { Skeleton } from "@/components/ui/skeleton";

export function FullAppSkeleton() {
  const pathname = usePathname();
  return (
    <div className="min-h-svh pb-24 md:pb-0">
      <aside className="fixed inset-y-0 right-0 hidden w-64 border-l bg-background md:block">
        <div className="flex h-20 items-center gap-3 border-b px-5">
          <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground"><RiPieChartLine /></div>
          <div className="space-y-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-2.5 w-32" /></div>
        </div>
        <div className="space-y-3 p-3"><Skeleton className="h-10 w-full rounded-xl" />{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-11 w-full rounded-xl" />)}</div>
      </aside>
      <header className="sticky top-0 h-16 border-b bg-background md:hidden">
        <div className="flex h-full items-center justify-between px-4"><Skeleton className="h-9 w-28 rounded-xl" /><Skeleton className="size-10 rounded-xl" /></div>
      </header>
      <main className="md:mr-64">
        <div className="mx-auto max-w-[1500px] p-3 sm:p-5 lg:p-7"><RouteSkeleton pathname={pathname} /></div>
      </main>
    </div>
  );
}

export function RouteSkeleton({ pathname }: { pathname: string }) {
  if (pathname.startsWith("/investments")) return <InvestmentsSkeleton />;
  if (pathname.startsWith("/settings")) return <SettingsSkeleton />;
  if (pathname.startsWith("/funds")) return <ListPageSkeleton withKpis />;
  if (pathname.startsWith("/income")) return <ListPageSkeleton />;
  if (pathname.startsWith("/reports")) return <ReportsSkeleton />;
  return <DashboardSkeleton />;
}

function HeaderSkeleton() {
  return <div className="mb-5 space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-8 w-72 max-w-[80%]" /><Skeleton className="h-3 w-96 max-w-full" /></div>;
}

function KpiSkeleton() {
  return <div className="rounded-2xl border bg-card p-4"><Skeleton className="mb-4 h-3 w-20" /><Skeleton className="h-7 w-32" /><Skeleton className="mt-3 h-2.5 w-24" /></div>;
}

function ChartSkeleton({ tall = false }: { tall?: boolean }) {
  return <div className="rounded-2xl border bg-card p-4"><div className="mb-4 flex justify-between"><Skeleton className="h-5 w-32" /><Skeleton className="h-8 w-20" /></div><Skeleton className={tall ? "h-[330px] w-full rounded-xl" : "h-[230px] w-full rounded-xl"} /></div>;
}

function DataTableSkeleton({ rows = 6, columns = 6 }: { rows?: number; columns?: number }) {
  const grid = { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` };
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full max-w-sm rounded-lg" />
      <div className="space-y-2 md:hidden">
        {Array.from({ length: Math.min(rows, 5) }, (_, index) => (
          <div key={index} className="rounded-2xl border bg-card p-4">
            <div className="flex items-start justify-between gap-4"><div className="space-y-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-20" /></div><div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-14" /></div></div>
            <Skeleton className="mt-4 h-2 w-full" /><div className="mt-4 flex gap-2"><Skeleton className="h-8 w-24 rounded-lg" /><Skeleton className="h-8 w-16 rounded-lg" /></div>
          </div>
        ))}
      </div>
      <div className="hidden overflow-hidden rounded-xl border md:block">
        <div className="grid gap-4 border-b bg-muted/40 px-4 py-3" style={grid}>{Array.from({ length: columns }, (_, index) => <Skeleton key={index} className="h-3 w-16 max-w-full" />)}</div>
        {Array.from({ length: rows }, (_, row) => (
          <div key={row} className="grid min-h-14 items-center gap-4 border-b px-4 py-3 last:border-b-0" style={grid}>
            {Array.from({ length: columns }, (_, column) => <Skeleton key={column} className={column === 0 ? "h-4 w-24 max-w-full" : "h-4 w-16 max-w-full"} />)}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between"><Skeleton className="h-3 w-20" /><div className="flex gap-1"><Skeleton className="size-8 rounded-lg" /><Skeleton className="size-8 rounded-lg" /></div></div>
    </div>
  );
}

function DataTableCardSkeleton({ rows = 6, columns = 6 }: { rows?: number; columns?: number }) {
  return <div className="rounded-2xl border bg-card p-4 sm:p-5"><DataTableSkeleton rows={rows} columns={columns} /></div>;
}

function DashboardSkeleton() {
  return <><HeaderSkeleton /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <KpiSkeleton key={index} />)}</div><div className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_1.95fr]"><ChartSkeleton /><ChartSkeleton /></div><div className="mt-4"><ChartSkeleton /></div></>;
}

function InvestmentsSkeleton() {
  return <><HeaderSkeleton /><div className="grid gap-3 sm:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <KpiSkeleton key={index} />)}</div><div className="mt-4"><ChartSkeleton tall /></div><div className="mt-4 space-y-4"><DataTableCardSkeleton rows={5} columns={8} /><DataTableCardSkeleton rows={5} columns={7} /></div></>;
}

function SettingsSkeleton() {
  return <><HeaderSkeleton /><div className="grid gap-4 xl:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="rounded-2xl border bg-card p-5"><Skeleton className="mb-6 h-5 w-40" />{Array.from({ length: 4 }, (_, row) => <Skeleton key={row} className="mb-4 h-11 w-full rounded-xl" />)}</div>)}</div></>;
}

function ListPageSkeleton({ withKpis = false }: { withKpis?: boolean }) {
  return <><HeaderSkeleton />{withKpis && <div className="grid gap-3 sm:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <KpiSkeleton key={index} />)}</div>}<div className={withKpis ? "mt-4" : ""}><DataTableCardSkeleton rows={6} columns={withKpis ? 6 : 5} /></div></>;
}

function ReportsSkeleton() {
  return <><HeaderSkeleton /><div className="grid gap-4 xl:grid-cols-[.9fr_2.1fr]"><ChartSkeleton /><ChartSkeleton /></div><div className="mt-4 grid gap-4 xl:grid-cols-2"><ChartSkeleton /><ChartSkeleton /></div></>;
}
