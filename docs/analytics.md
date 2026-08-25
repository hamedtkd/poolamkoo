# Cloudflare Web Analytics in Poolamco

Poolamco v0.18 adds an **optional** Cloudflare Web Analytics beacon for public deployments. The goal is deliberately narrow: understand whether the app is being used and whether real visitors experience acceptable page performance, without building a product-event analytics pipeline around personal-finance behavior.

## What is measured

When `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` is configured in a production build, the official Cloudflare beacon can report:

- visits and page views;
- page paths;
- browser, operating system and device category;
- country-level traffic dimensions provided by Cloudflare;
- page-load performance and Core Web Vitals;
- SPA route changes using the beacon's built-in navigation measurement.

Cloudflare documents Web Analytics as privacy-first and cookie-free. Its documentation also states that query strings are not logged, and that the Web Analytics metrics do not rely on cookies or `localStorage` client state.

Official references:

- https://developers.cloudflare.com/web-analytics/
- https://developers.cloudflare.com/web-analytics/get-started/
- https://developers.cloudflare.com/web-analytics/get-started/web-analytics-spa/
- https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/
- https://developers.cloudflare.com/web-analytics/faq/

## What Poolamco does not send

Poolamco does not define custom analytics events for financial actions. The integration never receives or serializes IndexedDB records, so the app does not intentionally send:

- income amounts;
- fund balances or targets;
- personal asset names;
- transaction rows or purchase prices;
- global-search text;
- form values;
- backup or recovery contents;
- device-transfer payloads.

The beacon sees normal website metadata such as the current page path. Route design should therefore continue to avoid putting sensitive financial values or user-entered names directly in URLs.

## Zero-cost / self-host behavior

No analytics package is installed. The integration uses Next.js `Script` with Cloudflare's official hosted beacon.

If the environment variable is absent or invalid:

```env
NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN=
```

then the component returns `null` and no Cloudflare analytics script is rendered.

Even with a token present, local development does not load the beacon. This keeps localhost work and developer test data out of production analytics.

## Setup for a Vercel deployment

1. Open Cloudflare Dashboard → **Web Analytics**.
2. Add the public Poolamco hostname as a site.
3. Open **Manage site** and copy the token from the JavaScript snippet.
4. In Vercel, add this environment variable to the **Production** environment only:

```env
NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN=your_site_token
```

5. Redeploy the application.
6. Visit the production site and confirm the beacon appears in DevTools Network.
7. Wait a few minutes and verify Visits / Page Views / Core Web Vitals in Cloudflare Web Analytics.

The Web Analytics token is intentionally client-visible because Cloudflare requires it in the browser snippet. It is not an account API token and must not be confused with a Cloudflare API key.

## Manual embedding vs automatic injection

Poolamco uses **manual embedding** so the open-source application behaves the same whether the deployment is on Vercel, another host, or behind Cloudflare DNS.

If a deployment is also proxied through Cloudflare and automatic Web Analytics injection is enabled, do not enable both approaches at the same time. Cloudflare recommends using a single beacon snippet per page. For Poolamco, prefer the repository's manual integration and disable automatic injection for that site.

## Consent and legal review

Poolamco does not add a cookie-consent modal solely for this integration because Cloudflare Web Analytics is designed to operate without analytics cookies or user-level fingerprinting. This is a product decision, not legal advice. Public deployers remain responsible for privacy notices and consent requirements in their own jurisdiction or organization.
