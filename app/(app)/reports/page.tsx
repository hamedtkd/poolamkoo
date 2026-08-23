"use client";

import { ReportsSection } from "@/components/sections/reports";
import { useAppRuntime } from "@/components/app/app-runtime";

export default function ReportsPage() {
  const { data, market } = useAppRuntime();
  return <ReportsSection settings={data.settings} rule={data.rule} incomes={data.incomes} allocations={data.allocations} funds={data.funds} assets={data.assets} transactions={data.transactions} quotes={market.quotes} planItems={data.planItems} />;
}
