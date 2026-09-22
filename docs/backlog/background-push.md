# Background Web Push — paused experiment

Background Web Push was implemented in v0.13.0 as an opt-in experiment, then intentionally paused in v0.13.1. The code remains in the repository for future work, but the default public build does not schedule any background jobs, does not contact Redis, and does not expose the Push activation UI.

## Why it is paused

- Poolamkoo is being developed as a free and open-source local-first app.
- Reliable closed-PWA alerts need a scheduler plus durable server storage.
- Market checks also consume third-party quote quota even when no user has the app open.
- A permanent paid dependency is not justified at the current stage.

## Default state

- `vercel.json` contains no cron schedule.
- `NEXT_PUBLIC_EXPERIMENTAL_BACKGROUND_PUSH` is unset/false.
- Local v0.12 market alerts continue to work while the app is running.
- No VAPID, Upstash, or `CRON_SECRET` values are needed for a normal deployment.

## Preserved implementation

The following pieces are kept so future contributors do not need to rebuild the experiment from scratch:

- Web Push subscription hook and UI
- VAPID sender
- minimal remote market-alert mirror
- privacy-minimized loan reminder schedule mirror with no loan name or amount
- Upstash REST store adapter
- protected cron evaluator route
- Service Worker Push handling
- privacy and reconciliation tests

## Re-enabling for development

Use `.env.push.example` and explicitly set `NEXT_PUBLIC_EXPERIMENTAL_BACKGROUND_PUSH=1`. No scheduler is shipped by default; an operator must provide one deliberately. Loan reminders can run without `TINDEX_API_TOKEN`; that token is needed only if remote market alerts are evaluated too. Before any public re-enable, document the scheduler, storage and operational cost budget. Market quote polling should still be reviewed around unique-symbol batching/deduplication.
