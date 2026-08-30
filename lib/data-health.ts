import { fundMovementSourceTypeIsValid, reviewFundLedger } from "./fund-ledger.ts";
import { validateInvestmentLedger } from "./investment-ledger.ts";
import type {
  AllocationEntry,
  AllocationRule,
  Asset,
  FundMovement,
  GoalFund,
  IncomeEvent,
  InvestmentTransaction,
  MarketAlert,
  MarketWatchItem,
  PlanItem,
} from "./types.ts";

export type DataHealthSeverity = "warning" | "error";
export type DataHealthStatus = "healthy" | "attention" | "critical";

export type DataHealthIssueCode =
  | "active_rule_missing"
  | "active_rule_multiple"
  | "invalid_income"
  | "invalid_allocation"
  | "invalid_fund"
  | "invalid_asset"
  | "invalid_transaction"
  | "invalid_plan"
  | "orphan_allocation"
  | "orphan_fund_movement"
  | "invalid_fund_movement"
  | "fund_negative_history"
  | "fund_missing_ledger"
  | "fund_balance_mismatch"
  | "orphan_transaction_asset"
  | "orphan_transaction_income"
  | "orphan_transaction_plan"
  | "transaction_plan_target_mismatch"
  | "investment_negative_history"
  | "archived_open_holding"
  | "orphan_plan_income"
  | "orphan_plan_target"
  | "plan_execution_overrun"
  | "investment_plan_execution_mismatch"
  | "investment_plan_execution_unverifiable"
  | "duplicate_watchlist_identity"
  | "invalid_market_alert"
  | "duplicate_market_alert";

export type DataHealthIssue = {
  code: DataHealthIssueCode;
  severity: DataHealthSeverity;
  title: string;
  detail: string;
  repairable: boolean;
};

export type DataHealthInput = {
  allocationRules: AllocationRule[];
  incomes: IncomeEvent[];
  allocations: AllocationEntry[];
  funds: GoalFund[];
  fundMovements: FundMovement[];
  assets: Asset[];
  transactions: InvestmentTransaction[];
  planItems: PlanItem[];
  marketWatchlist: MarketWatchItem[];
  marketAlerts: MarketAlert[];
};

export type DataHealthReport = {
  status: DataHealthStatus;
  issues: DataHealthIssue[];
  errors: number;
  warnings: number;
  repairable: number;
  checkedAt: string;
};

const MONEY_EPSILON = 0.5;
const QUANTITY_EPSILON = 1e-10;
function issue(code: DataHealthIssueCode, severity: DataHealthSeverity, title: string, detail: string, repairable = false): DataHealthIssue {
  return { code, severity, title, detail, repairable };
}

function positiveMoney(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 0;
}

function numericIds<T extends { id?: number }>(rows: T[]) {
  return new Set(rows.map((row) => row.id).filter((id): id is number => typeof id === "number" && Number.isInteger(id)));
}

function transactionFinancialsValid(row: InvestmentTransaction) {
  return Number.isFinite(row.amountToman) && row.amountToman > 0
    && Number.isFinite(row.quantity) && row.quantity > 0
    && Number.isFinite(row.unitPriceToman) && row.unitPriceToman > 0
    && Boolean(row.happenedAt && row.createdAt);
}

function fundMovementShapeValid(row: FundMovement) {
  return Number.isFinite(row.amountToman) && row.amountToman > 0
    && fundMovementSourceTypeIsValid(row.type, row.source)
    && Boolean(row.happenedAt && row.createdAt);
}

function investmentExecution(plan: PlanItem, transactions: InvestmentTransaction[]) {
  if (!plan.id) return { count: 0, amount: 0, valid: false };
  const linked = transactions.filter((row) => row.planItemId === plan.id);
  const valid = linked.every((row) => row.type === "buy" && row.assetId === plan.targetId && (!row.incomeId || row.incomeId === plan.incomeId) && transactionFinancialsValid(row));
  return { count: linked.length, amount: linked.reduce((sum, row) => sum + positiveMoney(row.amountToman), 0), valid };
}

