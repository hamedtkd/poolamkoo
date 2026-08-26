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


const [historyImportDialogSource, historicalImportSource, assetDialogSource, tindexProviderSource, marketSearchSource, portfolioSource, portfolioDecisionSource, portfolioAllocationSource, portfolioTablesSource, exchangePickerSource, marketPrioritySource, marketSourceLabelSource] = await Promise.all([
  read("components/investments/history-import-dialog.tsx"),
  read("lib/historical-import.ts"),
  read("components/investments/asset-dialog.tsx"),
  read("lib/market/tindex.ts"),
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

const [motionRevealSource, providersMotionSource, dashboardMotionSource, sparklineMotionSource, portfolioMotionSource, monthlyMotionSource, gitattributesSource, packageSource] = await Promise.all([
  read("components/motion/reveal.tsx"), read("components/providers.tsx"), read("components/sections/dashboard.tsx"),
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
const [reportInsightsSource, decisionInsightsSource] = await Promise.all([
  read("lib/report-insights.ts"), read("components/reports/decision-insights-card.tsx"),
]);
const [mediaCaptureSource, mediaDemoSource, mediaDocsSource, mediaWorkflowSource, iconCheckSource] = await Promise.all([
  read("scripts/capture-product-media.mjs"), read("scripts/media/demo-data.mjs"), read("docs/assets/README.md"),
  read(".github/workflows/product-media.yml"), read("scripts/check-icon-imports.mjs"),
]);

const [releaseSmokeSource, releaseSmokeWorkflowSource] = await Promise.all([
  read("scripts/release-browser-smoke.mjs"), read(".github/workflows/release-smoke.yml"),
]);

const checks = [
  [packageSource.includes('"check:release": "npm run check && npm run build && npm run test:browser:release:built"') && releaseSmokeSource.includes("landing-to-workspace navigation") && releaseSmokeSource.includes("fresh onboarding") && releaseSmokeSource.includes('clientNavigate(client, "/settings"') && releaseSmokeSource.includes("workspace content must remain visible after client navigation") && releaseSmokeSource.includes("workspace service worker registration") && releaseSmokeWorkflowSource.includes("npm run check:release"), "Release browser gate must cover public/workspace navigation, onboarding/bootstrap, client route continuity, reports and PWA runtime boundaries"],

  [landingPageSource.includes("LandingHero") && landingPageSource.includes("LandingSections") && landingHeroSource.includes("شروع رایگان") && landingHeroSource.includes("Local-first"), "Public root must present a clear Persian landing page before entering the financial app"],
  [landingHeroSource.includes("LandingProductVisual") && landingVisualSource.includes("poolamkoo-finance-light.webp") && landingVisualSource.includes("poolamkoo-finance-dark.webp") && landingVisualSource.includes("داده‌های نمایش‌داده‌شده نمونه‌اند"), "Landing hero must use the approved theme-aware product visuals and label their values as sample presentation data"],
  [!landingHeroSource.includes("MotionReveal") && landingHeroSource.includes("landing-enter") && landingVisualSource.includes('data-landing-visual="light"') && landingVisualSource.includes('data-landing-visual="dark"') && publicShellSource.includes("PublicThemeToggle") && publicThemeToggleSource.includes("useTheme") && !publicThemeToggleSource.includes("@/lib/db"), "Critical landing hero media must render without Motion hydration and public theme switching must stay independent from financial IndexedDB"],
  [packageSource.includes('"name": "poolamkoo"') && packageSource.includes('"version": "0.27.1"') && appVersionSource.includes('APP_VERSION = "0.27.1"'), "Package and runtime versions must use the canonical Poolamkoo v0.27.1 identity"],
  [rootLayout.includes("Poolamkoo open-source contributors") && serviceWorker.includes('const CACHE = "poolamkoo-v46"') && serviceWorker.includes('/logo-poolamkoo.svg'), "Active runtime branding and PWA cache/assets must use the Poolamkoo spelling"],
  [portfolioDecisionSource.includes("RiScalesLine") && !portfolioDecisionSource.includes("RiScaleLine") && iconCheckSource.includes("react-icons/ri named imports"), "Portfolio decision UI must use a real Remix Icon export and keep the icon-import quality gate"],
  [packageSource.includes('"media:capture"') && packageSource.includes('"media:capture:built"') && mediaCaptureSource.includes("createPoolamkooMediaDemoData") && mediaCaptureSource.includes("Storage.clearDataForOrigin") && mediaCaptureSource.includes('resolve(ROOT, "node_modules", "next", "dist", "bin", "next")') && mediaCaptureSource.includes("landing-dark-desktop.png") && mediaDemoSource.includes("Fixture نمایشی") && mediaDocsSource.includes("Browser Profile موقت") && mediaWorkflowSource.includes("poolamkoo-product-screenshots"), "Product screenshots must be reproducible cross-platform from isolated fake data locally and through the manual GitHub artifact workflow"],
  [siteSource.includes('APP_ENTRY_PATH = "/dashboard"') && appManifest.includes('\"start_url\": \"/dashboard\"') && appManifest.includes('\"id\": \"/dashboard\"') && desktopSidebar.includes('href="/dashboard"') && mobileNavigation.includes('href="/dashboard"'), "Landing and installed app must keep separate root and dashboard entry points"],
  [!rootLayout.includes("app.webmanifest") && !rootLayout.includes("appleWebApp") && workspaceLayoutSource.includes('manifest: "/app.webmanifest"') && workspaceLayoutSource.includes("appleWebApp"), "Only workspace routes may advertise the installable PWA and iOS standalone metadata"],
  [landingPageSource.includes("StandaloneLandingRedirect") && standaloneLandingRedirectSource.includes('(display-mode: standalone)') && standaloneLandingRedirectSource.includes('window.location.pathname !== "/"') && standaloneLandingRedirectSource.includes('window.location.replace("/dashboard")'), "Standalone root launches must enter the dashboard without redirecting normal landing visitors"],
  [!serviceWorker.split("\n").find((line) => line.startsWith("const PRECACHE"))?.includes('["/",') && serviceWorker.includes('"/dashboard"') && serviceWorker.includes('"/offline"'), "Service worker explicit precache must exclude the marketing root while retaining dashboard and offline shell"],
  [workspaceLayoutSource.includes("index: false") && robotsSource.includes('disallow: ["/dashboard"') && sitemapSource.includes("PUBLIC_INDEX_ROUTES"), "Financial app routes must stay out of search indexing while public trust pages remain discoverable"],
  [landingSectionsSource.includes("بکاپ رمزنگاری‌شده") && landingSectionsSource.includes("انتقال مستقیم دستگاه") && landingSectionsSource.includes("رایگان، متن‌باز"), "Landing page must explain data ownership, recovery and open-source positioning"],
  [appDataSource.includes("bootstrapError") && appDataSource.includes("BOOT_TIMEOUT_MS") && appDataSource.includes("performBootstrap(run)") && !appDataSource.includes("retryBootstrap();") && appRouteLayout.includes("LocalDataUnavailable") && localDataUnavailableSource.includes("Site Data") && !providersSource.includes("ensureSeedData"), "IndexedDB bootstrap failures must stay retryable without synchronous setState inside the mount effect"],
  [db.includes('db.on("blocked"') && db.includes('db.on("versionchange"') && appDataSource.includes("LOCAL_DATA_BLOCKED_EVENT") && appDataSource.includes("const canQuery = bootstrap.status === \"ready\"") && localDataIssuesSource.includes('name === "VersionError"') && localDataUnavailableSource.includes("classifyLocalDataIssue") && marketHook.includes("enabled = true") && backupSafetyHookSource.includes("enabled = true") && communityHookSource.includes("enabled ? db.appMeta") && appRouteLayout.includes("data.marketAlerts, data.ready"), "Multi-tab IndexedDB upgrades must block stale writes and delay financial database consumers until bootstrap succeeds"],
  [!providersSource.includes("PwaUpdateNotice") && workspaceLayoutSource.includes("PwaUpdateNotice") && pwaUpdateNoticeSource.includes("نسخه جدید پولم‌کو آماده است") && pwaUpdateHookSource.includes("controllerchange") && pwaUpdateHookSource.includes("waiting.postMessage({ type: PWA_UPDATE_MESSAGE })") && pwaUpdateHelperSource.includes('PWA_UPDATE_MESSAGE = "SKIP_WAITING"'), "PWA updates must wait for explicit acceptance and reload only after the new worker controls the page"],
  [serviceWorker.includes('const CACHE = "poolamkoo-v46"') && serviceWorker.includes('event.data?.type === "SKIP_WAITING"') && serviceWorker.indexOf('addEventListener("message"') < serviceWorker.indexOf("self.skipWaiting()"), "Service worker updates must not skip waiting unconditionally during install"],
  [networkStatusHookSource.includes("useSyncExternalStore") && !networkStatusHookSource.includes("useState") && shell.includes("NetworkStatusBanner") && networkStatusSource.includes("آفلاین هستی") && offlineScreenSource.includes("Local-first"), "Network state must use an external-store subscription without synchronous hydration setState"],
  [obsoleteRouteCleanupSource.includes('"app/(app)"') && obsoleteRouteCleanupSource.includes('"app/manifest.ts"') && obsoleteRouteCleanupSource.includes('".next/types"') && obsoleteRouteCleanupSource.includes('".next/dev/types"'), "Replacement installs must remove legacy route/manifest entrypoints and stale Next.js route validators before typecheck/build"],
  [notFoundSource.includes("۴۰۴") && notFoundSource.includes("/data") === false, "Unknown routes must fail safely without offering destructive data actions"],
  [rootLayout.includes("CloudflareWebAnalytics") && analyticsComponentSource.includes("next/script") && analyticsHelperSource.includes("static.cloudflareinsights.com") && analyticsHelperSource.includes('nodeEnv === "production"'), "Cloudflare Web Analytics must be optional, production-only and wired through the root layout"],
  [analyticsComponentSource.includes("NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN") && envExampleSource.includes("NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN") && !analyticsComponentSource.includes("fetch("), "Analytics must use only the public site token and the official beacon without a custom telemetry transport"],
  [settingsSection.includes("AnalyticsSettingsCard") && analyticsSettingsSource.includes("مبلغ") && analyticsSettingsSource.includes("Custom Event") && analyticsPageSource.includes("بدون Cookie"), "Analytics status and privacy boundaries must be visible in the app"],
  [analyticsDocsSource.includes("query strings are not logged") && analyticsDocsSource.includes("No analytics package is installed") && analyticsPageSource.includes("Self-host"), "Analytics documentation must preserve the zero-cost self-host and query-string privacy model"],
  [packageSource.includes('"motion"') && providersMotionSource.includes('reducedMotion="user"') && motionRevealSource.includes("useReducedMotion"), "Motion must be installed behind a global user reduced-motion policy"],
  [shell.includes("RouteTransition") && motionRevealSource.includes("data-route-content={routeKey}") && !motionRevealSource.includes("AnimatePresence") && dashboardMotionSource.includes("MotionReveal") && dashboardMotionSource.includes("sm:col-span-2 xl:col-span-2"), "Route continuity must never hide the whole workspace route while dashboard cards keep restrained motion"],
  [desktopSidebar.includes('layoutId="desktop-nav-active"') && mobileNavigation.includes('layoutId="mobile-nav-active"'), "Desktop and mobile navigation must keep a continuous active indicator"],
  [appNavigationSource.includes("mobilePrimaryNav") && appNavigationSource.includes("appNav[1]") && mobileNavigation.includes("mobilePrimaryNav.map") && mobileNavigation.includes('aria-label="ناوبری اصلی موبایل"'), "Mobile primary navigation must keep the daily incoming-money flow one tap away"],
  [desktopSidebar.includes('aria-current={active(item.href) ? "page" : undefined}') && mobileNavigation.includes('aria-current={active(item.href) ? "page" : undefined}') && mobileNavigation.includes('aria-expanded={menuOpen}'), "Navigation must expose active and expanded state to assistive technology"],
  [globalSearch.includes('role="combobox"') && globalSearch.includes('aria-activedescendant') && globalSearch.includes('role="listbox"') && globalSearch.includes('ArrowDown') && globalSearch.includes('aria-live="polite"'), "Global search must support keyboard result navigation and announce result changes"],
  [dialog.includes('aria-label="بستن پنجره"') && drawer.includes("DrawerDescription") && dateRangePicker.includes("DrawerDescription") && dataTable.includes("aria-sort") && dataTable.includes('aria-label="صفحه‌بندی جدول"'), "Shared overlays and data tables must preserve accessible names, descriptions and sort/page state"],
  [css.includes(".app-mobile-safe-bottom") && css.includes("env(safe-area-inset-bottom)") && mobileNavigation.includes("min-h-[72px]"), "Mobile app content and bottom navigation must stay clear of device safe areas"],
  [toastSource.includes("AnimatePresence") && dialog.includes("data-motion-dialog-body") && dialog.includes("useReducedMotion") && css.includes("skeleton-shimmer") && css.includes("prefers-reduced-motion: reduce"), "Dialog, toast and loading motion must include reduced-motion-safe behavior"],
  [sparklineMotionSource.includes("<svg") && !sparklineMotionSource.includes("recharts") && portfolioMotionSource.includes("isAnimationActive={!reduced}") && monthlyMotionSource.includes("isAnimationActive={!reduced}"), "Financial chart animations must stop when the user requests reduced motion"],
  [dashboardMotionSource.includes("هنوز صندوق هدفی نداری") && dashboardMotionSource.includes("قیمت بازار فعلاً در دسترس نیست") && dashboardMotionSource.includes("نمودار بعد از اولین خرید شکل می‌گیرد"), "Dashboard must show explicit empty states instead of blank or misleading loading states"],
  [gitattributesSource.includes("* text=auto eol=lf"), "Repository text files must keep deterministic LF line endings across Windows and Unix"],
  [communitySource.includes("SUPPORT_PROMPT_ACTIVE_DAYS = 7") && communitySource.includes("SUPPORT_PROMPT_SNOOZE_DAYS = 60") && communitySource.includes("SUPPORT_PROMPT_THANKS_DAYS = 180") && communityHookSource.includes("withUsageDay"), "Community support prompt must require seven distinct active days and use long local cooldowns"],
  [supportPromptSource.includes("ستاره در GitHub") && supportPromptSource.includes("حمایت اختیاری") && supportPromptSource.includes('pathname === "/dashboard"'), "Support prompt must stay gentle, optional, and dashboard-only"],
  [githubStatsApiSource.includes("api.github.com/repos/hamedtkd/poolamkoo") && githubStatsApiSource.includes("revalidate: 21_600") && sidebarCommunitySource.includes("RiStarFill"), "GitHub entry must use a cached public star count without requiring a client token"],
  [privacyPageSource.includes("IndexedDB") && privacyPageSource.includes("Analytics اختیاری و بدون داده مالی") && privacyPageSource.includes("WebRTC") && aboutPageSource.includes("متن‌باز") && guidePageSource.includes("بکاپ") && securityPageSource.includes("Secretهای سرور") && licensePageSource.includes("مجوز MIT"), "Public trust pages must explain local-first privacy, security, licensing, and backup reality"],
  [desktopSidebar.includes("SidebarCommunity") && mobileNavigation.includes("GithubLink") && settingsSection.includes("OpenSourceCard") && openSourceCardSource.includes("/privacy"), "Open-source, guide, privacy and GitHub surfaces must be reachable from desktop, mobile and settings"],
  [onboardingSource.includes('href="/privacy"'), "Privacy policy must be reachable before onboarding is complete"],
  [db.includes('this.version(LOCAL_DATABASE_SCHEMA_VERSION).stores(storesV6)') && appVersionSource.includes('LOCAL_DATABASE_SCHEMA_VERSION = 6') && db.includes('recoverySnapshots') && db.includes('appMeta'), "Data safety schema must persist bounded recovery snapshots and device-local backup metadata"],
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
  [productTour.includes('راهنمای سریع') && tourHook.includes('poolamkoo:start-tour') && types.includes('guideComplete'), "Initial product tour is not wired"],
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
  [reportsSection.includes("فاصله از هدف") && reportsSection.includes("بازده از خرید") && reportsSection.includes("HelpLabel"), "Reports must explain portfolio metrics and distinguish personal P/L from daily market change"],
  [reportsSection.includes("DecisionInsightsCard") && decisionInsightsSource.includes("جمع‌بندی تصمیمی این بازه") && decisionInsightsSource.includes("هزینه روزمره") && decisionInsightsSource.includes("قانون پول در برابر تخصیص ثبت‌شده"), "Reports must turn real recorded data into factual decision insights without becoming expense accounting"],
  [reportInsightsSource.includes("allocationReliable") && reportInsightsSource.includes("largestUnderTarget") && reportInsightsSource.includes("planHealth") && reportInsightsSource.includes("fundHealth"), "Report decision calculations must explicitly guard incomplete allocation data and deterministic follow-up priorities"],
  [reportsSection.includes("decision.allocatedTotal") && !reportsSection.includes("rule?.lifePct ?? 30"), "Reports must not invent allocation shares from the configured rule when the selected period has no allocation data"],
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

  [investmentsSource.includes("PortfolioDecisionCard") && portfolioDecisionSource.includes("مرور ترکیب سبد") && portfolioDecisionSource.includes("اولویت بررسی برای پول جدید") && portfolioDecisionSource.includes("توصیه خرید یا فروش نیست"), "Investments must expose factual target-vs-current portfolio decision guidance without investment advice"],
  [portfolioAllocationSource.includes("ALLOCATION_NEAR_TARGET_TOLERANCE_PCT = 1") && portfolioAllocationSource.includes("targetsValid") && portfolioAllocationSource.includes("pricingIncomplete") && portfolioAllocationSource.includes("newMoneyPriorities"), "Portfolio allocation guidance must use deterministic target gaps, explicit tolerance and incomplete-pricing safety"],
  [portfolioTablesSource.includes("سهم فعلی") && portfolioTablesSource.includes("هدف") && portfolioTablesSource.includes("allocationRows"), "Portfolio desktop and mobile rows must expose current share, target and allocation status"],
  [investmentsSource.includes("HistoryImportDialog") && investmentsSource.includes("ورود سوابق CSV") && historyImportDialogSource.includes("HistoryImportPreview"), "Investments must expose the historical CSV import flow"],
  [historicalImportSource.includes("parseHistoricalCsv") && historicalImportSource.includes("validateSellAvailability") && historicalImportSource.includes("transactionFingerprint") && historicalImportSource.includes("persianDateToIso"), "Historical import must validate dates, duplicates and sell availability before persistence"],
  [historyImportDialogSource.includes("downloadTemplate") && historyImportDialogSource.includes("missingAssets") && assetDialogSource.includes("initialName"), "Historical import must offer a template and in-context creation for missing assets"],
  [marketApi.includes("TINDEX_API_TOKEN") && marketApi.includes("tindexIds") && marketSearchSource.includes("new TindexProvider") && marketSearchSource.includes('search(query)'), "Iran exchange market search/quotes must be wired through the server-only Tindex provider"],
  [tindexProviderSource.includes("stocks/by-category/stock-energy") && tindexProviderSource.includes("rialToToman") && tindexProviderSource.includes("stock-market/symbol"), "Tindex integration must search exchange instruments and normalize rial prices to toman"],
  [assetDialogSource.includes("ExchangeInstrumentPicker") && assetDialogSource.includes('marketSource') && assetDialogSource.includes('marketId') && exchangePickerSource.includes("MarketSourceLabel"), "Stock and fund creation must support in-context exchange linking with source attribution"],
  [portfolioSource.includes("positivePrice(quote?.priceToman)") && portfolioSource.includes("marketPrice ?? manualPrice") && marketHook.includes('marketSource === "tindex"') && marketHook.includes('params.append("tindex"'), "Linked exchange assets must use live quotes with safe manual fallback and request only their market IDs"],
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
  [marketWatchlistSource.includes("دیده‌بان بازار") && marketWatchlistSource.includes("افزودن به سبد") && marketWatchlistSource.includes("marketWatchlistRows"), "Investments must expose a pre-purchase market watchlist with a direct portfolio shortcut"],
  [types.includes("navToman?: number") && tindexProviderSource.includes("nav?:") && tindexProviderSource.includes("navToman") && navSource.includes("premiumToNavPercent"), "Exchange fund NAV must be normalized and exposed without fabricating missing values"],
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
console.log("Regression checks passed: visible landing hero, public theme control, release browser gate, decision-focused reports, workspace-only PWA entry, safe local data, privacy boundaries, market cache, and responsive UI are wired.");
