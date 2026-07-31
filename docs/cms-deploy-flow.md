# Public CMS deploy flow

## Required behavior

A fresh Vercel production deployment must serve CMS SiteImage overrides on the
**first** public request. No admin save and no manual cache touch.

## Root cause (fixed)

1. During `next build`, `loadPublicCmsBundle` returned slot defaults without
   hitting the database (`NEXT_PHASE === phase-production-build`).
2. That default bundle was stored in `unstable_cache` and/or baked into ISR HTML.
3. First requests served those defaults until `revalidateTag('public-cms')`
   (e.g. an admin SiteImage save).

## Current architecture

1. `connection()` defers CMS resolution to **request time** — build never bakes
   defaults into route HTML.
2. `unstable_cache` (`public-cms-bundle-v7`) stores **only successful DB reads**.
3. Failures use in-process `lastGood` or one-shot defaults for that request only;
   they are **not** written into Data Cache.
4. Public path still uses 0 `SiteImage` table queries (map from
   `site-image-public-map-v2` only).

## Deployment order

```text
1. Ensure map exists (idempotent):
   npm run rebuild:site-image-map

2. Push to the production Git branch (Vercel builds + deploys).

3. Optional warm / belt-and-suspenders (authenticated):
   POST /api/internal/revalidate-public-cms
   Authorization: Bearer <CRON_SECRET>
   Body: {}   # or { "forceRebuildMap": true }

4. First public GET /, /cruises, /rooms — expect Supabase override URLs in SSR HTML.
```

Step 3 is optional when using the request-time CMS path; it still warms the
Data Cache and re-ensures the map without human admin UI.

## Do not

- Expose an unauthenticated revalidation endpoint.
- Cache fallback/default bundles as successful CMS results.
- Require an admin image save after every deploy.
