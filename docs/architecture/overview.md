# معماری پولم‌کو

## Frontend

Next.js App Router، React، TypeScript و shadcn/ui New York.

## Storage

اطلاعات شخصی کاربر در IndexedDB با Dexie نگهداری می‌شود.

## Market

Market Store بین همه Routeها مشترک است. از v0.28 Providerها بر اساس بازار جدا شده‌اند:

- **BrsApi** منبع اصلی دلار، طلای ۱۸ عیار، BTC و USDT است و پاسخ upstream آن ۶۰ ثانیه در Next Data Cache مشترک می‌شود.
- **TSETMC direct (`cdn.tsetmc.com`)** منبع پیش‌فرض جست‌وجو، Quote روز و تاریخچه سهام/ETFهای جدید است. درخواست فقط از Routeهای Server-side انجام می‌شود، قیمت ریالی قبل از ورود به مدل داخلی به تومان تبدیل می‌شود و API Key لازم ندارد.
- **Tindex** دیگر Provider پیش‌فرض بورس نیست؛ فقط برای رکوردهای Legacy، fallback آهسته نرخ‌های پایه و تاریخچه اختیاری دلار/طلا نگه داشته شده و با cache طولانی از سهمیه محدود آن محافظت می‌شود.

Endpointهای CDNِ TSETMC عمومی اما غیررسمی و بدون SLA هستند، بنابراین failure یک حالت عادی طراحی است: آخرین Snapshot واقعی IndexedDB و سپس قیمت دستی دارایی fallback می‌شوند و هیچ Quote/History مصنوعی ساخته نمی‌شود. `webgw.tse.ir` به‌دلیل محدودیت دسترسی از IPهای خارج ایران جزو مسیر الزامی Deployment نیست.

## Background Push (Backlog)

کد آزمایشی Web Push از v0.13.0 در Repository نگه داشته شده، اما از v0.13.1 به‌صورت پیش‌فرض کاملاً غیرفعال است. Build عادی نه Cron دارد، نه به Redis وصل می‌شود و نه UI فعال‌سازی Push را نشان می‌دهد. هشدارهای محلی v0.12 همچنان هنگام اجرای اپ کار می‌کنند. فعال‌سازی آزمایشی آینده فقط با Feature Flag صریح انجام می‌شود؛ جزئیات در `docs/backlog/background-push.md` است.

## Flow

```text
Income
  ↓
Plan
  ↓
Execution
  ↓
Investment Portfolio
  ↓
Reports
```

## UI Rules

- هیچ select خام HTML
- فرم‌ها با React Hook Form + Zod
- Typography فقط از type tokens
- Table دسکتاپ / Card موبایل
- Skeleton باید هندسه واقعی UI را تقلید کند

## Usage analytics

از v0.18، Cloudflare Web Analytics فقط یک integration اختیاری در لایه Root Layout است. اگر `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` وجود نداشته باشد یا Build در Production نباشد، component مقدار `null` برمی‌گرداند و هیچ Script خارجی load نمی‌شود.

Analytics مستقیماً به Dexie، فرم‌ها، Search یا stateهای مالی وصل نیست و Custom Event ندارد. بنابراین telemetry محصول به داده‌های مالی اصلی دسترسی ندارد. جزئیات در `docs/analytics.md` است.

## Public website vs. local app

از v0.19 مسیر `/` برای Landing Page عمومی و route group `(public)` استفاده می‌شود. برنامه Local-first از `/dashboard` و route group `(workspace)` شروع می‌شود. این جداسازی فقط در سطح URL و layout است؛ IndexedDB همچنان بر اساس Origin مرورگر نگهداری می‌شود و تغییر Path داده موجود را منتقل یا reset نمی‌کند.

- routeهای عمومی می‌توانند index شوند و داخل `sitemap.xml` قرار می‌گیرند.
- routeهای مالی `(workspace)` `noindex` هستند و در `robots.txt` نیز disallow می‌شوند.
- `Providers` دیگر دیتابیس مالی را روی بازدید صفحات عمومی seed نمی‌کند.
- bootstrap دیتابیس داخل app انجام می‌شود و timeout/error صریح دارد تا خرابی یا Block شدن IndexedDB به Skeleton بی‌پایان تبدیل نشود.


## Safe application and database updates

از v0.20 چرخه Update عمداً دو مرحله‌ای است. Service Worker جدید در حالت `waiting` می‌ماند و UI فقط وقتی نسخه قبلی واقعاً کنترل صفحه را دارد، Banner به‌روزرسانی نشان می‌دهد. با تأیید کاربر پیام `SKIP_WAITING` ارسال می‌شود و پس از `controllerchange` صفحه یک‌بار Reload می‌شود. این الگو از فعال‌شدن ناگهانی Worker جدید وسط یک Session مالی جلوگیری می‌کند.

