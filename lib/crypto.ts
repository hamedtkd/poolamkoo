import { APP_VERSION, LOCAL_DATABASE_SCHEMA_VERSION } from "./app-version.ts";
import type { BackupEnvelope } from "@/lib/types";

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function deriveKey(password: string, salt: Uint8Array) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: 210_000, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"],
  );
}

async function sha256Base64(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToBase64(new Uint8Array(digest));
}

function v2Metadata(envelope: Pick<BackupEnvelope, "format" | "version" | "exportedAt" | "encrypted" | "schemaVersion" | "appVersion">) {
  return JSON.stringify({
    format: envelope.format, version: envelope.version, exportedAt: envelope.exportedAt,
    encrypted: envelope.encrypted, schemaVersion: envelope.schemaVersion, appVersion: envelope.appVersion,
  });
}

function integrityInput(envelope: BackupEnvelope) {
  return `${v2Metadata(envelope)}\n${envelope.payload}`;
}

type BackupEnvelopeOptions = { version?: 1 | 2; schemaVersion?: number; appVersion?: string };

export async function createBackupEnvelope(rawJson: string, password?: string, options: BackupEnvelopeOptions = {}): Promise<BackupEnvelope> {
  const version = options.version ?? 2;
  const base: BackupEnvelope = {
    format: "poolyar-backup", version, exportedAt: new Date().toISOString(), encrypted: Boolean(password), payload: rawJson,
    schemaVersion: version === 2 ? options.schemaVersion ?? LOCAL_DATABASE_SCHEMA_VERSION : undefined,
    appVersion: version === 2 ? options.appVersion ?? APP_VERSION : undefined,
  };
  if (password) {
    const saltBytes = crypto.getRandomValues(new Uint8Array(16));
    const ivBytes = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, saltBytes);
    const algorithm: AesGcmParams = { name: "AES-GCM", iv: ivBytes };
    if (version === 2) algorithm.additionalData = new TextEncoder().encode(v2Metadata(base));
    const encrypted = await crypto.subtle.encrypt(algorithm, key, new TextEncoder().encode(rawJson));
    base.payload = bytesToBase64(new Uint8Array(encrypted));
    base.salt = bytesToBase64(saltBytes);
    base.iv = bytesToBase64(ivBytes);
  }
  if (version === 2) base.digest = await sha256Base64(integrityInput(base));
  return base;
}

export async function verifyBackupEnvelopeIntegrity(envelope: BackupEnvelope) {
  if (envelope.version !== 2) return;
  if (!envelope.digest) throw new Error("بکاپ جدید فاقد اطلاعات صحت فایل است.");
  if (await sha256Base64(integrityInput(envelope)) !== envelope.digest) throw new Error("صحت فایل بکاپ تأیید نشد؛ فایل ناقص یا تغییرکرده است.");
}

export async function openBackupEnvelope(envelope: BackupEnvelope, password?: string) {
  await verifyBackupEnvelopeIntegrity(envelope);
  if (!envelope.encrypted) return envelope.payload;
  if (!password || !envelope.salt || !envelope.iv) throw new Error("این بکاپ به رمز عبور نیاز دارد.");
  const salt = base64ToBytes(envelope.salt);
  const iv = base64ToBytes(envelope.iv);
  const key = await deriveKey(password, salt);
  const algorithm: AesGcmParams = { name: "AES-GCM", iv: iv as BufferSource };
  if (envelope.version === 2) algorithm.additionalData = new TextEncoder().encode(v2Metadata(envelope));
  const decrypted = await crypto.subtle.decrypt(algorithm, key, base64ToBytes(envelope.payload) as BufferSource);
  return new TextDecoder().decode(decrypted);
}
