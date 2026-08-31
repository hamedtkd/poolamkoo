# Poolamkoo — پولم‌کو

### A Persian-first, RTL, local-first PWA for planning incoming money, funds, and personal investing

[فارسی](./README.fa.md) · [Docs](./docs/README.md) · [Security](./SECURITY.md) · [License](./LICENSE)

---

## Release status

- **Latest stable:** [`v1.1.1`](./docs/releases/1.1.1.md)
- **Persistence contract:** IndexedDB **schema 8**
- **Product boundary:** local-first, no mandatory account, privacy-safe analytics, workspace-only PWA
- **Recent highlights:** compact investment purchase queue, semantic profit/loss colors, cleaner financial formatting, and a more polished landing experience

Historical release notes are intentionally kept out of the README body so this page stays readable. The full release history lives under [`docs/releases/`](./docs/releases/).

## GitHub product showcase

These English presentation panels are the canonical GitHub showcase. They are built from Poolamkoo's approved visual identity and real product-screen references, but they are **presentation assets** rather than pixel-exact application screenshots. All financial values shown inside the panels are illustrative demo values.

<p align="center">
  <img src="./docs/assets/showcase/poolamkoo-overview-en.webp" alt="Poolamkoo product showcase overview" width="1100" />
</p>

<table>
  <tr>
    <td width="50%"><img src="./docs/assets/showcase/income-planning-en.webp" alt="Poolamkoo income planning showcase" /></td>
    <td width="50%"><img src="./docs/assets/showcase/funds-goals-en.webp" alt="Poolamkoo funds and goals showcase" /></td>
  </tr>
  <tr>
    <td width="50%"><img src="./docs/assets/showcase/reports-insights-en.webp" alt="Poolamkoo reports and insights showcase" /></td>
    <td width="50%"><img src="./docs/assets/showcase/settings-themes-en.webp" alt="Poolamkoo settings and themes showcase" /></td>
  </tr>
</table>

For a Persian presentation version of the README, see [`README.fa.md`](./README.fa.md). Exact product captures from the real production UI remain under [`docs/assets/screenshots/`](./docs/assets/screenshots/).

## What is Poolamkoo?

Poolamkoo is not a daily bookkeeping app. It is designed for the moment new money arrives: decide how much should go to life, safety, and growth, then record what was actually executed and measure the outcome later.

The core product loop is:

```text
Incoming money
      ↓
Allocation plan
      ↓
Actual execution
      ↓
Portfolio and funds
      ↓
Reports and feedback
```

Core personal-finance data is stored locally in the user's browser through IndexedDB. Normal use does not require an account or a central user database.

## Website and app entry

Since v0.19, `/` is the public product landing page while the local-first financial application starts at `/dashboard`. The installed PWA also starts at `/dashboard`. This route split does not move or recreate IndexedDB because browser storage is scoped to the origin, not the URL path.

## Product scope

### Incoming money and planning

- Record new money with Persian-friendly amount and date inputs
- Configurable life / safety / growth rule
- Emergency-fund-aware smart allocation
- Per-income overrides without changing the global rule
- Correct incoming money safely without shrinking below already executed plan money
- Create, edit, and delete plan cards
- Record full or partial execution
- Compare planned versus actual behavior

### Investments

- Gold, currency, crypto, stocks/exchange, investment funds, and custom assets
- Record real buy and sell transactions
- Bulk historical investment import from CSV with preview and validation
- Search and link Tehran Stock Exchange stocks/ETFs directly to TSETMC quotes without an API key
- Manual fallback prices for linked exchange assets and manual pricing for custom assets
- Link purchases back to an incoming-money plan
- Average purchase price and cost basis
- Current value and unrealized P/L
- Target allocation versus actual portfolio weight
- Rebalance guidance using new money rather than synthetic trades

### Goal funds

- Emergency fund
- Planned costs such as medical care, travel, insurance, and gifts
- Target, balance, due date, and progress tracking
- Auditable deposit/withdrawal history with date, note, safe correction, and system-source provenance without turning the app into detailed expense bookkeeping

### Market data

