export const storesV1 = {
  allocationRules: "++id, preset, updatedAt",
  incomes: "++id, happenedAt, createdAt",
  allocations: "++id, incomeId, bucket, createdAt",
  funds: "++id, category, dueAt, updatedAt",
  assets: "++id, kind, symbol, updatedAt",
  transactions: "++id, assetId, type, happenedAt, createdAt",
  marketSnapshots: "++id, symbol, capturedAt",
  settings: "id, updatedAt",
};

export const storesV2 = {
  allocationRules: "++id, preset, updatedAt",
  incomes: "++id, happenedAt, createdAt",
  allocations: "++id, incomeId, bucket, createdAt",
  funds: "++id, category, dueAt, updatedAt",
  assets: "++id, kind, symbol, updatedAt",
  transactions: "++id, assetId, incomeId, planItemId, type, happenedAt, createdAt",
  marketSnapshots: "++id, symbol, capturedAt",
  planItems: "++id, incomeId, bucket, targetType, targetId, updatedAt",
  settings: "id, updatedAt",
};

export const storesV4 = {
  ...storesV2,
  marketWatchlist: "++id, &marketId, symbol, updatedAt",
};

export const storesV5 = {
  ...storesV4,
  marketAlerts: "++id, marketId, symbol, kind, enabled, updatedAt",
};

export const storesV6 = {
  ...storesV5,
  recoverySnapshots: "++id, createdAt, reason",
  appMeta: "&key, updatedAt",
};

export const storesV7 = {
  ...storesV6,
  marketWatchlist: "++id, &[source+marketId], marketId, symbol, updatedAt",
  marketAlerts: "++id, [source+marketId], marketId, symbol, kind, enabled, updatedAt",
};
