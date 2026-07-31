# Content, Responsive & Performance Audit

**Project:** Hathor Booking System  
**Audit started:** 2026-07-31  
**Scope:** Public marketing site content alignment, CMS binding, responsiveness, performance — without redesigning the approved visual identity.

---

## 1. Framework and architecture

| Layer | Detail |
|-------|--------|
| Framework | Next.js `^16.2.9` (App Router) |
| React | `^19.2.7` |
| DB | PostgreSQL via Prisma `^7.8.0` |
| Validation | Zod `^4.4.3` (typography, images, blogs; **not** WebsiteText) |
| Motion | GSAP + ScrollTrigger, Lenis (desktop only), Framer Motion (narrow) |
| Styling | Tailwind 4 + large custom CSS (`public.css`, `home-experience.css`, etc.) |

### Key layouts

- `app/layout.tsx` — root boot scripts, Geist fonts, globals + mobile-touch
- `app/(public)/layout.tsx` — CMS bundle, public fonts/CSS, providers (`revalidate = 300`)
- `components/public/PublicLayout.tsx` — nav, single `<main>`, footer, Lenis infrastructure
- Admin / booking layouts are separate shells

### Responsive bands (canonical)

- Phone: `≤480px`
- Tablet: `481px–1024px`
- Desktop: `>1024px` (Lenis + full motion)

---

## 2. Main page and component structure

### Public routes

| Route | Content component | Notes |
|-------|-------------------|--------|
| `/` | `HomePageClient` | Signature hero + fog + accordion |
| `/about` | `AboutPageContent` | PageScrollTransition |
| `/cruises` | `CruisesPageContent` | **Protected** |
| `/highlights` | `HighlightsPageContent` | |
| `/gastronomy` | `GastronomyPageContent` | |
| `/wellness` | `WellnessPageContent` | |
| `/charter` | `CharterPageContent` | |
| `/contact` | `ContactPageContent` | |
| `/partners` | `PartnersPageContent` | |
| `/rooms` | `RoomsPageContent` → `ResidenceScrollPage` | Suites scraped content |
| `/luxury-cabins-Nile-Cruise` | `LuxuryCabinsPageContent` | |
| `/Luxury-Royal-Suites-Nile-Dahabiya-Cruise` | `RoyalSuitesPageContent` | |
| `/blogs`, `/blogs/[slug]` | Blog components | Prisma `BlogPost` |

### Shared public chrome

- `PublicNavbar` → `Header` + `SiteNavLogoBar` + `StaggeredMenu`
- `ManagedImage` + site image slots
- `PageScrollTransition` / `usePageScrollTransition` (**protected**)
- Homepage: `useExScrollMotion` + `hero-scroll-stage` (**signature**)

---

## 3. How content reaches the frontend

```
SiteSetting JSON (website-text, website-text-mobile, typography, image map)
  → loadPublicCmsBundle() [public layout]
  → WebsiteTextProvider / SiteImagesProvider / TypographySettingsProvider
  → useWebsiteText() in *PageContent clients
  → merge with static lib/page-content.ts / ex-page-content.ts / homepage-content.ts
```

**Live CMS:** WebsiteText + SiteImages + Typography (`hero_pages` copy).  
**Legacy unused on public pages:** Prisma `SiteContent` (`lib/site-content.ts`, `/api/admin/content`).  
**Hardcoded editorial:** `lib/page-content.ts`, `lib/homepage-content.ts`, `lib/ex-page-content.ts`.

Phone copy swaps via `website-text-mobile` (viewport ≤767 in provider).

---

## 4. Dashboard field mapping (current)

| CMS area | Fields | Frontend targets |
|----------|--------|------------------|
| Website Text `home.*` | about, carousel, stackSlides, textBlocks, gallery, testimonials, campaign, **cta** | Homepage sections; **`home.cta` unused on live homepage** |
| Website Text `pages.*` | Per-page intro/titles/bodies | Matching `*PageContent` |
| Typography `hero_pages` | Main/second title lines | `PublicSiteHero` / PageScrollTransition when `heroPage` set |
| Site Images | Slot names | `ManagedImage` |
| Blog posts | Prisma | `/blogs` |

### Incorrect / unclear mappings (pre-fix)

