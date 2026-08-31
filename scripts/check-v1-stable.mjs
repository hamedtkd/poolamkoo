import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const VERSION = "1.0.2";
const BRAND_HASHES = {
  mark: "fabbfff77baacc3480ada96e505980b1ea879385eda10c034ce6e151fc0c9d4b",
  dark: "9d1f72084f83b7098f302e27cabdaa616fc7ab54c7e8508d411252b588f2bdb1",
  fa: "5f0335d3314e8495cb1ec497b28c30113635244e88d7352d287744b2abce5317",
  en: "963971d37d437030a289e9fea26a0496ef22f018d58985ff556b8fba3426a279",
};

async function read(path) { return readFile(path, "utf8"); }
async function hash(path) { return createHash("sha256").update(await readFile(path)).digest("hex"); }

const [
  packageSource, lockSource, appVersionSource, releaseSource, priorLaunchSource, launchAcceptanceSource, roadmapSource,
  quotaSource, reliabilitySource, brsSource, tsetmcSource, tindexSource, marketHookSource, marketApiSource, marketStatusCardSource,
  serviceWorkerSource, brandComponentSource, faviconSource, manifestSource,
  markHash, darkHash, faHash, enHash,
] = await Promise.all([
  read("package.json"), read("package-lock.json"), read("lib/app-version.ts"), read("docs/releases/1.0.2.md"),
  read("docs/releases/1.0.1.md"), read("docs/audits/v1.0.1-launch-readiness.md"), read("docs/ROADMAP.md"),
  read("lib/market/quota.ts"), read("lib/market/reliability.ts"), read("lib/market/brsapi.ts"), read("lib/market/tsetmc.ts"),
  read("lib/market/tindex.ts"), read("hooks/use-market.ts"), read("app/api/market/route.ts"), read("components/settings/market-status-card.tsx"),
  read("public/sw.js"), read("components/brand-logo.tsx"), read("public/favicon.svg"), read("public/app.webmanifest"),
  hash("public/brand/poolamkoo-mark.svg"), hash("public/brand/poolamkoo-dark.svg"), hash("public/brand/poolamkoo-fa-lockup.svg"), hash("public/brand/poolamkoo-en-lockup.svg"),
]);

const pkg = JSON.parse(packageSource);
const lock = JSON.parse(lockSource);
const checks = [
  [pkg.version === VERSION, "package.json version must match v1.0.2"],
  [lock.version === VERSION && lock.packages?.[""]?.version === VERSION, "package-lock.json version must match v1.0.2"],
  [appVersionSource.includes(`APP_VERSION = "${VERSION}"`), "runtime app version must match v1.0.2"],
  [appVersionSource.includes("LOCAL_DATABASE_SCHEMA_VERSION = 8"), "brand patch must not bump IndexedDB schema"],
  [releaseSource.includes("Brand mark & PWA identity refresh") && releaseSource.includes("بدون تایپوگرافی") && releaseSource.includes("CSS mask") && releaseSource.includes("schema 8"), "release note must document the brand/PWA identity boundary"],
  [roadmapSource.includes("v1.0.2 — Brand mark & PWA identity refresh 🚧"), "roadmap must track the v1.0.2 brand patch"],
  [markHash === BRAND_HASHES.mark && darkHash === BRAND_HASHES.dark && faHash === BRAND_HASHES.fa && enHash === BRAND_HASHES.en, "owner-supplied SVG masters must remain byte-identical"],
  [brandComponentSource.includes('/brand/poolamkoo-mark.svg') && brandComponentSource.includes("MaskImage") && brandComponentSource.includes("bg-primary"), "runtime brand mark must use the owner SVG as a theme-aware CSS mask"],
  [faviconSource.includes("prefers-color-scheme: dark") && faviconSource.includes('viewBox="0 0 475 383"'), "favicon must retain exact mark geometry and remain theme-aware"],
  [manifestSource.includes('"name": "پولم‌کو"') && manifestSource.includes('/icon-192.png') && manifestSource.includes('/maskable-512.png'), "PWA manifest must use Persian app naming and symbol launcher assets"],
  [serviceWorkerSource.includes('const CACHE = "poolamkoo-v69"') && serviceWorkerSource.includes('/logo-poolamkoo.svg'), "brand patch must ship a fresh PWA worker/cache"],
  [priorLaunchSource.includes("Public launch & quota hardening") && launchAcceptanceSource.includes("Fluid Compute Enabled"), "v1.0.2 must preserve the accepted v1.0.1 public-launch boundary"],
  [quotaSource.includes("brsapiCoreQuotes: 180") && quotaSource.includes("tsetmcQuote: 120") && quotaSource.includes("tsetmcSearch: 600") && quotaSource.includes("MARKET_CLIENT_REUSE_MS = 30_000"), "quota constants must keep launch-safe cache/reuse windows"],
  [reliabilitySource.includes("activeProviderCooldown") && reliabilitySource.includes("retryAfterSeconds") && reliabilitySource.includes("guarded: true"), "provider cooldowns must remain intact"],
  [brsSource.includes("MARKET_CACHE_SECONDS.brsapiCoreQuotes") && tsetmcSource.includes("MARKET_CACHE_SECONDS.tsetmcQuote") && tindexSource.includes("MARKET_CACHE_SECONDS.tindexCoreFallback"), "providers must keep the central cache policy"],
  [marketHookSource.includes("recentResponse") && marketHookSource.includes("MARKET_CLIENT_REUSE_MS"), "client market request reuse must remain intact"],
  [marketApiSource.includes("s-maxage=60") && marketApiSource.includes('"private, no-store"'), "market CDN/privacy cache boundary must remain intact"],
  [marketStatusCardSource.includes("محافظت Launch و سهمیه") && marketStatusCardSource.includes("marketLaunchGuardrails"), "Settings must retain privacy-safe launch guardrails"],
];

for (const [ok, message] of checks) {
  if (!ok) { console.error(`Stable readiness check failed: ${message}`); process.exit(1); }
}

console.log("v1.0.2 stable metadata gate passed. Full production release gate completed before branding acceptance.");
