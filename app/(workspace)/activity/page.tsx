"use client";

import { Reveal } from "@/components/animation/reveal";
import { PageDateFilterBar } from "@/components/app/page-date-filter-bar";
import { useAppRuntime } from "@/components/app/app-runtime";
import { ActivitySection } from "@/components/sections/activity";

export default function ActivityPage() {
  const { data, dateFilter } = useAppRuntime();
  const scope = "activity" as const;
  const filtered = dateFilter.filteredFor(scope);

  return <div className="space-y-5">
    <Reveal direction="down" step={0}>
      <PageDateFilterBar
        title="فیلتر تاریخچه"
        description="فقط فعالیت‌های مالی ثبت‌شده در این بازه نمایش داده می‌شوند."
        value={dateFilter.getRange(scope)}
        onValueChange={(value) => dateFilter.setRange(scope, value)}
      />
    </Reveal>
    <ActivitySection
      settings={data.settings}
      incomes={filtered.incomes}
      funds={data.funds}
      fundMovements={filtered.fundMovements}
      assets={data.allAssets}
      transactions={filtered.transactions}
    />
  </div>;
}
