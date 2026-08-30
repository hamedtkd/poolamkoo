import test from "node:test";
import assert from "node:assert/strict";
import { assertSupportedDataSchema, validatePortableData } from "../lib/data-portability.ts";
import { LOCAL_DATABASE_SCHEMA_VERSION } from "../lib/app-version.ts";
import { createBackupEnvelope, openBackupEnvelope, verifyBackupEnvelopeIntegrity } from "../lib/crypto.ts";

const validData = {
  allocationRules: [{}], incomes: [{}, {}], allocations: [], funds: [{}], assets: [{}, {}], transactions: [{}, {}, {}],
  settings: [{ id: "settings" }], planItems: [{}], marketWatchlist: [{ marketId: "legacy-watch" }], marketAlerts: [{ marketId: "legacy-alert-1" }, { marketId: "legacy-alert-2" }],
};

async function recalculateV2Digest(envelope: Awaited<ReturnType<typeof createBackupEnvelope>>) {
  const metadata = JSON.stringify({
    format: envelope.format, version: envelope.version, exportedAt: envelope.exportedAt, encrypted: envelope.encrypted,
    schemaVersion: envelope.schemaVersion, appVersion: envelope.appVersion,
  });
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${metadata}\n${envelope.payload}`));
  let binary = "";
  new Uint8Array(digest).forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

test("portable data preview validates required local-first tables", () => {
  assert.deepEqual(validatePortableData(validData), {
    incomes: 2, funds: 1, fundMovements: 0, assets: 2, transactions: 3, planItems: 1, watchlist: 1, alerts: 2, total: 12,
  });
  assert.throws(() => validatePortableData({ ...validData, settings: [] }), /تنظیمات معتبر/);
});

test("data schema compatibility accepts legacy/older data and rejects future data", () => {
  assert.equal(assertSupportedDataSchema(), "legacy");
  assert.equal(assertSupportedDataSchema(LOCAL_DATABASE_SCHEMA_VERSION), "current");
  assert.equal(assertSupportedDataSchema(Math.max(1, LOCAL_DATABASE_SCHEMA_VERSION - 1)), "older");
  assert.throws(() => assertSupportedDataSchema(LOCAL_DATABASE_SCHEMA_VERSION + 1), /نسخه جدیدتری/);
});

test("new backup envelopes include a corruption digest and schema metadata", async () => {
  const envelope = await createBackupEnvelope(JSON.stringify(validData));
  assert.equal(envelope.version, 2);
  assert.equal(envelope.schemaVersion, LOCAL_DATABASE_SCHEMA_VERSION);
  assert.ok(envelope.digest);
  assert.deepEqual(JSON.parse(await openBackupEnvelope(envelope)), validData);
});

test("tampered v2 backup payloads are rejected before restore", async () => {
  const envelope = await createBackupEnvelope(JSON.stringify(validData));
  const tampered = { ...envelope, payload: `${envelope.payload} ` };
  await assert.rejects(() => verifyBackupEnvelopeIntegrity(tampered), /صحت فایل بکاپ/);
});



test("encrypted v2 backups authenticate schema metadata with AES-GCM", async () => {
  const envelope = await createBackupEnvelope(JSON.stringify(validData), "strong-pass");
  assert.deepEqual(JSON.parse(await openBackupEnvelope(envelope, "strong-pass")), validData);
  const tampered = { ...envelope, schemaVersion: LOCAL_DATABASE_SCHEMA_VERSION + 1 };
  tampered.digest = await recalculateV2Digest(tampered);
  await assert.rejects(() => openBackupEnvelope(tampered, "strong-pass"), (error: unknown) => error instanceof Error && error.name === "OperationError");
});

test("legacy v1 backup envelopes remain readable", async () => {
  const envelope = await createBackupEnvelope(JSON.stringify(validData), undefined, { version: 1 });
  assert.equal(envelope.version, 1);
  assert.equal(envelope.digest, undefined);
  assert.deepEqual(JSON.parse(await openBackupEnvelope(envelope)), validData);
});
