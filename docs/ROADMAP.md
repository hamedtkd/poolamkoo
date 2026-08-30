# Poolamkoo roadmap

This roadmap prioritizes zero-cost, local-first product reliability before optional hosted infrastructure.

## v0.13.1 — Zero-cost baseline

- Pause Background Web Push behind an explicit experimental feature flag.
- Ship no Vercel Cron.
- Require no Redis/VAPID secrets for normal deployments.
- Keep the implementation and tests in the repository backlog.

## v0.14 — Data safety and durable backups ✅

- Backup health/status, 7-day stale policy, and 3-day snooze.
- Encrypted reminder flow plus shared Toast/Error Handling.
- Daily bounded local Recovery Snapshots and pre-destructive recovery points.
- Browser persistence status with explicit warnings that local recovery is not a permanent backup.
- Device-only backup metadata kept outside exported financial payloads.

## v0.15 — Simple device-to-device transfer ✅

- Direct encrypted WebRTC transfer inspired by Saatyar, with a shorter copy/share pairing flow.
- Sender: «انتقال به دستگاه جدید» → one-time PIN + pairing code.
- Receiver: paste/share code → return answer → preview → explicit import.
- No central storage of financial data and no required signaling backend.
- Version/schema validation, chunk progress, SHA-256 integrity, acknowledgement, timeout/retry, and duplicate-safe replace import.
- Encrypted backup file transfer remains the universal fallback when WebRTC cannot connect.
- QR scanning can be reconsidered later only if it materially simplifies the flow without adding fragile browser dependencies.

## v0.16 — Open-source product surface ✅

- GitHub entry point for `https://github.com/hamedtkd/poolamkoo` and a cached public star count.
- Guide/help, About, Privacy/Data policy, Security, License, and data-safety pages.
- Optional support link (`https://daramet.com/hamedtkd`, same voluntary support destination used by Saatyar) without gating any feature.
- Gentle support prompt only after real repeated use (target: at least 7 distinct active days), with choices to star GitHub, support financially, or dismiss.
- Long cooldown after dismissal; never interrupt onboarding or critical financial flows.

## v0.17 — Motion and dashboard polish ✅

- Add the modern `motion` package for restrained route/card/dialog micro-interactions.
- Respect `prefers-reduced-motion` everywhere.
- No decorative animation that delays data entry or makes financial values harder to scan.
- Improve dashboard hierarchy, empty/loading transitions, and responsive continuity.

## v0.18 — Privacy-first usage analytics ✅

- Optional Cloudflare Web Analytics integration for public deployments, loaded only in production.
- Track aggregate visits, page views, route paths, device/browser categories and Core Web Vitals; never financial amounts, asset names, search terms, transactions, form contents or backup data.
- No custom analytics event layer and no analytics npm dependency; token/config absent means no third-party beacon at all.
- Dedicated in-app Analytics page, Settings status card, privacy documentation and release QA.


## v0.19 — Landing page and release hardening ✅

- Public Persian landing page at `/` with the local-first financial app moved to `/dashboard`.
- SEO metadata, sitemap/robots boundaries, and noindex protection for financial application routes.
- IndexedDB startup failure/timeout handling without destructive reset guidance.
- Offline status UX, global/route error recovery, 404 handling, and keyboard skip links.
- PWA entry/cache alignment and baseline response-header hardening.

## v0.20 — Safe app updates and local database upgrades ✅

- Replace unconditional Service Worker activation with an explicit, user-visible update flow.
- Reload only after the waiting worker is accepted, avoiding mixed old/new application shells.
- Detect IndexedDB `blocked` and `versionchange` lifecycle events across tabs.
- Stop stale tabs from continuing to write after another tab upgrades the local database.
- Delay live financial queries until local database bootstrap completes successfully.
- Keep all recovery guidance non-destructive and preserve the same local-first origin/database.

## v0.21 — Verified backups and restore safety ✅

