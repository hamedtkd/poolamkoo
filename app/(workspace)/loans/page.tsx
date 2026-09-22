"use client";

import { LoansOverview } from "@/components/loans/loans-overview";
import { useAppRuntime } from "@/components/app/app-runtime";

export default function LoansPage() {
  const { data, market, loanRisk } = useAppRuntime();
  return <LoansOverview settings={data.settings} loans={data.loans} payments={data.loanPayments} funds={data.funds} assets={data.allAssets} transactions={data.transactions} fundMovements={data.fundMovements} quotes={market.quotes} loanRisk={loanRisk} />;
}
