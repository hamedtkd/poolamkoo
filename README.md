# Poolamco — پولم‌کو

### A Persian-first, RTL, local-first PWA for incoming-money planning, goal funds, and personal investment tracking

[فارسی](./README.fa.md) · [Documentation](./docs/README.md) · [Security](./SECURITY.md) · [License](./LICENSE)

---

## What is Poolamco?

Poolamco is not a daily bookkeeping app. It is designed for the moment new money arrives: decide how much should go to life, safety, and growth, then record what was actually executed and measure the outcome later.

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

## Product scope

### Incoming money and planning

- Record new money with Persian-friendly amount and date inputs
- Configurable life / safety / growth rule
- Emergency-fund-aware smart allocation
- Per-income overrides without changing the global rule
- Create, edit, and delete plan cards
- Record full or partial execution
- Compare planned versus actual behavior

### Investments

- Gold, currency, crypto, stocks/exchange, investment funds, and custom assets
- Record real buy and sell transactions
- Bulk historical investment import from CSV with preview and validation
- Search and link Tehran Stock Exchange stocks/ETFs to live Tindex/TSETMC quotes
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
- Deposit and withdrawal flows without turning the app into detailed expense bookkeeping

### Market data

- BrsApi-first pricing for gold, currency, and crypto with Tindex fallback for core quotes
- Tindex pricing and search for Tehran Stock Exchange stocks and ETFs
- Linked Tindex source attribution wherever Tindex quotes are displayed
- One shared market store across the application
- One initial fetch plus explicit manual refresh
- Real snapshots stored locally
- Real 1-month and 3-month Tindex history for USD, 18K gold, and linked TSE stocks/ETFs
- Line history for public indicators and real exchange candlesticks, with local snapshots as fallback
- No fake historical market series
- Market watchlist for tracking TSE stocks/ETFs before adding them to the portfolio
- NAV and market-price premium/discount for exchange funds whenever Tindex/TSETMC publishes NAV
- Local price, daily-move, and NAV alerts with duplicate-notification suppression
- Local market alerts; the Background Push experiment remains paused in the backlog by default

### Reports

- Total incoming money
- Plan adherence
- Goal-fund coverage
- Returns from the user's recorded purchases
- Target versus actual portfolio allocation
- Charts only when real local data exists
- Privacy mode for hiding financial values on screen

### Data durability and backups

- Visible backup health with stale/never-backed-up states
- Friendly reminders after meaningful use and again after seven days
- AES-GCM encrypted backup download with shared toast/error handling
- Up to five local recovery snapshots for accidental destructive changes
- Daily recovery checkpoints plus pre-destructive snapshots for key financial deletes/restores
- Browser persistence status without pretending browser storage is a permanent backup
- Device-local backup metadata and recovery history excluded from exported financial payloads
- Direct encrypted WebRTC device transfer with copy/share pairing codes and preview before import
- Recovery snapshot before destination replacement, with encrypted backup files kept as the universal fallback

### User experience

- Persian-first RTL interface
- PWA with offline shell
- Responsive, mobile-first layout
- Collapsible desktop sidebar
- Global search across sections, incoming money, funds, and assets
- Light, dark, and system themes
- Gold-first visual palette
- Product tour and contextual financial help
- Layout-matched skeletons with restrained shimmer
- Reduced-motion-aware route, KPI, navigation, and toast micro-interactions

## Open source and support

Poolamco is public at https://github.com/hamedtkd/poolamkoo. The app now includes public guide, About, Privacy/Data policy, and data-safety pages plus a cached GitHub star count. Optional development support is available at https://daramet.com/hamedtkd and never unlocks product features.

## Local-first and privacy

Poolamco stores core product data in IndexedDB for the current browser profile and origin. There is no central Poolamco database containing users' personal financial records by default.

This model means:

- No account is required for core workflows.
- Financial records stay under the user's direct browser storage.
- Clearing site data can remove local records.
- Private browsing is not appropriate for durable storage.
- Regular exported backups are important for serious use.

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
- Motion (`motion/react`) for restrained micro-interactions
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

The local development server normally runs at:

```text
http://localhost:3000
```

## Market data

Configure both BrsApi and a Tindex developer token. BrsApi remains primary for public market quotes; Tindex supplies missing core USD, 18K gold, and BTC quotes and serves linked Tehran Stock Exchange assets. The exact server-side environment variable names are documented in `.env.example`.

Exchange quotes are returned by Tindex from TSETMC data and converted from rial to toman for Poolamco calculations. Poolamco also uses Tindex candle/history endpoints for 1-month and 3-month USD, 18K gold, and linked exchange charts, with quota-aware server caching. If market access is unavailable, Poolamco must not fabricate historical prices; previously stored real snapshots remain the chart fallback.

## Market alerts and background push

Local market alerts work without a backend and are evaluated when the app refreshes live quotes. The v0.13.0 Background Web Push experiment is **intentionally paused and hidden by default in v0.13.1** so the public project remains zero-cost and local-first, with no required Redis, scheduler, VAPID keys, or cron secret.

The experiment has not been deleted. Its implementation and future opt-in instructions remain in [docs/backlog/background-push.md](./docs/backlog/background-push.md). The next zero-cost product phases are tracked in [docs/ROADMAP.md](./docs/ROADMAP.md).

## Quality gate

Run before committing or releasing:

```bash
npm run check
npm run build
```

`npm run check` covers TypeScript, ESLint, unit tests, file-size rules, UI architecture checks, and regression checks.

## PWA

Poolamco includes a web app manifest, service worker, offline route, install icons, and a favicon. Release QA should include real installation tests on desktop and mobile in addition to browser DevTools checks.

See [docs/testing/release.md](./docs/testing/release.md) for the release checklist.

## Documentation

Start at [docs/README.md](./docs/README.md). Architecture notes, development phases, and release-specific changes live under `docs/` so this README can remain a stable product overview.

## Security

Please avoid publishing sensitive security details or real personal financial data in public issues. See [SECURITY.md](./SECURITY.md) for reporting guidance.

## License

See [LICENSE](./LICENSE).

### Direct device transfer

Settings can now move local data directly to another device without an account or financial-data backend. Pairing uses copy/share codes, the payload is additionally protected with a one-time AES-GCM PIN, the receiver previews record counts before import, and a recovery snapshot is created before destination replacement. See [docs/device-transfer.md](./docs/device-transfer.md).
