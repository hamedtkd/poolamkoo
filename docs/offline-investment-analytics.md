# Offline workspace and purchase-level investment analytics

This upgrade keeps Poolamkoo's local-first financial workspace useful when the network is unavailable and makes investment performance explainable down to each individual purchase.

## Included

- Every primary financial route is pre-cached as one atomic offline release before a new Service Worker is allowed to become the waiting update.
- Local income, fund, investment and report data remains usable from IndexedDB while offline.
- Market requests are skipped while the browser is offline; cached snapshots may still be shown as stale prices.
- Missing market prices never create a fake current value or open profit/loss.
- Each buy is analyzed as a separate investment lot.
- Partial and full sells consume lots using FIFO (oldest open purchase first).
- Realized and unrealized profit/loss are shown separately.
- Optional transaction fee and other-cost fields affect true buy cost and net sale proceeds.
- Reports distinguish open invested cost from current priced portfolio composition.
- Asset-level and purchase-level profit/loss views are available.
- `/income?plan=...` keeps income-plan detail on the cached `/income` route for safer offline navigation.
- Offline workspace navigation intentionally falls back to full document loads so Next.js route-data requests cannot strand the app on a skeleton when the network is gone.
- Required Next.js scripts, styles, fonts and app-shell assets are cached with the route documents; an interrupted update is discarded instead of replacing a known-good offline release.
- The running app asks the active Service Worker whether its offline package is complete and repairs missing routes after reconnect or controller changes instead of trusting a stale browser-session marker.

## Data compatibility

No new Dexie store or index is required, so the local database schema remains version 8. `feeToman` and `otherCostToman` are optional additive properties on existing investment transaction objects. Older records are interpreted as having zero extra costs.

## Deliberately not included yet

- Manual selection of which purchase lot a sale consumes; FIFO is the current rule.
- Dividend or interest income attribution to investment performance.
- Historical net-worth snapshots and decomposition of growth into new deposits versus market return.

These can be added later without changing Poolamkoo's local-first boundary.