برای IndexedDB نیز اتصال Dexie به رویدادهای `blocked` و `versionchange` گوش می‌دهد. اگر تب قدیمی مانع Upgrade باشد، کاربر راهنمای بستن/تازه‌سازی تب‌های دیگر را می‌بیند. اگر تب دیگری Schema جدید را باز کند، تب قدیمی DB را می‌بندد و به‌جای ادامه نوشتن با کد قدیمی، Reload امن درخواست می‌کند. Live Queryهای مالی فقط بعد از Bootstrap موفق فعال می‌شوند.

هیچ‌کدام از این Flowها Site Data را پاک یا دیتابیس جدیدی با Origin متفاوت ایجاد نمی‌کنند.

## Verified data portability

از v0.21 نسخه برنامه و نسخه Schema دیتابیس در یک منبع مشترک (`lib/app-version.ts`) تعریف می‌شوند تا Backup، Recovery و Device Transfer درباره سازگاری داده تصمیم یکسان بگیرند.

فایل Backup جدید Envelope نسخه ۲ دارد: Payload می‌تواند AES-GCM باشد و SHA-256 digest خرابی فایل را قبل از Restore آشکار می‌کند. Restore ابتدا Envelope، Schema و جدول‌های ضروری را Validate می‌کند و Preview رکوردها را نشان می‌دهد؛ سپس و فقط پس از تأیید کاربر Recovery Snapshot ساخته و داده جایگزین می‌شود. Backupهای v1 همچنان خوانده می‌شوند.

Recovery Snapshotهای جدید Metadata نسخه دارند و انتقال مستقیم WebRTC نیز `schemaVersion` را داخل frame متادیتا می‌فرستد. داده‌ای که از Schema جدیدتر آمده باشد قبل از هر Import رد می‌شود. خود انتقال مستقیم برای سازگاری، Envelope رمزنگاری‌شده v1 را نگه می‌دارد و همان integrity بیرونی SHA-256 + AES-GCM را ادامه می‌دهد.


## Mobile navigation and accessibility

از v0.22 مسیرهای پرتکرار موبایل عمداً از مسیرهای کم‌تکرار جدا شده‌اند. Bottom Navigation چهار جریان روزانه `dashboard`، `income`، `investments` و `funds` را مستقیم نگه می‌دارد و Reports/Settings در Drawer «بیشتر» باقی می‌مانند. این تصمیم برای کاهش رفت‌وبرگشت در جریان «پول وارد شد → برنامه → اجرا/سرمایه/صندوق» است، نه برای افزودن سطح ناوبری جدید.

Shell موبایل و Bottom Navigation از `safe-area-inset-bottom` استفاده می‌کنند تا محتوای مالی زیر Home Indicator یا Gesture Area نرود. Desktop/Mobile nav با `aria-current` وضعیت Route فعال را اعلام می‌کنند و Drawer با `aria-expanded`/`aria-controls` به Trigger متصل است.

Global Search از v0.22 یک Combobox قابل کنترل با کیبورد است: Arrow Up/Down، Home/End و Enter نتیجه فعال را جابه‌جا/باز می‌کنند و تعداد نتایج در Live Region اعلام می‌شود. DataTable نیز Sort State و Pagination landmark را برای فناوری کمکی اعلام می‌کند. این لایه هیچ داده‌ای به Analytics یا Server جدید ارسال نمی‌کند.


## Performance boundaries (v0.23)

Chart libraries are intentionally kept out of high-frequency route entry code where a lighter representation is sufficient. Dashboard market sparklines use a small SVG renderer over real local snapshots; the portfolio area chart, Reports monthly bars, and investment market chart engine load through explicit dynamic boundaries. This is a bundle/hydration optimization only: it does not change IndexedDB, market-provider priority, Offline caching, or the rule that missing history must stay an honest empty state.

## Portfolio decision layer and PWA boundary (v0.24)

مرور ترکیب سبد یک لایه اطلاعاتی روی همان `portfolioPosition` موجود است و منطق بهای تمام‌شده را تغییر نمی‌دهد. `useInvestmentPortfolio` فقط منبع قیمت هر Position را به «market / manual / cost-basis fallback» برچسب می‌زند و `lib/portfolio-allocation.ts` سهم فعلی، سهم هدف، drift و gap ارزشی را به‌صورت Pure محاسبه می‌کند. اولویت پول جدید فقط از target gap خود کاربر می‌آید و وقتی جمع هدف‌ها ۱۰۰٪ نیست یا ارزش کل سبد صفر است، تولید نمی‌شود. هیچ مدل پیش‌بینی یا توصیه معامله‌ای در این لایه وجود ندارد.

