import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");

test("settings use one categorized navigation and search registry", () => {
  const model = read("components/settings/settings-navigation-model.ts");
  for (const route of ["general", "money", "market", "data", "transfer", "privacy", "about"]) {
    assert.equal(model.includes(`/settings/${route}`), true);
    assert.equal(read(`app/(workspace)/settings/${route}/page.tsx`).includes(`category=\"${route}\"`), true);
  }
  assert.equal(model.includes("settingsSearchItems"), true);
  assert.equal(model.includes("/settings/market#market-details"), true);
  assert.equal(model.includes("/settings/data#backup-restore"), true);
});

test("settings overview stays compact and route content replaces the old card wall", () => {
  const page = read("app/(workspace)/settings/page.tsx");
  const overview = read("components/settings/settings-overview.tsx");
  const routeContent = read("components/settings/settings-route-content.tsx");
  const legacySection = read("components/sections/settings.tsx");
  assert.equal(page.includes("SettingsOverview"), true);
  assert.equal(overview.includes("settingsCategories.map"), true);
  assert.equal(routeContent.includes("SettingsAnchor"), true);
  assert.equal(routeContent.includes("DataHealthCard"), true);
  assert.equal(legacySection.includes("RevealGrid"), false);
});

test("settings search and global search share deep-linkable settings items", () => {
  const settingsSearch = read("components/settings/settings-search.tsx");
  const globalSearch = read("components/app/global-search.tsx");
  assert.equal(settingsSearch.includes("settingsSearchItems"), true);
  assert.equal(settingsSearch.includes("normalizeSearchText"), true);
  assert.equal(settingsSearch.includes("router.push(item.href)"), true);
  assert.equal(globalSearch.includes("settingsSearchItems.map"), true);
  assert.equal(globalSearch.includes("تنظیم ·"), true);
});

test("market settings keep technical provider detail collapsed by default", () => {
  const market = read("components/settings/market-status-card.tsx");
  assert.equal(market.includes('<details id="market-details"'), true);
  assert.equal(market.includes("جزئیات فنی Providerها و سهمیه"), true);
  assert.equal(market.includes("محافظت Launch و سهمیه"), true);
  assert.equal(market.includes("کپی Diagnostic امن"), true);
});


test("appearance settings expose a local-first custom color builder without a schema bump", () => {
  const appearance = read("components/settings/appearance-settings-card.tsx");
  const dialog = read("components/settings/custom-theme-color-dialog.tsx");
  const theme = read("hooks/use-app-theme.ts");
  const types = read("lib/types.ts");
  const db = read("lib/db.ts");
  assert.equal(appearance.includes("CustomThemeColorDialog"), true);
  assert.equal(appearance.includes('settings.palette === "custom"'), true);
  assert.equal(dialog.includes("SaturationValueField"), true);
  assert.equal(dialog.includes('type="range"'), true);
  assert.equal(dialog.includes("aria-valuenow"), true);
  assert.equal(dialog.includes("useEffect"), false);
  assert.equal(appearance.includes("customOpen ? <CustomThemeColorDialog"), true);
  assert.equal(dialog.includes("savedThemeColors"), true);
  assert.equal(dialog.includes("پیش‌نمایش زنده"), true);
  assert.equal(theme.includes("previewCustomColor"), true);
  assert.equal(theme.includes("setCustomPalette"), true);
  assert.equal(theme.includes("buildCustomThemeTokens"), true);
  assert.equal(types.includes('PresetThemePalette | "custom"'), true);
  assert.equal(db.includes('customThemeColor: "#db2777"'), true);
  assert.equal(db.includes("savedThemeColors: []"), true);
});
