"use client";

import { IncomeSection } from "@/components/sections/income";
import { useAppRuntime } from "@/components/app/app-runtime";

export default function IncomePage() {
  const { data } = useAppRuntime();
  return <IncomeSection incomes={data.incomes} allocations={data.allocations} planItems={data.planItems} settings={data.settings} onNewMoney={() => window.dispatchEvent(new CustomEvent("poolyar:new-money"))} />;
}
