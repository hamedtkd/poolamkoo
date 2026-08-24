"use client";

import { PageDateFilterBar } from "@/components/app/page-date-filter-bar";
import { ReportsSection } from "@/components/sections/reports";
import { useAppRuntime } from "@/components/app/app-runtime";

export default function ReportsPage() {
  const { data, market, dateFilter } = useAppRuntime();
  const scope = "reports" as const;
  const filtered = dateFilter.filteredFor(scope);

  return (
    <div className="space-y-5">
      <PageDateFilterBar
        title="فیلتر گزارش‌ها"
        description="نمودارها و جدول‌های تحلیلی این صفحه بر اساس بازه انتخابی فیلتر می‌شوند."
        value={dateFilter.getRange(scope)}
        onValueChange={(value) => dateFilter.setRange(scope, value)}
      />
      <ReportsSection
        settings={data.settings}
        rule={data.rule}
        incomes={filtered.incomes}
        allocations={filtered.allocations}
        funds={data.funds}
        assets={data.assets}
        transactions={filtered.transactions}
        quotes={market.quotes}
        planItems={filtered.planItems}
      />
    </div>
  );
}