از v0.24 Manifest نصب‌شونده دیگر Special Route سراسری Next نیست. فایل `public/app.webmanifest` فقط توسط `(workspace)` advertise می‌شود و `PwaUpdateNotice` نیز فقط همان‌جا Service Worker را رجیستر/بررسی می‌کند. بنابراین بازدید عادی `/` یک سایت عمومی است، در حالی که PWA با `id` و `start_url` روی `/dashboard` تعریف می‌شود. Scope عمداً `/` می‌ماند چون routeهای واقعی app مانند `/income`، `/funds` و `/investments` sibling هستند. برای نصب‌های قدیمی، فقط اجرای standalone روی ریشه با یک guard کوچک به Dashboard منتقل می‌شود؛ مرورگر عادی redirect نمی‌شود.


## Decision-focused reports and landing media (v0.25)

لایه `lib/report-insights.ts` فقط از داده‌های محلی موجود یک Snapshot تصمیمی Pure می‌سازد: پوشش تخصیص پول ورودی، فاصله زندگی/امنیت/رشد با قانون فعال، اجرای Plan Itemها و پوشش فعلی صندوق‌ها. اگر Allocationهای بازه مجموع پول ورودی را پوشش ندهند، Snapshot با `allocationReliable = false` علامت می‌خورد و UI اجازه نمی‌دهد یک فاصله ناقص مثل نتیجه قطعی نمایش داده شود. این لایه به Expense ledger، Forecast یا API جدید وابسته نیست.

Landing از v0.25 به‌جای preview کاملاً مصنوعی JSX، دو Asset تصویری تأییدشده Light/Dark را از `public/landing/` نمایش می‌دهد. عددهای این تصویر صریحاً Demo هستند و هیچ داده کاربر برای ساخت Landing خوانده نمی‌شود. Service Worker همچنان فقط در Workspace رجیستر می‌شود، بنابراین اضافه‌شدن این رسانه مرز Public/PWA نسخه v0.24 را تغییر نمی‌دهد.

Capture رسانه برای Windows نیز Production Server را با `process.execPath` و bin نصب‌شده Next.js اجرا می‌کند؛ این کار وابستگی به اجرای مستقیم `npm.cmd` در Child Process را حذف می‌کند و همان Browser Profile موقت/Fixture ساختگی را حفظ می‌کند.

## Production browser release gate (v0.26)

`check:release` یک لایه Browser QA کوچک روی Gateهای ساختاری موجود اضافه می‌کند و جای Unit Testها یا Manual PWA install QA را نمی‌گیرد. Runner با Chrome/Edge/Chromium و Chrome DevTools Protocol اجرا می‌شود تا وابستگی Playwright/Cypress یا Browser bundle جدید وارد پروژه نشود.

هر اجرا یک Browser Profile موقت می‌سازد، Origin تست را پاک می‌کند و Market/Push/Cloudflare requests را Block می‌کند. ابتدا `/` را به‌عنوان Landing عمومی بررسی می‌کند، سپس CTA واقعی را تا Fresh `/dashboard` دنبال می‌کند، ایجاد IndexedDB و Onboarding را تأیید می‌کند، Fixture ساختگی `scripts/media/demo-data.mjs` را داخل همان Profile Seed می‌کند و Dashboard/Reports را از Production Build واقعی می‌خواند. در همان Session، Manifest و Service Worker فقط از Workspace بررسی می‌شوند و بازگشت عادی به `/` نباید به Dashboard redirect شود.

این Gate عمداً محدود است: فقط قراردادهای Release-critical را پوشش می‌دهد و هر Flow جدید را به Browser suite اضافه نمی‌کند. اگر Regression جدیدی ثابت کند پوشش بیشتری لازم است، همان مورد به‌صورت هدفمند اضافه می‌شود.

## Public landing rendering boundary (v0.27)

The public Hero must remain useful before client hydration. Critical copy and approved Light/Dark product media therefore render as normal server-visible markup; decorative entrance/float motion is CSS-only and disabled by `prefers-reduced-motion`. The public theme toggle uses `next-themes` directly and does not read or write the financial IndexedDB settings record. Workspace appearance persistence remains owned by the application theme layer after entering `/dashboard`.

