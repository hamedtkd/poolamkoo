const ANCHOR = "2026-08-26T10:30:00+03:30";

function marketSeries(symbol, name, values) {
  const days = ["2026-07-18", "2026-07-26", "2026-08-03", "2026-08-10", "2026-08-18", "2026-08-26"];
  return values.map((priceToman, index) => {
    const previous = values[Math.max(0, index - 1)];
    const changeValueToman = priceToman - previous;
    const changePercent = previous > 0 ? changeValueToman / previous * 100 : 0;
    const capturedAt = `${days[index]}T10:00:00+03:30`;
    return { symbol, name, priceToman, changePercent, changeValueToman, asOf: capturedAt, source: "local", capturedAt };
  });
}

export function createPoolamkooMediaDemoData() {
  const now = ANCHOR;
  const allocationRules = [{ id: 1, name: "متعادل", preset: "balanced", lifePct: 30, safetyPct: 20, growthPct: 50, isActive: true, createdAt: now, updatedAt: now }];
  const incomes = [
    { id: 1, amountToman: 95_000_000, title: "درآمد خرداد", note: "Fixture نمایشی", happenedAt: "2026-06-05T09:00:00+03:30", createdAt: "2026-06-05T09:00:00+03:30" },
    { id: 2, amountToman: 110_000_000, title: "درآمد تیر", note: "Fixture نمایشی", happenedAt: "2026-07-06T09:00:00+03:30", createdAt: "2026-07-06T09:00:00+03:30" },
    { id: 3, amountToman: 125_000_000, title: "درآمد مرداد", note: "Fixture نمایشی", happenedAt: "2026-08-07T09:00:00+03:30", createdAt: "2026-08-07T09:00:00+03:30" },
  ];
  const allocations = incomes.flatMap((income) => [
    { id: income.id * 10 + 1, incomeId: income.id, bucket: "life", amountToman: Math.round(income.amountToman * 0.30), createdAt: income.createdAt },
    { id: income.id * 10 + 2, incomeId: income.id, bucket: "safety", amountToman: Math.round(income.amountToman * 0.20), createdAt: income.createdAt },
    { id: income.id * 10 + 3, incomeId: income.id, bucket: "growth", amountToman: Math.round(income.amountToman * 0.50), createdAt: income.createdAt },
  ]);
  const funds = [
    { id: 1, name: "صندوق اضطراری", targetToman: 36_000_000, currentToman: 28_000_000, icon: "shield", category: "emergency", createdAt: now, updatedAt: now },
    { id: 2, name: "بیمه خودرو", targetToman: 20_000_000, currentToman: 14_000_000, dueAt: "2026-09-30T12:00:00+03:30", icon: "car", category: "planned", createdAt: now, updatedAt: now },
    { id: 3, name: "سفر زمستان", targetToman: 60_000_000, currentToman: 22_000_000, dueAt: "2026-12-15T12:00:00+03:30", icon: "plane", category: "custom", createdAt: now, updatedAt: now },
  ];
  const assets = [
    { id: 1, name: "طلای ۱۸ عیار", kind: "gold", symbol: "IR_GOLD_18K", targetPct: 35, icon: "gold", archived: false, createdAt: now, updatedAt: now },
    { id: 2, name: "دلار", kind: "currency", symbol: "USD", targetPct: 25, icon: "dollar", archived: false, createdAt: now, updatedAt: now },
    { id: 3, name: "بیت‌کوین", kind: "crypto", symbol: "BTC", targetPct: 15, icon: "bitcoin", archived: false, createdAt: now, updatedAt: now },
    { id: 4, name: "صندوق طلای عیار", kind: "fund", symbol: "AYAR", targetPct: 15, manualPriceToman: 31_000, icon: "fund", archived: false, createdAt: now, updatedAt: now },
    { id: 5, name: "درآمد ثابت", kind: "custom", targetPct: 10, manualPriceToman: 1_000_000, icon: "asset", archived: false, createdAt: now, updatedAt: now },
  ];
  const transactions = [
    { id: 1, assetId: 1, type: "buy", amountToman: 150_000_000, quantity: 25, unitPriceToman: 6_000_000, happenedAt: "2026-04-14T11:00:00+03:30", createdAt: "2026-04-14T11:00:00+03:30" },
    { id: 2, assetId: 2, type: "buy", amountToman: 96_000_000, quantity: 1600, unitPriceToman: 60_000, happenedAt: "2026-05-18T11:00:00+03:30", createdAt: "2026-05-18T11:00:00+03:30" },
    { id: 3, assetId: 3, type: "buy", amountToman: 60_000_000, quantity: 0.012, unitPriceToman: 5_000_000_000, happenedAt: "2026-06-22T11:00:00+03:30", createdAt: "2026-06-22T11:00:00+03:30" },
    { id: 4, assetId: 4, type: "buy", amountToman: 70_000_000, quantity: 2500, unitPriceToman: 28_000, happenedAt: "2026-07-12T11:00:00+03:30", createdAt: "2026-07-12T11:00:00+03:30" },
    { id: 5, assetId: 5, type: "buy", amountToman: 40_000_000, quantity: 40, unitPriceToman: 1_000_000, happenedAt: "2026-08-08T11:00:00+03:30", createdAt: "2026-08-08T11:00:00+03:30" },
  ];
  const marketSnapshots = [
    ...marketSeries("IR_GOLD_18K", "طلای ۱۸ عیار", [6_180_000, 6_250_000, 6_310_000, 6_420_000, 6_370_000, 6_500_000]),
    ...marketSeries("USD", "دلار", [60_800, 61_200, 62_000, 62_700, 63_300, 64_000]),
    ...marketSeries("BTC", "بیت‌کوین", [5_050_000_000, 5_120_000_000, 5_280_000_000, 5_410_000_000, 5_350_000_000, 5_600_000_000]),
    ...marketSeries("AYAR", "صندوق طلای عیار", [28_600, 29_100, 29_400, 30_100, 30_500, 31_000]),
  ].map((row, index) => ({ ...row, id: index + 1 }));
  const planItems = incomes.flatMap((income) => {
    const life = Math.round(income.amountToman * 0.30);
    const safety = Math.round(income.amountToman * 0.20);
    const growth = Math.round(income.amountToman * 0.50);
    const base = income.id * 10;
    return [
      { id: base + 1, incomeId: income.id, bucket: "life", targetType: "life", label: "زندگی این دوره", plannedToman: life, executedToman: Math.round(life * 0.96), createdAt: income.createdAt, updatedAt: now },
      { id: base + 2, incomeId: income.id, bucket: "safety", targetType: "fund", targetId: 1, label: "صندوق اضطراری", plannedToman: safety, executedToman: Math.round(safety * 0.90), createdAt: income.createdAt, updatedAt: now },
      { id: base + 3, incomeId: income.id, bucket: "growth", targetType: "asset", targetId: 2, label: "سرمایه‌گذاری", plannedToman: growth, executedToman: Math.round(growth * 0.84), createdAt: income.createdAt, updatedAt: now },
    ];
  });
  const settings = [{ id: "settings", displayUnit: "toman", palette: "amber", darkMode: "light", onboardingComplete: true, guideComplete: true, hideFinancialData: false, emergencyMonths: 3, monthlyEssentialToman: 12_000_000, incomeStability: "stable", riskTolerance: "medium", updatedAt: now }];
  return { allocationRules, incomes, allocations, funds, assets, transactions, marketSnapshots, marketWatchlist: [], marketAlerts: [], planItems, settings };
}

export const POOLAMKOO_MEDIA_ANCHOR = ANCHOR;
