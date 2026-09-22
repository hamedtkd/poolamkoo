import type { LoanView } from "./analytics.ts";
import type { LoanRiskAlert, LoanRiskAlertKind } from "./types.ts";

export type LoanRiskTransition = "trigger" | "rearm" | "none" | "unavailable";
export type LoanHealthLevel = "healthy" | "watch" | "critical";

export type LoanRiskObservation = {
  alert: LoanRiskAlert;
  observed: number | null;
  conditionMet: boolean;
  rearmMet: boolean;
  available: boolean;
  label: string;
  detail: string;
};

export type LoanHealthSummary = {
  level: LoanHealthLevel;
  headline: string;
  detail: string;
  triggeredCount: number;
  watchCount: number;
  unavailableCount: number;
  observations: LoanRiskObservation[];
};

export function loanRiskKindLabel(kind: LoanRiskAlertKind) {
  if (kind === "reserve_runway_below") return "پوشش ذخیره";
  if (kind === "loss_budget_exceeded") return "بودجه زیان";
  if (kind === "spread_below") return "فاصله بازده از هزینه وام";
  return "تازگی قیمت";
}

const MIN_SPREAD_OBSERVATION_DAYS = 90;

function positionFor(alert: Pick<LoanRiskAlert, "assetId">, view: LoanView) {
  return alert.assetId ? view.positions.find((row) => row.asset.id === alert.assetId) : undefined;
}

function evaluation(alert: Pick<LoanRiskAlert, "kind" | "threshold" | "rearmThreshold" | "assetId">, view: LoanView) {
  if (alert.kind === "reserve_runway_below") {
    const observed = view.reserveRunwayMonths;
    return { observed, available: true, conditionMet: observed < Math.max(0, alert.threshold), rearmMet: observed >= (alert.rearmThreshold ?? Math.max(0, alert.threshold + 1)) };
  }
  const position = positionFor(alert, view);
  if (!position) return { observed: null, available: false, conditionMet: false, rearmMet: false };
  if (alert.kind === "quote_stale") {
    if (!position.marketQuoteExpected) return { observed: null, available: false, conditionMet: false, rearmMet: false };
    const observed = position.marketQuoteAgeHours;
    const conditionMet = position.marketFreshnessState !== "fresh";
    const rearmThreshold = alert.rearmThreshold ?? Math.max(0.5, alert.threshold * 0.5);
    const rearmMet = position.marketFreshnessState === "fresh" && (observed ?? 0) <= rearmThreshold;
    return { observed, available: true, conditionMet, rearmMet };
  }
  if (alert.kind === "loss_budget_exceeded") {
    if (!position.automaticRiskReady) return { observed: null, available: false, conditionMet: false, rearmMet: false };
    const observed = view.installmentToman > 0 ? Math.max(0, -position.unrealizedPnlToman) / view.installmentToman : null;
    if (observed === null) return { observed, available: false, conditionMet: false, rearmMet: false };
    return {
      observed, available: true,
      conditionMet: observed > Math.max(0, alert.threshold),
      rearmMet: observed <= (alert.rearmThreshold ?? Math.max(0, alert.threshold * 0.8)),
    };
  }
  const observed = position.spreadVsLoanCostPct ?? null;
  const enoughHistory = (position.returnObservationDays ?? 0) >= MIN_SPREAD_OBSERVATION_DAYS;
  const available = position.automaticRiskReady && enoughHistory && observed !== null;
  if (!available) return { observed, available: false, conditionMet: false, rearmMet: false };
  return {
    observed, available: true,
    conditionMet: observed < alert.threshold,
    rearmMet: observed >= (alert.rearmThreshold ?? alert.threshold + 2),
  };
}

export function loanRiskObservedValue(alert: Pick<LoanRiskAlert, "kind" | "threshold" | "rearmThreshold" | "assetId">, view: LoanView) {
  return evaluation(alert, view).observed;
}

export function loanRiskConditionMet(alert: Pick<LoanRiskAlert, "kind" | "threshold" | "rearmThreshold" | "assetId">, view: LoanView) {
  return evaluation(alert, view).conditionMet;
}

