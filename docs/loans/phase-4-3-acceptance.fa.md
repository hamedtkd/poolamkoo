# Phase 4.3 Acceptance - Market Integration

Status: implemented in source and ready for final local dependency gates.

## Delivered

- Exact market-quote age guard based on `MarketQuote.asOf`.
- Asset-specific freshness limits and a `quote_stale` policy for open market-backed positions.
- Automatic loss-budget evaluation now requires a fresh automatic market quote; snapshots and untimestamped manual prices cannot fire an automatic stop-loss notification.
- `spread_below` monitoring for fund positions using recorded money-weighted annualized return, with a minimum 90-day observation window, compared with the effective loan cost.
- Fund spread is descriptive of recorded performance, not a forecast. Unrecorded cash distributions can make this metric incomplete and therefore require user review.
- Loan health marks incomplete monitoring as a watch state instead of declaring the strategy healthy.
- Market stress scenarios apply explicit shocks to linked market assets and express the impact in both money and installment units.
- Optional background risk push mirrors only privacy-minimized Tindex quote-freshness alerts. No loan name, asset name, principal, position value, reserve balance, cost basis, or P/L is sent in that payload.
- Service Worker enriches a background loan-risk notification from same-device IndexedDB.
- Existing Phase 4.2 lint warning in `tests/loan-risk.test.ts` was removed.

## Freshness policy

Current operational defaults are 2 hours for crypto, 8 hours for gold/currency, and 36 hours for stock/fund. These are safety gates for automatic decisions, not claims about market trading hours. Scheduled market closures and provider behavior should be revisited in Phase 5 QA before a public release.

## Background scope

Background evaluation is intentionally narrower than foreground evaluation. Reserve runway, exact loan-funded P/L, and fund return spread remain local because evaluating them remotely would require mirroring more personal financial data. Quote freshness can be checked remotely with only opaque ids and timing thresholds.

## Validation

The phase adds unit coverage for quote age, snapshot rejection, stale trigger/rearm, money-weighted annualized return, fund spread versus loan cost, privacy-minimized remote risk payloads, remote stale trigger/rearm, and server-state reconciliation.