- BrsApi-first pricing for gold, currency, and crypto with short shared server caching; Tindex is only an optional core fallback
- Direct server-side TSETMC search, quotes, and history for new Tehran Stock Exchange stocks and ETFs
- Explicit TSETMC/Tindex/BrsApi source attribution wherever external quotes are displayed
- One shared market store across the application
- One initial fetch plus explicit manual refresh
- Settings provider-health view with a privacy-safe copyable diagnostic that excludes prices, symbols, asset names, market IDs, amounts, raw upstream text, and secrets
- Partial-refresh continuity: fresh quotes always win, while only missing core/requested exchange quotes can reuse their latest real local Snapshot
- Snapshot provenance is visible on Dashboard, portfolio, watchlist and market details; local alerts wait for a fresh quote instead of evaluating a Snapshot fallback
- Real snapshots stored locally
- Real 1-month and 3-month TSETMC history for linked exchange assets; optional Tindex history for USD/18K gold
- Line history for public indicators and real exchange candlesticks, with local snapshots as fallback
- No fake historical market series
- Market watchlist for tracking TSE stocks/ETFs before adding them to the portfolio
- NAV and market-price premium/discount only when the active provider actually supplies NAV; the direct TSETMC price adapter does not invent missing NAV
- Local price, daily-move, and NAV alerts with duplicate-notification suppression
- Local market alerts; the Background Push experiment remains paused in the backlog by default

### Reports

- Total incoming money and plan adherence
- Decision summary for plan execution, money-rule balance, and current goal-fund coverage
- Explicit incomplete-allocation state instead of filling missing period data from configured targets
- Factual follow-up prompts based only on recorded local data
- Returns from the user's recorded purchases
- Target versus actual portfolio allocation
- Charts only when real local data exists
- Privacy mode for hiding financial values on screen

### Data durability and backups

- Visible backup health with stale/never-backed-up states
- Friendly reminders after meaningful use and again after seven days
- AES-GCM encrypted backup download with shared toast/error handling
- v2 backup envelope with SHA-256 corruption detection plus app/schema metadata
- Restore inspection with compatibility checks and record preview before replacement; legacy v1 files remain readable
- Up to five local recovery snapshots for accidental destructive changes
- Daily recovery checkpoints plus pre-destructive snapshots for key financial deletes/restores
- Browser persistence status without pretending browser storage is a permanent backup
- Device-local backup metadata and recovery history excluded from exported financial payloads
- Direct encrypted WebRTC device transfer with copy/share pairing codes and preview before import
- Recovery snapshot before destination replacement, with encrypted backup files kept as the universal fallback
- Recovery and direct-transfer schema guards stop newer-format data before destructive import

### Public landing and production resilience

- Public Persian landing page at `/` and financial app entry at `/dashboard`
- `robots.txt`, `sitemap.xml`, and app-route `noindex` boundaries
- Explicit IndexedDB bootstrap error/timeout state instead of an indefinite skeleton
- Offline status banner plus improved offline fallback
- Global error, route error, and 404 recovery surfaces without destructive reset shortcuts
- Keyboard skip links on public and app shells
- Explicit PWA update prompt that activates a waiting Service Worker only after user confirmation
- Multi-tab IndexedDB upgrade protection for blocked/outdated tabs before financial live queries start

### User experience

- Persian-first RTL interface
- PWA with offline shell
- Responsive, mobile-first layout with safe-area-aware fixed navigation
- Four daily mobile destinations kept one tap away: Home, Incoming Money, Investments, and Funds
- Collapsible desktop sidebar with active-route semantics
- Keyboard-navigable global search across sections, incoming money, funds, and assets
- Light, dark, and system themes
- Gold-first visual palette
- Product tour and contextual financial help
- Layout-matched skeletons with restrained shimmer
- Reduced-motion-aware route, KPI, navigation, and toast micro-interactions

### Optional privacy-first analytics

- Cloudflare Web Analytics only in production and only when the deployer supplies a site token
- No analytics SDK dependency and no custom financial events
- Visits, page views, route paths, device/browser categories, and Core Web Vitals for coarse product usage
- No intentional analytics payloads containing amounts, balances, personal asset names, transactions, search text, form values, backups, or device-transfer data
- No token means no third-party analytics beacon is rendered

## Open source and support

Poolamkoo is public at https://github.com/hamedtkd/poolamkoo. The app now includes public guide, About, Privacy/Data policy, and data-safety pages plus a cached GitHub star count. Optional development support is available at https://daramet.com/hamedtkd and never unlocks product features.

## Local-first and privacy

