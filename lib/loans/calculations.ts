export type LoanTerms = {
  principalToman: number;
  nominalAnnualRatePct: number;
  termMonths: number;
  actualInstallmentToman?: number;
  upfrontCostsToman?: number;
};

export type AmortizationRow = {
  installmentNo: number;
  openingPrincipalToman: number;
  paymentToman: number;
  interestToman: number;
  principalPaidToman: number;
  closingPrincipalToman: number;
};

export type LoanScenarioProjection = {
  endingBalanceToman: number;
  depletedAtMonth?: number;
  totalGrowthToman: number;
  totalWithdrawalsToman: number;
};

const EPSILON = 0.5;

function finiteNumber(value: number, label: string) {
  if (!Number.isFinite(value)) throw new Error(`${label} باید یک عدد معتبر باشد.`);
  return value;
}

function positiveNumber(value: number, label: string) {
  finiteNumber(value, label);
  if (value <= 0) throw new Error(`${label} باید بیشتر از صفر باشد.`);
  return value;
}

function nonNegativeNumber(value: number, label: string) {
  finiteNumber(value, label);
  if (value < 0) throw new Error(`${label} نمی‌تواند منفی باشد.`);
  return value;
}

function positiveInteger(value: number, label: string) {
  positiveNumber(value, label);
  if (!Number.isInteger(value)) throw new Error(`${label} باید عدد صحیح باشد.`);
  return value;
}

export function monthlyLoanRate(nominalAnnualRatePct: number) {
  nonNegativeNumber(nominalAnnualRatePct, "نرخ سالانه وام");
  return nominalAnnualRatePct / 100 / 12;
}

export function annualEffectiveToMonthlyRate(annualEffectiveRatePct: number) {
  finiteNumber(annualEffectiveRatePct, "بازده موثر سالانه");
  if (annualEffectiveRatePct <= -100) throw new Error("بازده موثر سالانه باید بیشتر از منفی ۱۰۰ درصد باشد.");
  return Math.pow(1 + annualEffectiveRatePct / 100, 1 / 12) - 1;
}

export function effectiveAnnualLoanRate(nominalAnnualRatePct: number) {
  const monthly = monthlyLoanRate(nominalAnnualRatePct);
  return (Math.pow(1 + monthly, 12) - 1) * 100;
}

export function loanInstallment(principalToman: number, nominalAnnualRatePct: number, termMonths: number) {
  positiveNumber(principalToman, "اصل وام");
  positiveInteger(termMonths, "تعداد اقساط");
  const monthly = monthlyLoanRate(nominalAnnualRatePct);
  if (monthly === 0) return principalToman / termMonths;
  return principalToman * monthly / (1 - Math.pow(1 + monthly, -termMonths));
}

export function loanContractInstallment(terms: LoanTerms) {
  if (terms.actualInstallmentToman !== undefined) return positiveNumber(terms.actualInstallmentToman, "قسط واقعی");
  return loanInstallment(terms.principalToman, terms.nominalAnnualRatePct, terms.termMonths);
}

export function loanTotalRepayment(terms: LoanTerms) {
  positiveInteger(terms.termMonths, "تعداد اقساط");
  const upfront = nonNegativeNumber(terms.upfrontCostsToman ?? 0, "هزینه اولیه وام");
  return loanContractInstallment(terms) * terms.termMonths + upfront;
}

export function loanAmortizationSchedule(terms: LoanTerms): AmortizationRow[] {
  const principal = positiveNumber(terms.principalToman, "اصل وام");
  const termMonths = positiveInteger(terms.termMonths, "تعداد اقساط");
  const monthly = monthlyLoanRate(terms.nominalAnnualRatePct);
  const installment = loanContractInstallment(terms);
  const rows: AmortizationRow[] = [];
  let balance = principal;

  for (let installmentNo = 1; installmentNo <= termMonths; installmentNo += 1) {
    const opening = balance;
    const interest = opening * monthly;
    const amountDue = opening + interest;
    const payment = Math.min(installment, amountDue);
    const principalPaid = payment - interest;
    balance = Math.max(0, amountDue - payment);
    if (balance < EPSILON) balance = 0;
    rows.push({
      installmentNo,
      openingPrincipalToman: opening,
      paymentToman: payment,
      interestToman: interest,
      principalPaidToman: principalPaid,
      closingPrincipalToman: balance,
    });
  }
  return rows;
}

export function loanOutstandingPrincipal(terms: LoanTerms, installmentsPaid: number) {
  if (!Number.isInteger(installmentsPaid) || installmentsPaid < 0) throw new Error("تعداد اقساط پرداخت‌شده معتبر نیست.");
  if (installmentsPaid === 0) return positiveNumber(terms.principalToman, "اصل وام");
  const rows = loanAmortizationSchedule(terms);
  if (installmentsPaid >= rows.length) return rows.at(-1)?.closingPrincipalToman ?? 0;
  return rows[installmentsPaid - 1]?.closingPrincipalToman ?? terms.principalToman;
}

