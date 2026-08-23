import { Skeleton } from "@/components/ui/skeleton";

export function IncomePlanSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2"><Skeleton className="h-4 w-36" /><Skeleton className="h-9 w-52" /><Skeleton className="h-4 w-64" /></div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[20rem_minmax(0,1fr)] 2xl:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="rounded-2xl border bg-card p-5">
          <Skeleton className="h-5 w-32" />
          <div className="mt-6 grid place-items-center"><Skeleton className="size-52 rounded-full" /></div>
          <Skeleton className="mx-auto mt-4 h-4 w-44" />
          <Skeleton className="mx-auto mt-2 h-3 w-24" />
        </div>
        <div className="grid min-w-0 gap-4 2xl:grid-cols-2">
          <GroupSkeleton cards={1} />
          <GroupSkeleton cards={1} />
          <div className="2xl:col-span-2"><GroupSkeleton cards={4} wide /></div>
        </div>
      </div>
    </div>
  );
}

function GroupSkeleton({ cards, wide = false }: { cards: number; wide?: boolean }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between"><div className="space-y-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-3 w-28" /></div><Skeleton className="h-9 w-28" /></div>
      <div className={wide ? "mt-5 grid gap-3 md:grid-cols-2 min-[1760px]:grid-cols-3" : "mt-5 grid gap-3 min-[1180px]:grid-cols-2 2xl:grid-cols-1 min-[1900px]:grid-cols-2"}>
        {Array.from({ length: cards }, (_, item) => <PlanCardSkeleton key={item} />)}
      </div>
    </div>
  );
}

function PlanCardSkeleton() {
  return <div className="rounded-2xl border p-4"><div className="flex justify-between"><div className="space-y-2"><Skeleton className="h-5 w-28" /><Skeleton className="h-3 w-24" /></div><div className="flex gap-2"><Skeleton className="h-6 w-20 rounded-full" /><Skeleton className="size-8 rounded-lg" /></div></div><Skeleton className="mt-4 h-2 w-full" /><div className="mt-3 grid grid-cols-3 gap-2"><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div><Skeleton className="mt-4 h-10 w-full" /></div>;
}
