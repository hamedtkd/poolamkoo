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
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function createBackupEnvelope(rawJson: string, password?: string): Promise<BackupEnvelope> {
  if (!password) {
    return { format: "poolyar-backup", version: 1, exportedAt: new Date().toISOString(), encrypted: false, payload: rawJson };
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(rawJson));
  return {
    format: "poolyar-backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    encrypted: true,
    payload: bytesToBase64(new Uint8Array(encrypted)),
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
  };
}

export async function openBackupEnvelope(envelope: BackupEnvelope, password?: string) {
  if (!envelope.encrypted) return envelope.payload;
  if (!password || !envelope.salt || !envelope.iv) throw new Error("این بکاپ به رمز عبور نیاز دارد.");
  const salt = base64ToBytes(envelope.salt);
  const iv = base64ToBytes(envelope.iv);
  const key = await deriveKey(password, salt);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, base64ToBytes(envelope.payload) as BufferSource);
  return new TextDecoder().decode(decrypted);
}