- Add a versioned v2 backup envelope with SHA-256 corruption detection plus app/schema metadata.
- Keep legacy v1 backup files readable so existing users are not stranded after upgrading.
- Inspect/decrypt/validate backup files before replacement and show a human-readable record preview.
- Reject backups, Recovery Snapshots and direct-transfer payloads created by a newer local schema before any destructive import starts.
- Stamp new Recovery Snapshots with schema/app versions while preserving old snapshots as legacy-compatible data.
- Keep direct WebRTC transfer zero-cost and backward-friendly by retaining its v1 encrypted envelope while adding schema compatibility metadata to the transfer frame.

## v0.22 — Mobile navigation and accessibility hardening ✅

- Keep the four highest-frequency money workflows visible in the mobile bottom navigation: Home, Incoming Money, Investments, and Funds; move lower-frequency reports/settings behind the More sheet.
- Respect mobile safe-area insets so the fixed bottom navigation never covers financial content or device gesture areas.
- Expose active/expanded navigation state with `aria-current`, `aria-expanded`, labelled navigation landmarks, and consistent keyboard focus rings.
- Upgrade global search from "Enter opens first result" to a real keyboard-navigable combobox with Up/Down/Home/End selection and live result-count announcements.
- Add accessible names to icon-only financial actions, overlay close controls, drawer descriptions, sortable table headers, and table pagination.
- Keep all of the above local-only: no analytics event expansion, account requirement, server storage, or financial-data telemetry.

## v0.23 — Performance and Core Web Vitals ✅

- Remove Recharts from Dashboard sparkline rendering by using a lightweight SVG path over real local market snapshots.
- Put Dashboard portfolio history, Reports monthly bars, and investment market charts behind explicit dynamic-import boundaries.
- Keep lazy-chart loading states reduced-motion safe and preserve honest empty states when real data is absent.
- Add `check:performance` as a release regression gate so heavy chart libraries cannot silently move back into high-frequency route entry code.
- Preserve the existing offline shell, explicit PWA update flow, local-first data model, and analytics privacy boundaries.

## v0.24 — Portfolio decision UX and PWA entry hardening ✅

> v0.24.1 release hardening: canonical Latin identity is `Poolamkoo` / `poolamkoo`, the invalid Remix icon import is fixed and guarded by `check:icons`, and privacy-safe product screenshot capture is available locally and through a manual GitHub Actions artifact workflow. Legacy `poolyar-local` / `poolyar-backup` data identifiers remain unchanged for compatibility.

- Compare each real holding's current portfolio share with the user's existing target percentage, including target value and drift.
- Classify target status as underweight, near target, overweight, or no target using a documented one-percentage-point tolerance.
- Show factual new-money review priorities only when targets total 100%; never generate buy/sell advice, forecasts, or synthetic prices.
- Flag allocation review as incomplete when a held asset has only cost-basis fallback pricing and no usable market/manual price.
- Keep current/target allocation visible in desktop and mobile portfolio rows without adding a chart dependency.
- Move installable PWA metadata and Service Worker update runtime out of the public Landing surface and into `(workspace)` routes.
- Keep `/dashboard` as the manifest id/start URL, exclude `/` from explicit Service Worker precache, and redirect only standalone root launches to `/dashboard`.
- Keep IndexedDB schema 6, backup formats, analytics boundaries, Background Push default state, and local-first data ownership unchanged.

## v0.25 — Reports decision insights and landing product media ✅

- Turn Reports into a factual review surface for plan execution, money-rule balance, and current fund coverage.
- Never substitute configured target percentages for missing period data; incomplete allocation stays visibly incomplete.
- Add deterministic follow-up prompts based only on recorded local data, without expense accounting, forecasting, or buy/sell advice.
- Add approved Light/Dark landing hero media using optimized local WebP assets.
- Harden product-media capture on Windows by launching the installed Next.js runtime directly instead of spawning `npm.cmd`.
- Keep IndexedDB schema 6, privacy boundaries, market-provider behavior, and Background Push backlog unchanged.

## v0.26 — E2E release smoke tests ✅

