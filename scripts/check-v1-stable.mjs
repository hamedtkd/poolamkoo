import { readFile } from "node:fs/promises";

const VERSION = "1.0.1";

async function read(path) {
  return readFile(path, "utf8");
}

const [
  packageSource,
  lockSource,
  appVersionSource,
  releaseSource,
  acceptanceSource,
  roadmapSource,
  quotaSource,
  reliabilitySource,
  brsSource,
  tsetmcSource,
  tindexSource,
  marketHookSource,
  marketApiSource,
  marketStatusCardSource,
  serviceWorkerSource,
] = await Promise.all([
  read("package.json"),
  read("package-lock.json"),
  read("lib/app-version.ts"),
  read("docs/releases/1.0.1.md"),
  read("docs/audits/v1.0.1-launch-readiness.md"),
  read("docs/ROADMAP.md"),
  read("lib/market/quota.ts"),
  read("lib/market/reliability.ts"),
  read("lib/market/brsapi.ts"),
  read("lib/market/tsetmc.ts"),
  read("lib/market/tindex.ts"),
  read("hooks/use-market.ts"),
  read("app/api/market/route.ts"),
  read("components/settings/market-status-card.tsx"),
  read("public/sw.js"),
]);

const pkg = JSON.parse(packageSource);
const lock = JSON.parse(lockSource);
const checks = [
  [pkg.version === VERSION, "package.json version must match v1.0.1"],
  [lock.version === VERSION && lock.packages?.[""]?.version === VERSION, "package-lock.json version must match v1.0.1"],
  [appVersionSource.includes(`APP_VERSION = "${VERSION}"`), "runtime app version must match v1.0.1"],
  [appVersionSource.includes("LOCAL_DATABASE_SCHEMA_VERSION = 8"), "launch hardening must not bump IndexedDB schema"],
  [releaseSource.includes("Public launch & quota hardening") && releaseSource.includes("1500 request/day") && releaseSource.includes("480"), "release note must document the quota rationale and guardrail"],
  [acceptanceSource.includes("Fluid Compute Enabled") && acceptanceSource.includes("24 ساعت") && acceptanceSource.includes("schema 8"), "launch readiness must retain hosting/provider manual checks"],
  [roadmapSource.includes("v1.0.1 — Public launch & quota hardening 🚧"), "roadmap must track v1.0.1 as the active launch phase"],
  [quotaSource.includes("brsapiCoreQuotes: 180") && quotaSource.includes("tsetmcQuote: 120") && quotaSource.includes("tsetmcSearch: 600") && quotaSource.includes("MARKET_CLIENT_REUSE_MS = 30_000"), "quota constants must keep launch-safe cache/reuse windows"],
  [reliabilitySource.includes("activeProviderCooldown") && reliabilitySource.includes("retryAfterSeconds") && reliabilitySource.includes("guarded: true"), "provider runner must enforce retry-aware warm-runtime cooldowns"],
  [brsSource.includes("MARKET_CACHE_SECONDS.brsapiCoreQuotes") && tsetmcSource.includes("MARKET_CACHE_SECONDS.tsetmcQuote") && tindexSource.includes("MARKET_CACHE_SECONDS.tindexCoreFallback"), "providers must consume the central cache policy"],
  [marketHookSource.includes("recentResponse") && marketHookSource.includes("MARKET_CLIENT_REUSE_MS"), "client market requests must reuse identical recent responses"],
  [marketApiSource.includes("s-maxage=60") && marketApiSource.includes('"private, no-store"'), "core-only market responses must be CDN-cacheable while target-bearing responses stay private"],
  [marketStatusCardSource.includes("محافظت Launch و سهمیه") && marketStatusCardSource.includes("marketLaunchGuardrails"), "Settings must expose privacy-safe launch guardrails"],
  [serviceWorkerSource.includes('const CACHE = "poolamkoo-v68"'), "v1.0.1 must ship a new service worker byte for the PWA update path"],
];

for (const [ok, message] of checks) {
  if (!ok) {
    console.error(`Stable readiness check failed: ${message}`);
    process.exit(1);
  }
}

console.log("v1.0.1 stable metadata gate passed. Full production release gate completed before public-launch acceptance.");