Poolamkoo stores core product data in IndexedDB for the current browser profile and origin. There is no central Poolamkoo database containing users' personal financial records by default.

This model means:

- No account is required for core workflows.
- Financial records stay under the user's direct browser storage.
- Clearing site data can remove local records.
- Private browsing is not appropriate for durable storage.
- Regular exported backups are important for serious use.
- Settings can audit cross-ledger consistency entirely on-device and only repairs deterministic summary drift after creating a Recovery Snapshot.

See [SECURITY.md](./SECURITY.md) for the security and data-safety model.

## Stack

- Next.js 16 with App Router
- React 19 and TypeScript
- Tailwind CSS 4
- shadcn/ui plus PersianLabs UI components for Persian UX
- Dexie and IndexedDB
- React Hook Form and Zod
- TanStack Table
- Recharts and Lightweight Charts where appropriate
- next-themes
- `tailwindcss-animated` for lightweight CSS micro-interactions and per-item staggered Workspace entrances
- `motion` for code-split viewport/scroll reveals where interaction timing matters
- Optional Cloudflare Web Analytics through the official hosted beacon, with no analytics SDK
- Remix Icons through react-icons

## Repository structure

```text
app/            routes, layouts, and API routes
components/     UI primitives, app shell, charts, and feature components
hooks/          reusable feature logic and state
lib/            models, calculations, validation, database, and market adapters
public/         PWA assets, service worker, and icons
docs/           architecture, development phases, and release documentation
scripts/        quality gates and UI architecture checks
tests/          unit tests for financial logic
```

## Quick start

### Requirements

- Node.js 22.x
- npm
- Git

### Install and run

```bash
npm install
cp .env.example .env.local
npm run dev
```

The public landing page normally runs at `http://localhost:3000`, while the local-first application starts at `http://localhost:3000/dashboard`.


## Landing product visual

The public hero now uses a compact cinematic composition around a **real Poolamkoo mobile capture** generated from demo data. The product frame stays dark in either site appearance, so the screenshot is truthful instead of swapping to a conceptual illustration.

<p align="center"><img src="./public/landing/poolamkoo-income-mobile.webp" width="320" alt="Real Poolamkoo mobile income-planning screen with demo data" /></p>

The capture contains synthetic showcase data only; it does not read a normal browser profile or personal financial records.

## Product screenshots

Poolamkoo can regenerate product screenshots from the real production build with an isolated fake-data browser profile. The capture does not read your normal browser profile or real financial records.

```bash
npm run media:capture
```

If a fresh production build already exists:

```bash
npm run media:capture:built
```

The output is written to `docs/assets/screenshots/`. A manual **Product media** GitHub Actions workflow runs the same capture and uploads `poolamkoo-product-screenshots` as an artifact. See [docs/assets/README.md](./docs/assets/README.md) for the privacy contract, browser-path override, and exact screenshot list.

The README paths are ready for those generated files; after a verified capture is committed, GitHub renders the real product UI here:

<p align="center">
  <img src="./docs/assets/screenshots/dashboard-light-desktop.png" alt="Poolamkoo dashboard with isolated demo financial data" width="920" />
</p>

<table>
  <tr>
    <td width="50%"><img src="./docs/assets/screenshots/dashboard-dark-desktop.png" alt="Poolamkoo dashboard in dark mode" /></td>
    <td width="50%"><img src="./docs/assets/screenshots/investments-light-desktop.png" alt="Poolamkoo investments and portfolio decision view" /></td>
  </tr>
  <tr>
    <td width="50%"><img src="./docs/assets/screenshots/reports-light-desktop.png" alt="Poolamkoo reports view" /></td>
    <td width="50%"><img src="./docs/assets/screenshots/landing-light-desktop.png" alt="Poolamkoo public landing page in light mode" /></td>
  </tr>
  <tr>
    <td width="50%"><img src="./docs/assets/screenshots/landing-dark-desktop.png" alt="Poolamkoo public landing page in dark mode" /></td>
    <td width="50%"></td>
  </tr>
  <tr>
    <td colspan="2" align="center"><img src="./docs/assets/screenshots/investments-mobile.png" alt="Poolamkoo investments on mobile" width="390" /></td>
  </tr>
</table>

## Market data