1. **Rooms / cabins / royal:** Admin “Overview → Intro” (`overviewIntro`) was bound to **amenities body**, while intro paragraphs stayed hardcoded `copyPlacement.afterHero`.
2. **Royal CTA:** `bookCta.title` mixed with `cruisesCta.body`.
3. **Partners:** `secondTitle` hardcoded `"Trusted Worldwide"` while `partners.chapter` (same default) was also passed as `subtitle` (duplicate).
4. **Cruises (protected):** Intro paragraph uses `CRUISES_PAGE.hero.subtitle` instead of a dedicated CMS body; `continueBody` is CMS but intro is not.
5. **`home.cta`:** Editable in admin, never rendered.
6. **Legacy SiteContent:** API exists; no public consumer; `/admin/content` is images only.
7. **`ROOMS_PAGE`:** Dead module; `/rooms` uses `LUXURY_SUITES_PAGE`.

---

## 5. Incorrect or unclear content relationships

- Titles/eyebrows/bodies sometimes positioned independently without shared semantic wrappers (mixed absolute/editorial layouts).
- Residence pages: overview title CMS-bound; overview intro mis-bound to amenities.
- Homepage: nested `<main>` inside layout `<main>`.
- Accordion: `<li role="button">` instead of native button control.
- Stack slides: WebsiteText → typography `on_images_copy` → `EX_PINNED` fallback chain (three sources).

---

## 6–9. Responsiveness / alignment / overflow / fixed sizing

| Issue | Evidence |
|-------|----------|
| Global `overflow-x: hidden` on `html`/`body` | `globals.css` — masks `100vw` breakouts |
| Heavy `100vw` on homepage hero/logo | `home-experience.css`, `public-site-hero.css` |
| Locked public `.btn` size | `12.5rem × 2.85rem` with `!important` (intentional; long labels risk truncate) |
| Accordion fixed panel heights | `LuxuryAccordion.module.css` (`520px` / `360px`) |
| No max-width on `.lux-container` | Full-bleed editorial intentional |
| Intermediate `768px` / `640px` queries | Inconsistent with 480/1024 bands in places |

---

## 10. Performance problems

- Many permanent `will-change` layers on homepage
- CMS remote images often `unoptimized`
- Dual font pipelines (Geist root + Plus Jakarta + large local catalog in `hathor-fonts.css`)
- Most page UIs are client components (RSC mainly for layout fetch)
- Large CSS payload on every public route
- Accordion `sizes="100vw"` for panel images
- Multiple ScrollTrigger owners per route (coordinated, still costly)

---

## 11. Duplicate or unnecessary code

- `SiteContent` vs WebsiteText
- `ROOMS_PAGE` unused
- `home.cta` / `EX_CTA` unused on homepage
- `scripts/*` measurement/verification utilities (local tooling; not production path)

---

## 12. High-risk / protected components

**Do not rewrite; fix only structure/binding/perf with approval where rules require:**

| Area | Paths |
|------|--------|
| Homepage hero / strips / Book Now | `useExScrollMotion`, `hero-scroll-stage`, `PublicSiteHero`, `home-experience.css` |
| Four-image fog | `HomePageClient` stack + `useExScrollMotion` fog phases |
| Layered mobile menu | `StaggeredMenu` |
| PageScrollTransition | `PageScrollTransition.tsx`, `usePageScrollTransition.ts`, engine |
| Cruises scroll | `CruisesPageContent`, cruises hooks/CSS (**approval required**) |
| Booking / admin | `/booking/**`, `/admin/**` (**approval required**) |
| Frozen | `app/test-scroll-reveal/**`, `_local/scroll-reveal-effect/**` |

---

## 13. Implementation plan

### Phase 1 — Discovery ✅
Document architecture and issues (this file).

### Phase 2 — Content contract
- Correct residence overviewIntro → intro body mapping
- Align defaults so visual intro copy is preserved
- Amenities body from static page-content (until admin amenities field approved)
- Fix royal CTA field mix
- Fix partners secondTitle CMS binding
- Add trim/empty helpers for WebsiteText consumers
- Document orphan `home.cta` / SiteContent (no silent redesign)

### Phase 3 — Structural / semantic
- Remove nested `<main>` on homepage
- Improve accordion interactivity semantics where CSS-safe
- Conditional render for empty optional text
- Stable keys where IDs exist

