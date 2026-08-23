import type { MarketQuote } from "@/lib/types";

export interface MarketDataProvider {
  readonly id: string;
  getQuotes(): Promise<MarketQuote[]>;
}
