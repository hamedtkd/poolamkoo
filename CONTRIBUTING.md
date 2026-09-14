# Contributing to Poolamkoo

Thank you for helping improve Poolamkoo.

Poolamkoo is a Persian-first, RTL, local-first personal-finance application. Changes should preserve data safety, privacy, financial correctness, accessibility, and the local-first model.

## Development setup

Requirements:

- Node.js 22.x
- npm
- Git

Clone and run:

```bash
git clone https://github.com/hamedtkd/poolamkoo.git
cd poolamkoo
npm install
cp .env.example .env.local
npm run dev
```

## Before making a change

- Keep changes focused and easy to review.
- Do not commit secrets, API keys, backups, or real financial data.
- Preserve Persian RTL behavior.
- Avoid breaking existing IndexedDB data.
- Financial calculations must remain deterministic and testable.
- Changes to stored data require explicit migration and compatibility review.
- Use synthetic data for screenshots, tests, and bug reports.

For large features or behavioral changes, open an Issue before implementation.

## Data safety

Changes involving any of these areas require additional care:

- IndexedDB schema
- Backup and restore
- Recovery snapshots
- Device transfer
- Income and allocation records
- Funds
- Investment transactions
- Cost basis and profit/loss calculations
- Market-data providers

Never silently reinterpret or discard existing user data.

## Security and privacy

Poolamkoo is local-first and personal financial data normally remains in the user's browser.

Do not:

- expose server secrets through client bundles
- include real user financial data in tests or screenshots
- log sensitive financial records
- publish security vulnerabilities in public Issues

Security vulnerabilities should follow the process described in `SECURITY.md`.

## Code quality

Before opening a Pull Request, run:

```bash
npm run check
npm run check:release
```

For a stable-release change, also run:

```bash
npm run check:stable
```

The repository also provides:

```bash
npm run typecheck
npm run lint
npm test
```

## UI changes

For interface changes, verify:

- Desktop and mobile layouts
- Persian RTL behavior
- Light and dark themes
- Keyboard navigation
- Reduced motion where relevant
- Privacy Mode for sensitive values

Attach screenshots when a Pull Request changes visible UI.

## Pull Requests

A Pull Request should explain:

- the problem being solved
- what changed
- what intentionally did not change
- tests that were run
- data/schema impact
- privacy and security impact
- rollback risk
- screenshots for visible UI changes

Small, focused Pull Requests are preferred.

## Commit messages

Use clear commit messages, for example:

```text
fix: preserve allocation after income correction
feat: add investment history filter
refactor: simplify market quote normalization
docs: improve backup documentation
```

## License

By contributing, you agree that your contribution will be licensed under the project's MIT License.
