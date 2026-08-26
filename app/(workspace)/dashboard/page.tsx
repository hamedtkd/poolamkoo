"use client";

import { useRouter } from "next/navigation";
import { PageDateFilterBar } from "@/components/app/page-date-filter-bar";
import { DashboardSection } from "@/components/sections/dashboard";
import { useAppRuntime } from "@/components/app/app-runtime";

export default function DashboardPage() {
  const router = useRouter();
  const { data, market, dateFilter } = useAppRuntime();
  const scope = "dashboard" as const;
  const filtered = dateFilter.filteredFor(scope);

  return (
    <div className="space-y-5">
      <PageDateFilterBar
        title="فیلتر داشبورد"
        description="کارت‌ها و نمودارهای همین صفحه بر اساس این بازه به‌روزرسانی می‌شوند."
        value={dateFilter.getRange(scope)}
        onValueChange={(value) => dateFilter.setRange(scope, value)}
      />
      <DashboardSection
        settings={data.settings}
        rule={data.rule}
        incomes={filtered.incomes}
        funds={data.funds}
        assets={data.assets}
        transactions={filtered.transactions}
        quotes={market.quotes}
        snapshots={filtered.snapshots}
        marketMode={market.mode}
        marketLoading={market.loading}
        marketLastUpdated={market.lastUpdated}
        marketWarning={market.warning}
        planItems={filtered.planItems}
        onRefreshMarket={() => void market.refresh()}
        onNewMoney={() => window.dispatchEvent(new CustomEvent("poolyar:new-money"))}
        onOpenInvestments={() => router.push("/investments")}
        onOpenFunds={() => router.push("/funds")}
      />
    </div>
  );
}
