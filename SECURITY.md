# Security notes

## Data model

PoolamCo is local-first. Personal finance records are stored in the browser's IndexedDB and are not sent to the Next.js server.

Public informational routes, including the landing page at `/`, do not seed the financial IndexedDB. Local financial storage is initialized when the application is opened at `/dashboard` or another app route. Financial app routes are marked `noindex` and excluded from the public sitemap.

## Secrets

`BRS_API_KEY` and `TINDEX_API_TOKEN` are the normal server environment variables. Do not expose them through `NEXT_PUBLIC_*` variables or client bundles. Background Push is paused by default; its experimental VAPID/Redis/Cron secrets are documented separately in `.env.push.example` and must remain server-side if that experiment is ever enabled.

## Backups

Encrypted backups use PBKDF2-SHA256 and AES-GCM. The password is not persisted by PoolamCo. Successful-backup timestamps and reminder snooze state are device-local metadata and are intentionally excluded from exported financial payloads.

Before importing a backup, PoolamCo creates a local recovery snapshot of the current database. Up to five recent recovery snapshots are kept in IndexedDB. These snapshots are for accidental local changes only and are not a substitute for an external backup because clearing Site Data removes them too.

## Browser storage

Browser storage is not a substitute for backup. Users should export backups before clearing browser/site data or moving devices. Market alerts are stored locally alongside the rest of the app data.

## Browser notifications

Local market notifications are opt-in and require browser permission. Background Web Push while the PWA is closed is paused in v0.13.1 and is not part of the default deployment. The preserved experiment can mirror only minimal alert condition metadata plus a Push Subscription when explicitly enabled; personal portfolio balances, transactions, income records, and purchase prices are excluded. See `docs/backlog/background-push.md`.

## Reporting a problem

If you extend this project for production, review CSP, hosting headers, dependency advisories, and the selected market-data provider before deployment.

## Device transfer

Direct device transfer uses a browser WebRTC DataChannel and does not require a Poolamco signaling/data server. Pairing descriptions are moved by the user through copy/share. The financial payload is additionally encrypted with AES-GCM using a one-time transfer PIN before it is chunked onto the WebRTC channel. The receiver verifies a SHA-256 digest, previews the decoded payload, and must explicitly confirm replacement. A local recovery snapshot is created before import.

For sensitive environments, keep both devices on a trusted local network and do not share pairing codes or the one-time PIN with third parties. Encrypted backup-file transfer remains the fallback when direct WebRTC cannot connect.

## Usage analytics

Cloudflare Web Analytics is optional and disabled when `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` is absent. The configured site token is intentionally public because it is embedded in Cloudflare's browser beacon; it is not a Cloudflare account API credential.

Poolamco does not create custom analytics events from IndexedDB records or financial forms. Income amounts, fund balances, personal asset names, transactions, search text, backups, recovery snapshots, and device-transfer payloads are not intentionally serialized into analytics requests. Keep sensitive values and user-entered names out of route paths because normal web analytics can measure page paths.

Local development never renders the analytics beacon, even when the token is present. See `docs/analytics.md` for deployment and privacy details.
