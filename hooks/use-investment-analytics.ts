"use client";

import { useMemo } from "react";
import { buildInvestmentAnalytics, withInvestmentShares } from "@/lib/investment-analytics";
import type { Asset, InvestmentTransaction, MarketQuote } from "@/lib/types";

export function useInvestmentAnalytics(assets: Asset[], transactions: InvestmentTransaction[], quotes: MarketQuote[]) {
  return useMemo(() => withInvestmentShares(buildInvestmentAnalytics(assets, transactions, quotes)), [assets, transactions, quotes]);
}
