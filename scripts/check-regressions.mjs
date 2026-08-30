import { readFile } from "node:fs/promises";

const read = (path) => readFile(path, "utf8");
const [
  price, money, dialog, alertDialog, css, validation, skeleton, newMoney, allocationEditor, pageDateFilterBar,
  newMoneyHook, marketApi, marketProvider, marketHook, marketHistoryHook, db, txDialog,
  pendingPlans, shell, themeHook, planPage, planCard, quickPlan, planEdit, planActions,
  desktopSidebar, mobileNavigation, appTopbar, drawer, dateRangePicker, dateFilterHook, tooltip, productTour, tourHook, button, types, marketRefreshButton, appRouteLayout, brandLogo, settingsSection, planProgress, appError, reportsSection, monthlyBars, privacyToggle, shellCss, dataTable, globalSearch, rootLayout, appManifest, serviceWorker, favicon,
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
  read("lib/plan-progress.ts"), read("app/(workspace)/error.tsx"), read("components/sections/reports.tsx"), read("components/charts/monthly-bars.tsx"), read("components/app/privacy-toggle.tsx"), read("app/globals.css"),
  read("components/data-table.tsx"), read("components/app/global-search.tsx"), read("app/layout.tsx"), read("public/app.webmanifest"), read("public/sw.js"), read("public/favicon.svg"),
]);

const githubStatsSource = await read("hooks/use-github-stats.ts");
const marketReliabilitySource = await read("lib/market/reliability.ts");
const marketStatusSource = await read("lib/market/status.ts");
const marketRuntimeSource = await read("lib/market/runtime.ts");
const marketStatusCardSource = await read("components/settings/market-status-card.tsx");
const marketValuationSource = await read("lib/market/valuation.ts");
const marketIdentitySource = await read("lib/market/identity.ts");
const dbSchemaSource = await read("lib/db-schema.ts");
const planningSource = await read("lib/planning.ts");
const reportsDataSource = await read("hooks/use-reports-data.ts");
const incomePlanHookSource = await read("hooks/use-income-plan.ts");
const investmentLedgerSource = await read("lib/investment-ledger.ts");
const assetLifecycleSource = await read("lib/asset-lifecycle.ts");
const archivedAssetsSource = await read("components/investments/archived-assets-card.tsx");
const fundLedgerSource = await read("lib/fund-ledger.ts");
const fundLedgerStoreSource = await read("lib/fund-ledger-store.ts");
const fundEditorSource = await read("components/funds/fund-editor.tsx");
const fundMovementSource = await read("components/funds/fund-movement.tsx");
const fundMovementHistorySource = await read("components/funds/fund-movement-history-card.tsx");
const fundsSectionSource = await read("components/sections/funds.tsx");
const planExecutionSource = await read("lib/plan-execution.ts");
const incomeSectionSource = await read("components/sections/income.tsx");
const incomeCorrectionSource = await read("lib/income-correction.ts");
const incomeEditorSource = await read("hooks/use-income-editor.ts");
const incomeEditDialogSource = await read("components/income/income-edit-dialog.tsx");
const dataHealthSource = await read("lib/data-health.ts");
const dataHealthStoreSource = await read("lib/data-health-store.ts");
const dataHealthCardSource = await read("components/settings/data-health-card.tsx");
const activitySource = await read("lib/activity.ts");
const activitySectionSource = await read("components/sections/activity.tsx");
const activityPageSource = await read("app/(workspace)/activity/page.tsx");
const reportReconciliationSource = await read("lib/report-reconciliation.ts");
const reconciliationCardSource = await read("components/reports/reconciliation-card.tsx");
const reportsPageSource = await read("app/(workspace)/reports/page.tsx");

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


const [historyImportDialogSource, historicalImportSource, assetDialogSource, tindexProviderSource, tsetmcProviderSource, marketSearchSource, portfolioSource, portfolioDecisionSource, portfolioAllocationSource, portfolioTablesSource, exchangePickerSource, marketPrioritySource, marketSourceLabelSource] = await Promise.all([
  read("components/investments/history-import-dialog.tsx"),
  read("lib/historical-import.ts"),
  read("components/investments/asset-dialog.tsx"),
  read("lib/market/tindex.ts"),
  read("lib/market/tsetmc.ts"),
  read("app/api/market/search/route.ts"),
  read("hooks/use-investment-portfolio.ts"),
  read("components/investments/portfolio-decision-card.tsx"),
  read("lib/portfolio-allocation.ts"),
  read("components/investments/portfolio-tables.tsx"),
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
  read("app/(workspace)/investments/page.tsx"),
]);

const [marketWatchToolbarSource, marketWatchDetailSource, marketWatchHelperSource] = await Promise.all([
  read("components/investments/market-watchlist-toolbar.tsx"),
  read("components/investments/market-watch-detail-dialog.tsx"),
  read("lib/market/watchlist.ts"),
]);

const [marketAlertsCardSource, marketAlertDialogSource, marketAlertHelperSource, marketAlertHookSource] = await Promise.all([
  read("components/investments/market-alerts-card.tsx"),
  read("components/investments/market-alert-dialog.tsx"),
  read("lib/market/alerts.ts"),
  read("hooks/use-market-alerts.ts"),
]);

const [backgroundPushHookSource, marketPushStatusSource, pushSubscriptionApiSource, pushCronSource, pushStoreSource, pushConfigSource, pushFeatureSource, vercelConfigSource] = await Promise.all([
  read("hooks/use-background-push.ts"),
  read("components/investments/market-push-status.tsx"),
  read("app/api/push/subscription/route.ts"),
  read("lib/push/cron.ts"),
  read("lib/push/store.ts"),
  read("lib/push/config.ts"),
  read("lib/push/feature.ts"),
  read("vercel.json"),
]);

const [backupSettingsSource, backupRestoreSource, backupReminderSource, backupSafetySource, backupClientSource, cryptoSource, dataPortabilitySource, recoverySource, appVersionSource, toastSource, providersSource] = await Promise.all([
  read("components/settings/backup-settings-card.tsx"),
  read("components/backup/backup-restore-dialog.tsx"),
  read("components/backup/backup-reminder.tsx"),
  read("lib/backup-safety.ts"),
  read("lib/backup-client.ts"),
  read("lib/crypto.ts"),
  read("lib/data-portability.ts"),
  read("lib/recovery.ts"),
  read("lib/app-version.ts"),
  read("components/ui/toast.tsx"),
  read("components/providers.tsx"),
]);

const [deviceTransferHookSource, deviceTransferCardSource, deviceTransferHelperSource, backupSafetyHookSource] = await Promise.all([
  read("hooks/use-device-transfer.ts"), read("components/settings/device-transfer-card.tsx"),
  read("lib/device-transfer.ts"), read("hooks/use-backup-safety.ts"),
]);

const [communitySource, communityHookSource, supportPromptSource, sidebarCommunitySource, githubStatsApiSource, privacyPageSource, aboutPageSource, guidePageSource, securityPageSource, licensePageSource, openSourceCardSource] = await Promise.all([
  read("lib/community.ts"), read("hooks/use-community-support.ts"), read("components/community/support-prompt.tsx"),
  read("components/community/sidebar-community.tsx"), read("app/api/github/stats/route.ts"), read("app/(public)/privacy/page.tsx"),
  read("app/(public)/about/page.tsx"), read("app/(public)/guide/page.tsx"), read("app/(public)/security/page.tsx"),
  read("app/(public)/license/page.tsx"), read("components/community/open-source-card.tsx"),
]);

const [animationRevealSource, motionRevealSource, dashboardMotionSource, sparklineMotionSource, portfolioMotionSource, monthlyMotionSource, gitattributesSource, packageSource] = await Promise.all([
  read("components/animation/reveal.tsx"), read("components/motion/reveal.tsx"), read("components/sections/dashboard.tsx"),
  read("components/charts/sparkline.tsx"), read("components/charts/portfolio-area-chart.tsx"), read("components/charts/monthly-bars.tsx"),
  read(".gitattributes"), read("package.json"),
]);

const [analyticsComponentSource, analyticsHelperSource, analyticsSettingsSource, analyticsPageSource, analyticsDocsSource, envExampleSource] = await Promise.all([
  read("components/analytics/cloudflare-web-analytics.tsx"), read("lib/analytics.ts"),
  read("components/settings/analytics-settings-card.tsx"), read("app/(public)/analytics/page.tsx"),
  read("docs/analytics.md"), read(".env.example"),
]);


