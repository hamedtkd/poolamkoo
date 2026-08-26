import { createBackupEnvelope, openBackupEnvelope, verifyBackupEnvelopeIntegrity } from "@/lib/crypto";
import { assertSupportedDataSchema, validatePortableData, type PortableDataPreview } from "@/lib/data-portability";
import { deleteAppMeta, setAppMeta } from "@/lib/app-meta";
import { exportDatabaseObject, importDatabaseObject } from "@/lib/db";
import { createRecoverySnapshot } from "@/lib/recovery";
import type { BackupEnvelope } from "@/lib/types";

export const BACKUP_LAST_SUCCESS_KEY = "backup:last-success";
export const BACKUP_SNOOZE_UNTIL_KEY = "backup:snooze-until";

export type BackupInspection = {
  exportedAt: string;
  encrypted: boolean;
  envelopeVersion: 1 | 2;
  schemaVersion?: number;
  appVersion?: string;
  compatibility: "legacy" | "older" | "current";
  preview: PortableDataPreview;
};

type ReadBackupResult = BackupInspection & { data: Record<string, unknown> };

function withoutData(result: ReadBackupResult): BackupInspection {
  return {
    exportedAt: result.exportedAt, encrypted: result.encrypted, envelopeVersion: result.envelopeVersion,
    schemaVersion: result.schemaVersion, appVersion: result.appVersion, compatibility: result.compatibility, preview: result.preview,
  };
}

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

function validateEnvelope(envelope: BackupEnvelope) {
  if (envelope?.format !== "poolyar-backup" || ![1, 2].includes(envelope?.version) || typeof envelope?.payload !== "string" || typeof envelope?.encrypted !== "boolean") {
    throw new Error("فایل بکاپ معتبر پولم‌کو نیست.");
  }
  if (typeof envelope.exportedAt !== "string" || !Number.isFinite(new Date(envelope.exportedAt).getTime())) throw new Error("تاریخ بکاپ معتبر نیست.");
  if (envelope.version === 2 && envelope.schemaVersion === undefined) throw new Error("بکاپ جدید نسخه ساختار داده را مشخص نکرده است.");
  if (envelope.appVersion !== undefined && typeof envelope.appVersion !== "string") throw new Error("نسخه برنامه در فایل بکاپ معتبر نیست.");
  return envelope;
}

async function readDatabaseBackup(file: File, password?: string): Promise<ReadBackupResult> {
  let envelope: BackupEnvelope;
  try {
    envelope = validateEnvelope(JSON.parse(await file.text()) as BackupEnvelope);
  } catch (error) {
    if (error instanceof Error && /پولم‌کو|بکاپ/.test(error.message)) throw error;
    throw new Error("فایل انتخاب‌شده JSON معتبر نیست.");
  }
  await verifyBackupEnvelopeIntegrity(envelope);
  const compatibility = assertSupportedDataSchema(envelope.version === 2 ? envelope.schemaVersion : undefined);
  const raw = await openBackupEnvelope(envelope, password || undefined);
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error("محتوای بکاپ قابل خواندن نیست.");
  }
  const preview = validatePortableData(data);
  return {
    data, preview, compatibility, exportedAt: envelope.exportedAt, encrypted: envelope.encrypted,
    envelopeVersion: envelope.version, schemaVersion: envelope.schemaVersion, appVersion: envelope.appVersion,
  };
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

export async function inspectDatabaseBackup(file: File, password?: string): Promise<BackupInspection> {
  return withoutData(await readDatabaseBackup(file, password));
}

export async function restoreDatabaseBackup(file: File, password?: string) {
  const result = await readDatabaseBackup(file, password);
  await createRecoverySnapshot("قبل از بازیابی فایل بکاپ");
  await importDatabaseObject(result.data);
  return withoutData(result);
}
