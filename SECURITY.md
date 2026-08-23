# Security notes

## Data model

PoolamCo is local-first. Personal finance records are stored in the browser's IndexedDB and are not sent to the Next.js server.

## Secrets

`BRS_API_KEY` and `BRS_API_PRO_KEY` are server environment variables. Do not expose them through `NEXT_PUBLIC_*` variables.

## Backups

Encrypted backups use PBKDF2-SHA256 and AES-GCM. The password is not persisted by PoolamCo.

## Browser storage

Browser storage is not a substitute for backup. Users should export backups before clearing browser/site data or moving devices.

## Reporting a problem

If you extend this project for production, review CSP, hosting headers, dependency advisories, and the selected market-data provider before deployment.