### Phase 4 — Responsiveness
- Additive text overflow safety (`min-width: 0`, `overflow-wrap`) on residence/editorial text shells
- Avoid changing locked button chrome or signature layouts
- Do **not** add global overflow hacks

### Phase 5 — Performance
- Low-risk: avoid rendering empty text nodes; keep image `sizes` honest where touched
- Defer aggressive animation/CSS cuts (signature protection)
- Document larger wins (font catalog audit, image optimization pipeline)

### Phase 6 — Verification
- `npm run lint`, `npm run build`
- Update this report with outcomes
- Note: no `typecheck` / `test` scripts in `package.json`

---

## 14. Files expected to be modified

- `CONTENT-RESPONSIVE-PERFORMANCE-AUDIT.md` (this file)
- `lib/website-text-shared.ts`
- `components/pages/rooms/RoomsPageContent.tsx`
- `components/pages/LuxuryCabinsPageContent.tsx`
- `components/pages/RoyalSuitesPageContent.tsx`
- `components/pages/rooms/ResidenceScrollPage.tsx`
- `components/pages/PartnersPageContent.tsx`
- `components/pages/HomePageClient.tsx`
- `components/home/LuxuryAccordion.tsx` (+ CSS if needed)
- Possibly small additive rules in `app/public.css` or component CSS

### Requires explicit approval (not modified in first pass)

- `components/pages/CruisesPageContent.tsx` and cruises motion/CSS
- `components/pages/PageScrollTransition.tsx` / `hooks/usePageScrollTransition.ts`
- `components/admin/WebsiteTextPanel.tsx` (amenities fields, CTA wiring UI)
- Booking / admin APIs

---

## 15. Assumptions

1. WebsiteText + SiteImages + Typography remain the sole live CMS; SiteContent stays legacy unless product asks to revive it.
2. Moving `overviewIntro` to the intro section is the correct product intent (matches admin labels); production CMS values previously shown under amenities may need a one-time editorial re-check.
3. Visual design must remain recognisably unchanged; copy location corrections are allowed when bindings were wrong.
4. Protected-area edits wait for approval.
5. Deploy follows project “always deploy” rule unless user says otherwise; git commit/push only when deploying or explicitly requested.

---

## Changes completed

### Content relationship / dashboard binding

- Rooms / cabins / royal: Admin **Overview → Intro** (`overviewIntro`) now drives the **intro** body paragraphs (via `resolveOverviewIntroParagraphs`).
- Soft migration: if stored CMS intro still equals the old amenities default (`overview.body`), intro keeps `copyPlacement.afterHero` so default visuals stay stable.
- Amenities body now uses static `*.overview.body` until a dedicated CMS `amenitiesBody` field is approved for the admin panel.
- Royal CTA uses `bookCta.title` + `bookCta.body` (no longer mixes cruises CTA body).
- Partners: `secondTitle` from CMS `partners.chapter`; removed duplicate subtitle; partner list is a semantic `<ul>`.
- Charter / contact: optional CMS fields skip empty wrappers; contact form falls back to page-content defaults when blank.
- Added `normalizeOptionalText` + `resolveOverviewIntroParagraphs` helpers in `lib/website-text-shared.ts`.
- Defaults for rooms/cabins/royal `overviewIntro` updated to joined `afterHero` copy.

### Structural / semantic / a11y

- Homepage: nested `<main>` replaced with `<div id="top">` (layout already owns `<main>`).
- Residence intro: title + eyebrow grouped in `<header>`; empty optional titles/bodies/CTAs omit empty nodes.
- Accordion: Escape collapses active row; description/name overflow-wrap; slightly tighter `sizes` hint.

### Responsive

- Partners grid reset for `ul`/`li` (`list-style` / margin / padding).
- Residence / charter text shells: `min-width: 0` + `overflow-wrap: anywhere` where long CMS copy can break flex/grid.

### Performance

- Accordion image `sizes` narrowed from bare `100vw` to `(max-width: 768px) 100vw, min(1200px, 100vw)`.
- No signature animation removal; no Lenis/GSAP changes.

### Not changed (needs approval)

- **Cruises** intro still uses hero subtitle (protected).
- **Admin** WebsiteTextPanel amenities fields / `home.cta` wiring UI (protected).
- **PageScrollTransition** / cruises scroll engine (protected).
- Legacy Prisma `SiteContent` still unused on public pages.
- Orphan `home.cta` / `EX_CTA` still not rendered (would add UI).

