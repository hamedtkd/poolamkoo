import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const VERSION = "1.1.0";
const BRAND_HASHES = {
  mark: "fabbfff77baacc3480ada96e505980b1ea879385eda10c034ce6e151fc0c9d4b",
  dark: "9d1f72084f83b7098f302e27cabdaa616fc7ab54c7e8508d411252b588f2bdb1",
  fa: "5f0335d3314e8495cb1ec497b28c30113635244e88d7352d287744b2abce5317",
  en: "963971d37d437030a289e9fea26a0496ef22f018d58985ff556b8fba3426a279",
};

async function read(path) { return readFile(path, "utf8"); }
async function hash(path) { return createHash("sha256").update(await readFile(path)).digest("hex"); }

const [
  packageSource, lockSource, appVersionSource, releaseSource, priorBrandSource, priorLaunchSource, roadmapSource,
  quotaSource, reliabilitySource, brsSource, tsetmcSource, tindexSource, marketHookSource, marketApiSource, marketStatusCardSource,
  serviceWorkerSource, brandComponentSource, faviconSource, manifestSource, settingsModelSource, settingsSearchSource,
  settingsRouteSource, globalSearchSource, settingsPageSource, appearanceSource, customThemeSource, themeHookSource, themeColorSource, typesSource, dbSource,
  workspaceLoadingSource, skeletonSource,
  markHash, darkHash, faHash, enHash,
] = await Promise.all([
  read("package.json"), read("package-lock.json"), read("lib/app-version.ts"), read("docs/releases/1.1.0.md"),
  read("docs/releases/1.0.2.md"), read("docs/releases/1.0.1.md"), read("docs/ROADMAP.md"),
  read("lib/market/quota.ts"), read("lib/market/reliability.ts"), read("lib/market/brsapi.ts"), read("lib/market/tsetmc.ts"),
  read("lib/market/tindex.ts"), read("hooks/use-market.ts"), read("app/api/market/route.ts"), read("components/settings/market-status-card.tsx"),
  read("public/sw.js"), read("components/brand-logo.tsx"), read("public/favicon.svg"), read("public/app.webmanifest"),
  read("components/settings/settings-navigation-model.ts"), read("components/settings/settings-search.tsx"),
  read("components/settings/settings-route-content.tsx"), read("components/app/global-search.tsx"), read("app/(workspace)/settings/page.tsx"),
  read("components/settings/appearance-settings-card.tsx"), read("components/settings/custom-theme-color-dialog.tsx"), read("hooks/use-app-theme.ts"), read("lib/theme-color.ts"), read("lib/types.ts"), read("lib/db.ts"),
  read("app/(workspace)/loading.tsx"), read("components/skeletons/page-skeleton.tsx"),
  hash("public/brand/poolamkoo-mark.svg"), hash("public/brand/poolamkoo-dark.svg"), hash("public/brand/poolamkoo-fa-lockup.svg"), hash("public/brand/poolamkoo-en-lockup.svg"),
]);

