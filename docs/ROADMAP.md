# Poolamco roadmap

This roadmap prioritizes zero-cost, local-first product reliability before optional hosted infrastructure.

## v0.13.1 — Zero-cost baseline

- Pause Background Web Push behind an explicit experimental feature flag.
- Ship no Vercel Cron.
- Require no Redis/VAPID secrets for normal deployments.
- Keep the implementation and tests in the repository backlog.

## v0.14 — Data safety and durable backups ✅

- Backup health/status, 7-day stale policy, and 3-day snooze.
- Encrypted reminder flow plus shared Toast/Error Handling.
- Daily bounded local Recovery Snapshots and pre-destructive recovery points.
- Browser persistence status with explicit warnings that local recovery is not a permanent backup.
- Device-only backup metadata kept outside exported financial payloads.

## v0.15 — Simple device-to-device transfer ✅

- Direct encrypted WebRTC transfer inspired by Saatyar, with a shorter copy/share pairing flow.
- Sender: «انتقال به دستگاه جدید» → one-time PIN + pairing code.
- Receiver: paste/share code → return answer → preview → explicit import.
- No central storage of financial data and no required signaling backend.
- Version/schema validation, chunk progress, SHA-256 integrity, acknowledgement, timeout/retry, and duplicate-safe replace import.
- Encrypted backup file transfer remains the universal fallback when WebRTC cannot connect.
- QR scanning can be reconsidered later only if it materially simplifies the flow without adding fragile browser dependencies.

## v0.16 — Open-source product surface ✅

- GitHub entry point for `https://github.com/hamedtkd/poolamkoo` and a cached public star count.
- Guide/help, About, Privacy/Data policy, Security, License, and data-safety pages.
- Optional support link (`https://daramet.com/hamedtkd`, same voluntary support destination used by Saatyar) without gating any feature.
- Gentle support prompt only after real repeated use (target: at least 7 distinct active days), with choices to star GitHub, support financially, or dismiss.
- Long cooldown after dismissal; never interrupt onboarding or critical financial flows.

## v0.17 — Motion and dashboard polish ✅

- Add the modern `motion` package for restrained route/card/dialog micro-interactions.
- Respect `prefers-reduced-motion` everywhere.
- No decorative animation that delays data entry or makes financial values harder to scan.
- Improve dashboard hierarchy, empty/loading transitions, and responsive continuity.

## v0.18 — Privacy-first usage analytics ✅

- Optional Cloudflare Web Analytics integration for public deployments, loaded only in production.
- Track aggregate visits, page views, route paths, device/browser categories and Core Web Vitals; never financial amounts, asset names, search terms, transactions, form contents or backup data.
- No custom analytics event layer and no analytics npm dependency; token/config absent means no third-party beacon at all.
- Dedicated in-app Analytics page, Settings status card, privacy documentation and release QA.

## Backlog — Background alerts while PWA is closed

See `docs/backlog/background-push.md`. Reconsider only when a sustainable free/voluntary hosting model and market-data quota make it responsible to enable.

## Reference: Saatyar patterns worth reusing

Saatyar is a useful sibling reference for Poolamco because it is also Persian-first and local-first. Its public repository documents versioned backup/restore, local recovery snapshots, encrypted direct WebRTC transfer with QR pairing, and optional Daramet support that does not unlock paid features. Poolamco should reuse the principles while keeping its own financial UX simpler and stricter around backup safety.

- https://github.com/hamedtkd/saat-yar
- https://github.com/hamedtkd/poolamkoo
