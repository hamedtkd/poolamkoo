import assert from "node:assert/strict";
import test from "node:test";
import { buildAllocationTemplates, calculateLoanHealthScore } from "../lib/loans/intelligence.ts";

test("loan health score reflects repayment pressure, reserve and overdue state", () => {
  assert.equal(calculateLoanHealthScore({
    installmentToIncomePct: 18,
    reserveInstallments: 6,
    reserveTargetMonths: 6,
    assetCoveragePct: 140,
    overdue: false,
  }), 100);
  assert.ok(calculateLoanHealthScore({
    installmentToIncomePct: 55,
    reserveInstallments: 0,
    reserveTargetMonths: 6,
    assetCoveragePct: 30,
    overdue: true,
  }) < 45);
});

test("allocation templates remain normalized and carry the financial disclaimer", () => {
  for (const template of buildAllocationTemplates("medium")) {
    assert.equal(template.rows.reduce((sum, row) => sum + row.percent, 0), 100);
    assert.match(template.disclaimer, /توصیه/);
  }
});