const [landingPageSource, landingHeroSource, landingVisualSource, landingSectionsSource, standaloneLandingRedirectSource, siteSource, workspaceLayoutSource, robotsSource, sitemapSource, localDataUnavailableSource, networkStatusSource, offlineScreenSource, notFoundSource] = await Promise.all([
  read("app/(public)/page.tsx"), read("components/landing/landing-hero.tsx"), read("components/landing/landing-product-visual.tsx"), read("components/landing/landing-sections.tsx"),
  read("components/landing/standalone-landing-redirect.tsx"), read("lib/site.ts"), read("app/(workspace)/layout.tsx"), read("app/robots.ts"), read("app/sitemap.ts"),
  read("components/system/local-data-unavailable.tsx"), read("components/system/network-status-banner.tsx"),
  read("components/system/offline-screen.tsx"), read("app/not-found.tsx"),
]);

const [publicShellSource, publicThemeToggleSource] = await Promise.all([
  read("components/public/public-shell.tsx"), read("components/public/public-theme-toggle.tsx"),
]);

const [networkStatusHookSource, obsoleteRouteCleanupSource] = await Promise.all([
  read("hooks/use-network-status.ts"), read("scripts/remove-obsolete-routes.mjs"),
]);

const [pwaUpdateHookSource, pwaUpdateNoticeSource, pwaUpdateHelperSource, localDataIssuesSource] = await Promise.all([
  read("hooks/use-pwa-update.ts"), read("components/system/pwa-update-notice.tsx"),
  read("lib/pwa-update.ts"), read("lib/local-data-issues.ts"),
]);

const appNavigationSource = await read("components/app/navigation.ts");
const [reportInsightsSource, decisionInsightsSource, reportExportSource, reportExportDialogSource] = await Promise.all([
  read("lib/report-insights.ts"), read("components/reports/decision-insights-card.tsx"),
  read("lib/report-export.ts"), read("components/reports/report-export-dialog.tsx"),
]);
const [mediaCaptureSource, mediaDemoSource, mediaDocsSource, mediaWorkflowSource, iconCheckSource] = await Promise.all([
  read("scripts/capture-product-media.mjs"), read("scripts/media/demo-data.mjs"), read("docs/assets/README.md"),
  read(".github/workflows/product-media.yml"), read("scripts/check-icon-imports.mjs"),
]);

const [releaseSmokeSource, releaseSmokeWorkflowSource, schema6FixtureSource] = await Promise.all([
  read("scripts/release-browser-smoke.mjs"), read(".github/workflows/release-smoke.yml"), read("scripts/fixtures/schema6-idb.mjs"),
]);

