"use client";

import Dexie, { type EntityTable } from "dexie";
import { LOCAL_DATA_BLOCKED_EVENT, LOCAL_DATA_VERSION_CHANGE_EVENT } from "@/lib/local-data-issues";
import { LOCAL_DATABASE_SCHEMA_VERSION } from "@/lib/app-version";
import { validatePortableData } from "@/lib/data-portability";
import { legacyFundOpeningMovement, normalizePortableFundLedger } from "@/lib/fund-ledger";
import { storesV1, storesV2, storesV4, storesV5, storesV6, storesV7, storesV8 } from "@/lib/db-schema";
import { normalizeLegacyAssetIdentityRow, normalizeLegacyExchangeIdentityRow, normalizePortableMarketIdentities } from "@/lib/market/identity";
import type {
  AllocationEntry,
  AllocationRule,
  AppSettings,
  Asset,
  GoalFund,
  FundMovement,
  IncomeEvent,
  InvestmentTransaction,
  MarketAlert,
  MarketSnapshot,
  MarketWatchItem,
  PlanItem,
  RecoverySnapshot,
  AppMeta,
} from "@/lib/types";

function safeAmount(value: unknown) {
  const number = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function normalizePlanRow(row: Record<string, unknown>) {
  const now = new Date().toISOString();
  row.plannedToman = safeAmount(row.plannedToman);
  row.executedToman = safeAmount(row.executedToman);
  row.label = typeof row.label === "string" && row.label.trim() ? row.label : "برنامه مالی";
  row.bucket = ["life", "safety", "growth"].includes(String(row.bucket)) ? row.bucket : "life";
  row.targetType = ["life", "fund", "asset", "bucket"].includes(String(row.targetType)) ? row.targetType : "bucket";
  row.createdAt = typeof row.createdAt === "string" && row.createdAt ? row.createdAt : now;
  row.updatedAt = typeof row.updatedAt === "string" && row.updatedAt ? row.updatedAt : now;
}

export class PoolYarDB extends Dexie {
  allocationRules!: EntityTable<AllocationRule, "id">;
  incomes!: EntityTable<IncomeEvent, "id">;
  allocations!: EntityTable<AllocationEntry, "id">;
  funds!: EntityTable<GoalFund, "id">;
  fundMovements!: EntityTable<FundMovement, "id">;
  assets!: EntityTable<Asset, "id">;
  transactions!: EntityTable<InvestmentTransaction, "id">;
  marketSnapshots!: EntityTable<MarketSnapshot, "id">;
  marketWatchlist!: EntityTable<MarketWatchItem, "id">;
  marketAlerts!: EntityTable<MarketAlert, "id">;
  recoverySnapshots!: EntityTable<RecoverySnapshot, "id">;
  appMeta!: EntityTable<AppMeta, "key">;
  planItems!: EntityTable<PlanItem, "id">;
  settings!: EntityTable<AppSettings, "id">;

  constructor() {
    super("poolyar-local");
    this.version(1).stores(storesV1);
    this.version(2).stores(storesV2);
    this.version(3).stores(storesV2).upgrade(async (tx) => {
      await tx.table("planItems").toCollection().modify((row) => normalizePlanRow(row));
    });
    this.version(4).stores(storesV4);
    this.version(5).stores(storesV5);
    this.version(6).stores(storesV6);
    this.version(7).stores(storesV7).upgrade(async (tx) => {
      await tx.table("assets").toCollection().modify((row) => normalizeLegacyAssetIdentityRow(row as Record<string, unknown>));
      await tx.table("marketWatchlist").toCollection().modify((row) => normalizeLegacyExchangeIdentityRow(row as Record<string, unknown>));
      await tx.table("marketAlerts").toCollection().modify((row) => normalizeLegacyExchangeIdentityRow(row as Record<string, unknown>));
    });
    this.version(LOCAL_DATABASE_SCHEMA_VERSION).stores(storesV8).upgrade(async (tx) => {
      const funds = await tx.table("funds").toArray() as GoalFund[];
      const openings = funds.map((fund) => legacyFundOpeningMovement(fund)).filter((row): row is FundMovement => Boolean(row));
      if (openings.length) await tx.table("fundMovements").bulkAdd(openings);
    });
  }
}

export const db = new PoolYarDB();

function dispatchLocalDataEvent(name: string) {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(name));
}

db.on("blocked", () => dispatchLocalDataEvent(LOCAL_DATA_BLOCKED_EVENT));
db.on("versionchange", () => {
  db.close();
  dispatchLocalDataEvent(LOCAL_DATA_VERSION_CHANGE_EVENT);
});

export const defaultSettings: AppSettings = {
  id: "settings",
  displayUnit: "toman",
  palette: "amber",
  darkMode: "system",
  onboardingComplete: false,
  guideComplete: false,
  hideFinancialData: false,
  emergencyMonths: 3,
  monthlyEssentialToman: 12_000_000,
  incomeStability: "stable",
  riskTolerance: "medium",
  updatedAt: new Date().toISOString(),
};

