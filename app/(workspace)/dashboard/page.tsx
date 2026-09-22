"use client";

import { useRouter } from "next/navigation";
import { Reveal } from "@/components/animation/reveal";
import { PageDateFilterBar } from "@/components/app/page-date-filter-bar";
import { DashboardSection } from "@/components/sections/dashboard";
import { useAppRuntime } from "@/components/app/app-runtime";
import { navigateWorkspace } from "@/lib/workspace-navigation";

export default function DashboardPage() {
  const router = useRouter();
  const { data, market, dateFilter, loanRisk } = useAppRuntime();
  const scope = "dashboard" as const;
  const filtered = dateFilter.filteredFor(scope);

  return (
    <div className="space-y-5">
      <Reveal direction="down" step={0}>
      <PageDateFilterBar
        title="فیلتر داشبورد"
        description="کارت‌ها و نمودارهای همین صفحه بر اساس این بازه به‌روزرسانی می‌شوند."
        value={dateFilter.getRange(scope)}
        onValueChange={(value) => dateFilter.setRange(scope, value)}
      />
      </Reveal>
      <DashboardSection
        settings={data.settings}
        rule={data.rule}
        incomes={filtered.incomes}
        funds={data.funds}
        assets={data.allAssets}
        transactions={filtered.transactions}
        fundMovements={data.fundMovements}
        loans={data.loans}
        loanPayments={data.loanPayments}
        loanRisk={loanRisk}
        quotes={market.quotes}
        snapshots={filtered.snapshots}
        marketMode={market.mode}
        marketDegraded={market.health?.degraded}
        marketLoading={market.loading}
        marketLastUpdated={market.lastUpdated}
        marketWarning={market.warning}
        planItems={filtered.planItems}
        onRefreshMarket={() => void market.refresh()}
        onNewMoney={() => window.dispatchEvent(new CustomEvent("poolyar:new-money"))}
        onOpenInvestments={() => navigateWorkspace(router, "/investments")}
        onOpenFunds={() => navigateWorkspace(router, "/funds")}
        onOpenLoans={() => navigateWorkspace(router, "/loans")}
      />
    </div>
  );
}
