# Hathor Dahabiya — Master Plan

> **Permanent project memory.** Read this file at the start of every redesign session before making changes.

**Reference site:** [The OWO London](https://theowo.london) — replicate structure, layout, and visual hierarchy; replace all content with `assets/RAW_DATA.md`.

**Goal:** Award-winning, million-dollar luxury website for Hathor Dahabiya Nile Cruise.

**Content source:** `assets/RAW_DATA.md` (not project root). When copying text, fix these typos:
- `exploreres` → `explorers`
- `crusing` → `cruising`
- `Loose yourself` → `Lose yourself`
- Add missing spaces after periods where scraped content omits them

**Images:** Use high-quality Unsplash URLs in code until real Hathor assets are uploaded via `/admin/images`. Replace later with Supabase-backed `SiteImage` records.

---

## Strict Safety Rules

### DO NOT TOUCH — under any circumstances

If any file inside these paths is accidentally modified, **revert immediately**:

| Area | Paths |
|------|--------|
| Booking APIs | `app/api/booking/*`, `app/api/bookings/*` |
| Booking pages | `app/booking/*`, `app/book/*` |
| Booking components | `components/booking/*` (e.g. `BookingModal.tsx`, `CheckoutCalendar.tsx`) |
| Booking logic | `lib/booking-validation.ts`, `lib/booking-pricing.ts`, `store/bookingStore.ts` |
| Admin (except images) | `app/admin/seo/*`, `app/admin/email-templates/*` |
| Booking schema | Prisma models/enums related to bookings, users, or SEO tables |

### Safe to modify

- Public-facing pages: `app/(public)/*`
- Public layout/components: `components/layout/*`, `components/public/*`, `components/home/*`, `components/ui/*`
- Styling: `app/public.css`, `app/globals.css`
- **Only** schema addition: `SiteImage` model in `prisma/schema.prisma`
- Admin: `/admin/images` (image management only)

### Booking integration rule

Public CTAs (**Book Now**, **Get Started**) must call the **existing** booking modal via `BookingModalProvider` / `BookNowTrigger` — never reimplement booking flow in public pages.

---

## Design System — Hathor Design DNA

**Vibe:** Editorial Nile Luxury (The OWO–inspired structure, Egyptian river elegance)

### Color palette

| Token | Hex | Usage |
|-------|-----|--------|
| Primary Gold | `#C9A96E` | Accents, CTAs, dividers, hover states |
| Gold Bright | `#D4AF37` | Button gradients, highlights |
| Dark | `#0A0A0A` | Header solid, dark sections, footer |
| Dark 2 | `#1A1A1A` | Cards on dark backgrounds |
| Cream | `#FAF8F5` | Page background, light sections |
| Surface | `#FDFBF7` | Alternate light sections |
| Muted | `#6B6B6B` | Body text on light backgrounds |
| Accent Teal | `#2F4F4F` | Stats band, contrast blocks |
| Text Light | `#E8E2D9` | Body text on dark backgrounds |

CSS variables live in `app/public.css` under `.hathor-site` (e.g. `--hathor-gold`, `--hathor-dark`, `--hathor-cream`).

### Typography

| Role | Font | Scale |
|------|------|--------|
| Display / H1–H3 | **Playfair Display** (`--font-hathor-display`) | H1 ~64px, H2 ~48px, H3 ~32px (clamp on mobile) |
| Body | **Plus Jakarta Sans** (`--font-hathor-body`) | 16px regular, 14px small/light |
| Labels | Plus Jakarta Sans | Uppercase, `letter-spacing: 0.2em–0.28em` |

**Do not use:** Inter, Roboto, or generic Tailwind blues/indigos as defaults.

### Layout & spacing

- Section padding: **120px** vertical desktop (~64px mobile)
- Container max-width: **1400px** (`.hathor-container` → 87.5rem)
- Grid gap: **32px**
- Element spacing: **24px**

### Design quirks (project rules)

1. **Buttons:** Sharp corners (`border-radius: 0`), gold fill with shimmer hover — no generic `rounded-lg` everywhere
2. **Cards:** Mix sharp and extreme rounded — editorial images use `border-radius: 0 2rem 0 2rem`
3. **Accommodations grid:** Asymmetric bento layout on desktop (not equal 4-column)
4. **Gold accents:** Sparingly — hairline dividers, eyebrows, discover links
5. **Shadows:** Layered/tinted or ring borders — avoid flat `shadow-md`

### Motion & micro-interactions

- **Framer Motion:** Page fade+slide (`PageTransition`), scroll reveals (`ScrollReveal`)
- **Custom cursor:** Gold circle, expands on interactive elements (desktop only; off for touch/reduced-motion)
- **Cards:** `translateY(-4px)` hover lift; images `scale(1.05)` on hover
- **Hero:** Slow Ken Burns zoom on background image

### Responsive breakpoints

| Breakpoint | Range |
|------------|--------|
| Mobile | `< 768px` |
| Tablet | `768px – 1024px` |
| Desktop | `1024px – 1440px` |
| Large desktop | `> 1440px` |

Mobile: hamburger/Explore menu, stacked cards, hero **60vh**, min **44px** touch targets.

### Security (from `.cursorrules`)

- Validate all admin/API inputs with **Zod** allow-lists
- Parameterized DB access only (Prisma)
- No secrets in code; use `.env`
- Admin routes behind session middleware
- Generic client error messages; log details server-side only

---

## 5-Phase Execution Plan

### Phase 1 — Global shell + Homepage ✅ **100% COMPLETE**

**Status:** Done. Awaiting stakeholder review before Phase 2.

| Item | Status | Location |
|------|--------|----------|
| `SiteImage` Prisma model + migration | ✅ | `prisma/schema.prisma`, `prisma/migrations/20250628120000_add_site_image/` |
| Image CRUD + Zod validation | ✅ | `lib/image-management.ts`, `lib/image-categories.ts` |
| Admin image APIs | ✅ | `app/api/admin/images/`, `app/api/site-images/` |
| Admin images dashboard | ✅ | `app/admin/(panel)/images/page.tsx` |
| `DynamicImage` component | ✅ | `components/ui/DynamicImage.tsx` |
| `LuxuryCursor` | ✅ | `components/ui/LuxuryCursor.tsx` |
| `PageTransition` | ✅ | `components/ui/PageTransition.tsx` |
| `ScrollReveal` (Framer Motion) | ✅ | `components/ui/ScrollReveal.tsx` |
| Global Header (The OWO Explore overlay) | ✅ | `components/layout/Header.tsx` |
| Global Footer | ✅ | `components/layout/Footer.tsx` |
| Homepage (all RAW_DATA homepage sections) | ✅ | `components/home/HomePageContent.tsx`, `app/(public)/page.tsx` |
| Design DNA CSS | ✅ | `app/public.css` |
| Public fonts (Playfair + Plus Jakarta) | ✅ | `app/(public)/layout.tsx` |
| Homepage SEO metadata | ✅ | `app/(public)/page.tsx`, `app/(public)/layout.tsx` |
| Unsplash placeholders | ✅ | `lib/unsplash-images.ts` |
| Homepage copy (typos fixed) | ✅ | `lib/homepage-content.ts` |
| Nav structure | ✅ | `lib/public-nav.ts` |

**Phase 1 homepage sections delivered:** Hero · Itineraries (3 cards) · Accommodations (bento) · Stats · Way of Life · Highlights · Welcome Aboard · Dining · Wellness · About · Reviews · CTA band.

**Deploy note:** Run `npx prisma migrate deploy` when DB credentials are valid.

---

### Phase 2 — Core public pages ✅ **COMPLETE**

| Page | Route | Status |
|------|-------|--------|
| About | `/about` | ✅ |
| Cruises List | `/cruises` | ✅ |
| Highlights | `/highlights` | ✅ |
| Gastronomy | `/gastronomy` | ✅ |
| Wellness | `/wellness` | ✅ |
| Charter | `/charter` | ✅ |
| Contact | `/contact` | ✅ |
| Blog listing | `/blogs` | ✅ |

Each page: Metadata API, Unsplash placeholders, RAW_DATA copy (`lib/page-content.ts`), Header/Footer shell, `BookNowTrigger` for booking CTAs. Contact/charter forms → `POST /api/contact` (Zod + rate limit).

---

### Phase 3 — Blog + room pages (NOT STARTED)

1. `/blogs` — Listing (44 posts from RAW_DATA)
2. `/blogs/[slug]` — Individual posts
3. `/luxury-cabins-Nile-Cruise`
4. `/rooms`
5. `/Luxury-Royal-Suites-Nile-Dahabiya-Cruise`

---

### Phase 4 — Polish (NOT STARTED)

1. Animation pass and performance tuning
2. Image optimization (WebP, lazy load, `DynamicImage` wired per section)
3. Cross-device QA
4. Accessibility audit (WCAG 2.1 AA target)
5. SEO audit (Lighthouse > 90 target)
6. Seed `SiteImage` records via admin where real assets exist

---

### Phase 5 — Testing & deployment (NOT STARTED)

1. Final QA checklist (links, booking modal, admin, console errors)
2. Core Web Vitals pass (LCP < 2.5s, CLS < 0.1)
3. Deploy to Vercel
4. Post-deployment smoke test

---

## Key file map

```
app/(public)/           → Public pages (safe to edit)
app/(public)/layout.tsx   → Public fonts + base metadata
app/(public)/page.tsx     → Homepage entry + metadata
components/layout/        → Header.tsx, Footer.tsx
components/home/          → HomePageContent.tsx
components/ui/            → DynamicImage, LuxuryCursor, PageTransition, ScrollReveal
components/public/        → PublicLayout, BookNowTrigger, legacy re-exports
lib/homepage-content.ts   → Homepage RAW_DATA copy (typos fixed)
lib/public-nav.ts         → Nav groups for header/footer
lib/unsplash-images.ts    → Placeholder URLs
lib/image-management.ts   → SiteImage server CRUD
assets/RAW_DATA.md        → Canonical content source
```

---

## Content & tone

- **Voice:** Elegant, exclusive, warm Egyptian hospitality — confident, not arrogant
- **Focus:** Experience over feature lists; short paragraphs (2–3 sentences)
- **One focal point per section;** generous whitespace; gold used sparingly

---

## Testing checklist (run after each phase)

- [ ] All new pages load without errors
- [ ] Internal/external links work
- [ ] Images have proper alt text
- [ ] Metadata correct per page
- [ ] Mobile responsive
- [ ] **Booking modal opens and works** (regression)
- [ ] Admin dashboard accessible; `/admin/images` works
- [ ] No console errors
- [ ] Lighthouse SEO & accessibility > 90 (Phase 4+)

---

*Last updated: Phase 2 core public pages complete. Blog detail (`/blogs/[slug]`) remains Phase 3.*
