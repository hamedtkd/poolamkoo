import assert from "node:assert/strict";
import test from "node:test";
import {
  effectiveAnnualLoanRate,
  equivalentLossBudget,
  equivalentLossDrawdownPct,
  loanAmortizationSchedule,
  loanBreakEvenAnnualRate,
  loanInstallment,
  loanOutstandingPrincipal,
  loanReserveRunway,
  loanReserveTarget,
  loanScenarioEndingBalance,
  monthlyReturnCoverage,
} from "../lib/loans/calculations.ts";

const terms = { principalToman: 280_000_000, nominalAnnualRatePct: 23, termMonths: 60 };
const installment = loanInstallment(terms.principalToman, terms.nominalAnnualRatePct, terms.termMonths);

test("280m at 23 percent for 60 months matches the documented installment and effective rate", () => {
  assert.ok(Math.abs(installment - 7_893_331.905) < 1);
  assert.ok(Math.abs(effectiveAnnualLoanRate(23) - 25.586377) < 0.00001);
  assert.ok(Math.abs(loanBreakEvenAnnualRate(terms) - effectiveAnnualLoanRate(23)) < 0.00001);
});

test("amortization reaches zero and outstanding principal follows the same schedule", () => {
  const schedule = loanAmortizationSchedule(terms);
  assert.equal(schedule.length, 60);
  assert.ok(Math.abs(schedule[0]!.interestToman - 5_366_666.667) < 1);
  assert.ok(schedule.at(-1)!.closingPrincipalToman < 0.5);
  assert.ok(Math.abs(loanOutstandingPrincipal(terms, 12) - schedule[11]!.closingPrincipalToman) < 0.01);
  assert.equal(loanOutstandingPrincipal(terms, 60), 0);
});

test("reserve and loss budget are expressed in installment units", () => {
  const reserve = loanReserveTarget(installment, 6);
  assert.ok(Math.abs(reserve - 47_359_991.431) < 1);
  assert.ok(Math.abs(loanReserveRunway(reserve, installment) - 6) < 1e-9);
  const loss = equivalentLossBudget(installment, 2);
  assert.ok(Math.abs(loss - 15_786_663.81) < 1);
  assert.ok(Math.abs(equivalentLossDrawdownPct(loss, 100_000_000) - 15.78666381) < 0.00001);
});

test("scenario engine reproduces the documented fixed-return examples", () => {
  assert.ok(Math.abs(loanScenarioEndingBalance(280_000_000, 20, 60, installment) - (-70_625_726.973)) < 2);
  assert.ok(Math.abs(loanScenarioEndingBalance(280_000_000, 35, 60, installment) - 169_580_455.455) < 2);
});

test("35 percent effective annual return covers about 90 percent of the first installment", () => {
  const result = monthlyReturnCoverage({ currentValueToman: 280_000_000, annualEffectiveReturnPct: 35, installmentToman: installment });
  assert.ok(Math.abs(result.expectedReturnToman - 7_090_736.03) < 1);
  assert.ok(Math.abs(result.coverageRatio - 0.89831976) < 0.000001);
});

test("real contract costs raise break-even above the nominal-rate EAR", () => {
  const withCost = loanBreakEvenAnnualRate({ ...terms, upfrontCostsToman: 5_000_000 });
  assert.ok(withCost > effectiveAnnualLoanRate(23));
  const withHigherActualPayment = loanBreakEvenAnnualRate({ ...terms, actualInstallmentToman: 8_000_000 });
  assert.ok(withHigherActualPayment > effectiveAnnualLoanRate(23));
});

test("zero-rate loans and invalid inputs remain numerically safe", () => {
  assert.equal(loanInstallment(120_000_000, 0, 12), 10_000_000);
  assert.equal(effectiveAnnualLoanRate(0), 0);
  assert.throws(() => loanInstallment(0, 23, 60), /اصل وام/);
  assert.throws(() => loanScenarioEndingBalance(100, -100, 12, 10), /منفی ۱۰۰/);
});
