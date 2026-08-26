import { assertSupportedDataSchema, validatePortableData, type PortableDataPreview } from "./data-portability.ts";
import type { BackupEnvelope } from "@/lib/types";

export const DEVICE_TRANSFER_SIGNAL_FORMAT = "poolamkoo-device-signal";
export const DEVICE_TRANSFER_SIGNAL_VERSION = 1;
const SUPPORTED_DEVICE_TRANSFER_SIGNAL_FORMAT = /^poolam(?:co|koo)-device-signal$/;
export const DEVICE_TRANSFER_SIGNAL_MAX_AGE_MS = 20 * 60 * 1000;
export const DEVICE_TRANSFER_CHUNK_SIZE = 24_000;

export type TransferRole = "offer" | "answer";
export type TransferSignalPacket = {
  format: typeof DEVICE_TRANSFER_SIGNAL_FORMAT;
  version: typeof DEVICE_TRANSFER_SIGNAL_VERSION;
  role: TransferRole;
  createdAt: string;
  description: { type: "offer" | "answer"; sdp: string };
};

export type TransferPreview = PortableDataPreview;

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export function createTransferPin() {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join("");
}

export function encodeTransferSignal(packet: TransferSignalPacket) {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(packet)));
}

export function decodeTransferSignal(value: string, expectedRole?: TransferRole, now = Date.now()) {
  if (value.length > 100_000) throw new Error("کد اتصال بیش از حد بزرگ است.");
  let packet: TransferSignalPacket;
  try {
    const raw = new TextDecoder().decode(base64UrlToBytes(value.trim().replace(/\s+/g, "")));
    packet = JSON.parse(raw) as TransferSignalPacket;
  } catch {
    throw new Error("کد اتصال قابل خواندن نیست.");
  }
  if (!SUPPORTED_DEVICE_TRANSFER_SIGNAL_FORMAT.test(String(packet.format)) || packet.version !== DEVICE_TRANSFER_SIGNAL_VERSION) {
    throw new Error("این کد اتصال مربوط به نسخه پشتیبانی‌شده پولم‌کو نیست.");
  }
  packet = { ...packet, format: DEVICE_TRANSFER_SIGNAL_FORMAT };
  if (expectedRole && packet.role !== expectedRole) throw new Error("کد اتصال مربوط به مرحله دیگری از انتقال است.");
  if (!packet.description?.sdp || packet.description.type !== packet.role) throw new Error("کد اتصال ناقص است.");
  const createdAt = new Date(packet.createdAt).getTime();
  if (!Number.isFinite(createdAt) || now - createdAt > DEVICE_TRANSFER_SIGNAL_MAX_AGE_MS) throw new Error("کد اتصال منقضی شده؛ یک انتقال جدید شروع کن.");
  return packet;
}

export function splitTransferText(value: string, size = DEVICE_TRANSFER_CHUNK_SIZE) {
  if (size < 1024) throw new Error("اندازه قطعه انتقال معتبر نیست.");
  const chunks: string[] = [];
  for (let index = 0; index < value.length; index += size) chunks.push(value.slice(index, index + size));
  return chunks;
}

export function validateTransferData(data: Record<string, unknown>): TransferPreview {
  return validatePortableData(data);
}

export function validateTransferSchema(schemaVersion?: number) {
  return assertSupportedDataSchema(schemaVersion);
}

export function validateTransferEnvelope(envelope: BackupEnvelope) {
  if (envelope?.format !== "poolyar-backup" || envelope.version !== 1 || !envelope.encrypted || typeof envelope.payload !== "string") {
    throw new Error("بسته انتقال معتبر یا رمزنگاری‌شده پولم‌کو نیست.");
  }
  return envelope;
}
