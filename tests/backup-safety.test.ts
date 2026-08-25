import test from "node:test";
import assert from "node:assert/strict";
import { calculateBackupHealth, recoverySnapshotIdsToPrune } from "../lib/backup-safety.ts";

const now = new Date("2026-08-25T12:00:00.000Z");

test("backup reminder waits for meaningful use and then warns when no backup exists", () => {
  const empty = calculateBackupHealth({ meaningfulCount: 0, now });
  assert.equal(empty.shouldRemind, false);
  const recent = calculateBackupHealth({ meaningfulCount: 2, firstMeaningfulAt: "2026-08-25T00:00:00.000Z", now });
  assert.equal(recent.state, "never");
  assert.equal(recent.shouldRemind, false);
  const old = calculateBackupHealth({ meaningfulCount: 2, firstMeaningfulAt: "2026-08-23T00:00:00.000Z", now });
  assert.equal(old.shouldRemind, true);
});

test("backup reminder becomes due after seven days and respects snooze", () => {
  const due = calculateBackupHealth({ meaningfulCount: 4, lastBackupAt: "2026-08-17T12:00:00.000Z", now });
  assert.equal(due.state, "due");
  assert.equal(due.ageDays, 8);
  assert.equal(due.shouldRemind, true);
  const snoozed = calculateBackupHealth({ meaningfulCount: 4, lastBackupAt: "2026-08-17T12:00:00.000Z", snoozedUntil: "2026-08-27T12:00:00.000Z", now });
  assert.equal(snoozed.due, true);
  assert.equal(snoozed.shouldRemind, false);
});

test("recovery history keeps the five newest snapshots", () => {
  const rows = [9, 8, 7, 6, 5, 4, 3].map((id) => ({ id }));
  assert.deepEqual(recoverySnapshotIdsToPrune(rows), [4, 3]);
});
