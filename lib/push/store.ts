import { createHash } from "node:crypto";
import { pushServerConfig } from "@/lib/push/config";
import type { PushDeviceRecord } from "@/lib/push/types";

const DEVICE_SET = "poolamco:push:devices:v1";
const DEVICE_PREFIX = "poolamco:push:device:v1:";
const DEVICE_TTL_SECONDS = 60 * 60 * 24 * 120;

function deviceId(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function redisCommand<T = unknown>(args: Array<string | number>) {
  const config = pushServerConfig();
  if (!config.redisUrl || !config.redisToken) throw new Error("Push storage is not configured.");
  const response = await fetch(config.redisUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.redisToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });
  const payload = await response.json().catch(() => null) as { result?: T; error?: string } | null;
  if (!response.ok || !payload || payload.error) throw new Error(payload?.error || `Push storage ${response.status}`);
  return payload.result as T;
}

export async function savePushDevice(token: string, record: PushDeviceRecord) {
  const id = deviceId(token);
  await redisCommand(["SET", `${DEVICE_PREFIX}${id}`, JSON.stringify(record), "EX", DEVICE_TTL_SECONDS]);
  await redisCommand(["SADD", DEVICE_SET, id]);
  return id;
}

export async function getPushDevice(token: string) {
  const raw = await redisCommand<string | null>(["GET", `${DEVICE_PREFIX}${deviceId(token)}`]);
  return raw ? JSON.parse(raw) as PushDeviceRecord : null;
}

export async function removePushDevice(token: string) {
  const id = deviceId(token);
  await redisCommand(["DEL", `${DEVICE_PREFIX}${id}`]);
  await redisCommand(["SREM", DEVICE_SET, id]);
}

export async function removePushDeviceById(id: string) {
  await redisCommand(["DEL", `${DEVICE_PREFIX}${id}`]);
  await redisCommand(["SREM", DEVICE_SET, id]);
}

export async function listPushDevices(limit = 200) {
  const ids = (await redisCommand<string[]>(["SMEMBERS", DEVICE_SET]) ?? []).slice(0, limit);
  if (!ids.length) return [];
  const rows = await redisCommand<Array<string | null>>(["MGET", ...ids.map((id) => `${DEVICE_PREFIX}${id}`)]);
  const records: Array<{ id: string; record: PushDeviceRecord }> = [];
  const stale: string[] = [];
  ids.forEach((id, index) => {
    const raw = rows?.[index];
    if (!raw) { stale.push(id); return; }
    try { records.push({ id, record: JSON.parse(raw) as PushDeviceRecord }); } catch { stale.push(id); }
  });
  if (stale.length) await redisCommand(["SREM", DEVICE_SET, ...stale]);
  return records;
}

export async function savePushDeviceById(id: string, record: PushDeviceRecord) {
  await redisCommand(["SET", `${DEVICE_PREFIX}${id}`, JSON.stringify(record), "EX", DEVICE_TTL_SECONDS]);
  await redisCommand(["SADD", DEVICE_SET, id]);
}
