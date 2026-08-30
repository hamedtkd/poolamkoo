import test from "node:test";
import assert from "node:assert/strict";
import { createTransferPin, decodeTransferSignal, encodeTransferSignal, splitTransferText, validateTransferData, validateTransferSchema } from "../lib/device-transfer.ts";
import { LOCAL_DATABASE_SCHEMA_VERSION } from "../lib/app-version.ts";

test("device transfer pairing codes round-trip and expire", () => {
  const createdAt = new Date("2026-08-25T12:00:00.000Z").toISOString();
  const code = encodeTransferSignal({ format: "poolamkoo-device-signal", version: 1, role: "offer", createdAt, description: { type: "offer", sdp: "v=0\\r\\n" } });
  const decoded = decodeTransferSignal(code, "offer", new Date("2026-08-25T12:10:00.000Z").getTime());
  assert.equal(decoded.description.sdp, "v=0\\r\\n");
  assert.throws(() => decodeTransferSignal(code, "offer", new Date("2026-08-25T12:30:01.000Z").getTime()), /منقضی/);
});

test("device transfer accepts previous pairing codes while normalizing to Poolamkoo", () => {
  const legacyFormat = ["poolam", "co", "-device-signal"].join("");
  const createdAt = new Date("2026-08-25T12:00:00.000Z").toISOString();
  const code = encodeTransferSignal({ format: legacyFormat, version: 1, role: "offer", createdAt, description: { type: "offer", sdp: "v=0\r\n" } } as never);
  const decoded = decodeTransferSignal(code, "offer", new Date("2026-08-25T12:05:00.000Z").getTime());
  assert.equal(decoded.format, "poolamkoo-device-signal");
});

test("device transfer PIN is short, readable and random enough for a one-time session", () => {
  const pin = createTransferPin();
  assert.match(pin, /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/);
});

test("transfer payload preview validates required Poolamkoo data", () => {
  const preview = validateTransferData({
    allocationRules: [{}], incomes: [{}, {}], allocations: [], funds: [{}], assets: [{}, {}], transactions: [{}, {}, {}],
    settings: [{ id: "settings" }], planItems: [{}], marketWatchlist: [{ marketId: "legacy-watch" }], marketAlerts: [{ marketId: "legacy-alert-1" }, { marketId: "legacy-alert-2" }],
  });
  assert.deepEqual(preview, { incomes: 2, funds: 1, assets: 2, transactions: 3, planItems: 1, watchlist: 1, alerts: 2, total: 12 });
});

test("large transfer payload is split into bounded chunks", () => {
  const chunks = splitTransferText("x".repeat(50_000), 10_000);
  assert.equal(chunks.length, 5);
  assert.ok(chunks.every((chunk) => chunk.length <= 10_000));
});


test("device transfer rejects data from a newer local schema before import", () => {
  assert.equal(validateTransferSchema(), "legacy");
  assert.throws(() => validateTransferSchema(LOCAL_DATABASE_SCHEMA_VERSION + 1), /نسخه جدیدتری/);
});
