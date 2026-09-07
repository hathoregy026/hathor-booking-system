# Keyword-to-page SEO map

One primary search intent per URL. Secondary terms may appear in body copy; they must not become a second title.

Canonical host: `https://www.easytravegypt.com`

## Commercial pages

| URL | Primary keyword | Secondary (supporting only) | Intent |
|---|---|---|---|
| `/` | Luxury Dahabiya Nile Cruise | Hathor Dahabiya; private Nile sailing Egypt | Brand + commercial |
| `/voyages` | Nile cruise itineraries Luxor Aswan | Hathor Nile itineraries | Commercial hub |
| `/voyages/luxor-to-aswan` | Luxor to Aswan Nile Cruise | 4 night Luxor Aswan dahabiya | Route |
| `/voyages/aswan-to-luxor` | Aswan to Luxor Nile Cruise | 3 night Aswan Luxor dahabiya | Route |
| `/charter` | Private Nile Cruise Egypt | Private Dahabiya Charter | Commercial |
| `/luxury-cabins-Nile-Cruise` | Luxury Nile Cruise Cabins | Luxury Nile Cruise Rooms | Commercial |
| `/suites` | Luxury Nile Cruise Suites | Hathor suites collection | Collection |
| `/rooms` | Hathor Luxury Suite | 46 m² Nile suite | Product (distinct from `/suites`) |
| `/royal-suites` | Royal Suite Nile Cruise | Hathor Royal Suite | Product |
| `/cruises-list` | Book Hathor Dahabiya sailing | Scheduled departures | Transactional |

## Informational / supporting

| URL | Primary keyword | Role |
|---|---|---|
| `/blogs` | Dahabiya Nile cruise journal | Hub for informational intent |
| `/blogs/[slug]` | Article title (long-tail) | Support commercial pages; never target a commercial primary |
| `/about` | About Hathor Dahabiya | Brand story — do not target “Luxury Dahabiya Nile Cruise” |
| `/highlights` | Nile cruise highlights / temples | Support voyages |
| `/wellness` | Seneb Spa on the Nile | Support suites / brand |
| `/gastronomy` | Dining on the Nile | Support brand |
| `/contact` | Contact Hathor Dahabiya | Reservations |
| `/partners` | Hathor travel partners | Trade |
| `/home-3` | — | **noindex** — duplicate homepage edition |

## Authority flow

```
Homepage
  → Voyages hub
      → /voyages/luxor-to-aswan
      → /voyages/aswan-to-luxor
      → /cruises-list (book dates)
  → Charter
  → Suites collection
      → /rooms (Luxury Suite product)
      → /luxury-cabins-Nile-Cruise
      → /royal-suites

Blog articles
  → matched commercial page (voyages / charter / cabins / royal suites)
```

## Cannibalisation rules

- Homepage owns **Luxury Dahabiya Nile Cruise**. About, Home 3, and journal posts must not use that exact title.
- Voyages hub must not title itself “Luxor to Aswan Nile Cruise” or “Aswan to Luxor Nile Cruise”.
- `/suites` is the suites collection. `/rooms` is the 46 m² Luxury Suite product. `/royal-suites` is Royal Suite only.
- Cabins/rooms live on `/luxury-cabins-Nile-Cruise`, not on `/rooms`.
- Charter owns private-vessel intent. Do not send Royal Suite URLs to Charter.
- `/cruises-list` is inventory/booking, not the itinerary story.

Source of truth in code: `lib/seo/keyword-map.ts` and `lib/seo/page-metadata.ts`.