export function loanReserveTarget(installmentToman: number, months: number) {
  positiveNumber(installmentToman, "مبلغ قسط");
  nonNegativeNumber(months, "تعداد ماه ذخیره");
  return installmentToman * months;
}

export function loanReserveRunway(reserveValueToman: number, installmentToman: number) {
  nonNegativeNumber(reserveValueToman, "موجودی ذخیره");
  positiveNumber(installmentToman, "مبلغ قسط");
  return reserveValueToman / installmentToman;
}

export function equivalentLossBudget(installmentToman: number, installments: number) {
  positiveNumber(installmentToman, "مبلغ قسط");
  nonNegativeNumber(installments, "تعداد قسط بودجه زیان");
  return installmentToman * installments;
}

export function equivalentLossDrawdownPct(lossBudgetToman: number, positionCostToman: number) {
  nonNegativeNumber(lossBudgetToman, "بودجه زیان");
  positiveNumber(positionCostToman, "بهای موقعیت");
  return lossBudgetToman / positionCostToman * 100;
}

export function loanScenarioProjection(input: {
  initialBalanceToman: number;
  annualEffectiveReturnPct: number;
  months: number;
  monthlyWithdrawalToman: number;
}): LoanScenarioProjection {
  const initial = nonNegativeNumber(input.initialBalanceToman, "سرمایه اولیه");
  const months = positiveInteger(input.months, "تعداد ماه سناریو");
  const withdrawal = nonNegativeNumber(input.monthlyWithdrawalToman, "برداشت ماهانه");
  const monthlyReturn = annualEffectiveToMonthlyRate(input.annualEffectiveReturnPct);
  let balance = initial;
  let totalGrowth = 0;
  let depletedAtMonth: number | undefined;

  for (let month = 1; month <= months; month += 1) {
    const growth = balance * monthlyReturn;
    totalGrowth += growth;
    balance += growth;
    balance -= withdrawal;
    if (depletedAtMonth === undefined && balance < 0) depletedAtMonth = month;
  }

  return {
    endingBalanceToman: balance,
    depletedAtMonth,
    totalGrowthToman: totalGrowth,
    totalWithdrawalsToman: withdrawal * months,
  };
}

export function loanScenarioEndingBalance(
  initialBalanceToman: number,
  annualEffectiveReturnPct: number,
  months: number,
  monthlyWithdrawalToman: number,
) {
  return loanScenarioProjection({ initialBalanceToman, annualEffectiveReturnPct, months, monthlyWithdrawalToman }).endingBalanceToman;
}

export function loanBreakEvenAnnualRate(terms: LoanTerms) {
  const principal = positiveNumber(terms.principalToman, "اصل وام");
  const months = positiveInteger(terms.termMonths, "تعداد اقساط");
  const payment = loanContractInstallment(terms);
  const upfront = nonNegativeNumber(terms.upfrontCostsToman ?? 0, "هزینه اولیه وام");
  const netProceeds = principal - upfront;
  if (netProceeds <= 0) throw new Error("هزینه‌های اولیه باید از اصل وام کمتر باشند.");

  const npv = (monthlyRate: number) => {
    let presentValue = 0;
    for (let month = 1; month <= months; month += 1) {
      presentValue += payment / Math.pow(1 + monthlyRate, month);
    }
    return netProceeds - presentValue;
  };

  if (Math.abs(npv(0)) < 0.000001) return 0;

  let low = -0.999;
  let high = 0.1;
  while (npv(high) < 0 && high < 100) high *= 2;
  if (npv(low) > 0 || npv(high) < 0) throw new Error("نرخ سر به سر برای این جریان نقدی قابل محاسبه نیست.");

  for (let step = 0; step < 160; step += 1) {
    const mid = (low + high) / 2;
    if (npv(mid) > 0) high = mid;
    else low = mid;
  }
  const monthlyIrr = (low + high) / 2;
  return (Math.pow(1 + monthlyIrr, 12) - 1) * 100;
}

export function monthlyReturnCoverage(input: {
  currentValueToman: number;
  annualEffectiveReturnPct: number;
  installmentToman: number;
}) {
  const value = nonNegativeNumber(input.currentValueToman, "ارزش فعلی");
  const installment = positiveNumber(input.installmentToman, "مبلغ قسط");
  const monthlyReturn = annualEffectiveToMonthlyRate(input.annualEffectiveReturnPct);
  const expectedReturnToman = value * monthlyReturn;
  return {
    expectedReturnToman,
    coverageRatio: expectedReturnToman / installment,
  };
}
