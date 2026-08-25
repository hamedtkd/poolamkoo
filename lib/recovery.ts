import { recoverySnapshotIdsToPrune } from "@/lib/backup-safety";
import { db, exportDatabaseObject, importDatabaseObject } from "@/lib/db";

export async function createRecoverySnapshot(reason: string) {
  const payload = await exportDatabaseObject();
  payload.marketSnapshots = []; // market cache is re-fetchable and would make local recovery points unnecessarily large
  const itemCount = payload.incomes.length + payload.transactions.length + payload.planItems.length + payload.allocations.length;
  const id = await db.recoverySnapshots.add({ reason, payload: JSON.stringify(payload), itemCount, createdAt: new Date().toISOString() });
  const snapshots = await db.recoverySnapshots.orderBy("createdAt").reverse().toArray();
  const oldIds = recoverySnapshotIdsToPrune(snapshots);
  if (oldIds.length) await db.recoverySnapshots.bulkDelete(oldIds);
  return id;
}

export async function ensurePeriodicRecoverySnapshot(minAgeMs = 24 * 60 * 60 * 1000) {
  const latest = await db.recoverySnapshots.orderBy("createdAt").last();
  if (latest && Date.now() - new Date(latest.createdAt).getTime() < minAgeMs) return latest.id;
  return createRecoverySnapshot("نقطه بازیابی خودکار");
}

export async function restoreRecoverySnapshot(id: number) {
  const snapshot = await db.recoverySnapshots.get(id);
  if (!snapshot) throw new Error("نقطه بازیابی پیدا نشد.");
  const parsed = JSON.parse(snapshot.payload) as Record<string, unknown>;
  await createRecoverySnapshot("قبل از بازگردانی نقطه بازیابی");
  await importDatabaseObject(parsed);
}
