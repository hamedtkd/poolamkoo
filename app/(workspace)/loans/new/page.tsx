"use client";

import { LoanWizard } from '@/components/loans/loan-wizard';
import { useAppRuntime } from '@/components/app/app-runtime';

export default function NewLoanPage() {
  const { data } = useAppRuntime();
  return <LoanWizard settings={data.settings} funds={data.funds} assets={data.assets} />;
}
