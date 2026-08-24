export type MoneyUnit = "toman" | "rial";
export type ThemePalette = "rose" | "violet" | "amber" | "blue";
export type LifestylePreset = "growth" | "balanced" | "comfort" | "safety" | "custom";
export type BucketKey = "life" | "safety" | "growth";
export type AssetKind = "gold" | "currency" | "crypto" | "stock" | "fund" | "custom";
export type MarketSymbol = "USD" | "IR_GOLD_18K" | "BTC" | "USDT";
export type PlanTargetType = "life" | "fund" | "asset" | "bucket";

export interface AllocationRule {
  id?: number;
  name: string;
  preset: LifestylePreset;
  lifePct: number;
  safetyPct: number;
  growthPct: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeEvent {
  id?: number;
  amountToman: number;
  title: string;
  note?: string;
  happenedAt: string;
  createdAt: string;
}

export interface AllocationEntry {
  id?: number;
  incomeId: number;
  bucket: BucketKey;
  amountToman: number;
  createdAt: string;
}

export interface PlanItem {
  id?: number;
  incomeId: number;
  bucket: BucketKey;
  targetType: PlanTargetType;
  targetId?: number;
  label: string;
  plannedToman: number;
  executedToman: number;
  createdAt: string;
  updatedAt: string;
}

export interface GoalFund {
  id?: number;
  name: string;
  targetToman: number;
  currentToman: number;
  dueAt?: string;
  icon: string;
  category: "planned" | "emergency" | "custom";
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id?: number;
  name: string;
  kind: AssetKind;
  symbol?: MarketSymbol | string;
  targetPct: number;
  manualPriceToman?: number;
  icon: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentTransaction {
  id?: number;
  assetId: number;
  type: "buy" | "sell";
  amountToman: number;
  quantity: number;
  unitPriceToman: number;
  happenedAt: string;
  note?: string;
  incomeId?: number;
  planItemId?: number;
  createdAt: string;
}

export interface MarketQuote {
  symbol: string;
  name: string;
  priceToman: number;
  changePercent: number;
  changeValueToman: number;
  asOf: string;
  source: "brsapi" | "local";
}

export interface MarketSnapshot extends MarketQuote {
  id?: number;
  capturedAt: string;
}

export interface AppSettings {
  id: "settings";
  displayUnit: MoneyUnit;
  palette: ThemePalette;
  darkMode: "light" | "dark" | "system";
  onboardingComplete: boolean;
  guideComplete: boolean;
  hideFinancialData: boolean;
  emergencyMonths: number;
  monthlyEssentialToman: number;
  incomeStability: "stable" | "variable" | "irregular";
  riskTolerance: "low" | "medium" | "high";
  updatedAt: string;
}

export interface BackupEnvelope {
  format: "poolyar-backup";
  version: 1;
  exportedAt: string;
  encrypted: boolean;
  payload: string;
  salt?: string;
  iv?: string;
}
