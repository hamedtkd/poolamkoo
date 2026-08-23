"use client";

import Dexie, { type EntityTable } from "dexie";
import type {
  AllocationEntry,
  AllocationRule,
  AppSettings,
  Asset,
  GoalFund,
  IncomeEvent,
  InvestmentTransaction,
  MarketSnapshot,
  PlanItem,
} from "@/lib/types";

export class PoolYarDB extends Dexie {
  allocationRules!: EntityTable<AllocationRule, "id">;
  incomes!: EntityTable<IncomeEvent, "id">;
  allocations!: EntityTable<AllocationEntry, "id">;
  funds!: EntityTable<GoalFund, "id">;
  assets!: EntityTable<Asset, "id">;
  transactions!: EntityTable<InvestmentTransaction, "id">;
  marketSnapshots!: EntityTable<MarketSnapshot, "id">;
  planItems!: EntityTable<PlanItem, "id">;
  settings!: EntityTable<AppSettings, "id">;

  constructor() {
    super("poolyar-local");
    this.version(1).stores({
      allocationRules: "++id, preset, updatedAt",
      incomes: "++id, happenedAt, createdAt",
      allocations: "++id, incomeId, bucket, createdAt",
      funds: "++id, category, dueAt, updatedAt",
      assets: "++id, kind, symbol, updatedAt",
      transactions: "++id, assetId, type, happenedAt, createdAt",
      marketSnapshots: "++id, symbol, capturedAt",
      settings: "id, updatedAt",
    });
    this.version(2).stores({
      allocationRules: "++id, preset, updatedAt",
      incomes: "++id, happenedAt, createdAt",
      allocations: "++id, incomeId, bucket, createdAt",
      funds: "++id, category, dueAt, updatedAt",
      assets: "++id, kind, symbol, updatedAt",
      transactions: "++id, assetId, incomeId, planItemId, type, happenedAt, createdAt",
      marketSnapshots: "++id, symbol, capturedAt",
      planItems: "++id, incomeId, bucket, targetType, targetId, updatedAt",
      settings: "id, updatedAt",
    });
  }
}

export const db = new PoolYarDB();

export const defaultSettings: AppSettings = {
  id: "settings",
  displayUnit: "toman",
  palette: "rose",
  darkMode: "system",
  onboardingComplete: false,
  emergencyMonths: 3,
  monthlyEssentialToman: 12_000_000,
  incomeStability: "stable",
  riskTolerance: "medium",
  updatedAt: new Date().toISOString(),
};

