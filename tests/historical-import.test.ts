import assert from "node:assert/strict";
import test from "node:test";
import { historicalImportSummary, parseHistoricalCsv, prepareHistoricalImport, toInvestmentTransaction } from "../lib/historical-import.ts";
import { getPersianParts } from "../lib/persian-date.ts";
import type { Asset, InvestmentTransaction } from "../lib/types.ts";

const assets: Asset[] = [
  { id: 1, name: "دلار", kind: "currency", symbol: "USD", targetPct: 30, icon: "dollar", archived: false, createdAt: "", updatedAt: "" },
  { id: 2, name: "شستا", kind: "stock", symbol: "SHASTA", targetPct: 0, manualPriceToman: 1_000, icon: "stock", archived: false, createdAt: "", updatedAt: "" },
];

test("historical CSV accepts Persian headers, digits and Persian calendar dates", () => {
  const rows = parseHistoricalCsv("دارایی,نماد,نوع,مقدار,قیمت واحد تومان,تاریخ,یادداشت\nدلار,USD,خرید,۱۲۰,۸۵۰۰۰,۱۴۰۵/۰۳/۰۱,قدیمی");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].quantity, 120);
  assert.equal(rows[0].unitPriceToman, 85_000);
  assert.equal(rows[0].type, "buy");
  assert.ok(rows[0].happenedAt);
  assert.deepEqual(getPersianParts(new Date(`${rows[0].happenedAt}T12:00:00`)), { year: 1405, month: 3, day: 1 });
});

test("type column is optional and defaults historical rows to buy", () => {
  const rows = parseHistoricalCsv("asset,symbol,quantity,unit_price_toman,date\nDollar,USD,120,85000,2026-05-22");
  assert.equal(rows[0].type, "buy");
  const prepared = prepareHistoricalImport(rows, assets, []);
  assert.equal(prepared[0].asset?.id, 1);
  assert.equal(prepared[0].status, "valid");
});

test("exact existing and in-file transactions are marked duplicate", () => {
  const existing: InvestmentTransaction[] = [{ assetId: 1, type: "buy", amountToman: 100_000, quantity: 10, unitPriceToman: 10_000, happenedAt: "2026-01-01", createdAt: "" }];
  const rows = parseHistoricalCsv("asset,type,quantity,price,date\nدلار,buy,10,10000,2026-01-01\nدلار,buy,5,11000,2026-01-02\nدلار,buy,5,11000,2026-01-02");
  const prepared = prepareHistoricalImport(rows, assets, existing);
  assert.deepEqual(prepared.map((row) => row.status), ["duplicate", "valid", "duplicate"]);
  assert.deepEqual(historicalImportSummary(prepared), { valid: 1, invalid: 0, duplicate: 2 });
});

test("historical sell cannot exceed quantity available on that date", () => {
  const rows = parseHistoricalCsv("asset,type,quantity,price,date\nدلار,buy,10,10000,2026-01-01\nدلار,sell,12,12000,2026-01-02");
  const prepared = prepareHistoricalImport(rows, assets, []);
  assert.equal(prepared[0].status, "valid");
  assert.equal(prepared[1].status, "invalid");
  assert.match(prepared[1].errors.join(" "), /موجودی/);
});

test("prepared row converts to a canonical investment transaction", () => {
  const rows = prepareHistoricalImport(parseHistoricalCsv("asset,type,quantity,price,date,note\nشستا,خرید,100,2000,2026-02-10,IPO"), assets, []);
  const tx = toInvestmentTransaction(rows[0], "2026-08-24T00:00:00.000Z");
  assert.ok(tx);
  assert.equal(tx.assetId, 2);
  assert.equal(tx.amountToman, 200_000);
  assert.equal(tx.note, "IPO");
});
