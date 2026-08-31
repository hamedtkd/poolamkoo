import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";

const VERSION = "1.1.1";
const BRAND_HASHES = {
  mark: "fabbfff77baacc3480ada96e505980b1ea879385eda10c034ce6e151fc0c9d4b",
  dark: "9d1f72084f83b7098f302e27cabdaa616fc7ab54c7e8508d411252b588f2bdb1",
  fa: "5f0335d3314e8495cb1ec497b28c30113635244e88d7352d287744b2abce5317",
  en: "963971d37d437030a289e9fea26a0496ef22f018d58985ff556b8fba3426a279",
};
const SHOWCASE = [
  "docs/assets/showcase/poolamkoo-overview-en.webp",
  "docs/assets/showcase/income-planning-en.webp",
  "docs/assets/showcase/funds-goals-en.webp",
  "docs/assets/showcase/reports-insights-en.webp",
  "docs/assets/showcase/settings-themes-en.webp",
];

async function read(path) { return readFile(path, "utf8"); }
async function hash(path) { return createHash("sha256").update(await readFile(path)).digest("hex"); }

const [
  packageSource, lockSource, appVersionSource, releaseSource, priorSettingsSource, priorBrandSource, priorLaunchSource, roadmapSource,
  quotaSource, reliabilitySource, brsSource, tsetmcSource, tindexSource, marketHookSource, marketApiSource, marketStatusCardSource,
  serviceWorkerSource, brandComponentSource, faviconSource, manifestSource, settingsModelSource, settingsSearchSource,
  settingsRouteSource, globalSearchSource, settingsPageSource, appearanceSource, customThemeSource, themeHookSource, themeColorSource, typesSource, dbSource,
  workspaceLoadingSource, skeletonSource, pendingPlanSource, readmeSource, readmeFaSource, showcaseDocsSource,
  markHash, darkHash, faHash, enHash, showcaseStats,
] = await Promise.all([
  read("package.json"), read("package-lock.json"), read("lib/app-version.ts"), read("docs/releases/1.1.1.md"),
  read("docs/releases/1.1.0.md"), read("docs/releases/1.0.2.md"), read("docs/releases/1.0.1.md"), read("docs/ROADMAP.md"),
  read("lib/market/quota.ts"), read("lib/market/reliability.ts"), read("lib/market/brsapi.ts"), read("lib/market/tsetmc.ts"),
  read("lib/market/tindex.ts"), read("hooks/use-market.ts"), read("app/api/market/route.ts"), read("components/settings/market-status-card.tsx"),
  read("public/sw.js"), read("components/brand-logo.tsx"), read("public/favicon.svg"), read("public/app.webmanifest"),
  read("components/settings/settings-navigation-model.ts"), read("components/settings/settings-search.tsx"),
  read("components/settings/settings-route-content.tsx"), read("components/app/global-search.tsx"), read("app/(workspace)/settings/page.tsx"),
  read("components/settings/appearance-settings-card.tsx"), read("components/settings/custom-theme-color-dialog.tsx"), read("hooks/use-app-theme.ts"), read("lib/theme-color.ts"), read("lib/types.ts"), read("lib/db.ts"),
  read("app/(workspace)/loading.tsx"), read("components/skeletons/page-skeleton.tsx"), read("components/investments/pending-plan-purchases.tsx"),
  read("README.md"), read("README.fa.md"), read("docs/assets/showcase/README.md"),
  hash("public/brand/poolamkoo-mark.svg"), hash("public/brand/poolamkoo-dark.svg"), hash("public/brand/poolamkoo-fa-lockup.svg"), hash("public/brand/poolamkoo-en-lockup.svg"),
  Promise.all(SHOWCASE.map((path) => stat(path))),
]);


const [formatSource, globalsSource, dashboardSource, investmentsSource, priceInputSource, cinematicHeroSource, landingVisualSource] = await Promise.all([
  read("lib/format.ts"), read("app/globals.css"), read("components/sections/dashboard.tsx"), read("components/sections/investments.tsx"),
  read("components/ui/price-input.tsx"), read("components/ui/cinematic-landing-hero.tsx"), read("components/landing/landing-product-visual.tsx"),
]);

