import { readFile } from "node:fs/promises";

const read = (path) => readFile(path, "utf8");
const [
  price, money, dialog, alertDialog, css, validation, skeleton, newMoney, allocationEditor, pageDateFilterBar,
  newMoneyHook, marketApi, marketProvider, marketHook, marketHistoryHook, db, txDialog,
  pendingPlans, shell, themeHook, planPage, planCard, quickPlan, planEdit, planActions,
  desktopSidebar, mobileNavigation, appTopbar, drawer, dateRangePicker, dateFilterHook, tooltip, productTour, tourHook, button, types, marketRefreshButton, appRouteLayout, brandLogo, settingsSection, planProgress, appError, reportsSection, monthlyBars, privacyToggle, shellCss, dataTable, globalSearch, rootLayout, manifest, serviceWorker, favicon,
] = await Promise.all([
  read("components/ui/price-input.tsx"), read("components/ui/money-input.tsx"), read("components/ui/dialog.tsx"),
  read("components/ui/alert-dialog.tsx"), read("app/globals.css"), read("lib/validation.ts"),
  read("components/skeletons/page-skeleton.tsx"), read("components/new-money-dialog.tsx"),
  read("components/new-money-allocation-editor.tsx"), read("components/app/page-date-filter-bar.tsx"), read("hooks/use-new-money.ts"),
  read("app/api/market/route.ts"), read("lib/market/brsapi.ts"), read("hooks/use-market.ts"),
  read("hooks/use-market-history.ts"), read("lib/db.ts"), read("components/investments/transaction-dialog.tsx"),
  read("components/investments/pending-plan-purchases.tsx"), read("components/app-shell.tsx"),
  read("hooks/use-app-theme.ts"), read("components/income/income-plan-page.tsx"),
  read("components/income/plan-item-card.tsx"), read("components/income/quick-plan-dialog.tsx"),
  read("components/income/plan-edit-dialog.tsx"), read("hooks/use-plan-item-actions.ts"),
  read("components/app/desktop-sidebar.tsx"), read("components/app/mobile-navigation.tsx"),
  read("components/app/app-topbar.tsx"), read("components/ui/drawer.tsx"), read("components/ui/date-range-picker.tsx"), read("hooks/use-app-date-filter.ts"),
  read("components/ui/tooltip.tsx"), read("components/app/product-tour.tsx"), read("hooks/use-product-tour.ts"),
  read("components/ui/button.tsx"), read("lib/types.ts"), read("components/app/market-refresh-button.tsx"),
  read("components/app/app-route-layout.tsx"), read("components/brand-logo.tsx"), read("components/sections/settings.tsx"),
  read("lib/plan-progress.ts"), read("app/(app)/error.tsx"), read("components/sections/reports.tsx"), read("components/charts/monthly-bars.tsx"), read("components/app/privacy-toggle.tsx"), read("app/globals.css"),
  read("components/data-table.tsx"), read("components/app/global-search.tsx"), read("app/layout.tsx"), read("app/manifest.ts"), read("public/sw.js"), read("public/favicon.svg"),
]);

const [onboardingSource, onboardingHookSource, openingHoldingSource, investmentsSource, arcGaugeSource, dashboardMetricsSource, appearanceSettingsSource, calculationsSource] = await Promise.all([
  read("components/onboarding.tsx"),
  read("hooks/use-onboarding.ts"),
  read("components/investments/opening-holding-dialog.tsx"),
  read("components/sections/investments.tsx"),
  read("components/charts/arc-gauge.tsx"),
  read("hooks/use-dashboard-metrics.ts"),
  read("components/settings/appearance-settings-card.tsx"),
  read("lib/calculations.ts"),
]);

const [todayDateSource, allocationDonutSource, datePickerSource, persianCalendarSource, themeToggleSource, sidebarStateSource, postcssSource, allocationSettingsSource, safetySettingsSource] = await Promise.all([
  read("components/app/today-date.tsx"),
  read("components/charts/allocation-donut.tsx"),
  read("components/ui/date-picker.tsx"),
  read("components/ui/persian-calendar.tsx"),
  read("components/ui/theme-toggle.tsx"),
  read("hooks/use-sidebar-state.ts"),
  read("postcss.config.mjs"),
  read("components/settings/allocation-rule-card.tsx"),
  read("components/settings/financial-safety-card.tsx"),
]);

