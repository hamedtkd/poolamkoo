# Security notes

## Data model

PoolamCo is local-first. Personal finance records are stored in the browser's IndexedDB and are not sent to the Next.js server.

## Secrets

`BRS_API_KEY` and `TINDEX_API_TOKEN` are the normal server environment variables. Do not expose them through `NEXT_PUBLIC_*` variables or client bundles. Background Push is paused by default; its experimental VAPID/Redis/Cron secrets are documented separately in `.env.push.example` and must remain server-side if that experiment is ever enabled.

## Backups

Encrypted backups use PBKDF2-SHA256 and AES-GCM. The password is not persisted by PoolamCo.

## Browser storage

Browser storage is not a substitute for backup. Users should export backups before clearing browser/site data or moving devices. Market alerts are stored locally alongside the rest of the app data.

## Browser notifications

Local market notifications are opt-in and require browser permission. Background Web Push while the PWA is closed is paused in v0.13.1 and is not part of the default deployment. The preserved experiment can mirror only minimal alert condition metadata plus a Push Subscription when explicitly enabled; personal portfolio balances, transactions, income records, and purchase prices are excluded. See `docs/backlog/background-push.md`.

## Reporting a problem

If you extend this project for production, review CSP, hosting headers, dependency advisories, and the selected market-data provider before deployment.
