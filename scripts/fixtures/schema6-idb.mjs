export const LEGACY_SCHEMA6_NATIVE_VERSION = 60;
export const CURRENT_SCHEMA8_NATIVE_VERSION = 80;

export const SCHEMA6_STORES = {
  allocationRules: "++id, preset, updatedAt",
  incomes: "++id, happenedAt, createdAt",
  allocations: "++id, incomeId, bucket, createdAt",
  funds: "++id, category, dueAt, updatedAt",
  assets: "++id, kind, symbol, updatedAt",
  transactions: "++id, assetId, incomeId, planItemId, type, happenedAt, createdAt",
  marketSnapshots: "++id, symbol, capturedAt",
  planItems: "++id, incomeId, bucket, targetType, targetId, updatedAt",
  settings: "id, updatedAt",
  marketWatchlist: "++id, &marketId, symbol, updatedAt",
  marketAlerts: "++id, marketId, symbol, kind, enabled, updatedAt",
  recoverySnapshots: "++id, createdAt, reason",
  appMeta: "&key, updatedAt",
};

function parseIndexToken(token) {
  let value = token.trim();
  const unique = value.startsWith("&");
  const multiEntry = value.startsWith("*") || value.startsWith("&*");
  value = value.replace(/^&?\*/, "").replace(/^&/, "");
  const compound = value.startsWith("[") && value.endsWith("]");
  const keyPath = compound ? value.slice(1, -1).split("+") : value;
  return { name: value, keyPath, unique, multiEntry };
}

function nativeStoreDefinitions() {
  return Object.entries(SCHEMA6_STORES).map(([name, schema]) => {
    const tokens = schema.split(",").map((token) => token.trim()).filter(Boolean);
    let primary = tokens.shift() ?? "";
    const autoIncrement = primary.startsWith("++");
    primary = primary.replace(/^\+\+/, "").replace(/^&/, "");
    return {
      name,
      keyPath: primary || undefined,
      autoIncrement,
      indexes: tokens.map(parseIndexToken),
    };
  });
}

function legacySeed(now) {
  return {
    allocationRules: [], incomes: [], allocations: [], transactions: [], marketSnapshots: [], planItems: [], recoverySnapshots: [], appMeta: [],
    funds: [{ id: 1, name: "Legacy migration fund", targetToman: 5_000_000, currentToman: 2_500_000, icon: "fund", category: "planned", createdAt: now, updatedAt: now }],
    assets: [{
      id: 1, name: "Legacy migration asset", kind: "stock", symbol: "LEGACY", marketId: "shared-market-id",
      targetPct: 100, manualPriceToman: 1_000, icon: "stock", archived: false, createdAt: now, updatedAt: now,
    }],
    settings: [{
      id: "settings", displayUnit: "toman", palette: "amber", darkMode: "system", onboardingComplete: true, guideComplete: true,
      hideFinancialData: false, emergencyMonths: 3, monthlyEssentialToman: 12_000_000, incomeStability: "stable", riskTolerance: "medium", updatedAt: now,
    }],
    marketWatchlist: [{ id: 1, marketId: "shared-market-id", symbol: "LEGACY", name: "Legacy migration watch", createdAt: now, updatedAt: now }],
    marketAlerts: [
      { id: 1, marketId: "legacy-alert-id", symbol: "LEGACY", name: "Legacy migration alert", kind: "price_above", threshold: 1_100, enabled: false, notifyBrowser: false, armed: true, createdAt: now, updatedAt: now },
      { id: 2, marketId: "explicit-tsetmc-id", symbol: "TSETMC", name: "Explicit TSETMC alert", source: "tsetmc", kind: "price_below", threshold: 900, enabled: false, notifyBrowser: false, armed: true, createdAt: now, updatedAt: now },
    ],
  };
}

export function legacySchema6SeedExpression(now) {
  const definitions = nativeStoreDefinitions();
  const seed = legacySeed(now);
  return `(async () => {
    await new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase("poolyar-local");
      request.onsuccess = resolve;
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error("legacy schema delete blocked"));
    });
    const definitions = ${JSON.stringify(definitions)};
    const seed = ${JSON.stringify(seed)};
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open("poolyar-local", ${LEGACY_SCHEMA6_NATIVE_VERSION});
      request.onupgradeneeded = () => {
        const database = request.result;
        for (const definition of definitions) {
          const store = database.createObjectStore(definition.name, { keyPath: definition.keyPath, autoIncrement: definition.autoIncrement });
          for (const index of definition.indexes) store.createIndex(index.name, index.keyPath, { unique: index.unique, multiEntry: index.multiEntry });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const names = Object.keys(seed);
    const tx = db.transaction(names, "readwrite");
    for (const name of names) {
      const store = tx.objectStore(name);
      for (const row of seed[name]) store.put(row);
    }
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    const version = db.version;
    db.close();
    return version;
  })()`;
}

export function migratedSchema8InspectionExpression() {
  return `(async () => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open("poolyar-local");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const tx = db.transaction(["assets", "funds", "fundMovements", "marketWatchlist", "marketAlerts"], "readonly");
    const getAll = (name) => new Promise((resolve, reject) => {
      const request = tx.objectStore(name).getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const [assets, funds, fundMovements, watchlist, alerts] = await Promise.all([getAll("assets"), getAll("funds"), getAll("fundMovements"), getAll("marketWatchlist"), getAll("marketAlerts")]);
    const watchStore = tx.objectStore("marketWatchlist");
    const alertStore = tx.objectStore("marketAlerts");
    const result = {
      nativeVersion: db.version,
      assets,
      funds,
      fundMovements,
      watchlist,
      alerts,
      watchIndexes: [...watchStore.indexNames],
      alertIndexes: [...alertStore.indexNames],
      watchMarketIdUnique: watchStore.index("marketId").unique,
    };
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    db.close();
    return result;
  })()`;
}

export function providerCollisionInsertExpression(now) {
  return `(async () => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open("poolyar-local");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const tx = db.transaction("marketWatchlist", "readwrite");
    tx.objectStore("marketWatchlist").add({ marketId: "shared-market-id", symbol: "NEW", name: "TSETMC collision proof", source: "tsetmc", createdAt: ${JSON.stringify(now)}, updatedAt: ${JSON.stringify(now)} });
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    const readTx = db.transaction("marketWatchlist", "readonly");
    const rows = await new Promise((resolve, reject) => {
      const request = readTx.objectStore("marketWatchlist").index("marketId").getAll("shared-market-id");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return rows.map((row) => ({ marketId: row.marketId, source: row.source })).sort((a, b) => a.source.localeCompare(b.source));
  })()`;
}