const [directFundsSource, relatedSelectSource, onboardingHoldingsSource, uiArchitectureSource] = await Promise.all([
  read("components/new-money-direct-funds.tsx"),
  read("components/ui/related-entity-select.tsx"),
  read("components/onboarding-holdings-step.tsx"),
  read("scripts/check-ui-architecture.mjs"),
]);


const [historyImportDialogSource, historicalImportSource, assetDialogSource, tindexProviderSource, marketSearchSource, portfolioSource, exchangePickerSource, marketPrioritySource, marketSourceLabelSource] = await Promise.all([
  read("components/investments/history-import-dialog.tsx"),
  read("lib/historical-import.ts"),
  read("components/investments/asset-dialog.tsx"),
  read("lib/market/tindex.ts"),
  read("app/api/market/search/route.ts"),
  read("hooks/use-investment-portfolio.ts"),
  read("components/investments/exchange-instrument-picker.tsx"),
  read("lib/market/priority.ts"),
  read("components/market/market-source-label.tsx"),
]);

const [marketHistoryApiSource, marketChartCardSource, financialChartSource, selectSource] = await Promise.all([
  read("app/api/market/history/route.ts"),
  read("components/investments/market-chart-card.tsx"),
  read("components/charts/financial-chart.tsx"),
  read("components/ui/select.tsx"),
]);


const [marketWatchlistSource, navSource, appDataSource, investmentsPageSource] = await Promise.all([
  read("components/investments/market-watchlist-card.tsx"),
  read("lib/market/nav.ts"),
  read("hooks/use-app-data.ts"),
  read("app/(app)/investments/page.tsx"),
]);