> v0.26.1 hotfix: `clean:obsolete` now removes legacy root Manifest special routes left behind by full-source replacement, preventing old `app/manifest.ts` from re-advertising PWA install metadata on the public Landing.

- Add a small production-browser release gate without Playwright/Cypress or another browser-test dependency.
- Verify normal Landing → Workspace navigation, fresh onboarding, local IndexedDB bootstrap/persistence, seeded Dashboard data and Reports decision insights.
- Verify PWA boundaries in the real production build: public root has no install manifest/runtime initialization, workspace advertises `/app.webmanifest`, and the service worker registers from workspace.
- Keep release fixtures isolated in a temporary browser profile and block market/push/analytics requests so smoke tests do not consume real quotas or read user data.
- Add `npm run check:release` plus a manual GitHub Actions **Release smoke** workflow using the same gate.
- Keep IndexedDB schema 6, backup formats, market providers and Background Push backlog unchanged.


## v0.27 — Public landing experience and theme continuity ✅

> v0.27.4 CSS-motion/runtime hotfix: replace workspace Motion runtime entrances with `tailwindcss-animated` per-item fade directions and ~55ms stagger, keep the whole route static, and move decorative GitHub stats off Promise fetch/AbortSignal cleanup to prevent the persistent Runtime `AbortError`.
> v0.27.3 runtime/motion hotfix: GitHub star stats uses an active-effect guard instead of aborting fetches during React cleanup, and workspace pages gain a visible-at-every-frame route entrance plus top-to-bottom stagger motion without reintroducing blank-route opacity failures.
> v0.27.2 visibility hotfix: Dashboard card reveals and shared Dialog bodies no longer start transparent, so delayed/failed Motion hydration cannot leave the home page or modals blank. The browser release gate now runs with normal motion preference and opens a real new-money modal before route-continuity checks.
> v0.27.1 navigation hotfix: route-level exit/opacity animation was removed after it could leave the persistent workspace shell with blank content during Next.js client navigation. The production browser gate now clicks Reports → Settings → Reports without a document reload and asserts that route content stays visible.

- Redesign the public Hero around the approved local Light/Dark product artwork so the product is visually present above the fold.
- Keep critical Hero content visible before/without client Motion hydration; use CSS-only entrance/float effects with reduced-motion fallbacks.
- Add a public Light/Dark theme control that does not touch financial IndexedDB state.
- Extend the production browser release gate to verify landing media loads and public theme switching works before entering the workspace.
- Preserve workspace-only PWA initialization, local-first privacy boundaries, and IndexedDB schema 6.

## v0.28 — Market provider resilience ✅

> v0.28.2 animation/tooling hotfix: import `tailwindcss-animated` through its explicit CSS entry for Next/Turbopack Windows compatibility, keep modal bodies transform-only so they never start transparent, and add an animation dependency resolver gate.
> v0.28.1 motion hotfix: restore the `motion` package for code-split viewport/scroll reveals on public Landing sections while keeping Workspace route content static and per-item entrances on `tailwindcss-animated`.

- Make direct server-side `cdn.tsetmc.com` access the default source for new Tehran Stock Exchange stock/ETF search, current quotes, and daily history.
- Keep BrsApi primary for core currency/gold/crypto and share a short server cache instead of multiplying upstream requests per browser.
- Demote Tindex to optional legacy/emergency use with long quota-aware cache windows; new exchange links require no Tindex token.
- Preserve existing `source: "tindex"` records without a destructive migration and let users re-link them to TSETMC when convenient.
- Keep real local market snapshots plus manual prices as the honest fallback; never fabricate quotes/history.
- Keep IndexedDB schema 6 and Background Push disabled by default.

## v0.29 — Export/share refinements and mobile UX continuity ✅

