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
- Manual current prices for stocks, investment funds, and custom assets until a dedicated provider is connected
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

- BrsApi market pricing using the user's API key
- One shared market store across the application
- One initial fetch plus explicit manual refresh
- Real snapshots stored locally
- No fake historical market series

### Reports

- Total incoming money
- Plan adherence
- Goal-fund coverage
- Returns from the user's recorded purchases
- Target versus actual portfolio allocation
- Charts only when real local data exists
- Privacy mode for hiding financial values on screen

### User experience

- Persian-first RTL interface
- PWA with offline shell
- Responsive, mobile-first layout
- Collapsible desktop sidebar
- Global search across sections, incoming money, funds, and assets
- Light, dark, and system themes
- Gold-first visual palette
- Product tour and contextual financial help
- Layout-matched skeletons

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

Add a BrsApi key through the environment variable documented in `.env.example` to enable live market prices.

If market access is unavailable, Poolamco must not fabricate historical prices. Previously stored real snapshots may be used for local/offline presentation.

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
