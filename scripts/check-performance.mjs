import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const checks = [
  [!read("components/charts/sparkline.tsx").includes("recharts") && read("components/charts/sparkline.tsx").includes("<svg"), "Dashboard sparklines must remain dependency-light SVGs"],
  [read("components/sections/dashboard.tsx").includes("LazyPortfolioAreaChart") && !read("components/sections/dashboard.tsx").includes('charts/portfolio-area-chart'), "Dashboard must defer the Recharts portfolio chart"],
  [read("components/sections/reports.tsx").includes("LazyMonthlyBars") && !read("components/sections/reports.tsx").includes('charts/monthly-bars'), "Reports must defer the monthly Recharts bundle"],
  [read("components/investments/market-chart-card.tsx").includes("LazyFinancialChart") && read("components/investments/market-watch-detail-dialog.tsx").includes("LazyFinancialChart"), "Investment market charts must defer lightweight-charts until needed"],
  [read("components/charts/lazy-portfolio-area-chart.tsx").includes("dynamic(") && read("components/charts/lazy-financial-chart.tsx").includes("dynamic(") && read("components/charts/lazy-monthly-bars.tsx").includes("dynamic("), "Heavy chart families must keep explicit dynamic boundaries"],
];
const failed = checks.filter(([ok]) => !ok);
if (failed.length) {
  for (const [, message] of failed) console.error(`Performance regression: ${message}`);
  process.exit(1);
}
console.log("Performance checks passed: dashboard, reports, and market chart libraries stay behind explicit lazy boundaries.");