export async function ensureSeedData() {
  const settings = await db.settings.get("settings");
  if (!settings) await db.settings.put(defaultSettings);

  if ((await db.allocationRules.count()) === 0) {
    await db.allocationRules.add({
      name: "متعادل",
      preset: "balanced",
      lifePct: 30,
      safetyPct: 20,
      growthPct: 50,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  if ((await db.funds.count()) === 0) {
    const now = new Date().toISOString();
    await db.funds.add({
      name: "صندوق اضطراری",
      targetToman: defaultSettings.monthlyEssentialToman * defaultSettings.emergencyMonths,
      currentToman: 0,
      icon: "shield",
      category: "emergency",
      createdAt: now,
      updatedAt: now,
    });
  }

  if ((await db.assets.count()) === 0) {
    const now = new Date().toISOString();
    await db.assets.bulkAdd([
      { name: "طلای ۱۸ عیار", kind: "gold", symbol: "IR_GOLD_18K", targetPct: 40, icon: "gold", archived: false, createdAt: now, updatedAt: now },
      { name: "دلار", kind: "currency", symbol: "USD", targetPct: 30, icon: "dollar", archived: false, createdAt: now, updatedAt: now },
      { name: "بیت‌کوین", kind: "crypto", symbol: "BTC", targetPct: 15, icon: "bitcoin", archived: false, createdAt: now, updatedAt: now },
      { name: "سرمایه‌گذاری سفارشی", kind: "custom", targetPct: 15, manualPriceToman: 1_000_000, icon: "pie", archived: false, createdAt: now, updatedAt: now },
    ]);
  }

  await db.marketSnapshots.filter((row) => String((row as { source?: unknown }).source ?? "") === "demo").delete();
  await ensureLegacyPlanItems();
}

async function ensureLegacyPlanItems() {
  const incomes = await db.incomes.toArray();
  if (!incomes.length) return;
  const allocations = await db.allocations.toArray();
  const assets = (await db.assets.toArray()).filter((asset) => !asset.archived && asset.id && asset.targetPct > 0);
  const emergency = await db.funds.filter((fund) => fund.category === "emergency").first();
  const now = new Date().toISOString();

  for (const income of incomes) {
    if (!income.id || await db.planItems.where("incomeId").equals(income.id).count()) continue;
    const rows = allocations.filter((row) => row.incomeId === income.id);
    const life = rows.find((row) => row.bucket === "life")?.amountToman ?? 0;
    const safety = rows.find((row) => row.bucket === "safety")?.amountToman ?? 0;
    const growth = rows.find((row) => row.bucket === "growth")?.amountToman ?? 0;
    const plans: PlanItem[] = [];
    if (life > 0) plans.push({ incomeId: income.id, bucket: "life", targetType: "life", label: "\u0632\u0646\u062f\u06af\u06cc \u0627\u06cc\u0646 \u062f\u0648\u0631\u0647", plannedToman: life, executedToman: 0, createdAt: now, updatedAt: now });
    if (safety > 0) plans.push({ incomeId: income.id, bucket: "safety", targetType: emergency?.id ? "fund" : "bucket", targetId: emergency?.id, label: emergency?.name ?? "\u0627\u0645\u0646\u06cc\u062a \u0648 \u067e\u0633\u200c\u0627\u0646\u062f\u0627\u0632", plannedToman: safety, executedToman: safety, createdAt: now, updatedAt: now });
    const totalTarget = assets.reduce((sum, asset) => sum + asset.targetPct, 0);
    let assigned = 0;
    if (growth > 0 && totalTarget > 0) {
      assets.forEach((asset, index) => {
        const amount = index === assets.length - 1 ? growth - assigned : Math.round(growth * asset.targetPct / totalTarget);
        assigned += amount;
        plans.push({ incomeId: income.id, bucket: "growth", targetType: "asset", targetId: asset.id, label: asset.name, plannedToman: amount, executedToman: 0, createdAt: now, updatedAt: now });
      });
    }
    if (plans.length) await db.planItems.bulkAdd(plans);
  }
}

export async function exportDatabaseObject() {
  return {
    allocationRules: await db.allocationRules.toArray(),
    incomes: await db.incomes.toArray(),
    allocations: await db.allocations.toArray(),
    funds: await db.funds.toArray(),
    assets: await db.assets.toArray(),
    transactions: await db.transactions.toArray(),
    marketSnapshots: await db.marketSnapshots.toArray(),
    planItems: await db.planItems.toArray(),
    settings: await db.settings.toArray(),
  };
}

export async function importDatabaseObject(data: Record<string, unknown>) {
  const required = ["allocationRules", "incomes", "allocations", "funds", "assets", "transactions", "settings"] as const;
  for (const name of required) {
    if (!Array.isArray(data[name])) throw new Error(`بکاپ ناقص است: بخش ${name} پیدا نشد.`);
  }
  const settings = data.settings as unknown[];
  if (!settings.some((row) => row && typeof row === "object" && (row as { id?: string }).id === "settings")) {
    throw new Error("بکاپ تنظیمات معتبر پولم‌کو را ندارد.");
  }

  const allowed = ["allocationRules", "incomes", "allocations", "funds", "assets", "transactions", "marketSnapshots", "planItems", "settings"] as const;
  await db.transaction("rw", db.tables, async () => {
    for (const table of db.tables) await table.clear();
    for (const name of allowed) {
      const rows = data[name];
      if (Array.isArray(rows) && rows.length) await db.table(name).bulkAdd(rows);
    }
  });
  await ensureSeedData();
}
