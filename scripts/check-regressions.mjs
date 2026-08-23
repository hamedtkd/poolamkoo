import { readFile } from "node:fs/promises";

const price = await readFile("components/ui/price-input.tsx", "utf8");
const money = await readFile("components/ui/money-input.tsx", "utf8");
const dialog = await readFile("components/ui/dialog.tsx", "utf8");
const alertDialog = await readFile("components/ui/alert-dialog.tsx", "utf8");
const css = await readFile("app/globals.css", "utf8");
const validation = await readFile("lib/validation.ts", "utf8");
const skeleton = await readFile("components/skeletons/page-skeleton.tsx", "utf8");
const newMoney = await readFile("components/new-money-dialog.tsx", "utf8");
const allocationEditor = await readFile("components/new-money-allocation-editor.tsx", "utf8");
const newMoneyHook = await readFile("hooks/use-new-money.ts", "utf8");
const marketApi = await readFile("app/api/market/route.ts", "utf8");
const marketProvider = await readFile("lib/market/brsapi.ts", "utf8");
const marketHook = await readFile("hooks/use-market.ts", "utf8");
const marketHistoryHook = await readFile("hooks/use-market-history.ts", "utf8");
const db = await readFile("lib/db.ts", "utf8");
const txDialog = await readFile("components/investments/transaction-dialog.tsx", "utf8");
const pendingPlans = await readFile("components/investments/pending-plan-purchases.tsx", "utf8");

const shell = await readFile("components/app-shell.tsx", "utf8");
const themeHook = await readFile("hooks/use-app-theme.ts", "utf8");
const planPage = await readFile("components/income/income-plan-page.tsx", "utf8");
const planCard = await readFile("components/income/plan-item-card.tsx", "utf8");
const quickPlan = await readFile("components/income/quick-plan-dialog.tsx", "utf8");

const checks = [
  [price.includes('locale = "fa-IR"'), "PriceInput must render Persian digits by default"],
  [money.includes('locale="fa-IR"'), "MoneyInput must explicitly use fa-IR formatting"],
  [dialog.includes("sm:place-items-center") && !dialog.includes("sm:left-1/2"), "Dialog desktop layout must use RTL-safe grid centering"],
  [alertDialog.includes("sm:place-items-center") && !alertDialog.includes("sm:left-1/2"), "AlertDialog desktop layout must use RTL-safe grid centering"],
  [css.includes('.dark[data-palette="rose"]'), "Dark rose palette selector is missing"],
  [css.includes('.dark[data-palette="violet"]'), "Dark violet palette selector is missing"],
  [css.includes('.dark[data-palette="amber"]'), "Dark amber palette selector is missing"],
  [css.includes('.dark[data-palette="blue"]'), "Dark blue palette selector is missing"],
  [dialog.includes('absolute left-4 top-4') && !dialog.includes('absolute start-4 top-4'), "Dialog close button must stay on the visual left in RTL"],
  [validation.includes('مبلغ را وارد کن.') && !validation.includes('Invalid input'), "Form validation must provide Persian required-field errors"],
  [skeleton.includes('md:hidden') && skeleton.includes('hidden overflow-hidden rounded-xl border md:block'), "Data table skeleton must use cards only on mobile and rows on laptop/desktop"],
  [newMoney.includes('className="h-14 w-full text-xl"') && !newMoney.includes('max-w-sm'), "New money amount field must use the full dialog width"],
  [allocationEditor.includes('تقسیم این پول') && allocationEditor.includes('بازگشت به پیشنهاد'), "Per-income allocation editor is missing"],
  [newMoneyHook.includes('rebalanceAllocation') && newMoneyHook.includes('allocationChanged'), "Per-income allocation override logic is missing"],
  [marketProvider.includes('Gold_Currency.php') && !marketProvider.includes('Cryptocurrency.php'), "Free market refresh must use one BrsApi request"],
  [!marketApi.includes('demoMarketQuotes') && !marketHistoryHook.includes('demoCandles'), "Fake market/history data must never be returned"],
  [!marketHook.includes('setInterval') && marketHook.includes('initialRequestStarted'), "Market data must load once per app reload and refresh manually"],
  [!marketHistoryHook.includes('fetch('), "Market history must use only locally stored real snapshots"],
  [db.includes('planItems:') && db.includes('planItemId'), "Plan execution schema is missing"],
  [txDialog.includes('planItemId') && txDialog.includes('initialAmount'), "Planned purchases must prefill and link transactions"],
  [pendingPlans.includes('planRemaining') && pendingPlans.includes('onBuy'), "Pending planned purchases UI is missing"],
  [planCard.includes("RiDeleteBin6Line") && planCard.includes("onDelete"), "Plan cards must expose a delete action"],
  [quickPlan.includes("کارت سریع برنامه") && quickPlan.includes("MoneyInput"), "Quick plan creation UI is missing"],
  [planPage.includes("xl:grid-cols-[20rem_minmax(0,1fr)]") && planPage.includes("items-start"), "Income plan grid must stay balanced on large displays"],
  [themeHook.includes("startViewTransition") && css.includes("theme-circle-reveal"), "Theme switch must use a radial View Transition from the trigger"],
  [shell.includes("پولم‌کو") && shell.includes("MarketRefreshButton showLabel") && shell.includes("ThemeToggle") , "Brand/utility controls are not wired in the new shell"],
];

const failures = checks.filter(([ok]) => !ok).map(([, message]) => message);
if (failures.length) {
  console.error(`Regression checks failed:\n${failures.join("\n")}`);
  process.exit(1);
}
console.log("Regression checks passed: Persian forms, plan execution, one-call market cache, no fake history, responsive skeletons, dialogs, and themes are wired.");
