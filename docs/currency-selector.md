# Display currency selector

The public header offers EUR (Euro), USD, GBP, EGP and RUB on desktop, tablet and phone. Prices across the homepage, cabin pages, listings, saved voyage, calendars and booking journey follow the selection. A validated browser preference survives reloads and synchronizes across tabs.

All prices, holds, payments, booking records, emails and invoices retain their canonical USD cents. Converted prices carry an approximation mark. Booking summaries disclose the USD invoice total. This feature does not accept a currency or an exchange rate from the guest when creating a booking.

`GET /api/exchange-rates` reads a fixed HTTPS Frankfurter v2 blended daily feed, validates all four currency pairs and their dates, and caches it for an hour. No API key or environment variable is needed. The endpoint applies request throttling; production should retain the platform's edge abuse protection in addition to the process-local limiter. Requests cannot change the upstream URL or currency list. An unavailable, incomplete, invalid or older-than-seven-days rate feed returns a generic 503. The UI then shows USD and offers a retry, preserving the guest's preference until valid rates return.

Rates: https://frankfurter.dev/

Run deterministic conversion and validation checks with `node --experimental-strip-types scripts/test-currency.mjs` (Node 22.6+), plus `npm run typecheck` and ESLint on changed files. Local preview: `npm run dev -- --webpack --port 3000`. Webpack is needed for the existing homepage Google-font loader in this checkout. No deployment is performed by this feature.

Local QA (2026-10-29): all five currencies changed the displayed cabin fare; EUR survived reloads; keyboard End and Escape worked; the menu fit 320px phone and 768px tablet viewports. TypeScript and conversion checks passed; ESLint reported no errors. Existing booking availability queries timed out, preventing a complete booking submission check. Existing image-optimizer URLs also returned 404s in local development.
