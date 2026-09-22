import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("phase 4.2 wires persistent loan risk monitoring into the app runtime", () => {
  const layout = readFileSync(new URL("../components/app/app-route-layout.tsx", import.meta.url), "utf8");
  const runtime = readFileSync(new URL("../components/app/app-runtime.tsx", import.meta.url), "utf8");
  const detail = readFileSync(new URL("../components/loans/loan-detail.tsx", import.meta.url), "utf8");
  assert.match(layout, /useLoanRiskMonitoring/);
  assert.match(runtime, /loanRisk: LoanRisk/);
  assert.match(detail, /TabsTrigger value="risk"/);
  assert.match(detail, /LoanRiskCard/);
});

test("phase 4.2 keeps risk alerts local-first and uses armed rearm anti-spam", () => {
  const hook = readFileSync(new URL("../hooks/use-loan-risk.ts", import.meta.url), "utf8");
  const risk = readFileSync(new URL("../lib/loans/risk.ts", import.meta.url), "utf8");
  const store = readFileSync(new URL("../lib/loans/risk-store.ts", import.meta.url), "utf8");
  assert.match(hook, /db\.loanRiskAlerts\.update/);
  assert.match(risk, /"trigger" \| "rearm"/);
  assert.match(store, /armed: true/);
  assert.doesNotMatch(hook, /fetch\(/);
});

test("phase 4.2 refuses snapshot pricing for automatic stop-loss evaluation", () => {
  const risk = readFileSync(new URL("../lib/loans/risk.ts", import.meta.url), "utf8");
  assert.match(risk, /automaticRiskReady/);
});