const pkg = JSON.parse(packageSource);
const lock = JSON.parse(lockSource);
const categoryRoutes = ["general", "money", "market", "data", "transfer", "privacy", "about"];
const checks = [
  [pkg.version === VERSION, "package.json version must match v1.1.0"],
  [lock.version === VERSION && lock.packages?.[""]?.version === VERSION, "package-lock.json version must match v1.1.0"],
  [appVersionSource.includes(`APP_VERSION = "${VERSION}"`), "runtime app version must match v1.1.0"],
  [appVersionSource.includes("LOCAL_DATABASE_SCHEMA_VERSION = 8"), "settings IA release must not bump IndexedDB schema"],
  [releaseSource.includes("Searchable settings architecture") && releaseSource.includes("registry") && releaseSource.includes("deep-link") && releaseSource.includes("رنگ‌ساز سفارشی") && releaseSource.includes("schema 8"), "release note must document searchable Settings, custom theme color and unchanged data boundaries"],
  [roadmapSource.includes("v1.1.0 — Searchable settings architecture 🚧"), "roadmap must track the v1.1.0 settings release"],
  [categoryRoutes.every((route) => settingsModelSource.includes(`/settings/${route}`)), "settings registry must expose every accepted category route"],
  [settingsSearchSource.includes("settingsSearchItems") && settingsSearchSource.includes("normalizeSearchText") && settingsSearchSource.includes("router.push(item.href)"), "local Settings search must use the shared normalized deep-link registry"],
  [globalSearchSource.includes("settingsSearchItems.map") && globalSearchSource.includes("تنظیم ·"), "global search must include the same Settings registry"],
  [settingsPageSource.includes("SettingsOverview") && settingsRouteSource.includes("SettingsAnchor") && settingsRouteSource.includes("DataHealthCard") && settingsRouteSource.includes("DeviceTransferCard"), "Settings root must stay compact while focused routes render existing controls"],
  [workspaceLoadingSource.includes("RouteSkeleton") && !workspaceLoadingSource.includes("FullAppSkeleton") && skeletonSource.includes("useSidebarState") && skeletonSource.includes("effectiveCollapsed"), "workspace route loading must preserve the mounted app shell and bootstrap skeleton must follow sidebar state"],
  [appearanceSource.includes("CustomThemeColorDialog") && customThemeSource.includes("SaturationValueField") && customThemeSource.includes('type="range"') && customThemeSource.includes("savedThemeColors"), "appearance settings must expose the custom color builder, hue control and saved swatches"],
  [themeHookSource.includes("setCustomPalette") && themeHookSource.includes("previewCustomColor") && themeHookSource.includes("buildCustomThemeTokens"), "custom theme must support live preview and persisted derived tokens"],
  [themeColorSource.includes("readableForeground") && themeColorSource.includes("MAX_SAVED_THEME_COLORS = 8"), "custom theme color utilities must preserve contrast and saved-color bounds"],
  [typesSource.includes('PresetThemePalette | "custom"') && dbSource.includes('customThemeColor: "#db2777"') && dbSource.includes("savedThemeColors: []"), "local Settings defaults must support custom colors without a schema migration"],
  [marketStatusCardSource.includes('<details id="market-details"') && marketStatusCardSource.includes("محافظت Launch و سهمیه"), "market provider/quota diagnostics must remain available but collapsed by default"],
  [markHash === BRAND_HASHES.mark && darkHash === BRAND_HASHES.dark && faHash === BRAND_HASHES.fa && enHash === BRAND_HASHES.en, "owner-supplied SVG masters must remain byte-identical"],
  [brandComponentSource.includes('/brand/poolamkoo-mark.svg') && brandComponentSource.includes("MaskImage") && brandComponentSource.includes("bg-primary"), "runtime brand mark must keep the owner SVG as a theme-aware CSS mask"],
  [faviconSource.includes("prefers-color-scheme: dark") && faviconSource.includes('viewBox="0 0 475 383"'), "favicon must retain the accepted mark geometry and remain theme-aware"],
  [manifestSource.includes('"name": "پولم‌کو"') && manifestSource.includes('/icon-192.png') && manifestSource.includes('/maskable-512.png'), "PWA manifest must keep Persian naming and symbol launcher assets"],
  [serviceWorkerSource.includes('const CACHE = "poolamkoo-v70"') && serviceWorkerSource.includes('/logo-poolamkoo.svg'), "settings feature release must ship a fresh PWA cache"],
  [priorBrandSource.includes("Brand mark & PWA identity refresh") && priorLaunchSource.includes("Public launch & quota hardening"), "v1.1.0 must preserve the accepted v1.0.x brand and launch boundaries"],
  [quotaSource.includes("brsapiCoreQuotes: 180") && quotaSource.includes("tsetmcQuote: 120") && quotaSource.includes("tsetmcSearch: 600") && quotaSource.includes("MARKET_CLIENT_REUSE_MS = 30_000"), "quota constants must keep launch-safe cache/reuse windows"],
  [reliabilitySource.includes("activeProviderCooldown") && reliabilitySource.includes("retryAfterSeconds") && reliabilitySource.includes("guarded: true"), "provider cooldowns must remain intact"],
  [brsSource.includes("MARKET_CACHE_SECONDS.brsapiCoreQuotes") && tsetmcSource.includes("MARKET_CACHE_SECONDS.tsetmcQuote") && tindexSource.includes("MARKET_CACHE_SECONDS.tindexCoreFallback"), "providers must keep the central cache policy"],
  [marketHookSource.includes("recentResponse") && marketHookSource.includes("MARKET_CLIENT_REUSE_MS"), "client market request reuse must remain intact"],
  [marketApiSource.includes("s-maxage=60") && marketApiSource.includes('"private, no-store"'), "market CDN/privacy cache boundary must remain intact"],
];

for (const [ok, message] of checks) {
  if (!ok) { console.error(`Stable readiness check failed: ${message}`); process.exit(1); }
}

console.log("v1.1.0 stable metadata gate passed. Full production release gate completed before searchable-settings acceptance.");
