# Poolamco roadmap

This roadmap prioritizes zero-cost, local-first product reliability before optional hosted infrastructure.

## v0.13.1 — Zero-cost baseline

- Pause Background Web Push behind an explicit experimental feature flag.
- Ship no Vercel Cron.
- Require no Redis/VAPID secrets for normal deployments.
- Keep the implementation and tests in the repository backlog.

## v0.14 — Data safety and durable backups

- Backup health/status in Settings: last backup time, age, and clear risk state.
- Friendly backup reminders after meaningful usage and when the last backup becomes old.
- One-click encrypted JSON backup download with complete toast/error handling.
- Never claim browser storage is a permanent backup.
- Explore user-approved persistent save destinations where browser APIs support them; otherwise use reminders plus explicit downloads.
- Add local recovery snapshots and a bounded recovery history before destructive operations.

## v0.15 — Simple device-to-device transfer

- Direct encrypted WebRTC transfer inspired by Saatyar, but with a shorter Poolamco flow.
- Sender: "انتقال به دستگاه جدید" → QR/pairing code.
- Receiver: scan/paste → preview → explicit import.
- No central storage of financial data.
- Version/schema validation, transfer progress, acknowledgement, timeout/retry, and duplicate-safe import.
- Keep encrypted backup file transfer as a universal fallback when WebRTC cannot connect.

## v0.16 — Open-source product surface

- GitHub entry point for `https://github.com/hamedtkd/poolamkoo` and a cached public star count.
- Guide/help, About, Privacy/Data policy, Security, License, and data-safety pages.
- Optional support link (`https://daramet.com/hamedtkd`, same voluntary support destination used by Saatyar) without gating any feature.
- Gentle support prompt only after real repeated use (target: at least 7 distinct active days), with choices to star GitHub, support financially, or dismiss.
- Long cooldown after dismissal; never interrupt onboarding or critical financial flows.

## v0.17 — Motion and dashboard polish

- Add the modern `motion` package for restrained route/card/dialog micro-interactions.
- Respect `prefers-reduced-motion` everywhere.
- No decorative animation that delays data entry or makes financial values harder to scan.
- Improve dashboard hierarchy, empty/loading transitions, and responsive continuity.

## v0.18 — Privacy-first usage analytics

- Optional Cloudflare Web Analytics integration for public deployments.
- Track only aggregate site/app usage and performance; never financial amounts, asset names, search terms, transactions, or backup contents.
- No analytics dependency for self-hosters; token/config absent means no beacon.
- Document the analytics/privacy policy in the app and repository.

## Backlog — Background alerts while PWA is closed

See `docs/backlog/background-push.md`. Reconsider only when a sustainable free/voluntary hosting model and market-data quota make it responsible to enable.

## Reference: Saatyar patterns worth reusing

Saatyar is a useful sibling reference for Poolamco because it is also Persian-first and local-first. Its public repository documents versioned backup/restore, local recovery snapshots, encrypted direct WebRTC transfer with QR pairing, and optional Daramet support that does not unlock paid features. Poolamco should reuse the principles while keeping its own financial UX simpler and stricter around backup safety.

- https://github.com/hamedtkd/saat-yar
- https://github.com/hamedtkd/poolamkoo
