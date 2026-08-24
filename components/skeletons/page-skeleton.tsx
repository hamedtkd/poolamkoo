"use client";

import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { Skeleton } from "@/components/ui/skeleton";

export function FullAppSkeleton() {
  const pathname = usePathname();
  return (
    <div className="min-h-svh pb-24 md:pb-0">
      <aside className="fixed inset-y-0 right-0 hidden w-64 border-l bg-background/92 backdrop-blur-xl md:flex md:flex-col">
        <div className="flex h-16 items-center justify-between border-b px-3">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-9 w-10" />
            <div className="space-y-1.5"><Skeleton className="h-4 w-20" /><Skeleton className="h-2.5 w-24" /></div>
          </div>
          <Skeleton className="size-10 rounded-xl" />
        </div>
        <div className="border-b p-3"><Skeleton className="h-11 w-full rounded-xl" /></div>
        <div className="space-y-2 p-3">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-11 w-full rounded-xl" />)}</div>
      </aside>

      <header className="sticky top-0 z-20 border-b bg-background/92 px-3 py-2 backdrop-blur-xl md:hidden">
        <div className="flex h-11 items-center justify-between">
          <div className="flex items-center gap-2"><BrandLogo className="size-8" /><Skeleton className="h-9 w-28 rounded-2xl" /></div>
          <div className="flex gap-2"><Skeleton className="size-10 rounded-xl" /><Skeleton className="size-10 rounded-xl" /></div>
        </div>
      </header>

      <main className="md:mr-64">
        <div className="mx-auto w-full max-w-[1920px] p-3 sm:p-5 lg:p-7 2xl:p-8">
          <TopbarSkeleton />
          <RouteSkeleton pathname={pathname} />
        </div>
      </main>
    </div>
  );
}

export function RouteSkeleton({ pathname }: { pathname: string }) {
  if (pathname.startsWith("/investments")) return <InvestmentsSkeleton />;
  if (pathname.startsWith("/settings")) return <SettingsSkeleton />;
  if (pathname.startsWith("/funds")) return <ListPageSkeleton withKpis filtered={false} />;
  if (pathname.startsWith("/income")) return <ListPageSkeleton filtered />;
  if (pathname.startsWith("/reports")) return <ReportsSkeleton />;
  return <DashboardSkeleton />;
}

function TopbarSkeleton() {
  return (
    <div className="sticky top-0 z-20 -mx-3 mb-4 hidden min-h-16 items-center gap-3 border-b bg-background/88 px-4 py-2 backdrop-blur-xl sm:-mx-5 sm:px-5 md:flex lg:-mx-7 lg:px-7 2xl:-mx-8 2xl:px-8">
      <Skeleton className="h-11 w-40 rounded-2xl" />
      <Skeleton className="mx-auto h-10 w-full max-w-md rounded-xl" />
      <div className="flex gap-1.5">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="size-10 rounded-xl" />)}</div>
    </div>
  );
}

function PageFilterSkeleton() {
  return <div className="mb-5 flex flex-col gap-3 rounded-3xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><Skeleton className="size-10 rounded-2xl" /><div className="space-y-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-52 max-w-[60vw]" /></div></div><Skeleton className="h-10 w-full rounded-xl sm:w-60" /></div>;
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
      <Skeleton className="h-10 w-full max-w-sm rounded-xl" />
      <div className="space-y-2 md:hidden">
        {Array.from({ length: Math.min(rows, 5) }, (_, index) => <div key={index} className="rounded-2xl border bg-card p-4"><div className="flex justify-between gap-4"><div className="space-y-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-20" /></div><Skeleton className="h-4 w-20" /></div><Skeleton className="mt-4 h-2 w-full" /><div className="mt-4 flex gap-2"><Skeleton className="h-8 w-24 rounded-lg" /><Skeleton className="h-8 w-16 rounded-lg" /></div></div>)}
      </div>
      <div className="hidden overflow-hidden rounded-xl border md:block">
        <div className="grid gap-4 border-b bg-muted/40 px-4 py-3" style={grid}>{Array.from({ length: columns }, (_, index) => <Skeleton key={index} className="h-3 w-16 max-w-full" />)}</div>
        {Array.from({ length: rows }, (_, row) => <div key={row} className="grid min-h-14 items-center gap-4 border-b px-4 py-3 last:border-b-0" style={grid}>{Array.from({ length: columns }, (_, column) => <Skeleton key={column} className={column === 0 ? "h-4 w-24 max-w-full" : "h-4 w-16 max-w-full"} />)}</div>)}
      </div>
      <div className="flex items-center justify-between"><Skeleton className="h-3 w-20" /><div className="flex gap-1"><Skeleton className="size-8 rounded-lg" /><Skeleton className="size-8 rounded-lg" /></div></div>
    </div>
  );
}

function DataTableCardSkeleton({ rows = 6, columns = 6 }: { rows?: number; columns?: number }) {
  return <div className="rounded-2xl border bg-card p-4 sm:p-5"><DataTableSkeleton rows={rows} columns={columns} /></div>;
}

function DashboardSkeleton() {
  return <><PageFilterSkeleton /><HeaderSkeleton /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{Array.from({ length: 5 }, (_, index) => <KpiSkeleton key={index} />)}</div><div className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_1.95fr]"><ChartSkeleton /><ChartSkeleton /></div><div className="mt-4"><ChartSkeleton /></div></>;
}

function InvestmentsSkeleton() {
  return <><PageFilterSkeleton /><HeaderSkeleton /><div className="grid gap-3 sm:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <KpiSkeleton key={index} />)}</div><div className="mt-4"><ChartSkeleton tall /></div><div className="mt-4 space-y-4"><DataTableCardSkeleton rows={5} columns={8} /><DataTableCardSkeleton rows={5} columns={7} /></div></>;
}

function SettingsSkeleton() {
  return <><HeaderSkeleton /><div className="grid gap-4 xl:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="rounded-2xl border bg-card p-5"><Skeleton className="mb-6 h-5 w-40" />{Array.from({ length: 4 }, (_, row) => <Skeleton key={row} className="mb-4 h-11 w-full rounded-xl" />)}</div>)}</div></>;
}

function ListPageSkeleton({ withKpis = false, filtered = false }: { withKpis?: boolean; filtered?: boolean }) {
  return <>{filtered ? <PageFilterSkeleton /> : null}{withKpis ? null : <HeaderSkeleton />}{withKpis && <div className="grid gap-3 sm:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <KpiSkeleton key={index} />)}</div>}<div className={withKpis ? "mt-4" : ""}><DataTableCardSkeleton rows={6} columns={withKpis ? 6 : 5} /></div></>;
}

function ReportsSkeleton() {
  return <><PageFilterSkeleton /><HeaderSkeleton /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{Array.from({ length: 5 }, (_, index) => <KpiSkeleton key={index} />)}</div><div className="mt-4 grid gap-4 xl:grid-cols-2"><ChartSkeleton /><ChartSkeleton /></div><div className="mt-4"><DataTableCardSkeleton rows={6} columns={6} /></div></>;
}
