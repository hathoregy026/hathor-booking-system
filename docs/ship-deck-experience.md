# Furnished ship experience

Integrated in the existing homepage after the experience marquee (`#explore-hathor`). Staff use **Dashboard → Ship Experience → Decks & rooms**, select a drawn room and edit its catalog name, number, description or physical-cabin link. The existing Sailing availability tab and exact-cabin checkout are unchanged.

## Source of truth and assignments

- Artwork is visual context. Only guest rooms have click targets. There are no interactive facilities or freely movable markers.
- Each illustrated room has a fixed `slotId` and an optional unique `roomId` pointing at existing physical inventory. The linked `Room` record supplies its name, number, description, type and capacity. Availability and prices still use the existing sailing service, and the booking URL carries the exact physical `roomId`.
- Main deck: **Royal Suite 2 is upper left (`R02`); Royal Suite 1 is lower left (`R01`)**, following the supplied images and hand drawing.
- The drawings show 13 guest rooms, while inventory has 12 cabins. The extra lower-deck Room 9 is deliberately unlinked. It is selectable and editable but leads to Contact reservations, never an invented availability/booking. Staff must verify the operational assignments before publishing. Assigning an existing cabin to it requires unlinking that cabin's former plan location first.
- Schema version 2 stays in the existing `ship-experience-v1` SiteSetting key. Legacy text/deck visibility is upgraded on read. Old abstract coordinates, separate marker labels and interactive facilities are retired. No database migration is needed for this visual revision.
- Existing exact-cabin reservation migration `20260923140000_exact_cabin_holds` remains a separate prerequisite for the previous feature. This revision does not apply it or change booking rules.

## Artwork provenance

The built-in image-generation tool edited the three user-provided furnished plans, using their exact ship shape, arrangement, furniture and materials. No operational facts were taken from generated details. The furniture-plan PDF was rendered and visually checked as an additional spatial reference.

Final assets (1774 × 887, transparent WebP, quality 92, approximately 758 KiB total):

- `public/media/hathor/ship/lower-deck.webp`
- `public/media/hathor/ship/main-deck.webp`
- `public/media/hathor/ship/sun-deck.webp`

Prompt set used for the edits:

> Precise-object-edit. Remove only all text labels, gold leader lines/dots and entrance arrows; repair tiny underlying pixels. Preserve the exact furnished top-down ship geometry, rooms, furniture and materials. Transparent-background cutout with soft shadow; bow right; 2:1 canvas, ship approximately 98% width, centered. No new rooms, no rearranging furniture, no new labels.

Main-deck additional constraint: preserve the two Royal Suites at the left, Royal Suite 2 above and Royal Suite 1 below. Sun-deck additional constraint: preserve both pools, pergola, circular bar and umbrellas. Outputs were encoded to WebP with Sharp; no geometry edits were applied during encoding. Rooms and editable number labels are HTML overlays aligned in the original artwork coordinate system.

## Interaction and performance

Desktop and tablet use a large horizontal furnished plan. Phones turn the whole plan into a portrait layout with upright labels and room-sized touch targets; a horizontal room list provides an alternative way to select. Deck changes use a short dimensional reveal, with subtle pool light on the sun deck. Reduced-motion disables both. Only the active deck image loads; all three optimized images total under 0.8 MB. Asset-load failure offers retry; availability failure keeps the visual explorer usable without showing a room as bookable.

## Verification

`npm run typecheck`

`npx eslint components/home/ShipExperience.tsx components/ship/ShipDeckPlan.tsx lib/ship-experience-shared.ts 'app/admin/(panel)/ship-experience/page.tsx'`

`node scripts/test-ship-experience.cjs`

`node scripts/test-ship-experience.cjs --browser` with localhost:3000 running.

The browser regression uses controlled API responses and intercepts dashboard saves; it never writes live data or creates a booking. It checks desktop 1440, tablet 768, phones 390/320, room-only interactions, both Royal Suites, exact-cabin links, unavailable/unlinked rooms, keyboard activation, reduced motion, empty/error responses, and dashboard name/number changes on the public map. Anonymous admin GET/PUT rejection is checked against the actual local server. Screenshots are written to `_local/ship-plan-qa/` for visual inspection.

Local database timeouts prevented a real database-backed save/reload or reservation test. Do not treat the fixture-based UI test as proof of production database connectivity. No deployment, migration or live data change was performed.