- Add an explicit Reports export/share surface without introducing hosted report links or a central financial backend.
- Keep the default share summary privacy-minimized: percentages and decision status only, with no amounts or asset names.
- Provide an explicit local CSV for users who need detailed report data, while excluding raw transaction/backup payloads and neutralizing spreadsheet-formula prefixes.
- Redesign the mobile More sheet so it does not duplicate Home/Incoming/Investments/Funds already present in bottom navigation.
- Make the shared Drawer truly drag-to-dismiss using an independent CSS translate channel, and reuse it for compact mobile search.
- Keep workspace entrance motion consistent: title from above, content cards from below with short stagger; remove alternating left/right KPI motion.
- Tighten compact-desktop/sidebar behavior, mobile safe-bottom spacing and route Skeleton fidelity.
- Keep IndexedDB schema 6, local-first data ownership, workspace-only PWA initialization and Background Push backlog unchanged.

## v0.30 — Market provider production reliability ✅

- Introduce one shared provider-health model for BrsApi, TSETMC and optional Tindex with stable failure categories instead of leaking arbitrary upstream error text.
- Bound direct TSETMC access with a per-request timeout plus a shared refresh budget so large portfolios cannot stretch one market refresh indefinitely.
- Run independent BrsApi, TSETMC and legacy-Tindex quote work in parallel; keep Tindex core fallback conditional so the free quota is not consumed when BrsApi is complete.
- Return provider health metadata from quote/search/history routes and preserve an explicit `live + degraded` state in the client when only part of the market refresh succeeds.
- Keep real IndexedDB snapshots and manual prices as the honest fallback; do not fabricate current quotes or historical candles.
- Preserve existing legacy Tindex links without migration, keep IndexedDB schema 6, and leave Background Push disabled by default.

## v0.31 — Market transparency & privacy-safe diagnostics ✅

- Turn v0.30 provider-health metadata into an explicit Settings status surface instead of hiding it only behind the refresh control.
- Explain BrsApi, direct TSETMC and optional Tindex roles separately, including safe status, requested/received counts and approximate latency.
- Let users retry the existing market refresh from Settings and copy a support-friendly diagnostic summary without prices, symbols, asset names, market IDs, financial amounts, raw upstream bodies or provider secrets.
- Keep diagnostics local until the user explicitly copies them; add no telemetry, account requirement or hosted financial backend.
- Preserve the real-data fallback order: provider → local Snapshot → user manual price → unavailable.
- Keep IndexedDB schema 6, backup formats, workspace-only PWA initialization and Background Push backlog unchanged.

## v0.32 — Market fallback continuity & freshness ✅

- Merge partial market refreshes with only the latest relevant real IndexedDB snapshots instead of dropping every missing quote when another provider succeeds.
- Keep fresh provider rows authoritative and preserve provider-scoped exchange identity so TSETMC/Tindex records never cross-fill by id alone.
- Expose live-versus-Snapshot coverage and oldest active fallback time in Settings without adding prices, symbols, asset names or market IDs to diagnostics.
- Label Snapshot provenance on Dashboard, portfolio, watchlist and market detail surfaces so cached values are never presented as newly fetched quotes.
- Evaluate local market alerts only against fresh runtime quotes; Snapshot fallback remains display/valuation continuity and cannot trigger or re-arm an alert.
- Keep IndexedDB schema 6, backup/transfer formats, BrsApi → optional Tindex core priority, direct TSETMC exchange behavior and Background Push backlog unchanged.

## v0.33 — Portfolio quote identity & decision safety ✅

- Keep provider-linked exchange identity (`source + marketId`) through portfolio valuation, watchlist, alert evaluation, planning and reports instead of falling back to symbol-only maps downstream.
- Treat fresh Provider quotes and explicit manual prices as decision-ready; keep local Snapshot and cost-basis fallback for display continuity without letting stale values drive automation.
- Pause automatic new-money priority and growth distribution when a held position lacks decision-ready pricing, while still showing clearly-labelled fallback valuation for review.
- Pause Reports best/worst ranking on incomplete pricing and include valuation provenance in the explicit detailed CSV; keep the share-safe summary amount/name-free.
- Prevent Snapshot daily change/NAV from masquerading as today's mover signal, seeding alert thresholds, or pre-filling transaction/manual prices.
- Make the release lint gate warning-free with `--max-warnings=0` and remove the v0.32 runtime warnings.
- Add no new market provider until auth/schema, sustainable zero-cost terms and deployment behavior are verified end-to-end.
- Keep IndexedDB schema 6, backup/transfer formats, BrsApi → optional Tindex core priority, direct TSETMC exchange behavior and Background Push backlog unchanged.

