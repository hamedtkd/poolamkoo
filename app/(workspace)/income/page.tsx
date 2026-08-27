"use client";

import { Reveal } from "@/components/animation/reveal";
import { PageDateFilterBar } from "@/components/app/page-date-filter-bar";
import { IncomeSection } from "@/components/sections/income";
import { useAppRuntime } from "@/components/app/app-runtime";

export default function IncomePage() {
  const { data, dateFilter } = useAppRuntime();
  const scope = "income" as const;
  const filtered = dateFilter.filteredFor(scope);

  return (
    <div className="space-y-5">
      <Reveal direction="down" step={0}>
      <PageDateFilterBar
        title="فیلتر ورودی‌ها"
        description="فهرست پول‌های ورودی و اجرای برنامه‌ها فقط برای همین بازه نمایش داده می‌شود."
        value={dateFilter.getRange(scope)}
        onValueChange={(value) => dateFilter.setRange(scope, value)}
      />
      </Reveal>
      <IncomeSection
        incomes={filtered.incomes}
        allocations={filtered.allocations}
        planItems={filtered.planItems}
        settings={data.settings}
        onNewMoney={() => window.dispatchEvent(new CustomEvent("poolyar:new-money"))}
      />
    </div>
  );
}
