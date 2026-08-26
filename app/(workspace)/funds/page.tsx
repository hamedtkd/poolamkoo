"use client";

import { FundsSection } from "@/components/sections/funds";
import { useAppRuntime } from "@/components/app/app-runtime";

export default function FundsPage() {
  const { data } = useAppRuntime();
  return <FundsSection funds={data.funds} settings={data.settings} />;
}