export function loanRiskRearmMet(alert: Pick<LoanRiskAlert, "kind" | "threshold" | "rearmThreshold" | "assetId">, view: LoanView) {
  return evaluation(alert, view).rearmMet;
}

export function loanRiskTransition(alert: LoanRiskAlert, view: LoanView): LoanRiskTransition {
  if (!alert.enabled) return "none";
  const state = evaluation(alert, view);
  if (!state.available) return "unavailable";
  if (state.conditionMet && alert.armed) return "trigger";
  if (!alert.armed && state.rearmMet) return "rearm";
  return "none";
}

export function observeLoanRisk(alert: LoanRiskAlert, view: LoanView): LoanRiskObservation {
  const state = evaluation(alert, view);
  return {
    alert,
    observed: state.observed,
    conditionMet: state.conditionMet,
    rearmMet: state.rearmMet,
    available: state.available,
    label: loanRiskKindLabel(alert.kind),
    detail: riskDetail(alert, view, state.observed),
  };
}

export function buildLoanHealthSummary(view: LoanView, alerts: readonly LoanRiskAlert[]): LoanHealthSummary {
  const observations = alerts.filter((row) => row.loanId === view.loan.id && row.enabled).map((row) => observeLoanRisk(row, view));
  const triggeredCount = observations.filter((row) => row.conditionMet).length;
  const unavailableCount = observations.filter((row) => !row.available).length;
  const watchCount = observations.filter((row) => row.available && !row.conditionMet && isNearBoundary(row)).length;

  if (view.overdue) return health("critical", "قسط عقب افتاده است", "اولویت با تعیین تکلیف بازپرداخت عقب افتاده است؛ تصمیم سرمایه گذاری را از این تعهد جدا کن.", triggeredCount, watchCount, unavailableCount, observations);
  if (view.fundingGapToman > 0.5) return health("critical", "منبع بخشی از سرمایه روشن نیست", "خریدهای متصل از وجه قابل ردیابی وام بیشتر شده اند و اختلاف فعلا آورده شخصی محسوب می شود.", triggeredCount, watchCount, unavailableCount, observations);
  if (triggeredCount > 0) return health("critical", "\u06cc\u06a9\u06cc \u0627\u0632 \u0645\u0631\u0632\u0647\u0627\u06cc \u0631\u06cc\u0633\u06a9 \u0639\u0628\u0648\u0631 \u06a9\u0631\u062f\u0647", "\u062d\u062f\u0627\u0642\u0644 \u06cc\u06a9 \u0634\u0631\u0637 \u062f\u0631 \u0630\u062e\u06cc\u0631\u0647\u060c \u0628\u0648\u062f\u062c\u0647 \u0632\u06cc\u0627\u0646\u060c \u062a\u0627\u0632\u06af\u06cc \u0642\u06cc\u0645\u062a \u06cc\u0627 \u0641\u0627\u0635\u0644\u0647 \u0628\u0627\u0632\u062f\u0647 \u0627\u0632 \u0647\u0632\u06cc\u0646\u0647 \u0648\u0627\u0645 \u0627\u0632 \u0645\u0631\u0632 \u062a\u0639\u06cc\u06cc\u0646\u200c\u0634\u062f\u0647 \u0639\u0628\u0648\u0631 \u06a9\u0631\u062f\u0647 \u0627\u0633\u062a.", triggeredCount, watchCount, unavailableCount, observations);
  if (unavailableCount > 0) return health("watch", "\u0628\u062e\u0634\u06cc \u0627\u0632 \u067e\u0627\u06cc\u0634 \u0646\u0627\u06a9\u0627\u0645\u0644 \u0627\u0633\u062a", "\u0628\u0631\u0627\u06cc \u06cc\u06a9 \u06cc\u0627 \u0686\u0646\u062f \u0645\u0631\u0632\u060c \u0642\u06cc\u0645\u062a \u062a\u0627\u0632\u0647 \u06cc\u0627 \u0633\u0627\u0628\u0642\u0647 \u06a9\u0627\u0641\u06cc \u0646\u062f\u0627\u0631\u06cc\u0645\u061b \u062a\u0627 \u062a\u06a9\u0645\u06cc\u0644 \u062f\u0627\u062f\u0647 \u0646\u0628\u0627\u06cc\u062f \u0648\u0636\u0639\u06cc\u062a \u0631\u0627 \u0642\u0637\u0639\u06cc \u062f\u0627\u0646\u0633\u062a.", triggeredCount, watchCount, unavailableCount, observations);
  if (watchCount > 0 || view.reserveRunwayMonths + 0.01 < view.loan.reserveTargetMonths) return health("watch", "\u0628\u0647 \u0645\u0631\u0632 \u0627\u062d\u062a\u06cc\u0627\u0637 \u0646\u0632\u062f\u06cc\u06a9 \u0634\u062f\u0647 \u0627\u06cc", "\u0647\u0646\u0648\u0632 \u0647\u0634\u062f\u0627\u0631 \u0627\u0635\u0644\u06cc \u0641\u0639\u0627\u0644 \u0646\u0634\u062f\u0647\u060c \u0627\u0645\u0627 \u0641\u0627\u0635\u0644\u0647 \u0628\u0627 \u06cc\u06a9\u06cc \u0627\u0632 \u0645\u0631\u0632\u0647\u0627\u06cc \u0628\u0631\u0646\u0627\u0645\u0647 \u06a9\u0645\u062a\u0631 \u0634\u062f\u0647 \u0627\u0633\u062a.", triggeredCount, watchCount, unavailableCount, observations);
  return health("healthy", "\u062f\u0631 \u0645\u062d\u062f\u0648\u062f\u0647 \u0628\u0631\u0646\u0627\u0645\u0647", "\u0628\u0631 \u0627\u0633\u0627\u0633 \u062f\u0627\u062f\u0647\u200c\u0647\u0627\u06cc \u0642\u0627\u0628\u0644 \u0627\u062a\u06a9\u0627\u06cc \u0641\u0639\u0644\u06cc\u060c \u0647\u06cc\u0686 \u0645\u0631\u0632 \u0641\u0639\u0627\u0644 \u0631\u06cc\u0633\u06a9 \u0639\u0628\u0648\u0631 \u0646\u06a9\u0631\u062f\u0647 \u0627\u0633\u062a.", triggeredCount, watchCount, unavailableCount, observations);
}

