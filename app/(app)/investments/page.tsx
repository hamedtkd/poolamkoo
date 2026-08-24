"use client";

import { PageDateFilterBar } from "@/components/app/page-date-filter-bar";
import { InvestmentsSection } from "@/components/sections/investments";
import { useAppRuntime } from "@/components/app/app-runtime";

export default function InvestmentsPage() {
  const { data, market, dateFilter } = useAppRuntime();
  const scope = "investments" as const;
  const filtered = dateFilter.filteredFor(scope);

  return (
    <div className="space-y-5">
      <PageDateFilterBar
        title="فیلتر سرمایه‌گذاری"
        description="تراکنش‌ها، اسنپ‌شات‌ها و روندهای سرمایه‌گذاری در همین صفحه با این بازه کنترل می‌شوند."
        value={dateFilter.getRange(scope)}
        onValueChange={(value) => dateFilter.setRange(scope, value)}
      />
      <InvestmentsSection
        settings={data.settings}
        assets={data.assets}
        transactions={data.transactions}
        quotes={market.quotes}
        snapshots={data.snapshots}
        planItems={data.planItems}
        incomes={data.incomes}
        visibleTransactions={filtered.transactions}
        visibleSnapshots={filtered.snapshots}
        visiblePlanItems={filtered.planItems}
        visibleIncomes={filtered.incomes}
      />
    </div>
  );
}
