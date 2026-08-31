import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_CUSTOM_THEME_COLOR,
  MAX_SAVED_THEME_COLORS,
  buildCustomThemeTokens,
  hexToHsv,
  hsvToHex,
  normalizeHexColor,
  normalizeSavedThemeColors,
  readableForeground,
} from "../lib/theme-color.ts";

test("custom theme normalizes hex and round-trips through HSV", () => {
  assert.equal(normalizeHexColor("#DB2777"), "#db2777");
  assert.equal(normalizeHexColor("abc"), "#aabbcc");
  assert.equal(normalizeHexColor("nope"), null);
  const source = "#3b82f6";
  const roundTrip = hsvToHex(hexToHsv(source));
  assert.equal(roundTrip, source);
});

test("custom theme chooses readable foreground and derives complete visual tokens", () => {
  assert.equal(readableForeground("#ffffff"), "#111111");
  assert.equal(readableForeground("#000000"), "#ffffff");
  const tokens = buildCustomThemeTokens(DEFAULT_CUSTOM_THEME_COLOR, false);
  assert.equal(tokens["--primary"], DEFAULT_CUSTOM_THEME_COLOR);
  assert.equal(typeof tokens["--primary-foreground"], "string");
  for (const key of ["--ring", "--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5", "--chart-canvas-up", "--glass-border"]) {
    assert.equal(Boolean(tokens[key as keyof typeof tokens]), true);
  }
});

test("saved custom colors stay valid, unique, ordered and bounded", () => {
  const many = ["#DB2777", "#db2777", "fff", "bad-value", "#000001", "#000002", "#000003", "#000004", "#000005", "#000006", "#000007", "#000008", "#000009"];
  const normalized = normalizeSavedThemeColors(many);
  assert.equal(normalized[0], "#db2777");
  assert.equal(normalized[1], "#ffffff");
  assert.equal(new Set(normalized).size, normalized.length);
  assert.equal(normalized.length, MAX_SAVED_THEME_COLORS);
});
