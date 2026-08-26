# رسانه‌های محصول Poolamkoo

اسکرین‌شات‌های این پوشه باید از **Build واقعی Poolamkoo** و یک Fixture نمایشی مستقل ساخته شوند. Capture هیچ داده واقعی کاربر را نمی‌خواند: اسکریپت با Browser Profile موقت اجرا می‌شود، Storage همان Origin محلی را پاک می‌کند، دیتای Demo ثابت را داخل IndexedDB همان Profile می‌نویسد و در پایان Profile موقت را حذف می‌کند.

## ساخت محلی

ابتدا dependencyها را نصب کن، سپس:

```bash
npm run media:capture
```

این دستور Production Build را می‌سازد، Next.js را مستقیماً با runtime نصب‌شده Node روی یک پورت موقت بالا می‌آورد، Chrome/Edge/Chromium را Headless اجرا می‌کند و تصاویر را داخل `docs/assets/screenshots/` می‌نویسد. این مسیر مستقیم برای جلوگیری از خطای `spawn EINVAL` در Windows استفاده می‌شود و به `npm.cmd` برای child process وابسته نیست.

اگر Build تازه از قبل وجود دارد:

```bash
npm run media:capture:built
```

اگر مرورگر به‌صورت خودکار پیدا نشد، مسیر executable را مشخص کن:

```bash
POOLAMKOO_BROWSER_PATH=/path/to/chromium npm run media:capture:built
```

در PowerShell:

```powershell
$env:POOLAMKOO_BROWSER_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
npm run media:capture:built
```

## خروجی‌ها

- `landing-light-desktop.png`
- `landing-dark-desktop.png`
- `dashboard-light-desktop.png`
- `dashboard-dark-desktop.png`
- `investments-light-desktop.png`
- `investments-mobile.png`
- `reports-light-desktop.png`

Fixture فقط داده ساختگی درآمد، صندوق، دارایی، تراکنش و Snapshot بازار دارد. درخواست‌های `/api/market`، Push و Cloudflare Web Analytics در زمان Capture مرورگر Block می‌شوند تا تصویر به Secret یا داده شبکه وابسته نباشد.

## GitHub Actions

Workflow دستی `.github/workflows/product-media.yml` همان Capture را روی GitHub Actions اجرا می‌کند:

1. در GitHub وارد تب **Actions** شو.
2. Workflow با نام **Product media** را باز کن.
3. **Run workflow** را بزن.
4. بعد از اتمام، Artifact با نام `poolamkoo-product-screenshots` را دانلود کن.

برای نمایش تصاویر داخل README، خروجی تأییدشده را در همین مسیر Commit کن. Workflow عمداً خودش روی Repository Commit نمی‌زند.