از v0.27.4 خود Route در Workspace کاملاً پایدار و بدون entrance/exit animation است. حرکت فقط در سطح آیتم‌های صفحه و با utilityهای CSS پکیج `tailwindcss-animated` انجام می‌شود: Header و کارت‌ها با `animate-fade-*` و delayهای کوتاه تقریباً 55ms به‌ترتیب وارد می‌شوند. از v0.28.2 واردکردن این پکیج در Tailwind v4 از مسیر صریح `tailwindcss-animated/src/index.css` انجام می‌شود تا Turbopack روی Windows به package `style` field وابسته نباشد. Dialog/AlertDialog/Drawer برای جلوگیری از فریم کاملاً شفاف از transform-only keyframeهای محلی استفاده می‌کنند؛ Overlay/Toast و آیتم‌های غیرحیاتی همچنان از utilityهای `tailwindcss-animated` استفاده می‌کنند. کتابخانه `motion` فقط برای revealهای viewport/scroll در Landing نگه داشته شده و در Providers/Workspace runtime سراسری وارد نمی‌شود. `prefers-reduced-motion` هر دو مسیر CSS و Motion را خاموش می‌کند.

## Report export and mobile interaction boundary (v0.29)

Reports can now create two deliberately different client-side outputs. `lib/report-export.ts` builds a share-safe Persian text summary from the already-derived decision snapshot; this text contains percentages/status only and intentionally excludes financial amounts and asset names. The detailed CSV path is explicit user action and may contain report amounts plus asset names/current values, but it does not serialize raw transactions, IndexedDB tables, backup envelopes, or recovery metadata. CSV string cells neutralize spreadsheet formula prefixes before quoting.

No report is uploaded or hosted by Poolamkoo. `navigator.share` is called only after the user presses Share; otherwise the text stays local. CSV is created with `Blob`/object URL in the browser and downloaded locally.

Mobile navigation keeps the four daily destinations in the bottom bar. The More drawer no longer repeats those destinations; it exposes only New Money, Reports, Settings, compact utilities and public help links. The same shared Drawer now implements real drag-to-dismiss: opening/closing animation uses `transform`, while the user's drag is applied through the independent CSS `translate` property, preventing the animation from overriding finger/pointer movement.

Workspace entrance motion is intentionally directional but not alternating: page headings use `fade-down`, while KPI/card/table content uses `fade-up` with short stagger. Horizontal left/right entrances remain available as utilities for isolated future use but are not mixed through the financial workspace. On compact desktop widths the sidebar becomes a locked icon rail so tables and report grids retain usable width.

## Market provider reliability boundary (v0.30)

Provider availability is now treated as structured runtime state rather than free-form exception text. `lib/market/reliability.ts` defines stable provider IDs, health states and failure categories; server routes expose only those safe categories plus human-readable Poolamkoo messages. Raw BrsApi/TSETMC/Tindex response bodies are never sent to the browser as error text.

The quote route starts independent BrsApi, direct-TSETMC and legacy-Tindex work together. Tindex's core boards fallback remains dependent on the BrsApi result and is called only when USD/18K gold/BTC are actually missing. This preserves the v0.28 provider priority and protects the optional free-tier quota instead of eagerly querying every source on every refresh.

A `TsetmcProvider` instance owns one deadline for the whole operation as well as a shorter timeout for each HTTP request. Batched quote requests therefore share a bounded time budget; partial successes return as `degraded`, while complete failure returns a classified `unavailable` state. Client code still persists only real quotes to IndexedDB and falls back to existing real snapshots/manual prices when fresh data is absent. IndexedDB schema 6 and all backup/transfer formats remain unchanged.

## Market transparency and diagnostics boundary (v0.31)

The v0.30 health model is now surfaced in Settings through `components/settings/market-status-card.tsx`. The card reads the existing `useMarket` runtime only; it does not create a second polling loop or another provider request path. A manual retry calls the same coalesced market refresh already used by the shell.

`lib/market/status.ts` owns user-facing provider labels and the copyable diagnostic formatter. The diagnostic contract intentionally accepts only market mode, health metadata, aggregate live/Snapshot coverage and timestamps. It has no quote/asset/watchlist inputs, so prices, symbols, asset names, market IDs and financial amounts cannot enter the generated text by accident. Provider configuration is reduced to a boolean and failures remain the stable v0.30 categories. Clipboard export happens only after explicit user action and is never uploaded by Poolamkoo.

## Partial market fallback continuity (v0.32)

