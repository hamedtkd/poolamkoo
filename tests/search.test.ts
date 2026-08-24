import assert from "node:assert/strict";
import test from "node:test";
import { normalizeSearchText } from "../lib/search.ts";

test("global search normalizes Persian and Arabic variants", () => {
  assert.equal(normalizeSearchText("  صندوق   اضطراري "), "صندوق اضطراری");
  assert.equal(normalizeSearchText("سرمايه گذاري"), "سرمایه گذاری");
});

test("global search normalizes Persian and Arabic digits", () => {
  assert.equal(normalizeSearchText("۲۰٬۰۰۰"), "20000");
  assert.equal(normalizeSearchText("١٢٣"), "123");
});
