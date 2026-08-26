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

## Likely next phases

- **v0.27 — Export/share refinements:** consider privacy-safe report export/share for user-requested summaries without turning Poolamkoo into accounting software.
- **Later — Release ergonomics:** only add more browser coverage when a real regression justifies the maintenance cost.

## Backlog — Background alerts while PWA is closed

See `docs/backlog/background-push.md`. Reconsider only when a sustainable free/voluntary hosting model and market-data quota make it responsible to enable.

## Reference: Saatyar patterns worth reusing

Saatyar is a useful sibling reference for Poolamkoo because it is also Persian-first and local-first. Its public repository documents versioned backup/restore, local recovery snapshots, encrypted direct WebRTC transfer with QR pairing, and optional Daramet support that does not unlock paid features. Poolamkoo should reuse the principles while keeping its own financial UX simpler and stricter around backup safety.

- https://github.com/hamedtkd/saat-yar
- https://github.com/hamedtkd/poolamkoo