export async function repairLocalData() {
  await db.transaction("rw", db.planItems, db.settings, async () => {
    await db.planItems.toCollection().modify((row) => normalizePlanRow(row as unknown as Record<string, unknown>));
    const current = await db.settings.get("settings");
    if (current) await db.settings.put({ ...defaultSettings, ...current, id: "settings", updatedAt: new Date().toISOString() });
  });
}

export async function ensureSeedData() {
  const settings = await db.settings.get("settings");
  if (!settings) await db.settings.put(defaultSettings);
  else await db.settings.put({ ...defaultSettings, ...settings, id: "settings" });

  if ((await db.allocationRules.count()) === 0) {
    const now = new Date().toISOString();
    await db.allocationRules.add({
      name: "متعادل", preset: "balanced", lifePct: 30, safetyPct: 20, growthPct: 50,
      isActive: true, createdAt: now, updatedAt: now,
    });
  }

  if ((await db.funds.count()) === 0) {
    const now = new Date().toISOString();
    await db.funds.add({
      name: "صندوق اضطراری",
      targetToman: defaultSettings.monthlyEssentialToman * defaultSettings.emergencyMonths,
      currentToman: 0, icon: "shield", category: "emergency", createdAt: now, updatedAt: now,
    });
  }

  if ((await db.assets.count()) === 0) {
    const now = new Date().toISOString();
    await db.assets.bulkAdd([
      { name: "طلای ۱۸ عیار", kind: "gold", symbol: "IR_GOLD_18K", targetPct: 40, icon: "gold", archived: false, createdAt: now, updatedAt: now },
      { name: "دلار", kind: "currency", symbol: "USD", targetPct: 30, icon: "dollar", archived: false, createdAt: now, updatedAt: now },
      { name: "بیت‌کوین", kind: "crypto", symbol: "BTC", targetPct: 15, icon: "bitcoin", archived: false, createdAt: now, updatedAt: now },
      { name: "سرمایه‌گذاری سفارشی", kind: "custom", targetPct: 15, manualPriceToman: 1_000_000, icon: "pie", archived: false, createdAt: now, updatedAt: now },
      { name: "سهام / بورس", kind: "stock", targetPct: 0, icon: "stock", archived: false, createdAt: now, updatedAt: now },
    ]);
  }

  if ((await db.assets.where("kind").equals("stock").count()) === 0) {
    const now = new Date().toISOString();
    await db.assets.add({ name: "سهام / بورس", kind: "stock", targetPct: 0, icon: "stock", archived: false, createdAt: now, updatedAt: now });
  }

  await db.marketSnapshots.filter((row) => String((row as { source?: unknown }).source ?? "") === "demo").delete();
  await repairLocalData();
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
    if (life > 0) plans.push({ incomeId: income.id, bucket: "life", targetType: "life", label: "زندگی این دوره", plannedToman: life, executedToman: 0, createdAt: now, updatedAt: now });
    if (safety > 0) plans.push({ incomeId: income.id, bucket: "safety", targetType: emergency?.id ? "fund" : "bucket", targetId: emergency?.id, label: emergency?.name ?? "امنیت و پس‌انداز", plannedToman: safety, executedToman: safety, createdAt: now, updatedAt: now });
    addGrowthPlans(plans, income.id, growth, assets, now);
    if (plans.length) await db.planItems.bulkAdd(plans);
  }
}

function addGrowthPlans(plans: PlanItem[], incomeId: number, growth: number, assets: Asset[], now: string) {
  const totalTarget = assets.reduce((sum, asset) => sum + asset.targetPct, 0);
  if (growth <= 0 || totalTarget <= 0) return;
  let assigned = 0;
  assets.forEach((asset, index) => {
    const amount = index === assets.length - 1 ? growth - assigned : Math.round(growth * asset.targetPct / totalTarget);
    assigned += amount;
    plans.push({ incomeId, bucket: "growth", targetType: "asset", targetId: asset.id, label: asset.name, plannedToman: amount, executedToman: 0, createdAt: now, updatedAt: now });
  });
}

export async function exportDatabaseObject() {
  return {
    allocationRules: await db.allocationRules.toArray(), incomes: await db.incomes.toArray(),
    allocations: await db.allocations.toArray(), funds: await db.funds.toArray(), fundMovements: await db.fundMovements.toArray(), assets: await db.assets.toArray(),
    transactions: await db.transactions.toArray(), marketSnapshots: await db.marketSnapshots.toArray(),
    marketWatchlist: await db.marketWatchlist.toArray(), marketAlerts: await db.marketAlerts.toArray(),
    planItems: await db.planItems.toArray(), settings: await db.settings.toArray(),
  };
}

const backupTableNames = ["allocationRules", "incomes", "allocations", "funds", "fundMovements", "assets", "transactions", "marketSnapshots", "marketWatchlist", "marketAlerts", "planItems", "settings"] as const;
export async function importDatabaseObject(data: Record<string, unknown>) {
  validatePortableData(data);
  const normalizedData = normalizePortableFundLedger(normalizePortableMarketIdentities(data));

  await db.transaction("rw", db.tables, async () => {
    for (const name of backupTableNames) await db.table(name).clear();
    for (const name of backupTableNames) {
      const rows = normalizedData[name];
      if (Array.isArray(rows) && rows.length) await db.table(name).bulkAdd(rows);
    }
  });
  await ensureSeedData();
}
