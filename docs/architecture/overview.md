# معماری پولم‌کو

## Frontend

Next.js App Router، React، TypeScript و shadcn/ui New York.

## Storage

اطلاعات شخصی کاربر در IndexedDB با Dexie نگهداری می‌شود.

## Market

Market Store بین همه Routeها مشترک است. BrsApi منبع اصلی نرخ طلا/ارز/رمزارز است؛ اگر Quoteهای اصلی ناقص باشند Tindex با یک درخواست Boards به‌عنوان fallback نرخ دلار، طلای ۱۸ عیار و BTC را می‌دهد. Tindex همچنین نمادهای بورسی متصل به سبد را از داده TSETMC دریافت می‌کند. Snapshot واقعی روی دستگاه cache می‌شود و قیمت مصنوعی تولید نمی‌شود. Quoteهای Tindex در UI با لینک منبع داده مشخص می‌شوند.

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
