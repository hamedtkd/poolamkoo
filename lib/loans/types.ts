export type LoanStatus = "active" | "closed";
export type LoanPaymentSource = "reserve" | "external" | "asset_sale" | "mixed";
export type LoanRiskAlertKind = "reserve_runway_below" | "loss_budget_exceeded" | "spread_below" | "quote_stale";

export interface LoanAllocationPlanItem {
  assetId?: number;
  label: string;
  amountToman: number;
}

export interface Loan {
  id?: number;
  name: string;
  lender?: string;
  principalToman: number;
  nominalAnnualRatePct: number;
  termMonths: number;
  disbursedAt: string;
  firstPaymentAt: string;
  actualInstallmentToman?: number;
  upfrontCostsToman?: number;
  reserveTargetMonths: number;
  reserveFundId?: number;
  riskBudgetInstallments?: number;
  allocationPlan?: LoanAllocationPlanItem[];
  reminderDays: number[];
  notifyBrowser: boolean;
  status: LoanStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LoanPayment {
  id?: number;
  loanId: number;
  installmentNo: number;
  dueAt: string;
  amountToman: number;
  paidAt: string;
  source: LoanPaymentSource;
  reserveToman: number;
  externalToman: number;
  assetSaleToman: number;
  reserveFundMovementId?: number;
  saleTransactionIds?: number[];
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanRiskAlert {
  id?: number;
  loanId: number;
  assetId?: number;
  kind: LoanRiskAlertKind;
  threshold: number;
  rearmThreshold?: number;
  enabled: boolean;
  armed: boolean;
  notifyBrowser: boolean;
  lastTriggeredAt?: string;
  createdAt: string;
  updatedAt: string;
}
