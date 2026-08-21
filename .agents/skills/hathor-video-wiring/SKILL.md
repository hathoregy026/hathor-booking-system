---
name: hathor-video-wiring
description: >-
  Hathor video wiring standard for hero, Bar/amenities reel, and any future clips.
  Covers encode, poster, CDN hosting, slot wiring (desktop + phone + poster), naming,
  inventory, and QA. Use when the user mentions wire video, hero video, Bar reel,
  amenities video, phone encode, video poster, media CDN, R2 video, Mux, Cloudflare
  Stream, or adding a new homepage/section reel.
---

# Hathor Video Wiring

Standard pipeline for every public-site video. Prefer this over ad-hoc MP4 drops into the deploy.

**Do not invent a different pattern** unless the user explicitly asks to change the standard.

## When invoked

1. Identify the **slot** (hero, amenities inset / Bar, or a new named slot).
2. Walk **A → F** below. Do not skip poster or phone encode without saying so and getting approval.
3. For Hathor today, the interim wiring (until full CDN) matches homepage hero:
   - Desktop MP4 under `/public/media/hathor/videos/` (or CDN URL when ready)
   - CMS / slot poster (never empty)
   - Phone: dedicated mobile MP4, or **poster-only** until a mobile encode exists
4. **Do not code** encode/upload tooling unless the user asks to implement scripts. This skill is the checklist and agent procedure.
5. Stop before editing protected areas (Suites, Cruises, booking, admin) unless the user approved that area.

## Hathor slot anchors (current)

| Slot | Video constant / path | Poster |
|------|----------------------|--------|
| Hero | `HATHOR_HERO_VIDEO_SRC` → `/media/hathor/videos/hathor-hero-nile-promo-v20260811.mp4` | CMS `home-hero-poster` |
| Bar / amenities inset | `HATHOR_AMENITIES_INSET_VIDEO_SRC` → `/media/hathor/videos/bar-hathor-egypt-cruise-history-meets-luxury-v20260811.mp4` | CMS `home-amenities-3` |
| Future | New stable name under `/media/hathor/videos/` or CDN + new constant | Dedicated poster slot or still |

Touch points when wiring (only if user asked to implement): `lib/branding.ts`, `lib/amenities-video.ts`, `components/pages/PublicSiteHero.tsx`, `components/home/AmenitiesInsetVideo.tsx`, `components/public/FullBleedBackgroundVideo.tsx`, `vercel.json` cache headers for static MP4s.

## Agent procedure

1. Confirm slot name and whether CDN URLs already exist.
2. Confirm desktop MP4, phone MP4 (or poster-only), and poster still.
3. Confirm public HTTPS URLs open on a second device.
4. Wire three assets; never ship empty poster or black-only fallback.
5. Hero: poster-first, early load OK. Non-hero: load/play when section approaches.
6. Run QA checklist F before calling done.
7. Report: slot, three URLs (or poster-only phone), files touched, desktop/phone/tablet notes.

---

### Video wiring to-do (hero, Bar reel, any future clips)

**A. Source & encode**
1. Keep one high-quality master offline (don’t upload the raw master to the site).
2. Export **desktop** encode: 1080p (or 1440p if needed), H.264, good bitrate, muted-friendly loop.
3. Export **phone** encode: 720p, smaller bitrate, same framing/crop if possible.
4. Fast-start MP4 (moov at front) so playback begins before full download.
5. Trim length — short loops only; cut dead frames.

**B. Poster**
6. Make a sharp poster still from the first (or best) frame.
7. Export poster as WebP/AVIF (+ JPG fallback if you want).
8. Match art direction to the video (same crop/mood). Never ship empty poster.

**C. Hosting**
9. Upload desktop MP4, phone MP4, and poster to a **media CDN** (R2 / Cloudflare Stream / Mux / etc.).
10. Don’t rely on stuffing large videos into the Next/Vercel deploy long-term.
11. Confirm public HTTPS URLs work on desktop and phone (open each URL directly).
12. Turn on caching + byte-range support on the CDN.

**D. Site wiring (per video slot)**
13. Decide the slot (hero, amenities inset, future section).
14. Store three URLs: desktop video, phone video, poster.
15. Wire phone URL only for phone; desktop for larger screens.
16. Always set poster so the stage never looks black/broken while loading.
17. Load/play only when the section is near/in view (not on first home paint unless it’s the hero).
18. Keep muted + playsInline for autoplay; respect reduced-motion (poster only).
19. On very slow/save-data networks: show poster, don’t force the heavy reel.

**E. Naming & inventory**
20. Use stable names (`hero-…`, `bar-hathor-…`, etc.) and a simple inventory list (slot → 3 URLs).
21. Don’t overwrite live files in place without cache-busting (new filename or version query).

**F. QA checklist (every video, every device)**
22. Desktop: poster shows instantly, then video plays cleanly.
23. Phone: phone encode loads (not desktop), poster first, no black stage.
24. Tablet: pick one encode deliberately (usually desktop or a mid encode).
25. Slow network / reduced motion: poster still looks finished.
26. Hard-refresh + second device on production domain (not only localhost).
27. Confirm custom domain URL and Vercel URL both serve the same assets.

**G. Hero vs Bar vs future**
28. **Hero:** treat as highest priority — poster must be perfect; desktop + phone encodes; load early but still poster-first.
29. **Bar / amenities:** same 3-asset pattern; load only as that chapter approaches.
30. **Any future video:** same pipeline — master → 2 encodes → poster → CDN → 3 URLs → slot wiring → QA above.

Do this once as a standard; every new reel is just repeat steps A→F.