function holdingQuantities(transactions: InvestmentTransaction[]) {
  const quantities = new Map<number, number>();
  for (const row of transactions) {
    const quantity = Number.isFinite(row.quantity) ? Math.max(0, row.quantity) : 0;
    quantities.set(row.assetId, (quantities.get(row.assetId) ?? 0) + (row.type === "buy" ? quantity : -quantity));
  }
  return quantities;
}

export function auditLocalData(input: DataHealthInput, checkedAt = new Date().toISOString()): DataHealthReport {
  const issues: DataHealthIssue[] = [];
  const incomeIds = numericIds(input.incomes);
  const fundIds = numericIds(input.funds);
  const assetIds = numericIds(input.assets);
  const planIds = numericIds(input.planItems);
  const fundsById = new Map(input.funds.flatMap((row) => row.id ? [[row.id, row] as const] : []));
  const assetsById = new Map(input.assets.flatMap((row) => row.id ? [[row.id, row] as const] : []));
  const plansById = new Map(input.planItems.flatMap((row) => row.id ? [[row.id, row] as const] : []));

  const activeRules = input.allocationRules.filter((row) => row.isActive);
  if (!activeRules.length) issues.push(issue("active_rule_missing", "warning", "قانون پول فعال نیست", "هیچ قانون تخصیص فعالی پیدا نشد؛ تا زمان ذخیره دوباره، برنامه می‌تواند به تنظیمات پیش‌فرض تکیه کند."));
  if (activeRules.length > 1) issues.push(issue("active_rule_multiple", "warning", "چند قانون پول فعال است", "بیش از یک قانون تخصیص فعال پیدا شد؛ از تنظیمات یک قانون را دوباره ذخیره کن تا فقط همان فعال بماند."));

  for (const row of input.incomes) {
    if (!Number.isFinite(row.amountToman) || row.amountToman <= 0 || !row.happenedAt || !row.createdAt) issues.push(issue("invalid_income", "error", "پول ورودی نامعتبر", "یک رکورد پول ورودی مبلغ یا تاریخ معتبر ندارد."));
  }

  for (const row of input.allocations) {
    if (!Number.isFinite(row.amountToman) || row.amountToman < 0) issues.push(issue("invalid_allocation", "error", "تقسیم مالی نامعتبر", "یک ردیف تقسیم مبلغ معتبر و غیرمنفی ندارد."));
    if (!incomeIds.has(row.incomeId)) issues.push(issue("orphan_allocation", "error", "تقسیم بدون پول ورودی", "یک ردیف تقسیم به پول ورودی موجودی متصل نیست و باید قبل از تغییر دستی داده بررسی شود."));
  }

  for (const row of input.funds) {
    if (!Number.isFinite(row.targetToman) || row.targetToman <= 0 || !Number.isFinite(row.currentToman) || row.currentToman < 0) issues.push(issue("invalid_fund", "error", "صندوق نامعتبر", `«${row.name}» هدف یا موجودی معتبر ندارد.`));
  }

  for (const row of input.fundMovements) {
    if (!fundIds.has(row.fundId)) {
      issues.push(issue("orphan_fund_movement", "error", "گردش صندوق بدون صندوق", "یک گردش مالی به صندوقی متصل است که دیگر وجود ندارد."));
      continue;
    }
    if (!fundMovementShapeValid(row)) {
      issues.push(issue("invalid_fund_movement", "error", "گردش صندوق نامعتبر", `یکی از گردش‌های «${fundsById.get(row.fundId)?.name ?? "صندوق"}» نوع، مبلغ یا تاریخ معتبر ندارد.`));
    }
  }

  for (const fund of input.funds) {
    if (!fund.id) continue;
    const rows = input.fundMovements.filter((row) => row.fundId === fund.id);
    if (!rows.length && positiveMoney(fund.currentToman) > MONEY_EPSILON) {
      issues.push(issue("fund_missing_ledger", "error", "دفتر گردش صندوق ناقص است", `«${fund.name}» موجودی دارد اما هیچ گردش ثبت‌شده‌ای برای بازسازی آن پیدا نشد.`));
      continue;
    }
    if (!rows.every(fundMovementShapeValid)) continue;
    const review = reviewFundLedger(rows);
    if (!review.valid) {
      issues.push(issue("fund_negative_history", "error", "تاریخچه صندوق منفی می‌شود", `دفتر گردش «${fund.name}» در یکی از تاریخ‌ها به موجودی منفی می‌رسد و خودکار ترمیم نمی‌شود.`));
      continue;
    }
    if (rows.length && Math.abs(review.balance - positiveMoney(fund.currentToman)) > MONEY_EPSILON) {
      issues.push(issue("fund_balance_mismatch", "warning", "موجودی صندوق نیاز به همگام‌سازی دارد", `موجودی نمایشی «${fund.name}» با دفتر گردش معتبر آن برابر نیست و می‌تواند از روی همان دفتر دوباره محاسبه شود.`, true));
    }
  }

  for (const row of input.assets) {
    if (!Number.isFinite(row.targetPct) || row.targetPct < 0 || row.targetPct > 100) issues.push(issue("invalid_asset", "error", "دارایی نامعتبر", `«${row.name}» درصد هدف معتبر ندارد.`));
  }

  for (const row of input.transactions) {
    if (!transactionFinancialsValid(row)) issues.push(issue("invalid_transaction", "error", "تراکنش سرمایه‌گذاری نامعتبر", "یک معامله مبلغ، مقدار، قیمت یا تاریخ معتبر ندارد."));
    if (!assetIds.has(row.assetId)) issues.push(issue("orphan_transaction_asset", "error", "معامله بدون دارایی", "یک تراکنش سرمایه‌گذاری به دارایی موجودی متصل نیست."));
    if (row.incomeId && !incomeIds.has(row.incomeId)) issues.push(issue("orphan_transaction_income", "error", "لینک پول ورودی نامعتبر", "یک تراکنش هنوز به پول ورودی‌ای اشاره می‌کند که وجود ندارد."));
    if (row.planItemId && !planIds.has(row.planItemId)) issues.push(issue("orphan_transaction_plan", "error", "لینک برنامه نامعتبر", "یک تراکنش هنوز به کارت برنامه‌ای اشاره می‌کند که وجود ندارد."));
    if (row.planItemId) {
      const plan = plansById.get(row.planItemId);
      if (plan && (row.type !== "buy" || plan.targetType !== "asset" || plan.targetId !== row.assetId || (row.incomeId && plan.incomeId !== row.incomeId))) {
        issues.push(issue("transaction_plan_target_mismatch", "error", "معامله با هدف برنامه همخوان نیست", "دارایی یا پول ورودی تراکنش لینک‌شده با کارت برنامه یکسان نیست."));
      }
    }
  }

  const investmentReview = validateInvestmentLedger(input.transactions);
  if (!investmentReview.valid) issues.push(issue("investment_negative_history", "error", "تاریخچه سرمایه‌گذاری ناسازگار است", "در یکی از تاریخ‌های ثبت‌شده مقدار فروش از موجودی واقعی همان زمان بیشتر شده است."));

  const quantities = holdingQuantities(input.transactions);
  for (const asset of input.assets) {
    if (asset.archived && asset.id && (quantities.get(asset.id) ?? 0) > QUANTITY_EPSILON) {
      issues.push(issue("archived_open_holding", "warning", "دارایی آرشیوشده هنوز موجودی دارد", `«${asset.name}» هنوز موجودی باز دارد؛ برای ادامه عملیات آن را از بخش دارایی‌های آرشیوشده بازگردان.`));
    }
  }

  for (const plan of input.planItems) {
    if (!Number.isFinite(plan.plannedToman) || plan.plannedToman < 0 || !Number.isFinite(plan.executedToman) || plan.executedToman < 0 || !plan.label) issues.push(issue("invalid_plan", "error", "کارت برنامه نامعتبر", "یک کارت برنامه مبلغ یا عنوان معتبر ندارد."));
    if (!incomeIds.has(plan.incomeId)) issues.push(issue("orphan_plan_income", "error", "برنامه بدون پول ورودی", "یک کارت برنامه به پول ورودی موجودی متصل نیست."));
    if (positiveMoney(plan.executedToman) > positiveMoney(plan.plannedToman) + MONEY_EPSILON) {
      issues.push(issue("plan_execution_overrun", "error", "اجرای برنامه از مقدار برنامه بیشتر است", `کارت «${plan.label}» اجرای ثبت‌شده بیشتری از مبلغ برنامه دارد.`));
    }
    if (plan.targetType === "fund" && (!plan.targetId || !fundIds.has(plan.targetId))) {
      issues.push(issue("orphan_plan_target", "error", "هدف صندوق برنامه پیدا نشد", `هدف صندوق کارت «${plan.label}» دیگر وجود ندارد.`));
    }
    if (plan.targetType === "asset" && (!plan.targetId || !assetIds.has(plan.targetId))) {
      issues.push(issue("orphan_plan_target", "error", "هدف دارایی برنامه پیدا نشد", `هدف سرمایه‌گذاری کارت «${plan.label}» دیگر وجود ندارد.`));
    }
    if (plan.targetType === "asset" && plan.id && incomeIds.has(plan.incomeId) && assetsById.has(plan.targetId ?? -1)) {
      const linked = investmentExecution(plan, input.transactions);
      const recorded = positiveMoney(plan.executedToman);
      if (linked.count && linked.valid && Math.abs(linked.amount - recorded) > MONEY_EPSILON) {
        issues.push(issue("investment_plan_execution_mismatch", "warning", "اجرای کارت سرمایه‌گذاری نیاز به همگام‌سازی دارد", `مقدار اجرای «${plan.label}» با خریدهای لینک‌شده برابر نیست و می‌تواند از روی تراکنش‌ها بازسازی شود.`, true));
      } else if (!linked.count && recorded > MONEY_EPSILON) {
        issues.push(issue("investment_plan_execution_unverifiable", "warning", "اجرای کارت سرمایه‌گذاری قابل بازسازی قطعی نیست", `«${plan.label}» اجرای ثبت‌شده دارد اما خرید لینک‌شده‌ای برای اثبات آن پیدا نشد؛ این مورد خودکار تغییر نمی‌کند.`));
      }
    }
  }

  const identities = new Set<string>();
  for (const row of input.marketWatchlist) {
    const key = `${row.source}:${row.marketId}`;
    if (identities.has(key)) issues.push(issue("duplicate_watchlist_identity", "error", "نماد تکراری در دیده‌بان", "یک هویت بازار از یک Provider بیش از یک‌بار در دیده‌بان ذخیره شده است."));
    identities.add(key);
  }

  const alertKeys = new Set<string>();
  for (const row of input.marketAlerts) {
    if (!row.marketId || !Number.isFinite(row.threshold) || row.threshold <= 0) {
      issues.push(issue("invalid_market_alert", "error", "هشدار بازار نامعتبر", "یک هشدار بازار شناسه یا آستانه معتبر ندارد."));
      continue;
    }
    const key = `${row.source}:${row.marketId}:${row.kind}:${row.threshold}`;
    if (alertKeys.has(key)) issues.push(issue("duplicate_market_alert", "warning", "هشدار بازار تکراری", "یک شرط هشدار یکسان بیش از یک‌بار ذخیره شده است؛ برای جلوگیری از اعلان تکراری یکی را حذف کن."));
    alertKeys.add(key);
  }

  const errors = issues.filter((row) => row.severity === "error").length;
  const warnings = issues.filter((row) => row.severity === "warning").length;
  const repairable = issues.filter((row) => row.repairable).length;
  return { status: errors ? "critical" : warnings ? "attention" : "healthy", issues, errors, warnings, repairable, checkedAt };
}