---

## Files modified

| File | Purpose |
|------|---------|
| `CONTENT-RESPONSIVE-PERFORMANCE-AUDIT.md` | Audit + completion log |
| `lib/website-text-shared.ts` | Defaults, normalize helpers, soft migrate |
| `components/pages/rooms/RoomsPageContent.tsx` | Correct overviewIntro → intro |
| `components/pages/LuxuryCabinsPageContent.tsx` | Same |
| `components/pages/RoyalSuitesPageContent.tsx` | Same + royal CTA fields |
| `components/pages/rooms/ResidenceScrollPage.tsx` | Semantic grouping, empty-safe render |
| `components/pages/PartnersPageContent.tsx` | CMS secondTitle, list semantics |
| `components/pages/CharterPageContent.tsx` | Optional field guards, header grouping |
| `components/pages/ContactPageContent.tsx` | Form title/intro fallbacks |
| `components/pages/HomePageClient.tsx` | Nested main fix |
| `components/home/LuxuryAccordion.tsx` | Escape, sizes |
| `components/home/LuxuryAccordion.module.css` | Text overflow safety |
| `app/public.css` | Partners grid list reset |

---

## Dashboard bindings corrected

| Field | Frontend element |
|-------|------------------|
| `pages.rooms.overviewTitle` | Rooms intro `<h2>` |
| `pages.rooms.overviewIntro` | Rooms intro paragraphs |
| `pages.cabins.overviewTitle` / `overviewIntro` | Cabins intro title / body |
| `pages.royal.overviewTitle` / `overviewIntro` | Royal intro title / body |
| `pages.partners.chapter` | Partners hero `secondTitle` |
| `pages.partners.lead` | Partners section lead (omitted if empty) |
| `pages.charter.*` | Charter overview block (empty-safe) |
| `pages.contact.formTitle` / `formIntro` | Contact form (with page-content fallback) |
| Amenities body (rooms/cabins/royal) | Static `overview.body` until CMS field added |

---

## Remaining limitations

1. Production CMS values that were **intentionally** edited via Overview Intro to change **amenities** copy will now appear under intro (or soft-migrate if still equal to `overview.body`). Editors should re-check rooms/cabins/royal after deploy.
2. No Zod schema for WebsiteText yet (deep-merge only).
3. `home.cta` remains admin-editable but unused on homepage.
4. Cruises intro CMS body still blocked pending protected-area approval.
5. Global `overflow-x: hidden` on `html`/`body` remains (pre-existing architecture).
6. Large local font catalog and unoptimized CMS images remain larger performance wins for a later pass.
7. `npm run lint` still fails on **pre-existing** admin/homepage hook rules unrelated to this pass; `tsc --noEmit` and `npm run build` succeed. No `typecheck`/`test` scripts in package.json.

---

## Recommended manual tests

### Pages
- `/`, `/rooms`, `/luxury-cabins-Nile-Cruise`, `/Luxury-Royal-Suites-Nile-Dahabiya-Cruise`
- `/partners`, `/charter`, `/contact`
- `/admin/website-text` → edit rooms/cabins/royal Overview Intro; confirm intro updates (not amenities only)

### Viewports
- 320, 360, 375, 390, 430, 768, 820, 1024, 1280, 1440, 1920

### Interactions
- Homepage hero / fog / Book Now (unchanged choreography)
- Accordion open/close + Escape
- Partners hero second title from CMS
- Long overview intro text on residence pages
- Empty optional charter fields (if cleared in CMS)

### Protected (visual regression only — no code change this pass)
- `/cruises` scroll / stripes
- Mobile three-layer menu
- Page sheet transitions on about/wellness/etc.

---

# Second Pass (post-`bccdab8`)

**Scope completed:** Cruises CMS intro, amenities CMS fields, homepage CTA decision, duplicate-source documentation, responsive text shells, image/font/JS notes, lint remediation for touched files, typecheck + verify scripts.

## Second Pass Scope

