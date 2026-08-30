"use client";

import { Reveal } from "@/components/animation/reveal";
import { PageDateFilterBar } from "@/components/app/page-date-filter-bar";
import { ReportsSection } from "@/components/sections/reports";
import { useAppRuntime } from "@/components/app/app-runtime";

export default function ReportsPage() {
  const { data, market, dateFilter } = useAppRuntime();
  const scope = "reports" as const;
  const filtered = dateFilter.filteredFor(scope);

  return (
    <div className="space-y-5">
      <Reveal direction="down" step={0}>
      <PageDateFilterBar
        title="فیلتر گزارش‌ها"
        description="ورودی، برنامه و گردش‌های واقعی بر اساس این بازه فیلتر می‌شوند؛ وضعیت فعلی صندوق‌ها و کل سبد مستقل از بازه باقی می‌ماند."
        value={dateFilter.getRange(scope)}
        onValueChange={(value) => dateFilter.setRange(scope, value)}
      />
      </Reveal>
      <ReportsSection
        settings={data.settings}
        rule={data.rule}
        incomes={filtered.incomes}
        allocations={filtered.allocations}
        funds={data.funds}
        fundMovements={filtered.fundMovements}
        assets={data.allAssets}
        transactions={data.transactions}
        periodTransactions={filtered.transactions}
        quotes={market.quotes}
        planItems={filtered.planItems}
        range={dateFilter.getRange(scope)}
      />
    </div>
  );
}
