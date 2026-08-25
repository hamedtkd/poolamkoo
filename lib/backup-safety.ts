export const BACKUP_STALE_DAYS = 7;
export const BACKUP_FIRST_REMINDER_HOURS = 24;
export const BACKUP_SNOOZE_DAYS = 3;
export const MAX_RECOVERY_SNAPSHOTS = 5;

type BackupHealthInput = {
  lastBackupAt?: string;
  snoozedUntil?: string;
  meaningfulCount: number;
  firstMeaningfulAt?: string;
  now?: Date;
};

export type BackupHealthState = "empty" | "fresh" | "due" | "never";

export type BackupHealth = {
  state: BackupHealthState;
  due: boolean;
  shouldRemind: boolean;
  ageDays: number | null;
  lastBackupAt?: string;
};

function validTime(value?: string) {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}

export function calculateBackupHealth(input: BackupHealthInput): BackupHealth {
  const now = (input.now ?? new Date()).getTime();
  if (input.meaningfulCount <= 0) return { state: "empty", due: false, shouldRemind: false, ageDays: null };

  const lastBackup = validTime(input.lastBackupAt);
  const snoozedUntil = validTime(input.snoozedUntil);
  const snoozed = snoozedUntil !== null && snoozedUntil > now;

  if (lastBackup === null) {
    const firstUse = validTime(input.firstMeaningfulAt) ?? now;
    const oldEnough = now - firstUse >= BACKUP_FIRST_REMINDER_HOURS * 60 * 60 * 1000;
    return { state: "never", due: true, shouldRemind: oldEnough && !snoozed, ageDays: null };
  }

  const ageDays = Math.max(0, Math.floor((now - lastBackup) / (24 * 60 * 60 * 1000)));
  const due = ageDays >= BACKUP_STALE_DAYS;
  return { state: due ? "due" : "fresh", due, shouldRemind: due && !snoozed, ageDays, lastBackupAt: input.lastBackupAt };
}

export function backupHealthLabel(health: BackupHealth) {
  if (health.state === "empty") return "هنوز داده مهمی ثبت نشده";
  if (health.state === "never") return "هنوز بکاپ نگرفته‌ای";
  if (health.state === "due") return `آخرین بکاپ ${new Intl.NumberFormat("fa-IR").format(health.ageDays ?? 0)} روز پیش بوده`;
  if ((health.ageDays ?? 0) === 0) return "امروز بکاپ گرفته‌ای";
  return `آخرین بکاپ ${new Intl.NumberFormat("fa-IR").format(health.ageDays ?? 0)} روز پیش بوده`;
}

export function recoverySnapshotIdsToPrune<T extends { id?: number }>(rows: T[], limit = MAX_RECOVERY_SNAPSHOTS) {
  return rows.slice(limit).map((row) => row.id).filter((value): value is number => typeof value === "number");
}
