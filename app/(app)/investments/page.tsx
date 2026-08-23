"use client";

import { InvestmentsSection } from "@/components/sections/investments";
import { useAppRuntime } from "@/components/app/app-runtime";

export default function InvestmentsPage() {
  const { data, market } = useAppRuntime();
  return <InvestmentsSection settings={data.settings} assets={data.assets} transactions={data.transactions} quotes={market.quotes} snapshots={data.snapshots} planItems={data.planItems} incomes={data.incomes} />;
}
