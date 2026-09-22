"use client";

import { useParams } from "next/navigation";
import { LoanEditor } from "@/components/loans/loan-editor";
import { Card, CardContent } from "@/components/ui/card";
import { useAppRuntime } from "@/components/app/app-runtime";

export default function LoanEditPage() {
  const params = useParams<{ id: string }>();
  const { data } = useAppRuntime();
  const loan = data.loans.find((row) => row.id === Number(params.id));
  if (!loan) return <Card><CardContent className="p-8 text-center">وام پیدا نشد.</CardContent></Card>;
  return <LoanEditor loan={loan} funds={data.funds} settings={data.settings}/>;
}