| Item | Result |
|------|--------|
| Cruises CMS intro | Added `overviewTitle`, `overviewIntro`, `ctaTitle`, `ctaBody`; stopped hero subtitle reuse for intro/CTA body |
| Amenities CMS fields | Added `amenitiesTitle` + `amenitiesIntro` for rooms, cabins, royal |
| Homepage CTA decision | `home.cta` wired to shared `MarketingCtaBand` (About/Contact/Blog/etc.); not a new homepage section |
| Duplicate content cleanup | `SiteContent` marked `@deprecated`; `EX_CTA` aligned with MarketingCtaBand defaults |
| Responsive audit | `page-container` + cruise/residence text shells: `min-width: 0`, `overflow-wrap: anywhere` |
| Image performance | Accordion sizes (pass 1); remote CMS still `unoptimized` (Supabase 400 risk on `/_next/image`) |
| CMS image delivery | No width/format transform params in storage URLs; Next optimizes local only |
| Font audit | Catalog kept — Typography dashboard offers all faces; removing `@font-face` would break picker |
| JavaScript audit | Homepage logo-tune sync effects removed (soft override only) |
| Scroll/animation | No choreography changes; `prefer-const` fix in scroll-refresh-coordinator |
| Lint remediation | Touched admin/page/CMS files clean; full-repo lint still has unrelated legacy errors |

## Content Mapping Table

| Page | Dashboard field | Frontend destination | Semantic element | Fallback | Status |
|------|-----------------|----------------------|------------------|----------|--------|
| Home | `home.about.*` | About section | heading/eyebrow/body/cta | homepage-content | OK |
| Home | `home.carousel.*` | Itineraries carousel | title/subtitle/cta | homepage-content | OK |
| Home | `home.stackSlides[]` | Fog stack slides | title/indication/body | EX_PINNED / typography | OK (multi-source) |
| Home | `home.textBlocks[]` | Text+image rows | title/body/cta | EX_TEXT_BLOCKS | OK |
| Home | `home.gallery.*` | Gallery header | title/indication | EX_GALLERY | OK |
| Home | `home.testimonials.*` | Reviews | title/cards | defaults | OK |
| Home | `home.campaign.title` | HomeCampaignSection | on-image title | EX_CAMPAIGN | OK |
| Home | `home.cta.title/body` | MarketingCtaBand (shared) | h2 + body | MarketingCtaBand defaults | OK (wired) |
| Cruises | Typography `hero_pages.cruises` | PublicSiteHero | hero titles | page-content hero | OK |
| Cruises | `pages.cruises.overviewTitle` | Intro H2 | overview title | `CRUISES_PAGE.sectionTitle` | OK |
| Cruises | `pages.cruises.overviewIntro` | Intro body | overview body | hero.subtitle default | OK |
| Cruises | `pages.cruises.continueTitle/Body` | Onboard column | continue exploring | defaults | OK |
| Cruises | `pages.cruises.ctaTitle/Body` | Bottom CTA | reserve CTA | hardcoded previous copy | OK |
| Rooms | `pages.rooms.overviewTitle` | Intro H2 | overview title | suites overview title | OK |
| Rooms | `pages.rooms.overviewIntro` | Intro paragraphs | overview body | afterHero (+ soft migrate) | OK |
| Rooms | `pages.rooms.amenitiesTitle` | Amenities H2 | amenities title | amenities.title | OK |
| Rooms | `pages.rooms.amenitiesIntro` | Amenities lead | amenities body | overview.body | OK |
| Cabins | `pages.cabins.overview*` / `amenities*` | Same pattern | intro + amenities | page-content | OK |
| Royal | `pages.royal.overview*` / `amenities*` | Same pattern | intro + amenities | page-content | OK |
| Partners | `pages.partners.title` | Hero title | h1 path | HOMEPAGE_PARTNERS | OK |
| Partners | `pages.partners.chapter` | Hero secondTitle | secondary title | Trusted Worldwide | OK |
| Partners | `pages.partners.lead` | Section lead | body | default lead | OK |
| Charter | `pages.charter.*` | Overview + benefits | section copy | CHARTER_PAGE | OK |
| Contact | `pages.contact.formTitle/Intro` | InquiryForm | form header | CONTACT_PAGE.form | OK |
| About | `pages.about.*` | About sections | intro/accommodations/dining/welcome | ABOUT_PAGE | OK |
| Nav | `lib/public-nav.ts` | Header links | nav labels | code | Interface (not WebsiteText) |
| Footer | Footer components | Footer copy | mixed | code + CMS images | Partial hardcoded |
| Accordion | Typography `our_voyages_copy` | LuxuryAccordion | title/indication | defaults | OK |
| Legacy | Prisma `SiteContent` | none (public) | — | — | Deprecated |

