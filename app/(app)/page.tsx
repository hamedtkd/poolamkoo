"use client";

import { useRouter } from "next/navigation";
import { DashboardSection } from "@/components/sections/dashboard";
import { useAppRuntime } from "@/components/app/app-runtime";

export default function DashboardPage() {
  const router = useRouter();
  const { data, market } = useAppRuntime();
  return <DashboardSection settings={data.settings} rule={data.rule} incomes={data.incomes} funds={data.funds} assets={data.assets} transactions={data.transactions} quotes={market.quotes} snapshots={data.snapshots} marketMode={market.mode} marketLoading={market.loading} marketLastUpdated={market.lastUpdated} marketWarning={market.warning} planItems={data.planItems} onRefreshMarket={() => void market.refresh()} onNewMoney={() => window.dispatchEvent(new CustomEvent("poolyar:new-money"))} onOpenInvestments={() => router.push("/investments")} onOpenFunds={() => router.push("/funds")} />;
}
