# Hathor Design DNA (shared)

Canonical brand tokens for the three design skills. Prefer existing CSS variables / components over inventing new ones.

## Vibe

Elegant Nile luxury editorial — cinematic, cream + gold, slow storytelling. Not SaaS, not startup purple, not newspaper broadsheet.

## Palette

| Role | Hex | Notes |
|------|-----|--------|
| Gold / primary | `#b69f64` | CTAs, accents, on-cream titles |
| Gold soft | `#c9a96e` / `#d4bf86` | Soft accents |
| Cream / surface | `#f5eacf` / `#ece8df` | Page grounds (Suites mosaic uses `#f5eacf`) |
| Title on media | `#f7f1e6` | Cream titles over photos |
| Ink | `#2c2824` | Body on cream |
| Beige wash | `#cdbfa6` | Soft radial washes |

Avoid: blue/indigo primaries, pure white flats, purple gradients, generic gray-900 stacks.

## Type

| Role | Face | Stack hint |
|------|------|------------|
| Display / titles | Gamgote (or admin typography face) | `--font-hathor-gamgote`, Georgia fallback |
| Script / second hero line | Quiet Luxury / Agraham family as configured | Never Inter/Roboto/Arial as default |
| Body | Plus Jakarta Sans / Hathor Body / Agraham per page | Luxury sans, not system-ui default |

Installed luxury faces live in `lib/typography-settings-shared.ts` (`HATHOR_LUXURY_FONTS`).

## Signature references

| Experience | Match this |
|------------|------------|
| Suites / Cruises mosaic hero | `-28°` plane, 3-lane marquee, gold radial wash, title bloom `0 4px 40px rgba(0,0,0,0.4)` |
| Homepage hero | Gold strips → logo rise → Book Now stretch (scroll-controlled) |
| Mobile menu | Three layers: `#8b6914` → `#c9a96e` → `#ece8df` |

## Breakpoints

- Desktop: `>1024px`
- Tablet: `481px–1024px`
- Phone: `≤480px`

## Protected (stop + ask)

Do not edit without explicit user approval:

- `/cruises` and cruises scroll/transition stack
- Booking (`/booking/**`, booking APIs)
- Admin (`/admin/**`, `/api/admin/**`)
- Frozen: `app/test-scroll-reveal/**`, `_local/scroll-reveal-effect/**`
