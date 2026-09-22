"use client";

import { useParams } from "next/navigation";
import { LoanDetail } from "@/components/loans/loan-detail";
import { Card, CardContent } from "@/components/ui/card";
import { useAppRuntime } from "@/components/app/app-runtime";

export default function LoanDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, market, loanReminders, loanRisk, backgroundPush } = useAppRuntime();
  const id = Number(params.id);
  const loan = data.loans.find((row) => row.id === id);
  if (!loan) return <Card><CardContent className="p-8 text-center"><div className="type-card-title">وام پیدا نشد</div><p className="mt-2 type-body text-muted-foreground">ممکن است این وام حذف شده باشد یا آدرس معتبر نباشد.</p></CardContent></Card>;
  return <LoanDetail loan={loan} payments={data.loanPayments} funds={data.funds} assets={data.allAssets} transactions={data.transactions} fundMovements={data.fundMovements} quotes={market.quotes} settings={data.settings} loanReminders={loanReminders} loanRisk={loanRisk} backgroundPush={backgroundPush} />;
}