For core gold/currency/crypto quotes, configure `BRS_API_KEY`. **New Tehran exchange links need no API key:** Poolamkoo searches and reads `cdn.tsetmc.com` through its own server routes. `TINDEX_API_TOKEN` remains optional in v0.34 and is retained only for legacy links, a slow emergency core fallback, and optional USD/gold online history. Provider failures are classified into stable health codes; upstream response bodies are never surfaced to users.

TSETMC exchange prices are returned in rial and normalized to toman on the server. TSETMC current quotes use a short shared cache and daily history uses an hourly cache; BrsApi also uses a short server cache so multiple browsers do not multiply provider requests. If an external provider is unavailable, Poolamkoo never fabricates prices/history: real IndexedDB snapshots and then the user's manual fallback price remain available. Existing `source: tindex` records are preserved and can be re-linked to TSETMC at the user's convenience.

## Privacy-first analytics

Poolamkoo v0.18 can optionally load Cloudflare Web Analytics in production. Add the site in Cloudflare Web Analytics, copy the token from its browser snippet, and set only the production deployment environment:

```env
NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN=your_site_token
```

This is a public Web Analytics site token, not a Cloudflare account API secret. If the variable is empty, the analytics component renders nothing. Development builds also keep the beacon disabled even if a token is present.

The integration is intentionally coarse: Cloudflare can measure visits, page views, page paths, device/browser categories, and real-user performance. Poolamkoo does not emit custom analytics events from financial data, search text, forms, backups, or device transfers. See [docs/analytics.md](./docs/analytics.md) for setup and privacy boundaries.

## Market alerts and background push

Local market alerts work without a backend and are evaluated when the app refreshes live quotes. The v0.13.0 Background Web Push experiment is **intentionally paused and hidden by default in v0.13.1** so the public project remains zero-cost and local-first, with no required Redis, scheduler, VAPID keys, or cron secret.

The experiment has not been deleted. Its implementation and future opt-in instructions remain in [docs/backlog/background-push.md](./docs/backlog/background-push.md). The next zero-cost product phases are tracked in [docs/ROADMAP.md](./docs/ROADMAP.md).

## Quality gate

Run the normal local gate before committing:

```bash
npm run check
npm run build
```

For a stable release, run the full production and stable metadata gate:

```bash
npm run check:stable
```

`check:stable` runs the complete `check:release` path first, then verifies the current stable (`v1.1.1`) package/runtime/schema/release-document alignment plus public-launch quota guardrails. The production gate creates one build and opens it in an isolated Chrome/Edge/Chromium profile to verify the legacy schema 6 → current schema 8 migration before Landing → Workspace, fresh onboarding/local bootstrap, product-tour spotlight, Reports and PWA boundaries. No Playwright/Cypress dependency is required. If browser auto-detection fails, set `POOLAMKOO_BROWSER_PATH`.

## PWA

Poolamkoo includes a web app manifest, service worker, offline route, install icons, and a favicon. Release QA should include real installation tests on desktop and mobile in addition to browser DevTools checks.

See [docs/testing/release.md](./docs/testing/release.md) for the release checklist.

## Documentation

Start at [docs/README.md](./docs/README.md). Architecture notes, development phases, and release-specific changes live under `docs/` so this README can remain a stable product overview.

## Security

Please avoid publishing sensitive security details or real personal financial data in public issues. See [SECURITY.md](./SECURITY.md) for reporting guidance.

## License

See [LICENSE](./LICENSE).

### Direct device transfer

Settings can now move local data directly to another device without an account or financial-data backend. Pairing uses copy/share codes, the payload is additionally protected with a one-time AES-GCM PIN, the receiver previews record counts before import, and a recovery snapshot is created before destination replacement. See [docs/device-transfer.md](./docs/device-transfer.md).

### v0.37 — Safe asset archive lifecycle

Asset archive is now reversible and guarded: open holdings or unfinished asset-targeted plans cannot be archived, archived assets can be restored with a Recovery Snapshot, and legacy archived holdings remain included in portfolio valuation until restored. IndexedDB remains schema 7.
### v0.38 — Auditable fund movement ledger

Goal-fund balances now have a first-class local movement history. Manual deposits and withdrawals can be dated, noted, corrected, or deleted only when chronological replay stays non-negative; plan execution, direct new-money funding, and income-deletion reversals use the same ledger boundary. Existing positive balances migrate in place to one opening movement as IndexedDB advances to schema 8.
