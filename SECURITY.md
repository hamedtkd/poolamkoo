# Security notes

## Data model

PoolamCo is local-first. Personal finance records are stored in the browser's IndexedDB and are not sent to the Next.js server.

## Secrets

`BRS_API_KEY`, `BRS_API_PRO_KEY`, and `TINDEX_API_TOKEN` are server environment variables. Do not expose them through `NEXT_PUBLIC_*` variables or client bundles.

## Backups

Encrypted backups use PBKDF2-SHA256 and AES-GCM. The password is not persisted by PoolamCo.

## Browser storage

Browser storage is not a substitute for backup. Users should export backups before clearing browser/site data or moving devices. Market alerts are stored locally alongside the rest of the app data.

## Browser notifications

Market notifications are opt-in and require browser permission. v0.12 evaluates alert conditions only after a live market refresh while the application is running; it does not claim background push delivery while the app is fully closed.

## Reporting a problem

If you extend this project for production, review CSP, hosting headers, dependency advisories, and the selected market-data provider before deployment.
