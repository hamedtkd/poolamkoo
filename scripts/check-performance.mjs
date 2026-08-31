import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const landingVisual = read("components/landing/landing-product-visual.tsx");
const landingProductBytes = fs.statSync("public/landing/poolamkoo-income-mobile.webp").size;

const checks = [
  [!read("components/charts/sparkline.tsx").includes("recharts") && read("components/charts/sparkline.tsx").includes("<svg"), "Dashboard sparklines must remain dependency-light SVGs"],
  [read("components/sections/dashboard.tsx").includes("LazyPortfolioAreaChart") && !read("components/sections/dashboard.tsx").includes('charts/portfolio-area-chart'), "Dashboard must defer the Recharts portfolio chart"],
  [read("components/sections/reports.tsx").includes("LazyMonthlyBars") && !read("components/sections/reports.tsx").includes('charts/monthly-bars'), "Reports must defer the monthly Recharts bundle"],
  [read("components/investments/market-chart-card.tsx").includes("LazyFinancialChart") && read("components/investments/market-watch-detail-dialog.tsx").includes("LazyFinancialChart"), "Investment market charts must defer lightweight-charts until needed"],
  [read("components/charts/lazy-portfolio-area-chart.tsx").includes("dynamic(") && read("components/charts/lazy-financial-chart.tsx").includes("dynamic(") && read("components/charts/lazy-monthly-bars.tsx").includes("dynamic("), "Heavy chart families must keep explicit dynamic boundaries"],
  [landingVisual.includes("next/image") && landingVisual.includes("sizes=") && landingVisual.includes("poolamkoo-income-mobile.webp") && landingProductBytes < 150_000, "Landing hero must use one optimized local real-product capture instead of a heavy conceptual render"],
];
const failed = checks.filter(([ok]) => !ok);
if (failed.length) {
  for (const [, message] of failed) console.error(`Performance regression: ${message}`);
  process.exit(1);
}
console.log("Performance checks passed: charts stay behind lazy boundaries and theme-aware landing media remains optimized.");