## v0.34 — Persisted provider-scoped market identity ✅

- Move persistent Watchlist uniqueness from raw `marketId` to compound `source + marketId`, matching the runtime/decision identity contract introduced in v0.33.
- Add a provider-scoped compound index for Market Alerts and use it for duplicate detection, dialog identity and notification tags.
- Reuse the same provider-scoped key for server quote merge, client target dedupe/Snapshot lookup and chart selection so collisions cannot reappear between persistence and runtime.
- Upgrade IndexedDB from schema 6 to schema 7 with a real Dexie migration that preserves explicit TSETMC rows and normalizes pre-TSETMC linked assets/watchlist/alerts to legacy Tindex.
- Normalize older Backup/Recovery/Device Transfer payloads before persistence and reject duplicate Watchlist identities within the same Provider before destructive replacement.
- Keep the database name, primary keys, backup envelope versions and direct-transfer protocol compatible; no server-side financial storage or telemetry is introduced.
- Keep BrsApi core priority, direct TSETMC exchange behavior, Tindex legacy/emergency role, decision-safe Snapshot rules and Background Push backlog unchanged.

## v0.35 — Verified schema migration release gate ✅

- Turn the v0.34 schema 6 → 7 upgrade from manual-only QA into a production-browser release contract.
- Seed the exact legacy schema-6 store layout in the isolated browser profile, then require the current app to upgrade that same IndexedDB database in place.
- Verify legacy linked assets/watchlist/alerts normalize to Tindex, explicit TSETMC rows remain TSETMC, and provider-scoped compound indexes exist after upgrade.
- Prove Tindex and TSETMC Watchlist rows with the same raw `marketId` can coexist after migration.
- Clear the migration fixture before the normal fresh-onboarding/dashboard/reports/mobile/PWA smoke so release tests remain independent and deterministic.
- Keep IndexedDB schema 7, backup/transfer formats, provider priority, zero-cost deployment boundaries and Background Push backlog unchanged.

## v0.36 — Investment transaction correction & ledger integrity ✅

- Add in-place editing for investment transactions instead of forcing delete-and-recreate corrections.
- Build one pure chronological ledger validator that prevents any buy/sell correction from making holdings negative at a historical date.
- Reject backdated sells when the quantity did not exist on that date, even if the current portfolio has enough units today.
- Reject deletion or reduction of an older buy when a later recorded sell depends on those units.
- Create a local Recovery Snapshot before every transaction edit and keep linked income-plan execution synchronized after edits/deletes.
- Allow an optional transaction note while preserving the original asset/link identity; editing an old transaction never overwrites the user's current manual fallback price.
- Keep IndexedDB schema 7, backup/transfer formats, provider priority, zero-cost deployment boundaries and Background Push backlog unchanged.

## v0.37 — Safe asset archive lifecycle ✅

- Block archive while an asset still has open quantity so current portfolio value cannot disappear from the active UI.
- Block archive while an unfinished income-plan item still targets that asset.
- Add an explicit archived-assets surface with Recovery-Snapshot-backed restore.
- Keep legacy archived holdings valuation-relevant until restored, while excluding archived assets from target-allocation/new-money decisions.
- Preserve archived asset identity in reports and transaction history instead of degrading labels after archive.
- Keep IndexedDB schema 7, backup/transfer formats, market-provider priority and Background Push backlog unchanged.

## v0.38 — Fund movement ledger & correction safety ✅

