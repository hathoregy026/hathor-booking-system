# Home 4 provenance and editorial decisions

Checked 7 September 2026. This is a local, non-indexable edition; no CMS records or existing media were changed.

## Geographic source

The river is extracted from [Natural Earth 1:10m rivers and lake centerlines](https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-rivers-lake-centerlines/), version 5.0.0 on the download page. [Natural Earth's terms](https://www.naturalearthdata.com/about/terms-of-use/) place the data in the public domain. This small-scale dataset is generalized cartography, derived from WDB2 and adjusted using relief; it is not a hydrographic survey.

Downloaded the Nile features from [the Natural Earth vector repository](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_rivers_lake_centerlines.geojson). The saved Nile feature subset is `_local/home-4-evidence/nile-source.json`, SHA-256 `0b0e07af5b274da0cd6449bda7f465a4ad6a9220ed5aa9336872d48cf1c8aee0`. The source URL tracks a branch; this digest identifies the actual snapshot used.

`nile-geometry.json` retains the 50 points of the river between the endpoint latitudes (25.698927 N and approximately 24.08894 N). Only the endpoint clipping interpolates coordinates; the displayed polyline adds no artistic splines. The order is reversed to sail south. Longitude is scaled by cosine of 24.9 degrees latitude, using the same scale as latitude: an equirectangular local overview that preserves the geographic proportions closely over this reach. North remains up.

The Haversine sum, using a mean Earth radius of 6,371 km, is 211.0008 km. The page rounds this to approximately 210 km **along the illustrated river**. Generalization omits channel detail and exact embarkation arrangements; this is not the vessel's log distance, a guaranteed voyage length, or a navigation chart.

Home 3's unaltered 18-point line sums to 196.7843 km by the same method. It misses several bends present in the geographic source, including the westward reach south of Luxor. No provenance in that file substantiates its claims that all points are river-channel coordinates or that the five city points are actual moorings. Home 4 makes neither claim.

## Places and attribution

City coordinates are from [GeoNames' Egypt gazetteer](https://www.geonames.org/search.html?country=EG), with [Esna checked separately](https://www.geonames.org/search.html?q=Esna). GeoNames uses WGS84 and [Creative Commons Attribution 4.0](https://www.geonames.org/about.html). The page visibly credits GeoNames and Natural Earth; this file documents coordinate selection, clipping and projection.

- Luxor: 25.698927 N, 32.642097 E.
- Esna: 25.29336 N, 32.55402 E.
- Edfu: 24.979163 N, 32.877224 E.
- Kom Ombo: 24.476687 N, 32.946262 E (city, not the temple's riverbank position).
- Aswan: 24.09082 N, 32.89942 E.

The city markers retain their geographic positions and connect to the nearest river segment using dotted leaders. The moving vessel follows SVG path length and its local tangent, not the city markers. Stop highlighting, detail selection and route drawing share one path fraction. No precise berth or island mooring is plotted. The text explicitly distinguishes embarkation/arrival cities from temple excursions.

## Hathor facts

- `RAW_DATA.md`, accommodation summary: eight cabins, two suites and two Royal Suites. The room catalogue supports the individual room categories and facilities. The contradictory Home 3 claim of twelve guests is omitted; total guest capacity is not inferred from room count.
- `lib/hathor-catalog.ts` and its catalogue data: 3 nights / 4 days Aswan–Luxor, 4 nights / 5 days Luxor–Aswan, 7 nights / 8 days return passage. These drive the visible itinerary ledger. No price or rating is copied into Home 4.
- [Hathor's published Nile Sailing Cruise itinerary](https://www.hathorcruise.com/rooms/nile-sailing-cruise): Luxor east bank on day 1, west bank and sailing to Esna on day 2, Edfu then El Ramady on day 3, Gebel Silsila then Kom Ombo then Aswan on day 4, farewell on day 5. The atlas presents selected places from this specific 4-night passage, not a universal stop schedule for all voyages. Day-five sightseeing and mooring arrangements require confirmation for the sailing.
- Existing Suites, Gastronomy, Wellness and Charter content supports private bathrooms, air conditioning, river views, Egyptian/international dining, Seneb Spa and exclusive vessel charter. Treatment arrangements and individual occupancy are referred to the existing detail pages.
- `lib/public-contact.ts` supplies reservations contact details. No response-time guarantee, cabin hold promise, scarcity claim, review, award or sustainability claim is introduced.

## Images and typography

Existing Hathor assets only. Some legacy slot labels conflict with their actual photographs. Home 4 selects explicit existing local assets for the aerial vessel, suite sitting area, Royal Suite, dining room and pool deck; their alts describe the inspected photograph. Other slots remain CMS-fed. No image is generated, downloaded for decoration, modified or re-encoded by this work. The atlas uses actual Luxor/Aswan landmark photographs and clearly generic Nile/deck imagery for the other stops; these are not presented as photographs of specific berths.

The hero consumes the existing configured title/subtitle font roles and desktop/mobile split-logo tuning, but does not call the shared homepage copy resolver. CMS `home` text cannot silently replace its H1. Editorial headings use Italiana; body prose uses the existing Rollgates role. Distances and itinerary numerals use Playfair Display; controls use the established body family. No new font files or families are loaded.

## Future publication

Publication would require an explicit decision to remove or replace the local-only server gate, review the final CMS imagery and voyage facts, set a single public canonical and social URL, remove the noindex metadata, add the chosen public route to navigation and the sitemap, and complete field performance/accessibility checks. None of those publication changes is enabled here.
