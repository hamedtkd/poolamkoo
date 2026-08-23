"use client";

import { useParams } from "next/navigation";
import { useAppRuntime } from "@/components/app/app-runtime";
import { IncomePlanPage } from "@/components/income/income-plan-page";

export default function IncomePlanRoute() {
  const params = useParams<{ id: string }>();
  const { data, market } = useAppRuntime();
  return <IncomePlanPage incomeId={Number(params.id)} settings={data.settings} incomes={data.incomes} planItems={data.planItems} assets={data.assets} funds={data.funds} transactions={data.transactions} quotes={market.quotes} />;
}