function isNearBoundary(observation: LoanRiskObservation) {
  const { alert, observed } = observation;
  if (!observation.available) return false;
  if (alert.kind === "reserve_runway_below") {
    const rearm = alert.rearmThreshold ?? alert.threshold + 1;
    return observed !== null && observed < rearm;
  }
  if (alert.kind === "loss_budget_exceeded") {
    return observed !== null && alert.threshold > 0 && observed >= alert.threshold * 0.7;
  }
  if (alert.kind === "quote_stale") {
    return observed !== null && observed >= alert.threshold * 0.7;
  }
  return observed !== null && observed < Math.max(3, alert.rearmThreshold ?? 2);
}

function riskDetail(alert: LoanRiskAlert, view: LoanView, observed: number | null) {
  if (alert.kind === "reserve_runway_below") {
    if (observed === null) return "\u067e\u0648\u0634\u0634 \u0630\u062e\u06cc\u0631\u0647 \u0642\u0627\u0628\u0644 \u0645\u062d\u0627\u0633\u0628\u0647 \u0646\u06cc\u0633\u062a.";
    return `${observed.toLocaleString("fa-IR", { maximumFractionDigits: 1 })} \u0642\u0633\u0637 \u067e\u0648\u0634\u0634 \u0641\u0639\u0644\u06cc\u060c \u0645\u0631\u0632 \u0647\u0634\u062f\u0627\u0631 ${alert.threshold.toLocaleString("fa-IR", { maximumFractionDigits: 1 })} \u0642\u0633\u0637.`;
  }
  const position = positionFor(alert, view);
  if (alert.kind === "loss_budget_exceeded") {
    if (observed === null) return `${position?.asset.name ?? "\u062f\u0627\u0631\u0627\u06cc\u06cc"}: \u0628\u0631\u0627\u06cc \u0627\u0631\u0632\u06cc\u0627\u0628\u06cc \u062e\u0648\u062f\u06a9\u0627\u0631 \u0642\u06cc\u0645\u062a \u0628\u0627\u0632\u0627\u0631 \u062a\u0627\u0632\u0647 \u0644\u0627\u0632\u0645 \u0627\u0633\u062a.`;
    return `${position?.asset.name ?? "\u0628\u06cc\u0634\u062a\u0631\u06cc\u0646 \u0632\u06cc\u0627\u0646"}: ${observed.toLocaleString("fa-IR", { maximumFractionDigits: 1 })} \u0642\u0633\u0637 \u0632\u06cc\u0627\u0646 \u062f\u0631 \u0628\u0631\u0627\u0628\u0631 \u0628\u0648\u062f\u062c\u0647 ${alert.threshold.toLocaleString("fa-IR", { maximumFractionDigits: 1 })} \u0642\u0633\u0637.`;
  }
  if (alert.kind === "quote_stale") {
    if (!position) return "\u062f\u0627\u0631\u0627\u06cc\u06cc \u0645\u062a\u0635\u0644 \u067e\u06cc\u062f\u0627 \u0646\u0634\u062f.";
    const age = observed === null ? "\u0646\u0627\u0645\u0634\u062e\u0635" : `${observed.toLocaleString("fa-IR", { maximumFractionDigits: 1 })} \u0633\u0627\u0639\u062a`;
    return `${position.asset.name}: \u0639\u0645\u0631 \u0642\u06cc\u0645\u062a ${age}\u060c \u0633\u0642\u0641 \u067e\u0627\u06cc\u0634 ${alert.threshold.toLocaleString("fa-IR", { maximumFractionDigits: 1 })} \u0633\u0627\u0639\u062a.`;
  }
  if (!position) return "\u062f\u0627\u0631\u0627\u06cc\u06cc \u0645\u062a\u0635\u0644 \u067e\u06cc\u062f\u0627 \u0646\u0634\u062f.";
  if ((position.returnObservationDays ?? 0) < MIN_SPREAD_OBSERVATION_DAYS) {
    return `${position.asset.name}: \u062d\u062f\u0627\u0642\u0644 ${MIN_SPREAD_OBSERVATION_DAYS.toLocaleString("fa-IR")} \u0631\u0648\u0632 \u0633\u0627\u0628\u0642\u0647 \u0628\u0631\u0627\u06cc \u0645\u0642\u0627\u06cc\u0633\u0647 \u0633\u0627\u0644\u0627\u0646\u0647 \u0644\u0627\u0632\u0645 \u0627\u0633\u062a.`;
  }
  if (observed === null) return `${position.asset.name}: \u0628\u0627\u0632\u062f\u0647 \u0633\u0627\u0644\u0627\u0646\u0647 \u0642\u0627\u0628\u0644 \u0645\u062d\u0627\u0633\u0628\u0647 \u0646\u06cc\u0633\u062a.`;
  return `${position.asset.name}: \u0641\u0627\u0635\u0644\u0647 \u0628\u0627\u0632\u062f\u0647 \u0633\u0627\u0644\u0627\u0646\u0647 \u062b\u0628\u062a\u200c\u0634\u062f\u0647 \u0628\u0627 \u0647\u0632\u06cc\u0646\u0647 \u0645\u0648\u062b\u0631 \u0648\u0627\u0645 ${observed >= 0 ? "+" : ""}${observed.toLocaleString("fa-IR", { maximumFractionDigits: 1 })} \u0648\u0627\u062d\u062f \u062f\u0631\u0635\u062f.`;
}

function health(level: LoanHealthLevel, headline: string, detail: string, triggeredCount: number, watchCount: number, unavailableCount: number, observations: LoanRiskObservation[]): LoanHealthSummary {
  return { level, headline, detail, triggeredCount, watchCount, unavailableCount, observations };
}