const checks = [
  [price.includes('locale = "fa-IR"'), "PriceInput must render Persian digits by default"],
  [money.includes('locale="fa-IR"'), "MoneyInput must explicitly use fa-IR formatting"],
  [dialog.includes("sm:place-items-center") && !dialog.includes("sm:left-1/2"), "Dialog desktop layout must use RTL-safe grid centering"],
  [alertDialog.includes("sm:place-items-center") && !alertDialog.includes("sm:left-1/2"), "AlertDialog desktop layout must use RTL-safe grid centering"],
  [css.includes('.dark[data-palette="rose"]') && css.includes('.dark[data-palette="amber"]'), "Dark palette selectors are missing"],
  [dialog.includes('absolute left-4 top-4'), "Dialog close button must stay on the visual left in RTL"],
  [validation.includes('مبلغ را وارد کن.') && !validation.includes('Invalid input'), "Form validation must provide Persian required-field errors"],
  [skeleton.includes('md:hidden') && skeleton.includes('hidden overflow-hidden rounded-xl border md:block'), "Data table skeleton must use cards only on mobile"],
  [newMoney.includes('className="h-14 w-full text-xl"'), "New money amount field must use the full dialog width"],
  [allocationEditor.includes('تقسیم این پول') && allocationEditor.includes('بازگشت به پیشنهاد'), "Per-income allocation editor is missing"],
  [newMoneyHook.includes('rebalanceAllocation') && newMoneyHook.includes('allocationChanged'), "Per-income allocation override logic is missing"],
  [marketProvider.includes('Gold_Currency.php') && !marketProvider.includes('Cryptocurrency.php'), "Free market refresh must use one BrsApi request"],
  [!marketApi.includes('demoMarketQuotes') && !marketHistoryHook.includes('demoCandles'), "Fake market/history data must never be returned"],
  [!marketHook.includes('setInterval') && marketHook.includes('latestCachedQuotes().then') && marketHook.includes('requestMarket(ids)'), "Market data must load once on mount and refresh manually"],
  [marketHistoryHook.includes("snapshotsToCandles"), "Market history must keep real locally stored snapshots as fallback"],
  [db.includes('planItems:') && db.includes('planItemId'), "Plan execution schema is missing"],
  [txDialog.includes('planItemId') && txDialog.includes('initialAmount'), "Planned purchases must prefill and link transactions"],
  [pendingPlans.includes('planRemaining') && pendingPlans.includes('onBuy'), "Pending planned purchases UI is missing"],
  [planCard.includes('RiDeleteBin6Line') && planCard.includes('RiEdit2Line') && planCard.includes('onEdit'), "Plan cards must expose edit and delete actions"],
  [planEdit.includes('ویرایش کارت برنامه') && planActions.includes('updatePlanItem'), "Plan card editing flow is missing"],
  [quickPlan.includes('کارت سریع برنامه') && quickPlan.includes('MoneyInput'), "Quick plan creation UI is missing"],
  [planPage.includes('max-w-[1780px]') && planPage.includes('xl:grid-cols-2') && planPage.includes('items-start'), "Income plan spacing/grid must stay balanced on large displays"],
  [css.includes('--type-weight-display: 740') && css.includes('.type-page-title') && !css.includes('font-weight: 900'), "Central typography tokens/classes are missing or too heavy"],
  [desktopSidebar.includes('collapsed') && desktopSidebar.includes('TooltipContent') && desktopSidebar.includes('w-[64px]'), "Desktop sidebar must collapse to an icon rail with tooltips"],
  [tooltip.includes('TooltipPrimitive') && tooltip.includes('TooltipContent'), "Shared shadcn-style Tooltip primitive is missing"],
  [button.includes('forwardRef'), "Button must forward refs for Radix/shadcn composition"],
  [themeHook.includes('startViewTransition') && css.includes('data-theme-motion="mobile"') && css.includes('320ms'), "Mobile theme transition optimization is missing"],
  [productTour.includes('راهنمای سریع') && tourHook.includes('poolamco:start-tour') && types.includes('guideComplete'), "Initial product tour is not wired"],
  [mobileNavigation.includes('data-tour="mobile-more"') && desktopSidebar.includes('data-tour="new-money"'), "Tour anchors are missing from navigation"],
  [shell.includes('DesktopSidebar') && shell.includes('MobileNavigation') && shell.includes('ProductTour'), "App shell composition is incomplete"],
  [!marketRefreshButton.includes('useAppRuntime') && marketRefreshButton.includes('market?: MarketRefreshControls | null') && marketRefreshButton.includes('market ??'), "Shell market refresh must tolerate a temporarily missing market runtime without crashing"],
  [appRouteLayout.includes('market={market}') && appRouteLayout.includes('<AppRuntimeProvider'), "App route layout must pass market controls into the shell and keep page runtime context"],
  [css.includes('.glass-strong') && css.includes('--glass-strong') && productTour.includes('glass-strong'), "Readable strong glass surface is missing from the product tour"],
  [css.includes('--logo-gold: var(--primary)') && brandLogo.includes('var(--logo-ink)') && desktopSidebar.includes('<BrandLogo') && mobileNavigation.includes('<BrandLogo'), "Official theme-aware logo is not wired into app navigation"],
  [css.includes(':root[data-palette="amber"]') && css.includes('#9a6f0a') && css.includes('.dark[data-palette="amber"]') && css.includes('#d4a72c') && appearanceSettingsSource.includes('label: "طلایی"'), "Gold palette must stay metallic in both light and dark themes"],
  [mobileNavigation.includes('<Drawer open={open}') && mobileNavigation.includes('دسترسی سریع'), "Mobile quick menu must use the organized responsive drawer"],
  [planProgress.includes("if (!Array.isArray(items)) return []") && planProgress.includes("items?: readonly PlanItemLike[] | null"), "Plan progress must tolerate missing or legacy local data"],
  [db.includes("this.version(3)") && db.includes("normalizePlanRow") && db.includes("repairLocalData"), "IndexedDB v3 migration/repair for legacy plan rows is missing"],
  [appError.includes("بازسازی داده") && appError.includes("repairLocalData"), "Local-data recovery error boundary is missing"],
  [desktopSidebar.includes("group-hover:scale-0") && desktopSidebar.includes('BrandLogo className="size-8') && mobileNavigation.includes('BrandLogo className="size-8"'), "Collapsed navigation logo must morph into the sidebar-open control and stay compact"],
  [!desktopSidebar.includes("تصمیم‌یار مالی شخصی") && !desktopSidebar.includes("Local-First") && !mobileNavigation.includes("تصمیم‌یار مالی شخصی"), "Navigation should keep branding clean without marketing subtitles"],
  [types.includes("hideFinancialData: boolean") && privacyToggle.includes("RiEyeLine") && shellCss.includes(".privacy-hidden") && appTopbar.includes("PrivacyToggle") && mobileNavigation.includes("PrivacyToggle"), "Global privacy eye toggle is not wired"],
  [reportsSection.includes("فاصله از هدف") && reportsSection.includes("بازده از خرید") && reportsSection.includes("این عدد تغییر روزانه بازار نیست") && reportsSection.includes("HelpLabel"), "Reports must explain portfolio metrics and distinguish personal P/L from daily market change"],
  [monthlyBars.includes("هنوز داده ماهانه‌ای نداریم") && monthlyBars.includes("hasData"), "Monthly report chart must show a real empty state instead of a blank chart"],
  [onboardingSource.includes("فعلاً ردش کن") && onboardingSource.includes("OnboardingHoldingsStep") && onboardingSource.includes("gapRatio={0}"), "Onboarding must support fast skip, opening holdings, and complete progress rings"],
  [onboardingHookSource.includes("openingHoldingTransaction") && onboardingHookSource.includes("onboardingComplete: true") && onboardingHookSource.includes("ONBOARDING_STEPS = 6"), "Onboarding persistence must save historical opening holdings and a six-step flow"],
  [openingHoldingSource.includes("دارایی قبلی را وارد کن") && investmentsSource.includes("OpeningHoldingDialog") && investmentsSource.includes("دارایی قبلی دارم"), "Investments must expose a post-onboarding opening-holding flow"],
  [arcGaugeSource.includes("gapRatio = 0") && arcGaugeSource.includes("safeGap"), "ArcGauge must render a complete ring by default across the app"],
  [dashboardMetricsSource.includes("futureFocusPercent(rule.safetyPct, rule.growthPct)") && onboardingHookSource.includes("futureFocusPercent(safety, growth)") && calculationsSource.includes("Math.round(safetyPct + growthPct)") && !calculationsSource.includes("/ 85"), "Future-focus gauges must show the real safety + growth share without hidden normalization"],
  [appTopbar.includes("-mt-3") && appTopbar.includes("h-16") && desktopSidebar.includes("h-16"), "Desktop topbar must align vertically with the sidebar brand header"],
  [types.includes('"stock"') && db.includes('kind: "stock"') && txDialog.includes("assetRequiresManualPrice") && investmentsSource.includes("?? activeAsset.manualPriceToman"), "Stock assets must exist as a first-class portfolio type with market/manual price fallback"],
  [reportsSection.includes("RiMoneyDollarCircleLine") && reportsSection.includes("RiFileList3Line") && reportsSection.includes("KpiIcon"), "Report KPI cards must use distinct semantic icons"],
  [todayDateSource.includes("useHydrated") && !todayDateSource.includes("setToday"), "TodayDate must hydrate without a synchronous setState effect"],
  [!allocationDonutSource.includes("let offset") && !allocationDonutSource.includes("offset +="), "AllocationDonut must not mutate render-local offsets inside map"],
  [!datePickerSource.includes("useEffect") && !dateRangePicker.includes("useEffect") && !persianCalendarSource.includes("useEffect") && !themeToggleSource.includes("useEffect"), "Date and theme controls must avoid synchronous setState effects"],
  [dateFilterHook.includes("useSyncExternalStore") && sidebarStateSource.includes("useSyncExternalStore"), "Persisted UI state must hydrate through external-store snapshots instead of mount effects"],
  [tourHook.includes("requestAnimationFrame(measure)") && !tourHook.includes("useEffect(() => { measure();"), "Product-tour measurement must be scheduled instead of setting state synchronously in an effect"],
  [!settingsSection.includes("useSettingsManager") && allocationSettingsSource.includes("useWatch") && safetySettingsSource.includes("useWatch"), "Settings forms must keep React Hook Form controls local and use useWatch"],
  [postcssSource.includes("const config") && postcssSource.includes("export default config"), "PostCSS config must use a named default export"],
  [newMoney.includes("NewMoneyDirectFunds") && directFundsSource.includes("برای برنامه‌ریزی می‌ماند") && newMoneyHook.includes("remainingAfterDirect") && newMoneyHook.includes("executedToman: amountToman"), "New money must support direct fund allocation before percentage planning"],
  [relatedSelectSource.includes("createLabel") && quickPlan.includes("RelatedEntitySelect") && planEdit.includes("RelatedEntitySelect") && openingHoldingSource.includes("RelatedEntitySelect") && onboardingHoldingsSource.includes("RelatedEntitySelect"), "Entity selectors must offer in-context create shortcuts"],
  [uiArchitectureSource.includes('replaceAll("\\\\", "/")'), "UI architecture paths must be normalized for Windows quality checks"],

  [investmentsSource.includes("HistoryImportDialog") && investmentsSource.includes("ورود سوابق CSV") && historyImportDialogSource.includes("HistoryImportPreview"), "Investments must expose the historical CSV import flow"],
  [historicalImportSource.includes("parseHistoricalCsv") && historicalImportSource.includes("validateSellAvailability") && historicalImportSource.includes("transactionFingerprint") && historicalImportSource.includes("persianDateToIso"), "Historical import must validate dates, duplicates and sell availability before persistence"],
  [historyImportDialogSource.includes("downloadTemplate") && historyImportDialogSource.includes("missingAssets") && assetDialogSource.includes("initialName"), "Historical import must offer a template and in-context creation for missing assets"],
  [marketApi.includes("TINDEX_API_TOKEN") && marketApi.includes("tindexIds") && marketSearchSource.includes("new TindexProvider") && marketSearchSource.includes('search(query)'), "Iran exchange market search/quotes must be wired through the server-only Tindex provider"],
  [tindexProviderSource.includes("stocks/by-category/stock-energy") && tindexProviderSource.includes("rialToToman") && tindexProviderSource.includes("stock-market/symbol"), "Tindex integration must search exchange instruments and normalize rial prices to toman"],
  [assetDialogSource.includes("ExchangeInstrumentPicker") && assetDialogSource.includes('marketSource') && assetDialogSource.includes('marketId') && exchangePickerSource.includes("MarketSourceLabel"), "Stock and fund creation must support in-context exchange linking with source attribution"],
  [portfolioSource.includes("quote?.priceToman ?? asset.manualPriceToman") && marketHook.includes('marketSource === "tindex"') && marketHook.includes('params.append("tindex"'), "Linked exchange assets must use live quotes with safe manual fallback and request only their market IDs"],
  [marketApi.includes("needsCoreFallback") && marketApi.includes("getFallbackQuotes") && marketPrioritySource.includes("for (const quote of primary)"), "BrsApi must remain primary while Tindex supplies only missing core quotes"],
  [tindexProviderSource.includes("/boards") && tindexProviderSource.includes("USD-EXCHANGE-RATE") && tindexProviderSource.includes("GOLD-18K") && tindexProviderSource.includes("btc"), "Tindex fallback must cover core dollar, gold and bitcoin quotes in one boards request"],
  [marketSourceLabelSource.includes("منبع داده: Tindex") && marketSourceLabelSource.includes("https://tindex.app") && exchangePickerSource.includes("MarketSourceLabel"), "Tindex data must carry visible linked source attribution"],
  [marketHistoryApiSource.includes("getExchangeCandles") && marketHistoryApiSource.includes("getIndicatorCandles") && marketHistoryApiSource.includes("s-maxage=3600"), "Market history API must fetch real Tindex candles with quota-aware server caching"],
  [marketHistoryHook.includes("/api/market/history") && marketHistoryHook.includes("snapshotsToCandles") && marketHistoryHook.includes("memoryCache"), "Market history must prefer remote candles while retaining real local Snapshot fallback"],
  [tindexProviderSource.includes("parseTindexCandlesPayload") && tindexProviderSource.includes("/candles") && tindexProviderSource.includes("unitScale"), "Tindex candle history must decode delta dates and normalize exchange rial prices"],
  [marketChartCardSource.includes('"1m"') && marketChartCardSource.includes('"3m"') && marketChartCardSource.includes("MarketSourceLabel") && financialChartSource.includes("LineSeries") && financialChartSource.includes("CandlestickSeries"), "Market charts must expose real 1m/3m history, source attribution, line indicators and exchange candles"],
  [marketChartCardSource.includes('<RangePicker value={range} onChange={setRange} />\n      </div>\n      {candles.length >= 2 ? <>'), "Market history range picker must stay visible in loading and empty states"],
  [selectSource.includes("collisionPadding={12}") && selectSource.includes("min(16rem, calc(var(--radix-select-content-available-height) - 3.5rem))") && selectSource.includes("overflow-y-auto"), "Shared Select dropdowns must stay within the viewport and scroll when options are long"],
  [db.includes("marketWatchlist") && appDataSource.includes("db.marketWatchlist") && appRouteLayout.includes("data.watchlist") && investmentsPageSource.includes("watchlist={data.watchlist}"), "Market watchlist must be persisted and wired through the application runtime"],
  [marketWatchlistSource.includes("دیده‌بان بازار") && marketWatchlistSource.includes("افزودن به سبد") && marketWatchlistSource.includes("premiumToNavPercent"), "Investments must expose a pre-purchase market watchlist with a direct portfolio shortcut"],
  [types.includes("navToman?: number") && tindexProviderSource.includes("nav?:") && tindexProviderSource.includes("navToman") && navSource.includes("premiumToNavPercent"), "Exchange fund NAV must be normalized and exposed without fabricating missing values"],

  [!desktopSidebar.includes("جست‌وجوی کلی") && appTopbar.includes("جست‌وجوی کلی") && globalSearch.includes("Ctrl / ⌘ + K"), "Desktop global search must have one clear entry point in the topbar"],
  [mobileNavigation.includes("onOpenSearch") && mobileNavigation.includes("RiSearch2Line"), "Global search must be accessible on mobile"],
  [desktopSidebar.includes('href="/"') && mobileNavigation.includes('href="/"') && desktopSidebar.includes("BrandLogo") && mobileNavigation.includes("BrandLogo"), "Brand logo must link to the dashboard in desktop and mobile navigation"],
  [drawer.includes("dragY") && drawer.includes("onPointerMove") && drawer.includes("closeRef.current?.click()"), "Mobile Drawer must support swipe-down dismissal"],
  [appTopbar.includes("MarketRefreshButton") && appTopbar.includes("PrivacyToggle") && appTopbar.includes("ThemeToggle") && !appTopbar.includes("DateRangePicker") && pageDateFilterBar.includes("DateRangePicker"), "Desktop utilities belong in the topbar while date filtering must stay page-scoped"],
  [!desktopSidebar.includes("MarketRefreshButton") && !desktopSidebar.includes("PrivacyToggle") && !desktopSidebar.includes("ThemeToggle"), "Desktop sidebar must stay focused on navigation instead of utility controls"],
  [dateRangePicker.includes('mode="range"') && dateRangePicker.includes("همه زمان") && dateFilterHook.includes("dateInRange") && dateFilterHook.includes("filtered"), "Responsive Persian date-range filtering is not wired"],
  [mobileNavigation.includes("mobile-bottom-nav") && mobileNavigation.includes("TodayDate"), "Mobile navigation must expose a readable bottom bar and today date"],
  [dataTable.includes("type RowData") && dataTable.includes("TData extends RowData"), "DataTable must satisfy TanStack Table v9 RowData constraints"],
  [dataTable.includes("table.store.state.pagination.pageIndex") && !dataTable.includes("table.state.pagination.pageIndex"), "TanStack Table v9 pagination must read the core store in the shared generic Pagination component"],
  [newMoneyHook.includes("newMoneySchema.parse") && newMoneyHook.includes('typeof incomeIdKey !== "number"') && newMoneyHook.includes("watchedLife ?? activeRule.lifePct"), "New-money persistence must validate form values, narrow Dexie IDs, and normalize watched allocation numbers"],
  [dataTable.includes("مرتب‌سازی ستون") && !dataTable.includes("<button\n                            type=\"button\"\n                            className=\"inline-flex w-full"), "Sortable headers must not wrap interactive help controls in a button"],
  [rootLayout.includes('/favicon.svg') && manifest.includes('/icon-192.png') && serviceWorker.includes('/favicon.svg') && favicon.includes("prefers-color-scheme: dark"), "Theme-aware favicon and PWA icon assets must be wired into metadata and offline precache"],
];

const failures = checks.filter(([ok]) => !ok).map(([, message]) => message);
if (failures.length) {
  console.error(`Regression checks failed:\n${failures.join("\n")}`);
  process.exit(1);
}
console.log("Regression checks passed: Persian forms, resilient local data, semantic DataTable headers, global search, PWA identity, compact sidebar, privacy controls, market cache, and responsive UI are wired.");