- Add a first-class local movement ledger for goal-fund deposits, withdrawals and opening balances instead of treating `currentToman` as an independently editable source of truth.
- Route manual fund movements, plan execution, direct new-money allocation and income-deletion reversals through one ledger mutation boundary while keeping `fund.currentToman` as a denormalized current balance.
- Allow manual movements to carry date/note and be edited or deleted only when chronological replay never makes the fund balance negative; system-generated movements remain read-only for auditability.
- Upgrade IndexedDB from schema 7 to schema 8 in place, converting each pre-ledger positive fund balance into one explicit migration opening movement without changing the database name or existing primary keys.
- Normalize older Backup/Recovery/Device Transfer payloads that have fund balances but no movement rows, while rejecting orphan, invalid, negative or balance-mismatched ledger payloads before destructive replacement.
- Extend the production browser release fixture so the verified schema 6 profile must upgrade through schema 7 market identity and schema 8 opening-fund migration before the normal workspace/PWA smoke.
- Keep provider priority, decision-safe market rules, zero-cost deployment boundaries and Background Push backlog unchanged.

## v0.39 — Income correction & money-flow integrity ✅

- Treat already executed plan money as a hard floor when correcting an incoming-money amount.
- Rescale only the still-unexecuted remainder of plan cards; fully executed cards never grow just because the source income was increased.
- Keep allocations synchronized to corrected plan totals with exact integer-Toman distribution.
- Use linked investment buys as an additional execution floor when plan progress is stale.
- Lock the income date after execution has started and reject future-dated new/edit income rows.
- Create a Recovery Snapshot before every valid correction and revalidate live state inside one atomic Dexie write boundary.
- Keep IndexedDB schema 8, backup/transfer formats, provider priority and Background Push backlog unchanged.

## v0.40 — Local data health & consistency audit ✅

- Add an on-device Settings audit across income/allocation links, fund movements, investment transactions, plan targets/progress, archived holdings and persisted market identities.
- Surface orphan references, invalid records, historical negative-ledger states and execution overruns without silently deleting or rewriting ambiguous financial history.
- Treat `fund.currentToman` and asset-plan `executedToman` as repairable only when their authoritative ledger/linked transactions are valid and deterministic.
- Create a Recovery Snapshot before any repair and re-read live data inside one Dexie transaction before synchronizing those derived summary fields.
- Keep the audit completely local: no diagnostic upload, analytics event expansion, account requirement or hosted financial backend.
- Keep IndexedDB schema 8, backup/transfer formats, provider priority and Background Push backlog unchanged.

## v0.41 — Unified financial activity history ✅

- Add one workspace Activity timeline derived only from persisted incoming money, Fund Movement rows and investment transactions.
- Group by recorded calendar day and use creation time only as a deterministic same-day display order; do not invent an execution timestamp or imply causality that is not stored.
- Preserve fund movement source labels, investment-plan linkage labels, notes, archived-asset identity and explicit missing-entity fallbacks.
- Add independent date, category and normalized Persian search filters plus privacy-sensitive recorded-volume summaries.
- Keep Activity local and read-only: no expense ledger, inferred cash account, server sync, telemetry expansion or schema migration.
- Keep IndexedDB schema 8, backup/transfer formats, provider priority and Background Push backlog unchanged.

## v0.42 — Reports & reconciliation upgrade ✅

- Reconcile each selected incoming-money record across recorded income, allocation, planned amount and execution without inventing a cash account.
- Distinguish incomplete execution (`in_progress`) from structural mismatches that need review, while preserving explicit execution overruns.
- Summarize real in-range fund deposits/withdrawals separately from opening balances and real investment buys/sells without calling net buy flow profit.
- Separate period flow from current state: the date filter controls recorded period activity, while current portfolio value/weight keeps the full investment ledger.
- Extend the explicit detailed CSV with reconciliation and aggregate flow rows while keeping the share-safe summary amount/name-free.
- Keep IndexedDB schema 8, backup/transfer formats, provider priority, zero-cost deployment boundaries and Background Push backlog unchanged.