const pkg = JSON.parse(packageSource);
const lock = JSON.parse(lockSource);
const categoryRoutes = ["general", "money", "market", "data", "transfer", "privacy", "about"];
const checks = [
  [pkg.version === VERSION, "package.json version must match v1.1.1"],
  [lock.version === VERSION && lock.packages?.[""]?.version === VERSION, "package-lock.json version must match v1.1.1"],
  [appVersionSource.includes(`APP_VERSION = "${VERSION}"`), "runtime app version must match v1.1.1"],
  [appVersionSource.includes("LOCAL_DATABASE_SCHEMA_VERSION = 8"), "investment queue UX patch must not bump IndexedDB schema"],
  [releaseSource.includes("Investment queue UX & GitHub showcase") && releaseSource.includes("چهار گروه") && releaseSource.includes("SensitiveValue") && releaseSource.includes("schema 8") && releaseSource.includes("سبز") && releaseSource.includes("comma استاندارد") && releaseSource.includes("Composition سینمایی"), "release note must document compact purchases plus financial semantics, number grouping and landing polish"],
  [globalsSource.includes("--profit: #15803d") && globalsSource.includes("--profit: #4ade80") && globalsSource.includes("--loss: #c62828") && globalsSource.includes("--loss: #f87171") && formatSource.includes('new Intl.NumberFormat("en-US"') && formatSource.includes("formatSignedMoney") && priceInputSource.includes("formatGroupedNumber"), "profit/loss colors and Persian money grouping must remain semantic and palette-independent"],
  [dashboardSource.includes("سود باز") && dashboardSource.includes("زیان باز") && dashboardSource.includes("text-profit") && dashboardSource.includes("text-loss") && investmentsSource.includes("formatSignedMoney"), "dashboard and investments must label and color open profit/loss explicitly"],
  [cinematicHeroSource.includes("پول می‌رسد") && cinematicHeroSource.includes("useReducedMotion") && cinematicHeroSource.includes("initial={false}") && landingVisualSource.includes("poolamkoo-income-mobile.webp") && landingVisualSource.includes('data-demo="true"'), "landing hero must stay readable, motion-safe and grounded in a real demo product capture"],
  [roadmapSource.includes("v1.1.0 — Searchable settings architecture ✅") && roadmapSource.includes("v1.1.1 — Investment queue UX & GitHub media 🚧"), "roadmap must close v1.1.0 and track the v1.1.1 UX patch"],
  [pendingPlanSource.includes("groupByIncome") && pendingPlanSource.includes("MAX_VISIBLE_GROUPS = 4") && pendingPlanSource.includes("open={defaultOpen}") && pendingPlanSource.includes("showAll ? groups") && pendingPlanSource.includes("SensitiveValue") && pendingPlanSource.includes("onBuy(item, asset)"), "pending investment purchases must group by income, stay compact, preserve privacy and keep exact PlanItem actions"],
  [SHOWCASE.every((path) => readmeSource.includes(`./${path}`)) && SHOWCASE.every((path) => readmeFaSource.includes(`./${path}`)), "both READMEs must render the canonical English GitHub showcase"],
  [showcaseStats.every((entry) => entry.size > 50_000) && showcaseDocsSource.includes("promotional compositions") && showcaseDocsSource.includes("outside the repository"), "GitHub showcase assets must exist and remain explicitly separate from exact screenshots/Persian social assets"],
  [categoryRoutes.every((route) => settingsModelSource.includes(`/settings/${route}`)), "v1.1.0 settings registry must remain intact"],
  [settingsSearchSource.includes("settingsSearchItems") && settingsSearchSource.includes("normalizeSearchText") && settingsSearchSource.includes("router.push(item.href)"), "local Settings search must keep the shared normalized deep-link registry"],
  [globalSearchSource.includes("settingsSearchItems.map") && globalSearchSource.includes("تنظیم ·"), "global search must keep the same Settings registry"],
  [settingsPageSource.includes("SettingsOverview") && settingsRouteSource.includes("SettingsAnchor") && settingsRouteSource.includes("DataHealthCard") && settingsRouteSource.includes("DeviceTransferCard"), "Settings root must remain compact while focused routes render existing controls"],
  [workspaceLoadingSource.includes("RouteSkeleton") && !workspaceLoadingSource.includes("FullAppSkeleton") && skeletonSource.includes("useSidebarState") && skeletonSource.includes("effectiveCollapsed"), "workspace route loading must preserve the mounted app shell and sidebar-aware bootstrap skeleton"],
  [appearanceSource.includes("CustomThemeColorDialog") && customThemeSource.includes("SaturationValueField") && customThemeSource.includes('type="range"') && customThemeSource.includes("savedThemeColors"), "custom theme builder must remain available"],
  [themeHookSource.includes("setCustomPalette") && themeHookSource.includes("previewCustomColor") && themeHookSource.includes("buildCustomThemeTokens"), "custom theme must keep live preview and persisted derived tokens"],
  [themeColorSource.includes("readableForeground") && themeColorSource.includes("MAX_SAVED_THEME_COLORS = 8"), "custom theme utilities must preserve contrast and saved-color bounds"],
  [typesSource.includes('PresetThemePalette | "custom"') && dbSource.includes('customThemeColor: "#db2777"') && dbSource.includes("savedThemeColors: []"), "local Settings defaults must keep custom colors without a schema migration"],
  [marketStatusCardSource.includes('<details id="market-details"') && marketStatusCardSource.includes("محافظت Launch و سهمیه"), "market provider/quota diagnostics must remain available but collapsed by default"],
  [markHash === BRAND_HASHES.mark && darkHash === BRAND_HASHES.dark && faHash === BRAND_HASHES.fa && enHash === BRAND_HASHES.en, "owner-supplied SVG masters must remain byte-identical"],
  [brandComponentSource.includes('/brand/poolamkoo-mark.svg') && brandComponentSource.includes("MaskImage") && brandComponentSource.includes("bg-primary"), "runtime brand mark must keep the owner SVG as a theme-aware CSS mask"],
  [faviconSource.includes("prefers-color-scheme: dark") && faviconSource.includes('viewBox="0 0 475 383"'), "favicon must retain accepted mark geometry and remain theme-aware"],
  [manifestSource.includes('"name": "پولم‌کو"') && manifestSource.includes('/icon-192.png') && manifestSource.includes('/maskable-512.png'), "PWA manifest must keep Persian naming and symbol launcher assets"],
  [serviceWorkerSource.includes('const CACHE = "poolamkoo-v71"') && serviceWorkerSource.includes('/logo-poolamkoo.svg'), "v1.1.1 must ship a fresh PWA cache"],
  [priorSettingsSource.includes("Searchable settings architecture") && priorSettingsSource.includes("رنگ‌ساز سفارشی") && priorBrandSource.includes("Brand mark & PWA identity refresh") && priorLaunchSource.includes("Public launch & quota hardening"), "v1.1.1 must preserve accepted v1.1.0 and v1.0.x boundaries"],
  [quotaSource.includes("brsapiCoreQuotes: 180") && quotaSource.includes("tsetmcQuote: 120") && quotaSource.includes("tsetmcSearch: 600") && quotaSource.includes("MARKET_CLIENT_REUSE_MS = 30_000"), "quota constants must keep launch-safe cache/reuse windows"],
  [reliabilitySource.includes("activeProviderCooldown") && reliabilitySource.includes("retryAfterSeconds") && reliabilitySource.includes("guarded: true"), "provider cooldowns must remain intact"],
  [brsSource.includes("MARKET_CACHE_SECONDS.brsapiCoreQuotes") && tsetmcSource.includes("MARKET_CACHE_SECONDS.tsetmcQuote") && tindexSource.includes("MARKET_CACHE_SECONDS.tindexCoreFallback"), "providers must keep the central cache policy"],
  [marketHookSource.includes("recentResponse") && marketHookSource.includes("MARKET_CLIENT_REUSE_MS"), "client market request reuse must remain intact"],
  [marketApiSource.includes("s-maxage=60") && marketApiSource.includes('"private, no-store"'), "market CDN/privacy cache boundary must remain intact"],
];

for (const [ok, message] of checks) {
  if (!ok) { console.error(`Stable readiness check failed: ${message}`); process.exit(1); }
}

console.log("v1.1.1 stable metadata gate passed. Full production release gate completed before investment-queue UX acceptance.");
