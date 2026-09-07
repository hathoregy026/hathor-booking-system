# Redirect audit

Last reviewed: 7 September 2026  
Implementation: `next.config.ts` `redirects()`, plus a few `permanentRedirect()` / `redirect()` in pages.

Status codes: Next.js `permanent: true` emits **308** (permanent). Treat as ranking-signal transfer.

## Production redirects

| Old URL | Current destination | Type | SEO risk | Action |
|---|---|---|---|---|
| `/Luxury-Royal-Suites-Nile-Dahabiya-Cruise` | `/royal-suites` | 308 | **Was Critical — now fixed.** This URL carried Royal Suite keyword authority. It previously pointed at `/charter` (unrelated private-charter intent). | Keep destination `/royal-suites`. Never send this URL to Charter again. |
| `/luxury-suites` | `/rooms` | 308 | Low. Old “luxury suites” product URL → Hathor Luxury Suite product page. | Keep. Do not send to `/suites` (collection) or `/royal-suites`. |
| `/Nile-Cruise-Luxury-Suites` | `/rooms` | 308 | Medium. Matches Luxury Suite product, not the `/suites` visual collection and not Royal Suites. | Keep `/rooms`. |
| `/rooms/dahabiya-nile-cruise-aswan-to-luxor` | `/voyages/aswan-to-luxor` | 308 | High if left 404. Legacy blog/internal links used a room URL for a voyage. | Keep. |
| `/rooms/dahabiya-nile-cruise-luxor-to-aswan` | `/voyages/luxor-to-aswan` | 308 | Same as above, opposite direction. | Keep. |
| `/cruises` | `/cruises-list` | 308 | Low. Inventory alias. | Keep. Do not point at `/voyages` (story hub). |
| `/mask-reveal` | `/cruises-list` | 308 | None (dev/internal). | Keep. |
| `/blog` | `/blogs` | 308 | Low. Journal hub alias. | Keep. |
| `/journal` | `/blogs` | 308 | Low. | Keep. |
| `/contact-us` | `/contact` | 308 | Low. | Keep. |
| `/accommodation` | `/luxury-cabins-Nile-Cruise` | 308 | Low. Cabins intent preserved. | Keep. |
| `/accommodations` | `/luxury-cabins-Nile-Cruise` | 308 | Low. | Keep. |
| `/dining` | `/gastronomy` | 308 | Low. | Keep. |
| `/homepage-2` | `/` | 308 | Low. Duplicate homepage. | Keep. |
| `/homepage-3` | `/` | 308 | Medium. `/home-3` still exists as a live noindex edition; this alias consolidates to `/`. | Keep destination `/`. Do not 308 `/home-3` itself until that edition is retired. |
| `/ex` | `/` | 307/308 via page | Low. Former EX homepage. | Keep. |
| `/book` | `/booking` | 307 | None (non-indexable booking). | Keep. |
| `/booking/checkout` | `/booking` | 307 | None. | Keep. |

## Do not add

| Tempting redirect | Why not |
|---|---|
| `/royal-suites` → `/charter` | Unrelated intent. Destroys Royal Suite rankings. |
| `/voyages` → `/cruises-list` | Hub vs inventory. Split is deliberate. |
| `/suites` → `/rooms` | Collection vs 46 m² product. |
| `/luxury-cabins-Nile-Cruise` → `/rooms` | Cabins vs suites cannibalisation. |
| `/home-3` → `/` while still linked in nav | Soft-canonical via **noindex**; a 308 is fine only after Home 3 is removed from navigation. |

## Blog HTML alias map

`lib/blog-html.ts` rewrites scraped Hathor Cruise links at render time. It must stay aligned with the table above — especially Royal Suite → `/royal-suites`, not Charter.

## Monitoring

After deploy, request in Google Search Console:

1. `/Luxury-Royal-Suites-Nile-Dahabiya-Cruise`
2. `/Nile-Cruise-Luxury-Suites`
3. `/voyages/luxor-to-aswan`
4. `/voyages/aswan-to-luxor`

Confirm 308 chain length = 1 (no hop through Charter).
