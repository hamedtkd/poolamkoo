# معماری پولم‌کو

## Frontend

Next.js App Router، React، TypeScript و shadcn/ui New York.

## Storage

اطلاعات شخصی کاربر در IndexedDB با Dexie نگهداری می‌شود.

## Market

Market Provider فقط یک بار داده را دریافت می‌کند. Routeها از Store مشترک استفاده می‌کنند.

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