## v0.43 — v1.0 readiness hardening ✅

- Audit product/UX, offline/PWA, migration, backup/restore, recovery, privacy, documentation and release gates without adding another major feature family.
- Keep public navigations network-only after Workspace PWA registration even though the Service Worker needs root scope for sibling app routes.
- Treat “Later” as dismissal of the current waiting worker for the active app session; a genuinely new worker may notify again.
- Remove generic IndexedDB repair from the Workspace error boundary and route recovery decisions through Settings → Local Data Health / Data Safety.
- Extend structural and production-browser gates for these boundaries while keeping IndexedDB schema 8 and all portability formats unchanged.

## v1.0.0-rc.1 — Release candidate validation ✅

- Freeze feature development and use the v0.43 readiness audit as the release baseline.
- Run `npm run check:rc`, which executes the full Production release gate before validating RC version/schema/document alignment.
- Keep IndexedDB schema 8 and Backup/Recovery/Device Transfer contracts unchanged.
- Complete manual Chromium desktop PWA install/update, mobile-class PWA, Backup → Restore, old-tab upgrade and responsive/theme acceptance on the real Candidate.
- Fix only reproducible release blockers. A non-blocking enhancement stays out of the RC.

## v1.0.0-rc.2 — Product tour release-blocker fix ⚠️ superseded

- Fix the RC1 manual-acceptance blocker where the tour overlay dimmed the control being explained and some steps could resolve to hidden/unavailable targets.
- Use a true transparent spotlight hole, explicit page-area labels and only currently visible Desktop/Mobile targets.
- Extend the production browser release gate so the highlighted control cannot overlap any shade and Desktop search must have a real tour target.
- Keep Feature freeze, IndexedDB schema 8, Backup/Recovery/Device Transfer contracts and provider boundaries unchanged.
- Re-run the full RC gate and manual guide pass before continuing the remaining v1.0.0 stable acceptance matrix.
- Full local `check:rc` later failed at the new Production Browser Smoke spotlight assertion, so RC2 is not a valid stable candidate even though its normal CI workflow passed.

## v1.0.0-rc.3 — Product-tour masked spotlight stabilization 🚧

- Keep one SVG mask with a real transparent cutout around the active guide target.
- Bind the Spotlight and Overlay to the exact active `data-tour-target`, retry target resolution across layout frames and preserve valid geometry through transient scroll/resize changes.
- Make Production Browser Smoke deterministic with explicit 1280×900 Desktop and 425×800 Mobile viewports instead of Chromium defaults.
- Emit exact Target/Spotlight/Overlay/viewport diagnostics if the guide gate still fails.
- Keep Feature freeze, IndexedDB schema 8, Backup/Recovery/Device Transfer contracts and provider boundaries unchanged.
- Do not Commit/Tag/Release RC3 until `npm run check:rc` is fully green on the real local Production Browser Smoke.

## Likely next phases

- **v1.0.0 stable:** only after all automated and manual RC acceptance gates pass without a release blocker.
- **Later — Additional core-price adapters:** consider Gheymat.online or StreamData only after auth/schema, free-tier terms and deployment behavior are verified end-to-end; do not rely on stale Arzhaam market-API references.
- **Later — Release ergonomics:** only add more browser coverage when a real regression justifies the maintenance cost.

## Backlog — Background alerts while PWA is closed

See `docs/backlog/background-push.md`. Reconsider only when a sustainable free/voluntary hosting model and market-data quota make it responsible to enable.

## Reference: Saatyar patterns worth reusing

Saatyar is a useful sibling reference for Poolamkoo because it is also Persian-first and local-first. Its public repository documents versioned backup/restore, local recovery snapshots, encrypted direct WebRTC transfer with QR pairing, and optional Daramet support that does not unlock paid features. Poolamkoo should reuse the principles while keeping its own financial UX simpler and stricter around backup safety.

- https://github.com/hamedtkd/saat-yar
- https://github.com/hamedtkd/poolamkoo