`lib/market/runtime.ts` owns client-side continuity after a provider refresh. Fresh rows are keyed first; only missing core symbols and exchange targets that are actually present in the current runtime request may be filled from the newest matching IndexedDB snapshot. Exchange keys include both provider and market id, so a TSETMC instrument cannot silently inherit a legacy Tindex snapshot just because the numeric id matches. Unrelated historical snapshots are excluded.

Snapshot provenance exists only as runtime metadata (`runtimeSource` / `snapshotCapturedAt`). Before a fresh quote is persisted, that metadata is stripped, so IndexedDB snapshots remain provider data plus their existing `capturedAt` field and backup/schema formats do not change. Settings may expose aggregate live/Snapshot counts and timestamps, but the privacy-safe diagnostic still has no quote, asset, symbol or market-id input.

Local alerts deliberately filter out `runtimeSource: "snapshot"`. A partial refresh can therefore keep portfolio/watchlist valuation continuous without turning an old observed price into a new notification or re-arm event. UI source labels mark Snapshot fallback anywhere the mixed runtime quote is surfaced.


## Provider-scoped valuation and decision freshness (v0.33)

`lib/market/valuation.ts` is the downstream quote-selection boundary. A linked exchange asset/watch item/alert must match both provider and market id; symbol-only fallback is reserved for unlinked/core symbols. This prevents a legacy Tindex row and a direct TSETMC row with the same display symbol or numeric id from silently substituting for one another after the API/runtime merge.

Valuation now distinguishes continuity from decision freshness. Fresh provider quotes and explicit manual prices are suitable inputs for automatic portfolio planning. Runtime Snapshot quotes and cost-basis fallback can keep current value visible, but they are marked incomplete for decision surfaces. Portfolio target gaps may still be inspected, while automatic new-money priorities, smart growth distribution and Reports best/worst ranking pause until held positions have decision-ready pricing. Transaction price suggestions and newly linked manual fallback values likewise never come from a Snapshot.

Detailed local CSV export includes the valuation-source label so a user can audit which rows used fresh market, Snapshot, manual or cost-basis pricing. The privacy-minimized share text is unchanged. Local market alerts use the same provider-scoped lookup and filter Snapshot rows before evaluation. IndexedDB schema 6 and persisted MarketSnapshot shape remain unchanged.

The release lint command also uses `--max-warnings=0`; warning-free source is part of the release contract instead of an advisory console state.


## Persisted provider-scoped identity (v0.34)

Runtime quote selection became provider-scoped in v0.33, but the older IndexedDB Watchlist schema still treated raw `marketId` as globally unique. v0.34 closes that persistence gap. Schema 7 uses a unique compound `[source+marketId]` index for `marketWatchlist` and a non-unique compound index for `marketAlerts`, while keeping the numeric primary keys and old `marketId` index available for compatibility. UI lookups, duplicate checks and notification identity use the same provider-scoped key. Server quote merge, client target dedupe/Snapshot lookup and market-chart selection use that same helper as well, closing the remaining raw-id/symbol collision paths.

The Dexie chain keeps schema 6 explicitly and upgrades to 7 in place. During migration, an exchange-linked asset with `marketId` but no valid `marketSource`, or a Watchlist/Alert row without a valid `source`, is treated as legacy Tindex. That default is historically safe because those rows predate direct TSETMC linking. Explicit `tsetmc` rows are preserved. Backup/Recovery/Device Transfer payloads are normalized with the same rule before writing into schema 7; Watchlist duplicates within one provider are rejected during preview validation, while the same raw market id from different providers is valid.

No backup envelope format, database name, table primary key, market-provider priority or financial-data boundary changes in this release. The schema bump exists only because persisted market identity now requires a real compound index.


## Verified schema migration release boundary (v0.35)

The schema-7 model introduced in v0.34 is unchanged. v0.35 instead verifies the upgrade path in the same production-browser gate used for routing, dialogs, Reports and PWA boundaries. `scripts/fixtures/schema6-idb.mjs` mirrors the exact `storesV6` contract and builds a raw IndexedDB database at native version 60; Dexie maps declared version 6 to that native version. The current application must then open the same `poolyar-local` database and reach native version 70/schema 7 before the smoke proceeds.

The browser assertion reads the migrated stores directly: legacy exchange rows must gain `tindex`, explicit `tsetmc` rows must remain unchanged, the provider-scoped compound indexes must exist, and raw `marketId` may no longer be globally unique in Watchlist. A second TSETMC row with the same raw market id as a migrated Tindex row is inserted as a collision proof. The temporary fixture is then cleared before the existing fresh-profile smoke continues, so migration verification cannot contaminate onboarding, product-media data or the user's real browser storage.