## Migration Notes

| Legacy source | Destination | Condition | Fallback period |
|---------------|-------------|-----------|-----------------|
| `pages.cruises.sectionTitle` | `pages.cruises.overviewTitle` | overviewTitle empty | Until editors re-save cruises |
| Hero subtitle as cruises intro | `pages.cruises.overviewIntro` default | New field | Defaults preserve visible copy |
| Hero subtitle as cruises CTA body | `pages.cruises.ctaBody` default | New field | Same |
| `overview.body` used as amenities | `amenitiesIntro` defaults | New fields | Defaults = previous visible amenities body |
| Overview intro == overview.body | Soft-migrate to afterHero for intro | Exact string match | Permanent soft rule |
| `home.cta` EX_CTA strings | Dropped → MarketingCtaBand defaults | Title == “Begin your Nile escape” | Until custom CTA saved |
| Prisma SiteContent | — | Unused on public | Deprecate; keep API/seeds |

New edits always save to canonical fields. Migration runs inside `parseWebsiteText` before deep-merge (read path only; does not rewrite DB until next admin save).

## Performance Findings (observed)

- Remote Supabase CMS images remain `unoptimized` because `/_next/image` often 400s on large remotes (`lib/site-image-url.ts`) — measured pattern from existing comments/code, not a Lighthouse score.
- Local Optimized images use quality 90 + WebP (`next.config.ts`).
- Font catalogue in `hathor-fonts.css` is required by Typography admin picker; not removed.
- Homepage logo-tune no longer double-syncs provider props into state every render cycle.
- Accordion image `sizes` tightened in pass 1.

## Files Changed (second pass)

| File | Purpose |
|------|---------|
| `lib/website-text-shared.ts` | Schema + migration + helpers |
| `components/pages/CruisesPageContent.tsx` | Dedicated overview/CTA CMS wiring |
| `components/pages/rooms/RoomsPageContent.tsx` | Amenities CMS |
| `components/pages/LuxuryCabinsPageContent.tsx` | Amenities CMS |
| `components/pages/RoyalSuitesPageContent.tsx` | Amenities CMS |
| `components/pages/MarketingCtaBand.tsx` | Wire `home.cta` |
| `components/pages/HomePageClient.tsx` | Logo-tune lint-safe soft override |
| `components/admin/WebsiteTextPanel.tsx` | Field groups + new fields |
| `lib/site-content.ts` | Deprecation notice |
| `lib/ex-page-content.ts` | EX_CTA aligned / deprecated note |
| `app/interior-design-system.css` | Responsive text shell safety |
| `app/admin/(panel)/bookings/page.tsx` | Retry loop lint fix |
| `app/admin/(panel)/cruises/page.tsx` | Retry loop lint fix |
| `app/admin/(panel)/content/page.tsx` | Mount-fetch lint scope |
| `lib/scroll-refresh-coordinator.ts` | prefer-const |
| `package.json` | `typecheck`, `verify:website-text` |
| `scripts/verify-website-text-mapping.ts` | Mapping/migration checks |
| `CONTENT-RESPONSIVE-PERFORMANCE-AUDIT.md` | This update |

## Validation Results (second pass)

- `npm run typecheck` — pass
- `npm run verify:website-text` — pass
- `npm run build` — pass
- Touched-file eslint (CMS/pages/admin panels listed above) — pass
- Full `npm run lint` — still fails on unrelated legacy issues (see Remaining Risks)

## Remaining Risks

1. Full-repo `npm run lint`: `lib/hero-scroll-stage.ts` still has `@ts-nocheck` (`@typescript-eslint/ban-ts-comment`) — protected hero stage; not removed.
2. `components/pages/PublicSiteHero.tsx:154` — `setUseLiveVideo` in effect (`react-hooks/set-state-in-effect`); hero video gate — behaviour preserved, not refactored.
3. Additional unused-var warnings across scripts/admin helpers.
4. Remote CMS images still full-resolution downloads (no Supabase transform pipeline).
5. Font catalogue weight remains for dashboard font choices.
6. Partner names, residence listings, and many hero titles remain hardcoded / Typography-owned by design.
7. No Jest/Vitest framework — mapping checks via `npm run verify:website-text` only.
