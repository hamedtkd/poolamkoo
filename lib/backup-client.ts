import { createBackupEnvelope, openBackupEnvelope } from "@/lib/crypto";
import { deleteAppMeta, setAppMeta } from "@/lib/app-meta";
import { exportDatabaseObject, importDatabaseObject } from "@/lib/db";
import { createRecoverySnapshot } from "@/lib/recovery";
import type { BackupEnvelope } from "@/lib/types";

export const BACKUP_LAST_SUCCESS_KEY = "backup:last-success";
export const BACKUP_SNOOZE_UNTIL_KEY = "backup:snooze-until";

function triggerDownload(contents: string, filename: string) {
  const blob = new Blob([contents], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function downloadDatabaseBackup(options: { encrypted: boolean; password?: string }) {
  if (options.encrypted && (options.password?.length ?? 0) < 6) throw new Error("برای بکاپ رمزنگاری‌شده رمزی با حداقل ۶ کاراکتر وارد کن.");
  const payload = await exportDatabaseObject();
  const envelope = await createBackupEnvelope(JSON.stringify(payload), options.encrypted ? options.password : undefined);
  const day = new Date().toISOString().slice(0, 10);
  triggerDownload(JSON.stringify(envelope, null, 2), `poolamco-backup-${day}.json`);
  await setAppMeta(BACKUP_LAST_SUCCESS_KEY, envelope.exportedAt);
  await deleteAppMeta(BACKUP_SNOOZE_UNTIL_KEY);
  return envelope.exportedAt;
}

export async function restoreDatabaseBackup(file: File, password?: string) {
  let envelope: BackupEnvelope;
  try {
    envelope = JSON.parse(await file.text()) as BackupEnvelope;
  } catch {
    throw new Error("فایل انتخاب‌شده JSON معتبر نیست.");
  }
  if (envelope?.format !== "poolyar-backup" || envelope?.version !== 1 || typeof envelope.payload !== "string") {
    throw new Error("فایل بکاپ معتبر پولم‌کو نیست.");
  }
  const raw = await openBackupEnvelope(envelope, password || undefined);
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error("محتوای بکاپ قابل خواندن نیست.");
  }
  await createRecoverySnapshot("قبل از بازیابی فایل بکاپ");
  await importDatabaseObject(data);
  return envelope.exportedAt;
}
