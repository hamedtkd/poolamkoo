import { Skeleton } from "@/components/ui/skeleton";

export function IncomePlanSkeleton() {
  return (
    <div className="mx-auto max-w-[1780px] space-y-7">
      <header className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[19rem_minmax(0,1fr)] 2xl:grid-cols-[20rem_minmax(0,1fr)]">
        <ProgressSkeleton />
        <div className="grid min-w-0 gap-5 xl:grid-cols-2">
          <GroupSkeleton cards={1} />
          <GroupSkeleton cards={1} />
          <div className="xl:col-span-2">
            <GroupSkeleton cards={4} wide />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-5 sm:p-6 xl:sticky xl:top-6">
      <Skeleton className="h-6 w-36" />
      <div className="mt-6 grid place-items-center">
        <Skeleton className="size-[200px] rounded-full" />
      </div>
      <Skeleton className="mx-auto mt-4 h-4 w-44" />
      <Skeleton className="mx-auto mt-2 h-3 w-24" />
    </div>
  );
}

function GroupSkeleton({ cards, wide = false }: { cards: number; wide?: boolean }) {
  return (
    <div className="rounded-2xl border bg-card">
      <div className="flex items-center justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
        <div className={wide ? "grid gap-4 lg:grid-cols-2 2xl:grid-cols-3" : "grid gap-4 min-[1180px]:grid-cols-2 xl:grid-cols-1 min-[1800px]:grid-cols-2"}>
          {Array.from({ length: cards }, (_, item) => <PlanCardSkeleton key={item} />)}
        </div>
      </div>
    </div>
  );
}

function PlanCardSkeleton() {
  return (
    <div className="rounded-[20px] border bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
      </div>
      <Skeleton className="mt-5 h-2 w-full" />
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
      </div>
      <Skeleton className="mt-5 h-10 w-full rounded-lg" />
    </div>
  );
}