const checks = [
  [packageSource.includes('"check:release": "npm run check && npm run build && npm run test:browser:release:built"') && releaseSmokeSource.includes("schema 6 profile must upgrade in place through schema 8") && releaseSmokeSource.includes("Tindex and TSETMC rows with the same raw marketId must coexist after migration") && releaseSmokeSource.includes("schema 8 migration must create an opening fund-ledger row for legacy balances") && schema6FixtureSource.includes("LEGACY_SCHEMA6_NATIVE_VERSION = 60") && schema6FixtureSource.includes("CURRENT_SCHEMA8_NATIVE_VERSION = 80") && releaseSmokeSource.includes("landing-to-workspace navigation") && releaseSmokeSource.includes("fresh onboarding") && releaseSmokeSource.includes('clientNavigate(client, "/settings"') && releaseSmokeSource.includes("workspace content must remain visible after client navigation") && releaseSmokeSource.includes("shared dialog content must never render blank under normal motion preference") && releaseSmokeSource.includes("dashboard critical content must be visible with normal motion preference") && releaseSmokeSource.includes("workspace must compile tailwindcss-animated stagger utilities with distinct delays") && releaseSmokeSource.includes("workspace service worker registration") && releaseSmokeSource.includes("reports must expose privacy-safe export controls") && releaseSmokeSource.includes("drag-to-dismiss mobile drawer") && releaseSmokeSource.includes("workspace service worker must not cache the public landing navigation") && releaseSmokeWorkflowSource.includes("npm run check:release"), "Release browser gate must verify schema 6→8 migration, including opening fund-ledger continuity, plus public/workspace navigation, onboarding/bootstrap, client route continuity, reports and PWA runtime boundaries"],

  [landingPageSource.includes("LandingHero") && landingPageSource.includes("LandingSections") && landingHeroSource.includes("شروع رایگان") && landingHeroSource.includes("Local-first"), "Public root must present a clear Persian landing page before entering the financial app"],
  [landingHeroSource.includes("LandingProductVisual") && landingVisualSource.includes("poolamkoo-finance-light.webp") && landingVisualSource.includes("poolamkoo-finance-dark.webp") && landingVisualSource.includes("داده‌های نمایش‌داده‌شده نمونه‌اند"), "Landing hero must use the approved theme-aware product visuals and label their values as sample presentation data"],
  [!landingHeroSource.includes("MotionReveal") && landingHeroSource.includes("landing-enter") && landingVisualSource.includes('data-landing-visual="light"') && landingVisualSource.includes('data-landing-visual="dark"') && publicShellSource.includes("PublicThemeToggle") && publicThemeToggleSource.includes("useTheme") && !publicThemeToggleSource.includes("@/lib/db"), "Critical landing hero media must render without Motion hydration and public theme switching must stay independent from financial IndexedDB"],
  [packageSource.includes('"name": "poolamkoo"') && packageSource.includes('"version": "1.0.0"') && appVersionSource.includes('APP_VERSION = "1.0.0"'), "Package and runtime versions must use the canonical Poolamkoo v1.0.0 stable identity"],
  [rootLayout.includes("Poolamkoo open-source contributors") && serviceWorker.includes('const CACHE = "poolamkoo-v67"') && serviceWorker.includes('/logo-poolamkoo.svg'), "Active runtime branding and PWA cache/assets must use the Poolamkoo spelling"],
  [incomeCorrectionSource.includes("amount_below_executed") && incomeCorrectionSource.includes("date_locked_after_execution") && incomeCorrectionSource.includes("remainingTotal > 0") && incomeEditorSource.includes('createRecoverySnapshot("قبل از اصلاح پول ورودی")') && incomeEditorSource.includes('[db.incomes, db.allocations, db.planItems, db.transactions]') && incomeEditDialogSource.includes("disabled={dateLocked}") && incomeEditDialogSource.includes("min={recordedExecuted}") && validation.includes("تاریخ پول ورودی نمی‌تواند در آینده باشد"), "Income correction must preserve executed money, lock historical dates after execution, snapshot before writes and reject future income dates"],
  [settingsSection.includes("DataHealthCard") && dataHealthCardSource.includes("سلامت داده محلی") && dataHealthCardSource.includes("repairSafeLocalDataHealth") && dataHealthSource.includes("fund_balance_mismatch") && dataHealthSource.includes("investment_plan_execution_mismatch") && dataHealthSource.includes("investment_negative_history") && dataHealthSource.includes("orphan_transaction_plan") && dataHealthStoreSource.includes('createRecoverySnapshot("قبل از ترمیم سلامت داده")') && dataHealthStoreSource.includes('[db.funds, db.fundMovements, db.planItems, db.transactions, db.assets, db.incomes]') && appVersionSource.includes("LOCAL_DATABASE_SCHEMA_VERSION = 8"), "Local data health must audit cross-ledger integrity on-device and repair only deterministic derived drift after a Recovery Snapshot without a schema bump"],
  [activitySource.includes("buildFinancialActivity") && activitySource.includes("fundMovementSourceLabel") && activitySource.includes("groupFinancialActivityByDay") && activitySectionSource.includes("تاریخچه یکپارچه فعالیت‌ها") && activitySectionSource.includes("Ledgerهای واقعی") && activitySectionSource.includes("SensitiveValue") && activityPageSource.includes('scope = "activity"') && dateFilterHook.includes('| "activity"') && dateFilterHook.includes("fundMovements: data.fundMovements.filter") && appNavigationSource.includes('href: "/activity"') && mobileNavigation.includes('href="/activity"') && robotsSource.includes('"/activity"'), "Unified activity history must derive a local factual timeline from income, fund and investment ledgers, remain date-filterable/privacy-sensitive, and keep the workspace route out of search indexing"],
  [reportReconciliationSource.includes("buildReportReconciliation") && reportReconciliationSource.includes('"in_progress"') && reportReconciliationSource.includes("opening") && reportReconciliationSource.includes("netBuyFlow") && reconciliationCardSource.includes("تطبیق جریان مالی این بازه") && reconciliationCardSource.includes("در حال اجرا") && reconciliationCardSource.includes("SensitiveValue") && reportsPageSource.includes("fundMovements={filtered.fundMovements}") && reportsPageSource.includes("transactions={data.transactions}") && reportsPageSource.includes("periodTransactions={filtered.transactions}") && reportsDataSource.includes("transactions: periodTransactions") && reportExportSource.includes("reconciliation: ReportReconciliationSnapshot") && reportExportSource.includes("گردش صندوق") && reportExportSource.includes("گردش سرمایه‌گذاری"), "Reports must reconcile recorded income/allocation/plan execution, keep period fund/investment flow factual, preserve full-ledger current portfolio state, and extend only the explicit detailed export"],
  [portfolioDecisionSource.includes("RiScalesLine") && !portfolioDecisionSource.includes("RiScaleLine") && iconCheckSource.includes("react-icons/ri named imports"), "Portfolio decision UI must use a real Remix Icon export and keep the icon-import quality gate"],
  [packageSource.includes('"media:capture"') && packageSource.includes('"media:capture:built"') && mediaCaptureSource.includes("createPoolamkooMediaDemoData") && mediaCaptureSource.includes("Storage.clearDataForOrigin") && mediaCaptureSource.includes('resolve(ROOT, "node_modules", "next", "dist", "bin", "next")') && mediaCaptureSource.includes("landing-dark-desktop.png") && mediaDemoSource.includes("Fixture نمایشی") && mediaDocsSource.includes("Browser Profile موقت") && mediaWorkflowSource.includes("poolamkoo-product-screenshots"), "Product screenshots must be reproducible cross-platform from isolated fake data locally and through the manual GitHub artifact workflow"],
  [siteSource.includes('APP_ENTRY_PATH = "/dashboard"') && appManifest.includes('\"start_url\": \"/dashboard\"') && appManifest.includes('\"id\": \"/dashboard\"') && desktopSidebar.includes('href="/dashboard"') && mobileNavigation.includes('href="/dashboard"'), "Landing and installed app must keep separate root and dashboard entry points"],
  [!rootLayout.includes("app.webmanifest") && !rootLayout.includes("appleWebApp") && workspaceLayoutSource.includes('manifest: "/app.webmanifest"') && workspaceLayoutSource.includes("appleWebApp"), "Only workspace routes may advertise the installable PWA and iOS standalone metadata"],
  [landingPageSource.includes("StandaloneLandingRedirect") && standaloneLandingRedirectSource.includes('(display-mode: standalone)') && standaloneLandingRedirectSource.includes('window.location.pathname !== "/"') && standaloneLandingRedirectSource.includes('window.location.replace("/dashboard")'), "Standalone root launches must enter the dashboard without redirecting normal landing visitors"],
  [!serviceWorker.split("\n").find((line) => line.startsWith("const PRECACHE"))?.includes('["/",') && serviceWorker.includes('"/dashboard"') && serviceWorker.includes('"/offline"') && serviceWorker.includes("WORKSPACE_NAVIGATION_PREFIXES") && serviceWorker.includes("!isWorkspaceNavigation(url.pathname)") && releaseSmokeSource.includes("workspace service worker must not cache the public landing navigation"), "Service worker must keep public navigations network-only while retaining dashboard/offline workspace shell caching"],
  [workspaceLayoutSource.includes("index: false") && robotsSource.includes('disallow: ["/dashboard"') && sitemapSource.includes("PUBLIC_INDEX_ROUTES"), "Financial app routes must stay out of search indexing while public trust pages remain discoverable"],
  [landingSectionsSource.includes("بکاپ رمزنگاری‌شده") && landingSectionsSource.includes("انتقال مستقیم دستگاه") && landingSectionsSource.includes("رایگان، متن‌باز"), "Landing page must explain data ownership, recovery and open-source positioning"],
  [appDataSource.includes("bootstrapError") && appDataSource.includes("BOOT_TIMEOUT_MS") && appDataSource.includes("performBootstrap(run)") && !appDataSource.includes("retryBootstrap();") && appRouteLayout.includes("LocalDataUnavailable") && localDataUnavailableSource.includes("Site Data") && !providersSource.includes("ensureSeedData"), "IndexedDB bootstrap failures must stay retryable without synchronous setState inside the mount effect"],
  [db.includes('db.on("blocked"') && db.includes('db.on("versionchange"') && appDataSource.includes("LOCAL_DATA_BLOCKED_EVENT") && appDataSource.includes("const canQuery = bootstrap.status === \"ready\"") && localDataIssuesSource.includes('name === "VersionError"') && localDataUnavailableSource.includes("classifyLocalDataIssue") && marketHook.includes("enabled = true") && backupSafetyHookSource.includes("enabled = true") && communityHookSource.includes("enabled ? db.appMeta") && appRouteLayout.includes("data.marketAlerts, data.ready"), "Multi-tab IndexedDB upgrades must block stale writes and delay financial database consumers until bootstrap succeeds"],
  [!providersSource.includes("PwaUpdateNotice") && workspaceLayoutSource.includes("PwaUpdateNotice") && pwaUpdateNoticeSource.includes("نسخه جدید پولم‌کو آماده است") && pwaUpdateHookSource.includes("controllerchange") && pwaUpdateHookSource.includes("dismissedWaitingWorkerRef.current = registrationRef.current?.waiting ?? null") && pwaUpdateHookSource.includes("dismissedWaitingWorkerRef.current === waiting") && pwaUpdateHookSource.includes("waiting.postMessage({ type: PWA_UPDATE_MESSAGE })") && pwaUpdateHelperSource.includes('PWA_UPDATE_MESSAGE = "SKIP_WAITING"') && pwaUpdateHelperSource.includes("waitingWorkerDismissed"), "PWA updates must wait for explicit acceptance, keep the dismissed waiting worker quiet, and reload only after a new worker controls the page"],
  [serviceWorker.includes('const CACHE = "poolamkoo-v67"') && serviceWorker.includes('event.data?.type === "SKIP_WAITING"') && serviceWorker.indexOf('addEventListener("message"') < serviceWorker.indexOf("self.skipWaiting()"), "Service worker updates must not skip waiting unconditionally during install"],
  [networkStatusHookSource.includes("useSyncExternalStore") && !networkStatusHookSource.includes("useState") && shell.includes("NetworkStatusBanner") && networkStatusSource.includes("آفلاین هستی") && offlineScreenSource.includes("Local-first"), "Network state must use an external-store subscription without synchronous hydration setState"],
  [obsoleteRouteCleanupSource.includes('"app/(app)"') && obsoleteRouteCleanupSource.includes('"app/manifest.ts"') && obsoleteRouteCleanupSource.includes('".next/types"') && obsoleteRouteCleanupSource.includes('".next/dev/types"'), "Replacement installs must remove legacy route/manifest entrypoints and stale Next.js route validators before typecheck/build"],
  [notFoundSource.includes("۴۰۴") && notFoundSource.includes("/data") === false, "Unknown routes must fail safely without offering destructive data actions"],
  [rootLayout.includes("CloudflareWebAnalytics") && analyticsComponentSource.includes("next/script") && analyticsHelperSource.includes("static.cloudflareinsights.com") && analyticsHelperSource.includes('nodeEnv === "production"'), "Cloudflare Web Analytics must be optional, production-only and wired through the root layout"],
  [analyticsComponentSource.includes("NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN") && envExampleSource.includes("NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN") && !analyticsComponentSource.includes("fetch("), "Analytics must use only the public site token and the official beacon without a custom telemetry transport"],
  [settingsSection.includes("AnalyticsSettingsCard") && analyticsSettingsSource.includes("مبلغ") && analyticsSettingsSource.includes("Custom Event") && analyticsPageSource.includes("بدون Cookie"), "Analytics status and privacy boundaries must be visible in the app"],
  [settingsSection.includes("MarketStatusCard") && marketStatusCardSource.includes("formatMarketDiagnostics") && marketStatusCardSource.includes("navigator.clipboard.writeText") && marketStatusCardSource.includes("بررسی دوباره بازار") && marketStatusSource.includes("financial-values-and-identifiers-excluded") && !marketStatusSource.includes("MarketQuote") && !marketStatusSource.includes("Asset"), "Settings market diagnostics must stay explicit, copy-only and structurally unable to include financial quote/asset data"],
  [marketHook.includes("mergeRuntimeMarketQuotes") && marketHook.includes("marketQuoteForStorage") && marketRuntimeSource.includes("runtimeSource: \"snapshot\"") && marketRuntimeSource.includes("CORE_RUNTIME_SYMBOLS") && marketRuntimeSource.includes("oldestSnapshotAt") && marketAlertHookSource.includes("freshMarketQuotes") && marketAlertsCardSource.includes('runtimeSource === "snapshot"') && marketSourceLabelSource.includes("Snapshot محلی"), "Partial market refreshes must preserve relevant real snapshots, label fallback provenance, and never trigger local alerts from snapshot-only quotes"],
  [analyticsDocsSource.includes("query strings are not logged") && analyticsDocsSource.includes("No analytics package is installed") && analyticsPageSource.includes("Self-host"), "Analytics documentation must preserve the zero-cost self-host and query-string privacy model"],
  [packageSource.includes('"tailwindcss-animated": "2.1.0"') && packageSource.includes('"motion": "^12.0.0"') && css.includes('@import "tailwindcss-animated/src/index.css";') && !css.includes('@import "tailwindcss-animated";') && animationRevealSource.includes("animate-fade-up") && animationRevealSource.includes("animate-fade-right") && animationRevealSource.includes("animate-delay-[55ms]") && animationRevealSource.includes("motion-reduce:animate-none") && !providersSource.includes("MotionConfig") && motionRevealSource.includes("whileInView") && landingSectionsSource.includes("MotionReveal"), "Workspace entrances must stay on staggered Tailwind utilities while Motion is code-split to reduced-motion-safe viewport reveals on the public landing"],
  [!githubStatsSource.includes("AbortController") && !githubStatsSource.includes("AbortSignal") && !githubStatsSource.includes("fetch(") && githubStatsSource.includes("new XMLHttpRequest()") && githubStatsSource.includes("request.send()") && githubStatsSource.includes("let active = true") && !exchangePickerSource.includes("AbortController") && !exchangePickerSource.includes(".abort(") && exchangePickerSource.includes("requestIdRef"), "GitHub stats and market search cleanup must not create Promise AbortError paths during React teardown"],
  [shell.includes("data-route-content={pathname}") && !shell.includes("RouteTransition") && !shell.includes("motion/react") && dashboardMotionSource.includes("<Reveal") && !dashboardMotionSource.includes('direction="right"') && !dashboardMotionSource.includes('direction="left"') && animationRevealSource.includes("animate-fill-both"), "Whole workspace routes must stay static while individual dashboard items use one-direction staggered Tailwind entrances"],
  [desktopSidebar.includes("animate-fade") && mobileNavigation.includes("animate-fade") && !desktopSidebar.includes("layoutId=") && !mobileNavigation.includes("layoutId="), "Desktop and mobile navigation must keep lightweight CSS active indicators without Motion layout dependencies"],
  [appNavigationSource.includes("mobilePrimaryNav") && appNavigationSource.includes("appNav[1]") && mobileNavigation.includes("mobilePrimaryNav.map") && mobileNavigation.includes('aria-label="ناوبری اصلی موبایل"'), "Mobile primary navigation must keep the daily incoming-money flow one tap away"],
  [desktopSidebar.includes('aria-current={active(item.href) ? "page" : undefined}') && mobileNavigation.includes('aria-current={active(item.href) ? "page" : undefined}') && mobileNavigation.includes('aria-expanded={menuOpen}'), "Navigation must expose active and expanded state to assistive technology"],
  [globalSearch.includes('role="combobox"') && globalSearch.includes('aria-activedescendant') && globalSearch.includes('role="listbox"') && globalSearch.includes('ArrowDown') && globalSearch.includes('aria-live="polite"'), "Global search must support keyboard result navigation and announce result changes"],
  [dialog.includes('aria-label="بستن پنجره"') && drawer.includes("DrawerDescription") && dateRangePicker.includes("DrawerDescription") && dataTable.includes("aria-sort") && dataTable.includes('aria-label="صفحه‌بندی جدول"'), "Shared overlays and data tables must preserve accessible names, descriptions and sort/page state"],
  [css.includes(".app-mobile-safe-bottom") && css.includes("env(safe-area-inset-bottom)") && mobileNavigation.includes("min-h-[72px]"), "Mobile app content and bottom navigation must stay clear of device safe areas"],
  [toastSource.includes("animate-fade-up") && !toastSource.includes("AnimatePresence") && dialog.includes("data-dialog-content") && dialog.includes("safe-modal-motion") && !dialog.includes("contentMotion = \"data-[state=open]:animate-fade") && !dialog.includes("motion/react") && css.includes("poolamkoo-modal-enter") && css.includes("skeleton-shimmer") && css.includes("prefers-reduced-motion: reduce"), "Dialog bodies must stay opacity-safe while toast/overlay motion remains CSS-driven and reduced-motion safe"],
  [sparklineMotionSource.includes("<svg") && !sparklineMotionSource.includes("recharts") && portfolioMotionSource.includes("isAnimationActive={!reduced}") && monthlyMotionSource.includes("isAnimationActive={!reduced}"), "Financial chart animations must stop when the user requests reduced motion"],
  [dashboardMotionSource.includes("هنوز صندوق هدفی نداری") && dashboardMotionSource.includes("قیمت بازار فعلاً در دسترس نیست") && dashboardMotionSource.includes("نمودار بعد از اولین خرید شکل می‌گیرد"), "Dashboard must show explicit empty states instead of blank or misleading loading states"],
  [gitattributesSource.includes("* text=auto eol=lf"), "Repository text files must keep deterministic LF line endings across Windows and Unix"],
  [communitySource.includes("SUPPORT_PROMPT_ACTIVE_DAYS = 7") && communitySource.includes("SUPPORT_PROMPT_SNOOZE_DAYS = 60") && communitySource.includes("SUPPORT_PROMPT_THANKS_DAYS = 180") && communityHookSource.includes("withUsageDay"), "Community support prompt must require seven distinct active days and use long local cooldowns"],
  [supportPromptSource.includes("ستاره در GitHub") && supportPromptSource.includes("حمایت اختیاری") && supportPromptSource.includes('pathname === "/dashboard"'), "Support prompt must stay gentle, optional, and dashboard-only"],
  [githubStatsApiSource.includes("api.github.com/repos/hamedtkd/poolamkoo") && githubStatsApiSource.includes("revalidate: 21_600") && sidebarCommunitySource.includes("RiStarFill"), "GitHub entry must use a cached public star count without requiring a client token"],
  [privacyPageSource.includes("IndexedDB") && privacyPageSource.includes("Analytics اختیاری و بدون داده مالی") && privacyPageSource.includes("WebRTC") && aboutPageSource.includes("متن‌باز") && guidePageSource.includes("بکاپ") && securityPageSource.includes("Secretهای سرور") && licensePageSource.includes("مجوز MIT"), "Public trust pages must explain local-first privacy, security, licensing, and backup reality"],
  [desktopSidebar.includes("SidebarCommunity") && mobileNavigation.includes("GithubLink") && settingsSection.includes("OpenSourceCard") && openSourceCardSource.includes("/privacy"), "Open-source, guide, privacy and GitHub surfaces must be reachable from desktop, mobile and settings"],
  [onboardingSource.includes('href="/privacy"'), "Privacy policy must be reachable before onboarding is complete"],
  [db.includes('this.version(6).stores(storesV6)') && db.includes('this.version(7).stores(storesV7)') && db.includes('this.version(LOCAL_DATABASE_SCHEMA_VERSION).stores(storesV8)') && appVersionSource.includes('LOCAL_DATABASE_SCHEMA_VERSION = 8') && dbSchemaSource.includes('fundMovements: "++id, fundId, type, source, happenedAt, createdAt"') && db.includes('legacyFundOpeningMovement') && db.includes('recoverySnapshots') && db.includes('appMeta'), "Data safety schema must preserve v6/v7 history while adding the schema 8 fund movement ledger in place"],
  [fundLedgerSource.includes("reviewFundLedger") && fundLedgerSource.includes("legacyFundOpeningMovement") && fundLedgerSource.includes("assertPortableFundLedger") && fundLedgerSource.includes("normalizePortableFundLedger"), "Fund movement ledger must own chronological balance validation plus legacy/portable normalization"],
  [fundLedgerStoreSource.includes("applyFundMovementWithinTransaction") && fundLedgerStoreSource.includes("updateManualFundMovement") && fundLedgerStoreSource.includes("deleteManualFundMovement") && newMoneyHook.includes("applyFundMovementWithinTransaction") && planExecutionSource.includes("applyFundMovementWithinTransaction") && incomeSectionSource.includes('source: "income_reversal"'), "Manual, direct-allocation, plan-execution and income-reversal fund mutations must share the auditable ledger path"],
  [incomeSectionSource.includes("[db.incomes, db.allocations, db.planItems, db.transactions, db.funds, db.fundMovements]") && !incomeSectionSource.includes('db.transaction("rw", db.incomes, db.allocations, db.planItems, db.transactions, db.funds, db.fundMovements'), "Income deletion must use Dexie’s table-array transaction overload when six stores participate in one atomic reversal"],
  [fundEditorSource.includes("موجودی از دفتر گردش محاسبه می‌شود") && !fundEditorSource.includes("db.funds.update(fund.id, { currentToman") && fundMovementSource.includes('source: "manual"') && fundMovementHistorySource.includes("گردش صندوق‌ها") && fundsSectionSource.includes("FundMovementHistoryCard"), "Fund UI must keep balance derived from movement history and expose auditable manual correction instead of direct balance editing"],
  [dataPortabilitySource.includes("assertPortableFundLedger") && db.includes("normalizePortableFundLedger") && backupRestoreSource.includes("گردش صندوق"), "Backup restore must validate/normalize the schema 8 fund ledger while remaining backward-compatible with older backups"],
  [backupSafetySource.includes('BACKUP_STALE_DAYS = 7') && backupSafetySource.includes('BACKUP_SNOOZE_DAYS = 3') && backupReminderSource.includes('سه روز بعد'), "Backup reminders must use the documented stale and snooze policy"],
  [backupSettingsSource.includes('RecoverySnapshots') && recoverySource.includes('recoverySnapshotIdsToPrune') && recoverySource.includes('قبل از بازگردانی نقطه بازیابی') && recoverySource.includes('payload.marketSnapshots = []'), "Settings must expose lean bounded recovery history with a pre-restore safety point"],
  [cryptoSource.includes('version = options.version ?? 2') && cryptoSource.includes('verifyBackupEnvelopeIntegrity') && cryptoSource.includes('sha256Base64(integrityInput(base))'), "New backup files must carry a v2 corruption digest while preserving explicit legacy envelope support"],
  [backupClientSource.includes('inspectDatabaseBackup') && backupClientSource.indexOf('await verifyBackupEnvelopeIntegrity(envelope);') < backupClientSource.indexOf('const compatibility = assertSupportedDataSchema') && backupClientSource.includes('createRecoverySnapshot') && backupRestoreSource.includes('بررسی صحت و پیش‌نمایش') && backupRestoreSource.includes('بازیابی همین نسخه'), "Backup restore must verify file integrity, validate compatibility and show a record preview before replacement"],
  [dataPortabilitySource.includes('schemaVersion > LOCAL_DATABASE_SCHEMA_VERSION') && recoverySource.includes('schemaVersion: LOCAL_DATABASE_SCHEMA_VERSION') && recoverySource.includes('assertSupportedDataSchema(snapshot.schemaVersion)') && recoverySource.indexOf('validatePortableData(parsed);') < recoverySource.indexOf('await createRecoverySnapshot("قبل از بازگردانی نقطه بازیابی")'), "Backup and recovery data must reject future or malformed local data before destructive replacement"],
  [toastSource.includes('poolamkoo:toast') && providersSource.includes('<Toaster />') && backupSettingsSource.includes('toast({ tone: "error"'), "Backup success and failure must use the shared toast surface"],
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
  [!marketHook.includes('setInterval') && marketHook.includes('latestCachedQuotes().then') && marketHook.includes('requestMarket(targets)'), "Market data must load once on mount and refresh manually"],
  [marketHistoryHook.includes("snapshotsToCandles"), "Market history must keep real locally stored snapshots as fallback"],
  [dbSchemaSource.includes('planItems:') && dbSchemaSource.includes('planItemId'), "Plan execution schema is missing"],
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
  [productTour.includes('راهنمای سریع') && tourHook.includes('poolamkoo:start-tour') && types.includes('guideComplete'), "Initial product tour is not wired"],
  [productTour.includes('data-tour-overlay="masked"') && productTour.includes('data-tour-cutout="true"') && productTour.includes('data-tour-dimmer="true"') && productTour.includes('data-tour-spotlight="true"') && productTour.includes('در حال نمایش: {tour.step.location}') && tourHook.includes("ResizeObserver") && !productTour.includes('9999px') && appTopbar.includes('data-tour="global-search"') && tourHook.includes('title: "جست‌وجو همیشه در دسترس است"') && !tourHook.includes("{ target: '[data-tour=\"reports\"]'"), "Product tour must keep the target outside the overlay and use visible responsive anchors"],
  [mobileNavigation.includes('data-tour="mobile-more"') && desktopSidebar.includes('data-tour="new-money"'), "Tour anchors are missing from navigation"],
  [shell.includes('DesktopSidebar') && shell.includes('MobileNavigation') && shell.includes('ProductTour'), "App shell composition is incomplete"],
  [!marketRefreshButton.includes('useAppRuntime') && marketRefreshButton.includes('market?: MarketRefreshControls | null') && marketRefreshButton.includes('market ??'), "Shell market refresh must tolerate a temporarily missing market runtime without crashing"],
  [appRouteLayout.includes('market={market}') && appRouteLayout.includes('<AppRuntimeProvider'), "App route layout must pass market controls into the shell and keep page runtime context"],
  [css.includes('.glass-strong') && css.includes('--glass-strong') && productTour.includes('glass-strong'), "Readable strong glass surface is missing from the product tour"],
  [css.includes('--logo-gold: var(--primary)') && brandLogo.includes('var(--logo-ink)') && desktopSidebar.includes('<BrandLogo') && mobileNavigation.includes('<BrandLogo'), "Official theme-aware logo is not wired into app navigation"],
  [css.includes(':root[data-palette="amber"]') && css.includes('#9a6f0a') && css.includes('.dark[data-palette="amber"]') && css.includes('#d4a72c') && appearanceSettingsSource.includes('label: "طلایی"'), "Gold palette must stay metallic in both light and dark themes"],
  [mobileNavigation.includes('<Drawer open={open}') && mobileNavigation.includes('دسترسی سریع') && mobileNavigation.includes('بخش‌های اصلی پایین صفحه هستند') && drawer.includes('data-drawer-drag-handle="true"') && drawer.includes('dragYRef.current') && css.includes('.drawer-drag-surface'), "Mobile quick menu must stay focused and provide a real drag-to-dismiss drawer"],
  [planProgress.includes("if (!Array.isArray(items)) return []") && planProgress.includes("items?: readonly PlanItemLike[] | null"), "Plan progress must tolerate missing or legacy local data"],
  [db.includes("this.version(3)") && db.includes("normalizePlanRow") && db.includes("repairLocalData"), "IndexedDB v3 migration/repair for legacy plan rows is missing"],
  [appError.includes("/settings#local-data-health") && appError.includes("/data-safety") && !appError.includes("repairLocalData") && !appError.includes("بازسازی داده"), "Generic workspace errors must never mutate local data and must route recovery through explicit Data Health/Data Safety flows"],
  [desktopSidebar.includes("group-hover:scale-0") && desktopSidebar.includes('BrandLogo className="size-8') && mobileNavigation.includes('BrandLogo className="size-8"'), "Collapsed navigation logo must morph into the sidebar-open control and stay compact"],
  [!desktopSidebar.includes("تصمیم‌یار مالی شخصی") && !desktopSidebar.includes("Local-First") && !mobileNavigation.includes("تصمیم‌یار مالی شخصی"), "Navigation should keep branding clean without marketing subtitles"],
  [types.includes("hideFinancialData: boolean") && privacyToggle.includes("RiEyeLine") && shellCss.includes(".privacy-hidden") && appTopbar.includes("PrivacyToggle") && mobileNavigation.includes("PrivacyToggle"), "Global privacy eye toggle is not wired"],
  [reportsSection.includes("فاصله از هدف") && reportsSection.includes("بازده از خرید") && reportsSection.includes("HelpLabel"), "Reports must explain portfolio metrics and distinguish personal P/L from daily market change"],
  [reportsSection.includes("DecisionInsightsCard") && decisionInsightsSource.includes("جمع‌بندی تصمیمی این بازه") && decisionInsightsSource.includes("هزینه روزمره") && decisionInsightsSource.includes("قانون پول در برابر تخصیص ثبت‌شده"), "Reports must turn real recorded data into factual decision insights without becoming expense accounting"],
  [reportsSection.includes("ReportExportDialog") && reportExportDialogSource.includes("خلاصه مناسب اشتراک") && reportExportDialogSource.includes("دانلود CSV") && reportExportSource.includes("عمداً مبلغ‌ها و نام دارایی‌ها") && reportExportSource.includes("^[\\t ]*[=+\\-@]") , "Report export must separate privacy-safe sharing from explicit detailed CSV and neutralize spreadsheet formulas"],
  [reportInsightsSource.includes("allocationReliable") && reportInsightsSource.includes("largestUnderTarget") && reportInsightsSource.includes("planHealth") && reportInsightsSource.includes("fundHealth"), "Report decision calculations must explicitly guard incomplete allocation data and deterministic follow-up priorities"],
  [reportsSection.includes("decision.allocatedTotal") && !reportsSection.includes("rule?.lifePct ?? 30"), "Reports must not invent allocation shares from the configured rule when the selected period has no allocation data"],
  [monthlyBars.includes("هنوز داده ماهانه‌ای نداریم") && monthlyBars.includes("hasData"), "Monthly report chart must show a real empty state instead of a blank chart"],
  [onboardingSource.includes("فعلاً ردش کن") && onboardingSource.includes("OnboardingHoldingsStep") && onboardingSource.includes("gapRatio={0}"), "Onboarding must support fast skip, opening holdings, and complete progress rings"],
  [onboardingHookSource.includes("openingHoldingTransaction") && onboardingHookSource.includes("onboardingComplete: true") && onboardingHookSource.includes("ONBOARDING_STEPS = 6"), "Onboarding persistence must save historical opening holdings and a six-step flow"],
  [openingHoldingSource.includes("دارایی قبلی را وارد کن") && investmentsSource.includes("OpeningHoldingDialog") && investmentsSource.includes("دارایی قبلی دارم"), "Investments must expose a post-onboarding opening-holding flow"],
  [arcGaugeSource.includes("gapRatio = 0") && arcGaugeSource.includes("safeGap"), "ArcGauge must render a complete ring by default across the app"],
  [dashboardMetricsSource.includes("futureFocusPercent(rule.safetyPct, rule.growthPct)") && onboardingHookSource.includes("futureFocusPercent(safety, growth)") && calculationsSource.includes("Math.round(safetyPct + growthPct)") && !calculationsSource.includes("/ 85"), "Future-focus gauges must show the real safety + growth share without hidden normalization"],
  [appTopbar.includes("-mt-3") && appTopbar.includes("h-16") && desktopSidebar.includes("h-16"), "Desktop topbar must align vertically with the sidebar brand header"],
  [types.includes('"stock"') && db.includes('kind: "stock"') && txDialog.includes("assetRequiresManualPrice") && investmentsSource.includes("activeAsset?.manualPriceToman"), "Stock assets must exist as a first-class portfolio type with market/manual price fallback"],
  [reportsSection.includes("RiMoneyDollarCircleLine") && reportsSection.includes("RiFileList3Line") && reportsSection.includes("KpiIcon"), "Report KPI cards must use distinct semantic icons"],
  [todayDateSource.includes("useHydrated") && !todayDateSource.includes("setToday"), "TodayDate must hydrate without a synchronous setState effect"],
  [!allocationDonutSource.includes("let offset") && !allocationDonutSource.includes("offset +="), "AllocationDonut must not mutate render-local offsets inside map"],
  [!datePickerSource.includes("useEffect") && !dateRangePicker.includes("useEffect") && !persianCalendarSource.includes("useEffect") && !themeToggleSource.includes("useEffect"), "Date and theme controls must avoid synchronous setState effects"],
  [dateFilterHook.includes("useSyncExternalStore") && sidebarStateSource.includes("useSyncExternalStore"), "Persisted UI state must hydrate through external-store snapshots instead of mount effects"],
  [tourHook.includes("requestAnimationFrame(resolveTarget)") && tourHook.includes("requestAnimationFrame(() => { measure(); })") && !tourHook.includes("useEffect(() => { measure();"), "Product-tour measurement must be scheduled instead of setting state synchronously in an effect"],
  [!settingsSection.includes("useSettingsManager") && allocationSettingsSource.includes("useWatch") && safetySettingsSource.includes("useWatch"), "Settings forms must keep React Hook Form controls local and use useWatch"],
  [postcssSource.includes("const config") && postcssSource.includes("export default config"), "PostCSS config must use a named default export"],
  [newMoney.includes("NewMoneyDirectFunds") && directFundsSource.includes("برای برنامه‌ریزی می‌ماند") && newMoneyHook.includes("remainingAfterDirect") && newMoneyHook.includes("executedToman: amountToman"), "New money must support direct fund allocation before percentage planning"],
  [relatedSelectSource.includes("createLabel") && quickPlan.includes("RelatedEntitySelect") && planEdit.includes("RelatedEntitySelect") && openingHoldingSource.includes("RelatedEntitySelect") && onboardingHoldingsSource.includes("RelatedEntitySelect"), "Entity selectors must offer in-context create shortcuts"],
  [uiArchitectureSource.includes('replaceAll("\\\\", "/")'), "UI architecture paths must be normalized for Windows quality checks"],

  [investmentsSource.includes("PortfolioDecisionCard") && portfolioDecisionSource.includes("مرور ترکیب سبد") && portfolioDecisionSource.includes("اولویت بررسی برای پول جدید") && portfolioDecisionSource.includes("توصیه خرید یا فروش نیست"), "Investments must expose factual target-vs-current portfolio decision guidance without investment advice"],
  [portfolioAllocationSource.includes("ALLOCATION_NEAR_TARGET_TOLERANCE_PCT = 1") && portfolioAllocationSource.includes("targetsValid") && portfolioAllocationSource.includes("pricingIncomplete") && portfolioAllocationSource.includes("newMoneyPriorities"), "Portfolio allocation guidance must use deterministic target gaps, explicit tolerance and incomplete-pricing safety"],
  [portfolioTablesSource.includes("سهم فعلی") && portfolioTablesSource.includes("هدف") && portfolioTablesSource.includes("allocationRows"), "Portfolio desktop and mobile rows must expose current share, target and allocation status"],
  [investmentLedgerSource.includes("validateTransactionChange") && investmentLedgerSource.includes("validateInvestmentLedger") && txDialog.includes("validateTransactionChange") && txDialog.includes("createRecoverySnapshot(\"قبل از اصلاح تراکنش سرمایه‌گذاری\")") && txDialog.includes("!editing && assetRequiresManualPrice") && txDialog.includes('form.setError("root.ledger"') && !txDialog.includes("setLedgerError") && investmentsSource.includes("validateInvestmentLedger(transactions.filter") && portfolioTablesSource.includes("onEditTransaction") && planPage.includes("transactions={transactions}") && !planPage.includes("availableQty={"), "Investment transaction edits/deletes must preserve chronological quantity integrity, create recovery before edits, pass the full ledger into plan purchase dialogs, and avoid rewriting current manual price from historical corrections"],
  [assetLifecycleSource.includes("assetArchiveBlockers") && assetLifecycleSource.includes("portfolioRelevantAssets") && archivedAssetsSource.includes("بازگردانی به سبد") && investmentsSource.includes("ArchivedAssetsCard") && investmentsSource.includes("createRecoverySnapshot(\"قبل از بازگردانی دارایی آرشیوشده\")") && appDataSource.includes("allAssets") && appDataSource.includes("archivedAssets") && appRouteLayout.includes("portfolioRelevantAssets(data.allAssets, data.transactions)") && portfolioSource.includes("!position.asset.archived"), "Asset archive must block open holdings/pending plans, remain restorable, keep legacy archived holdings valuation-relevant, and exclude archived assets from active allocation decisions"],
  [alertDialog.includes("disabled?: boolean") && alertDialog.includes("disabled={disabled}") && investmentsSource.includes("<AlertDialogAction disabled={"), "Blocked asset archive confirmation must use a typed disabled AlertDialog action instead of an unsupported prop"],
  [appDataSource.includes("const allAssetsQuery = useLiveQuery") && appDataSource.includes("useMemo(() => allAssetsQuery ?? [], [allAssetsQuery])"), "Asset archive active/archived filters must depend on a memo-stable allAssets fallback so warning-free release lint remains deterministic"],
  [marketValuationSource.includes("quote.source === target.source") && marketValuationSource.includes("quote.marketId === target.marketId") && portfolioSource.includes("resolveAssetValuation") && dashboardMetricsSource.includes("resolveAssetValuation") && reportsDataSource.includes("resolveAssetValuation") && marketWatchHelperSource.includes("marketQuoteForTarget") && marketAlertHookSource.includes("marketQuoteForTarget"), "Provider-linked market identity must remain source + marketId scoped through portfolio, watchlist, alerts and reports"],
  [dbSchemaSource.includes("&[source+marketId]") && dbSchemaSource.includes("[source+marketId]") && db.includes("normalizeLegacyAssetIdentityRow") && db.includes("normalizeLegacyExchangeIdentityRow") && marketIdentitySource.includes("MARKET_IDENTITY_INDEX") && marketWatchlistSource.includes("marketIdentityTuple") && marketAlertDialogSource.includes("marketIdentityTuple") && marketPrioritySource.includes("marketIdentityKey") && marketChartCardSource.includes("marketItemKey") && marketHook.includes("marketIdentityKey") && marketRuntimeSource.includes("marketIdentityKey") && dataPortabilitySource.includes("assertPortableMarketIdentities"), "Persisted and runtime exchange identity must share provider-scoped keys with a backward-compatible schema migration and restore normalization"],
  [portfolioAllocationSource.includes("!pricingIncomplete") && planningSource.includes("!pricingReady") && newMoney.includes("پیشنهاد خودکار بین دارایی‌ها") && reportsDataSource.includes("pricingIncomplete ? []") && reportsSection.includes("نیاز به قیمت تازه") && incomePlanHookSource.includes("valuation.decisionReady") && reportExportSource.includes("منبع ارزش‌گذاری"), "Snapshot and cost-basis fallback must remain display continuity and never drive automatic allocation, ranking or transaction suggestions"],
  [packageSource.includes('"lint": "eslint . --max-warnings=0"') && !marketRuntimeSource.includes("_runtimeSource") && !marketRuntimeSource.includes("_snapshotCapturedAt") && !marketRuntimeSource.includes("const { id: _id"), "Release lint must fail on warnings and market runtime storage cleanup must stay warning-free"],
  [investmentsSource.includes("HistoryImportDialog") && investmentsSource.includes("ورود سوابق CSV") && historyImportDialogSource.includes("HistoryImportPreview"), "Investments must expose the historical CSV import flow"],
  [historicalImportSource.includes("parseHistoricalCsv") && historicalImportSource.includes("validateSellAvailability") && historicalImportSource.includes("transactionFingerprint") && historicalImportSource.includes("persianDateToIso"), "Historical import must validate dates, duplicates and sell availability before persistence"],
  [historyImportDialogSource.includes("downloadTemplate") && historyImportDialogSource.includes("missingAssets") && assetDialogSource.includes("initialName"), "Historical import must offer a template and in-context creation for missing assets"],
  [marketSearchSource.includes("new TsetmcProvider") && marketSearchSource.includes("search(query.slice") && !marketSearchSource.includes("TINDEX_API_TOKEN"), "New Iran exchange search must use direct server-side TSETMC without consuming Tindex quota"],
  [tsetmcProviderSource.includes("https://cdn.tsetmc.com/api") && tsetmcProviderSource.includes("GetInstrumentSearch") && tsetmcProviderSource.includes("GetClosingPriceInfo") && tsetmcProviderSource.includes("GetClosingPriceDailyList") && tsetmcProviderSource.includes("rialToToman") && tsetmcProviderSource.includes("User-Agent") && tsetmcProviderSource.includes("next: { revalidate }"), "TSETMC integration must use documented public endpoints, browser-like headers, toman normalization and shared server caching"],
  [marketApi.includes("tsetmcIds") && marketApi.includes("new TsetmcProvider().getQuotes") && marketApi.includes("TINDEX_API_TOKEN") && marketApi.includes("tindexIds"), "Market API must route new exchange IDs to TSETMC while preserving optional legacy Tindex links"],
  [marketReliabilitySource.includes('MarketProviderStatus = "ok" | "degraded" | "unavailable" | "unconfigured" | "idle"') && marketReliabilitySource.includes('"timeout"') && marketReliabilitySource.includes('"rate_limited"') && marketReliabilitySource.includes('"invalid_response"') && marketReliabilitySource.includes("marketProviderWarning"), "Market providers must expose stable health/failure categories and safe user-facing warnings"],
  [tsetmcProviderSource.includes("DEFAULT_REQUEST_TIMEOUT_MS") && tsetmcProviderSource.includes("DEFAULT_REQUEST_BUDGET_MS") && tsetmcProviderSource.includes("deadlineAt") && tsetmcProviderSource.includes("Math.min(this.requestTimeoutMs, remainingBudget)") && tsetmcProviderSource.includes("Promise.all(chunk.map"), "TSETMC quote refresh must share a bounded provider budget while retaining small parallel request chunks"],
  [marketApi.includes("const [brsRun, tsetmcRun, legacyRun] = await Promise.all") && marketApi.includes("runMarketProvider") && marketApi.includes("summarizeMarketHealth") && marketApi.indexOf("getFallbackQuotes") > marketApi.indexOf("const primary = brsRun.value"), "Independent market providers must start in parallel while optional Tindex core fallback stays conditional on the BrsApi result"],
  [marketApi.includes("health,") && marketSearchSource.includes("health,") && marketHistoryApiSource.includes("health,") && marketHook.includes("MarketHealthSummary") && marketHook.includes("setHealth(data.health)") && marketRefreshButton.includes("controls.health?.degraded"), "Quote/search/history health metadata must reach the client and make degraded refresh state visible"],
  [!marketApi.includes("error.message") && !marketSearchSource.includes("error.message") && !marketHistoryApiSource.includes("error.message") && !tindexProviderSource.includes("payload?.message") && marketProvider.includes("providerErrorFromStatus") && tsetmcProviderSource.includes("providerErrorFromStatus"), "Market routes must not expose raw upstream error bodies or arbitrary provider exception text"],
  [assetDialogSource.includes("ExchangeInstrumentPicker") && assetDialogSource.includes('marketSource') && assetDialogSource.includes('marketId') && exchangePickerSource.includes("MarketSourceLabel") && exchangePickerSource.includes('MarketSourceLabel source={selected.source}') && exchangePickerSource.includes('onSelect(item)'), "Stock and fund creation must support source-aware exchange linking with visible attribution"],
  [portfolioSource.includes("resolveAssetValuation") && marketValuationSource.includes("positivePrice(quote?.priceToman)") && marketValuationSource.includes("manualPriceToman") && marketHook.includes("targetDescriptors") && marketHook.includes("params.append(target.source, target.id)") && marketHook.includes('quote.source !== "tsetmc"') && marketHook.includes('quote.source !== "tindex"'), "Linked exchange assets must request only source-aware market IDs and retain safe manual pricing fallback"],
  [marketApi.includes("needsCoreFallback") && marketApi.includes("getFallbackQuotes") && marketPrioritySource.includes("for (const quote of primary)"), "BrsApi must remain primary while optional Tindex supplies only missing core quotes"],
  [tindexProviderSource.includes("/boards") && tindexProviderSource.includes("USD-EXCHANGE-RATE") && tindexProviderSource.includes("GOLD-18K") && tindexProviderSource.includes("btc") && tindexProviderSource.includes('request<TindexBoardsPayload>("/boards", 1800)') && !tindexProviderSource.includes('cache: "no-store"'), "Optional Tindex core fallback must stay consolidated and protected by a long shared cache"],
  [tindexProviderSource.includes("slice(0, 1)") && tindexProviderSource.includes("stock-market/symbol") && tindexProviderSource.includes("3600"), "Legacy Tindex exchange links must refresh conservatively instead of exhausting the free account quota"],
  [marketSourceLabelSource.includes("منبع داده: TSETMC") && marketSourceLabelSource.includes("https://www.tsetmc.com") && marketSourceLabelSource.includes("منبع داده: Tindex") && exchangePickerSource.includes("MarketSourceLabel"), "Exchange quotes must visibly attribute both direct TSETMC and legacy Tindex sources"],
  [marketHistoryApiSource.includes("new TsetmcProvider().getCandles") && marketHistoryApiSource.includes("getExchangeCandles") && marketHistoryApiSource.includes("getIndicatorCandles") && marketHistoryApiSource.includes("s-maxage=3600"), "Market history API must prefer real TSETMC exchange candles while preserving optional legacy/core Tindex history behind server caching"],
  [marketHistoryHook.includes("/api/market/history") && marketHistoryHook.includes('params.set("source", marketSource)') && marketHistoryHook.includes("snapshotsToCandles") && marketHistoryHook.includes("memoryCache"), "Market history must pass exchange source identity and retain real local Snapshot fallback"],
  [tsetmcProviderSource.includes("parseTsetmcHistoryPayload") && tsetmcProviderSource.includes("priceFirst") && tsetmcProviderSource.includes("priceMin") && tsetmcProviderSource.includes("priceMax") && tindexProviderSource.includes("parseTindexCandlesPayload"), "Exchange history parsers must normalize real TSETMC OHLC data while retaining legacy Tindex candle compatibility"],
  [marketChartCardSource.includes('"1m"') && marketChartCardSource.includes('"3m"') && marketChartCardSource.includes("MarketSourceLabel") && financialChartSource.includes("LineSeries") && financialChartSource.includes("CandlestickSeries"), "Market charts must expose real 1m/3m history, source attribution, line indicators and exchange candles"],
  [marketChartCardSource.includes('<RangePicker value={range} onChange={setRange} />\n      </div>\n      {candles.length >= 2 ? <>'), "Market history range picker must stay visible in loading and empty states"],
  [selectSource.includes("collisionPadding={12}") && selectSource.includes("min(16rem, calc(var(--radix-select-content-available-height) - 3.5rem))") && selectSource.includes("overflow-y-auto"), "Shared Select dropdowns must stay within the viewport and scroll when options are long"],
  [db.includes("marketWatchlist") && appDataSource.includes("db.marketWatchlist") && appRouteLayout.includes("data.watchlist") && investmentsPageSource.includes("watchlist={data.watchlist}"), "Market watchlist must be persisted and wired through the application runtime"],
  [marketWatchlistSource.includes("دیده‌بان بازار") && marketWatchlistSource.includes("افزودن به سبد") && marketWatchlistSource.includes("marketWatchlistRows"), "Investments must expose a pre-purchase market watchlist with a direct portfolio shortcut"],
  [types.includes("navToman?: number") && tindexProviderSource.includes("nav?:") && tindexProviderSource.includes("navToman") && !tsetmcProviderSource.includes("navToman") && navSource.includes("premiumToNavPercent"), "Fund NAV must remain optional: legacy providers may expose it while the direct TSETMC price adapter must not fabricate missing NAV"],
  [marketWatchlistSource.includes("MarketWatchlistToolbar") && marketWatchToolbarSource.includes("بیشترین تخفیف NAV") && marketWatchHelperSource.includes('filter === "discount"') && marketWatchHelperSource.includes('sort === "gain"'), "Market watchlist must support local search, portfolio/NAV filters and decision-oriented sorting"],
  [marketWatchlistSource.includes("WatchlistSummary") && marketWatchHelperSource.includes("watchlistSummary") && marketWatchHelperSource.includes("navSignal"), "Market watchlist must summarize movers and expose explicit NAV discount/premium signals"],
  [marketWatchlistSource.includes("MarketWatchDetailDialog") && marketWatchDetailSource.includes("useMarketHistory") && marketWatchDetailSource.includes('"1m", "3m"') && marketWatchDetailSource.includes("افزودن به سبد"), "Watchlist items must open real market history details with a direct portfolio shortcut"],

  [backgroundPushHookSource.includes("pushManager.subscribe") && backgroundPushHookSource.includes("/api/push/subscription") && backgroundPushHookSource.includes("BACKGROUND_PUSH_EXPERIMENT_ENABLED"), "Background Push experiment must stay preserved behind the explicit feature flag"],
  [marketPushStatusSource.includes("هشدار وقتی PWA بسته است") && marketPushStatusSource.includes("Push Subscription"), "Paused Background Push UI implementation must remain available for future work"],
  [marketAlertsCardSource.includes("backgroundPush.featureEnabled && <MarketPushStatus"), "Background Push controls must stay hidden unless the experimental flag is enabled"],
  [pushSubscriptionApiSource.includes("mergeRemoteAlerts") && pushSubscriptionApiSource.includes("config.featureEnabled") && pushStoreSource.includes("sha256"), "Push subscription experiment must keep privacy reconciliation and refuse the disabled default"],
  [pushCronSource.includes("runMarketAlertCron") && pushCronSource.includes("sendMarketAlertPush") && pushConfigSource.includes("featureEnabled") && pushFeatureSource.includes("NEXT_PUBLIC_EXPERIMENTAL_BACKGROUND_PUSH"), "Preserved Push evaluator must require the explicit experimental feature flag"],
  [vercelConfigSource.trim() === "{}", "Zero-cost public deployment must not ship a scheduled Background Push cron"],
  [serviceWorker.includes('addEventListener("push"') && serviceWorker.includes("markAlertTriggered") && serviceWorker.includes("showNotification"), "Service worker Push handling must stay preserved for the backlog experiment"],
  [db.includes("marketAlerts") && types.includes("MarketAlertKind") && appDataSource.includes("db.marketAlerts") && appRouteLayout.includes("useMarketAlerts"), "Market alerts must be persisted and evaluated from the application runtime"],
  [marketAlertHelperSource.includes("marketAlertTransition") && marketAlertHelperSource.includes('return "trigger"') && marketAlertHelperSource.includes('return "rearm"'), "Market alerts must suppress duplicate triggers until the condition clears"],
  [marketAlertsCardSource.includes("هشدارهای بازار") && marketAlertDialogSource.includes("Notification.requestPermission") && marketAlertHookSource.includes("showNotification") && marketAlertHookSource.includes('mode !== "live"'), "Market alerts must expose opt-in browser notifications without requiring them"],
  [marketWatchlistSource.includes("RiNotification3Line") && marketWatchDetailSource.includes("ساخت هشدار") && marketAlertDialogSource.includes("nav_discount"), "Watchlist and market details must offer direct price/NAV alert shortcuts"],

  [deviceTransferCardSource.includes("انتقال بین دستگاه‌ها") && deviceTransferCardSource.includes("بدون حساب و فضای ابری پولم‌کو") && deviceTransferHookSource.includes("RTCPeerConnection"), "Device transfer must stay direct, local-first and account-free"],
  [deviceTransferHookSource.includes("createBackupEnvelope") && deviceTransferHookSource.includes("createRecoverySnapshot") && deviceTransferHookSource.includes("importDatabaseObject") && deviceTransferHelperSource.includes("validateTransferData"), "Device transfer must encrypt payloads, preview valid data and create recovery before replacement"],
  [deviceTransferHookSource.includes("stage: \"imported\"") && deviceTransferHookSource.includes("sendChannelMessages") && deviceTransferHelperSource.includes("splitTransferText"), "Device transfer must provide chunked progress and explicit receiver acknowledgement"],
  [deviceTransferHookSource.includes('schemaVersion: LOCAL_DATABASE_SCHEMA_VERSION') && deviceTransferHookSource.includes('{ version: 1 }') && deviceTransferHelperSource.includes('validateTransferSchema'), "Direct transfer must gate future schemas while keeping its legacy encrypted envelope interoperable"],
  [backupSafetyHookSource.includes("[metaQuery]") && !backupSafetyHookSource.includes("const meta = metaQuery ?? []"), "Backup safety memoization must not recreate a fallback dependency on every render"],

  [!desktopSidebar.includes("جست‌وجوی کلی") && appTopbar.includes("جست‌وجوی کلی") && globalSearch.includes("Ctrl / ⌘ + K"), "Desktop global search must have one clear entry point in the topbar"],
  [mobileNavigation.includes("onOpenSearch") && mobileNavigation.includes("RiSearch2Line"), "Global search must be accessible on mobile"],
  [desktopSidebar.includes('href="/dashboard"') && mobileNavigation.includes('href="/dashboard"') && desktopSidebar.includes("BrandLogo") && mobileNavigation.includes("BrandLogo"), "Brand logo must link to the dashboard in desktop and mobile navigation"],
  [drawer.includes("dragY") && drawer.includes("onPointerMove") && drawer.includes("closeRef.current?.click()"), "Mobile Drawer must support swipe-down dismissal"],
  [appTopbar.includes("MarketRefreshButton") && appTopbar.includes("PrivacyToggle") && appTopbar.includes("ThemeToggle") && !appTopbar.includes("DateRangePicker") && pageDateFilterBar.includes("DateRangePicker"), "Desktop utilities belong in the topbar while date filtering must stay page-scoped"],
  [!desktopSidebar.includes("MarketRefreshButton") && !desktopSidebar.includes("PrivacyToggle") && !desktopSidebar.includes("ThemeToggle"), "Desktop sidebar must stay focused on navigation instead of utility controls"],
  [dateRangePicker.includes('mode="range"') && dateRangePicker.includes("همه زمان") && dateFilterHook.includes("dateInRange") && dateFilterHook.includes("filtered"), "Responsive Persian date-range filtering is not wired"],
  [mobileNavigation.includes("mobile-bottom-nav") && mobileNavigation.includes("TodayDate"), "Mobile navigation must expose a readable bottom bar and today date"],
  [dataTable.includes("type RowData") && dataTable.includes("TData extends RowData"), "DataTable must satisfy TanStack Table v9 RowData constraints"],
  [dataTable.includes("table.store.state.pagination.pageIndex") && !dataTable.includes("table.state.pagination.pageIndex"), "TanStack Table v9 pagination must read the core store in the shared generic Pagination component"],
  [newMoneyHook.includes("newMoneySchema.parse") && newMoneyHook.includes('typeof incomeIdKey !== "number"') && newMoneyHook.includes("watchedLife ?? activeRule.lifePct"), "New-money persistence must validate form values, narrow Dexie IDs, and normalize watched allocation numbers"],
  [dataTable.includes("مرتب‌سازی ستون") && !dataTable.includes("<button\n                            type=\"button\"\n                            className=\"inline-flex w-full"), "Sortable headers must not wrap interactive help controls in a button"],
  [rootLayout.includes('/favicon.svg') && appManifest.includes('/icon-192.png') && serviceWorker.includes('/favicon.svg') && favicon.includes("prefers-color-scheme: dark"), "Theme-aware favicon and PWA icon assets must be wired into metadata and offline precache"],
];

const failures = checks.filter(([ok]) => !ok).map(([, message]) => message);
if (failures.length) {
  console.error(`Regression checks failed:\n${failures.join("\n")}`);
  process.exit(1);
}
console.log("Regression checks passed: reports reconciliation upgrade, unified financial activity history, local data health audit, safe income correction integrity, auditable fund movement ledger, safe asset archive lifecycle, investment transaction correction integrity, automated schema 6→8 browser migration, persisted provider-scoped market identity, decision-safe Snapshot fallback, privacy-safe report export, draggable mobile navigation, focused search, warning-free release lint, safe workspace motion, product-tour spotlight clarity, release browser gate, workspace-only PWA entry, safe local data, privacy boundaries, market cache, and responsive UI are wired.");
