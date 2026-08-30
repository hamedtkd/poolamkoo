export type MoneyUnit = "toman" | "rial";
export type ThemePalette = "rose" | "violet" | "amber" | "blue";
export type LifestylePreset = "growth" | "balanced" | "comfort" | "safety" | "custom";
export type BucketKey = "life" | "safety" | "growth";
export type AssetKind = "gold" | "currency" | "crypto" | "stock" | "fund" | "custom";
export type MarketSymbol = "USD" | "IR_GOLD_18K" | "BTC" | "USDT";
export type MarketSource = "brsapi" | "tindex" | "tsetmc" | "local";
export type MarketHistoryRange = "1m" | "3m";
export type ExchangeMarketSource = "tsetmc" | "tindex";
export type MarketAlertKind = "price_above" | "price_below" | "change_above" | "change_below" | "nav_discount" | "nav_premium";
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

export type FundMovementType = "deposit" | "withdraw" | "opening";
export type FundMovementSource = "manual" | "opening" | "plan" | "direct" | "income_reversal" | "migration";

export interface FundMovement {
  id?: number;
  fundId: number;
  type: FundMovementType;
  source: FundMovementSource;
  amountToman: number;
  happenedAt: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id?: number;
  name: string;
  kind: AssetKind;
  symbol?: MarketSymbol | string;
  marketId?: string;
  marketSource?: ExchangeMarketSource;
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
  marketId?: string;
  symbol: string;
  name: string;
  priceToman: number;
  navToman?: number;
  changePercent: number;
  changeValueToman: number;
  asOf: string;
  source: MarketSource;
  runtimeSource?: "live" | "snapshot";
  snapshotCapturedAt?: string;
}


export interface MarketInstrument {
  id: string;
  symbol: string;
  name: string;
  priceToman?: number;
  changePercent?: number;
  source: ExchangeMarketSource;
}

export interface MarketWatchItem {
  id?: number;
  marketId: string;
  symbol: string;
  name: string;
  source: ExchangeMarketSource;
  createdAt: string;
  updatedAt: string;
}

export interface MarketAlert {
  id?: number;
  marketId: string;
  symbol: string;
  name: string;
  source: ExchangeMarketSource;
  kind: MarketAlertKind;
  threshold: number;
  enabled: boolean;
  notifyBrowser: boolean;
  armed: boolean;
  lastTriggeredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarketSnapshot extends MarketQuote {
  id?: number;
  capturedAt: string;
}

export interface MarketCandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
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

export interface RecoverySnapshot {
  id?: number;
  reason: string;
  payload: string;
  itemCount: number;
  schemaVersion?: number;
  appVersion?: string;
  createdAt: string;
}

export interface AppMeta {
  key: string;
  value: string;
  updatedAt: string;
}

export interface BackupEnvelope {
  format: "poolyar-backup";
  version: 1 | 2;
  exportedAt: string;
  encrypted: boolean;
  payload: string;
  salt?: string;
  iv?: string;
  digest?: string;
  schemaVersion?: number;
  appVersion?: string;
}
