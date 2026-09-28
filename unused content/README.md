# Unused content

Moved here on 2026-09-24 because nothing on the live site uses them: 94 unused media files (380.8 MB) and 195 scratch and snapshot folders (3021.0 MB).
Every file keeps its original folder path under this folder, so `unused content/public/branding/x.webp` came from `public/branding/x.webp`.

This folder is excluded from deploys (`.vercelignore`) and from new git additions (`.gitignore`). Files that were already in git were moved with `git mv`, so their history is kept.

## How each file was checked

- Its path and file name were searched in all site code (app, components, lib, hooks, emails, middleware, next.config) and in every static bundle the site loads from public/.
- Paths the code builds at run time were kept whole: CMS site images (`public/media/hathor/optimized`), ship deck plans, dining plates, logo letters, videos, and the responsive copies of any used photo.
- Anything a build, seed or maintenance script reads was kept, as were `public/uploads` (dashboard uploads) and the r2 photo mirror (the database can point at both).
- Every page in the live sitemap (66) was fetched with the JS and CSS files it links (98), and none of the moved public/ files is named there.
- The site was then loaded locally at desktop and phone width, before and after the move, scrolling every page: no image, font or video failed to load because of the move.
- The database and the live deployment were not touched.

## Put a file back

Move it to the same path without the `unused content/` prefix, for example:

```bash
git mv "unused content/public/branding/dahabiya-cruise-hathor.webp" public/branding/
```

Use a plain `mv` for files marked *not in git* below.

## Moved files

### QA screenshots left at the project root (38, 13.7 MB)

- `.tmp-home2-desktop-0.png` — 545 KB — not in git
- `.tmp-home2-desktop-1.png` — 334 KB — not in git
- `.tmp-home2-desktop-2.png` — 728 KB — not in git
- `.tmp-home2-desktop-3.png` — 358 KB — not in git
- `.tmp-home2-desktop-wheel.png` — 1.4 MB — not in git
- `.tmp-home2-desktop.png` — 664 KB — not in git
- `.tmp-home2-large-phone-0.png` — 228 KB — not in git
- `.tmp-home2-large-phone-1.png` — 241 KB — not in git
- `.tmp-home2-large-phone-2.png` — 251 KB — not in git
- `.tmp-home2-large-phone.png` — 14 KB — not in git
- `.tmp-home2-large-tablet-0.png` — 334 KB — not in git
- `.tmp-home2-large-tablet-1.png` — 285 KB — not in git
- `.tmp-home2-large-tablet-2.png` — 723 KB — not in git
- `.tmp-home2-large-tablet-3.png` — 255 KB — not in git
- `.tmp-home2-large-tablet.png` — 31 KB — not in git
- `.tmp-home2-narrow-phone-0.png` — 160 KB — not in git
- `.tmp-home2-narrow-phone-1.png` — 171 KB — not in git
- `.tmp-home2-narrow-phone-2.png` — 183 KB — not in git
- `.tmp-home2-narrow-phone.png` — 14 KB — not in git
- `.tmp-home2-phone-0.png` — 169 KB — not in git
- `.tmp-home2-phone-1.png` — 204 KB — not in git
- `.tmp-home2-phone-2.png` — 208 KB — not in git
- `.tmp-home2-phone-wheel.png` — 390 KB — not in git
- `.tmp-home2-phone.png` — 14 KB — not in git
- `.tmp-home2-short-phone-0.png` — 100 KB — not in git
- `.tmp-home2-short-phone-1.png` — 258 KB — not in git
- `.tmp-home2-short-phone-2.png` — 189 KB — not in git
- `.tmp-home2-short-phone.png` — 13 KB — not in git
- `.tmp-home2-tablet-0.png` — 360 KB — not in git
- `.tmp-home2-tablet-1.png` — 327 KB — not in git
- `.tmp-home2-tablet-2.png` — 114 KB — not in git
- `.tmp-home2-tablet.png` — 25 KB — not in git
- `.tmp-home2-wide-desktop-0.png` — 586 KB — not in git
- `.tmp-home2-wide-desktop-1.png` — 756 KB — not in git
- `.tmp-home2-wide-desktop-2.png` — 1.5 MB — not in git
- `.tmp-home2-wide-desktop-3.png` — 724 KB — not in git
- `.tmp-home2-wide-desktop.png` — 1018 KB — not in git
- `tmp-accom-check.png` — 107 KB — not in git

### QA screenshots in scripts/ (7, 6.8 MB)

- `scripts/out-local-gallery.png` — 518 KB — not in git
- `scripts/out-opening-at-opening-top.png` — 1.1 MB — not in git
- `scripts/out-opening-p0.25.png` — 906 KB — not in git
- `scripts/out-opening-p0.45.png` — 888 KB — not in git
- `scripts/out-opening-p0.65.png` — 897 KB — not in git
- `scripts/out-opening-p0.85.png` — 905 KB — not in git
- `scripts/out-springs-gallery.png` — 1.7 MB — not in git

### Logo and photo source files in assets/ (the site serves the copies in public/) (32, 29.7 MB)

- `assets/hathor cruise nile trips luxur aswan visit egypt.jpg` — 1.5 MB — not in git
- `assets/hathor cruise nile trips luxur aswan.jpg` — 1.6 MB
- `assets/LOGOS/dahabiya-cruise,-nile-cruises-and-tours.webp` — 83 KB — not in git
- `assets/LOGOS/egyptian-hyroglyphs-hathor-cruise.webp` — 49 KB — not in git
- `assets/LOGOS/hathor-logo-behind-the-sheet-egypt-toors-gold-01.svg` — 1 KB — not in git
- `assets/LOGOS/hathor-logo-behing-the-sheet-egypt-toors-pyramids.svg` — 3 KB — not in git
- `assets/LOGOS/hathor-logo-nile-cruise-day-mode.webp` — 48 KB
- `assets/LOGOS/hathor-logo-nile-cruise-panorama-on-nile-visit-egypt-black.svg` — 7 KB
- `assets/LOGOS/hathor-logo-nile-cruise-panorama-on-nile-visit-egypt-white.svg` — 7 KB
- `assets/LOGOS/hathor-logo-nile-cruise.webp` — 48 KB
- `assets/LOGOS/hathor-main-logo-egypt-toors.svg` — 7 KB
- `assets/LOGOS/hathor-mouse-arrow-egypt-tours-DARK.svg` — 1 KB
- `assets/LOGOS/hathor-mouse-arrow-egypt-tours-GOLDEN.svg` — 1 KB
- `assets/LOGOS/hathor-mouse-arrow-egypt-tours-WHITE.svg` — 1 KB
- `assets/LOGOS/Hathor.parts/hathor-a.webp` — 83 KB — not in git
- `assets/LOGOS/Hathor.parts/hathor-h1.webp` — 128 KB — not in git
- `assets/LOGOS/Hathor.parts/hathor-h2.webp` — 63 KB — not in git
- `assets/LOGOS/Hathor.parts/hathor-o.webp` — 86 KB — not in git
- `assets/LOGOS/Hathor.parts/hathor-r.webp` — 97 KB — not in git
- `assets/LOGOS/Hathor.parts/hathor-t.webp` — 62 KB — not in git
- `assets/LOGOS/Hathor.parts/parts empty bg/1h@2x.png` — 6 KB — not in git
- `assets/LOGOS/Hathor.parts/parts empty bg/a@2x.png` — 18 KB — not in git
- `assets/LOGOS/Hathor.parts/parts empty bg/Artboard 1 copy 4@2x.png` — 6 KB — not in git
- `assets/LOGOS/Hathor.parts/parts empty bg/o@2x.png` — 20 KB — not in git
- `assets/LOGOS/Hathor.parts/parts empty bg/r@2x.png` — 12 KB — not in git
- `assets/LOGOS/Hathor.parts/parts empty bg/t@2x.png` — 5 KB — not in git
- `assets/LOGOS/Hathor.parts/parts in regular/1h.png` — 2 KB — not in git
- `assets/LOGOS/Hathor.parts/parts in regular/Artboard 1 copy 4.png` — 2 KB — not in git
- `assets/LOGOS/Hathor.parts/parts in white/1h.png` — 2 KB — not in git
- `assets/LOGOS/Hathor.parts/parts in white/Artboard 1 copy 4.png` — 2 KB — not in git
- `assets/LOGOS/rotating wheel [Recovered].ai` — 25.7 MB
- `assets/LOGOS/rotating wheel.png` — 38 KB

### Branding files in public/branding that no page loads (8, 0.4 MB)

- `public/branding/booking-modal-noir-panel.webp` — 113 KB
- `public/branding/dahabiya-cruise-hathor.webp` — 91 KB
- `public/branding/dahabiya-cruise-nile-tour.webp` — 92 KB
- `public/branding/egyptian-hyroglyphs-hathor-cruise-tile.webp` — 68 KB
- `public/branding/hathor-logo-behind-the-sheet-egypt-toors-gold-01.svg` — 3 KB
- `public/branding/hathor-logo-behing-the-sheet-egypt-toors-pyramids.svg` — 3 KB
- `public/branding/hathor-logo-nile-cruise-panorama-on-nile-visit-egypt-black-wordmark.svg` — 3 KB
- `public/branding/hathor-mouse-arrow-egypt-tours-WHITE.svg` — 1 KB

### Font files no @font-face rule loads (the rules use the .otf/.ttf of the same font) (3, 0.1 MB)

- `public/fonts/cylburn-1784545829-0/Cylburn.woff2` — 22 KB
- `public/fonts/cylburn-personal-license/Cylburn.woff2` — 22 KB
- `public/fonts/lavenir-modern-lavish-serif-font/lavenir.woff2` — 30 KB

### Next.js starter icons (5, 0.0 MB)

- `public/file.svg` — 1 KB
- `public/globe.svg` — 1 KB
- `public/next.svg` — 1 KB
- `public/vercel.svg` — 1 KB
- `public/window.svg` — 1 KB

### Promo video never uploaded to the live site (1, 330.2 MB)

- `public/videos/Hathor-Luxor-Promo-nile-cruise.mp4` — 330.2 MB — not in git

## Scratch and snapshot folders

QA runs, local test output and old site snapshots. None of them is used by the live site or by the normal build and deploy.

- `_local/hathor-phone` stays where it was on purpose (project rule in CLAUDE.md).
- `npm run build:suites-springs` and `npm run build:accommodation-springs` read `assets/CLONE. httpssprings.estate`: move it back to `assets/` before running either one.
- `backups/` holds `hathor-backup-2026-08-22.sql`, a local database dump. Moving it did not touch the database.

- `assets/GPT SITE RESTORE` — 781.7 MB
- `_local/home-4-evidence` — 579.4 MB
- `assets/CLONE. httpssprings.estate` — 494.0 MB
- `.tmp-suites-hero-deploy-4e167866` — 199.5 MB
- `repomix-output.xml` — 124.7 MB
- `.tmp-suites-production-acceptance` — 104.6 MB
- `_local/footer-qa` — 101.6 MB
- `.tmp-suites-native-rebuild` — 74.7 MB
- `.tmp-suites-final-qa` — 72.0 MB
- `.tmp-suites-type-qa` — 68.3 MB
- `.tmp-suites-final-visual-qa` — 61.0 MB
- `.tmp-suites-pass03` — 40.5 MB
- `scripts/qa-luxury-out` — 34.8 MB
- `.tmp-cruises-master-audit` — 32.7 MB
- `scripts/qa-cinema-out` — 25.2 MB
- `.tmp-suites-premium-correction` — 23.3 MB
- `.tmp-suites-home-visual-clone` — 19.7 MB
- `.tmp-suites-layout-restore` — 19.2 MB
- `.tmp-suites-text-art-direction` — 17.7 MB
- `.tmp-suites-home-typography-match` — 16.6 MB
- `.tmp-suites-color-final` — 15.3 MB
- `scripts/qa-charter-out` — 12.8 MB
- `.tmp-hero-probe` — 12.2 MB
- `scripts/qa-gold-svg-out` — 9.1 MB
- `.tmp-suites-screenshot-surgery` — 8.0 MB
- `.tmp-suites-break-loop` — 7.0 MB
- `_local/step5-ui` — 6.5 MB
- `_local/mobile-journey-qa` — 6.4 MB
- `.tmp-suites-typo-reset` — 6.2 MB
- `.tmp-suites-final-acceptance` — 5.3 MB
- `_local/ship-plan-qa` — 5.1 MB
- `_local/home-hero-frame` — 4.7 MB
- `.tmp-suites-artdir-qa` — 4.3 MB
- `scripts/qa-user-check` — 4.2 MB
- `_local/suites-phone-qa` — 3.4 MB
- `scripts/qa-gold-prod-out` — 3.3 MB
- `.tmp-suites-pass04` — 2.7 MB
- `backups` — 2.3 MB
- `scripts/qa-gold-clear-out` — 1.9 MB
- `_local/suites-rails-qa` — 1.8 MB
- `.tmp-f432-index.html` — 1.2 MB
- `.tmp-a732-index.html` — 1.1 MB
- `redesign` — 857 KB
- `OLD DASHBOARD BACK UP` — 667 KB
- `scripts/qa-gold-base-out` — 646 KB
- `.tmp-home2.html` — 473 KB
- `.tmp-land.html` — 470 KB
- `.tmp-vinspect.json` — 295 KB
- `_local/ship-furniture-reference.png` — 293 KB
- `_local/booking-step2-review.png` — 131 KB
- `_local/site-image-audit.json` — 121 KB
- `.tmp-gap-px-report.json` — 96 KB
- `.tmp-media-inventory.json` — 69 KB
- `_local/booking-step2-browser.png` — 62 KB
- `.tmp-dining-da56.css` — 60 KB
- `.tmp-ok-opening.css` — 60 KB
- `.tmp-ff-opening.css` — 58 KB
- `_local/scroll-reveal-effect` — 48 KB
- `.tmp-contact-css.css` — 45 KB
- `.tmp-springs-i-slider.html` — 36 KB
- `.tmp-springs-i-opening.html` — 29 KB
- `.tmp-site-nav-prev.css` — 29 KB
- `scripts/qa-final-out` — 28 KB
- `.tmp-dl-floating-ig-2` — 26 KB
- `.tmp-dl-about-hero` — 25 KB
- `.tmp-dl-dining-gallery-left` — 25 KB
- `.tmp-dl-floating-ig-1` — 25 KB
- `_local/mobile-journey-qa.cjs` — 25 KB
- `.tmp-dl-floating-ig-3` — 24 KB
- `.tmp-contact-restore.tsx` — 23 KB
- `.tmp-restore-hook.ts` — 23 KB
- `.tmp-easy-home.html` — 17 KB
- `.tmp-easy-home2.html` — 17 KB
- `.tmp-easy-home3.html` — 17 KB
- `.tmp-easy-home4.html` — 17 KB
- `.tmp-home-html.txt` — 17 KB
- `.tmp-springs-i-video.html` — 16 KB
- `.tmp-suites-final-qa.mjs` — 16 KB
- `.tmp-suites-final-qa-visual.mjs` — 16 KB
- `.tmp-restore-patterns.ts` — 15 KB
- `_local/rooms-presentation-map.html` — 15 KB
- `.tmp-seam-audit-report.json` — 14 KB
- `.tmp-seam-pixel-report.json` — 12 KB
- `_local/room-folio-scrape` — 11 KB
- `.tmp-suites-final-qa-annotate.mjs` — 11 KB
- `.tmp-patch-suites-layout-lock.mjs` — 11 KB
- `.tmp-contact-hook.ts` — 10 KB
- `.tmp-orphan-delete-report.json` — 10 KB
- `.tmp-all-storage-objects.json` — 9 KB
- `.tmp-suites-final-qa-pinned.mjs` — 9 KB
- `.tmp-springs-i-intro.html` — 8 KB
- `.tmp-springs-iopening-full.css` — 8 KB
- `_local/booking-rpcs.sql` — 8 KB
- `.tmp-bar-probe.json` — 7 KB
- `_local/footer-qa.cjs` — 7 KB
- `.tmp-unused-media-audit.json` — 7 KB
- `.tmp-live-supabase-images.json` — 7 KB
- `_local/suites-phone-qa.cjs` — 6 KB
- `_local/suites-rails-qa.cjs` — 6 KB
- `.tmp-patch-suites-artdir.mjs` — 6 KB
- `.tmp-suites-blank-report.json` — 6 KB
- `.tmp-amenities-compare-report.json` — 5 KB
- `.tmp-vercel-ls.txt` — 5 KB
- `.tmp-vercel-ls2.txt` — 5 KB
- `.tmp-hathor.html` — 5 KB
- `.tmp-hathorcruise-home.html` — 5 KB
- `.tmp-home-am-opening.css` — 5 KB
- `.tmp-migrate-supabase-to-local-report.json` — 5 KB
- `.tmp-compress-local-results.json` — 5 KB
- `.tmp-springs-sticky-infra.css` — 5 KB
- `_local/build-20.log` — 5 KB
- `.tmp-gold-diag.json` — 5 KB
- `.tmp-suites-type-qa3.mjs` — 4 KB
- `.tmp-suites-type-qa.mjs` — 4 KB
- `.tmp-suites-pass03-capture.mjs` — 4 KB
- `.tmp-suites-type-qa4.mjs` — 4 KB
- `.tmp-gap-springs.mjs` — 4 KB
- `.tmp-suites-layout-compare.mjs` — 4 KB
- `.tmp-left-gap.mjs` — 4 KB
- `.tmp-suites-pass04-before.mjs` — 4 KB
- `.tmp-probe-gap2.mjs` — 4 KB
- `.tmp-suites-type-qa2.mjs` — 4 KB
- `.tmp-springs-sticky.css` — 3 KB
- `.tmp-probe-gap.mjs` — 3 KB
- `.tmp-suites-pass03-audit.mjs` — 3 KB
- `.tmp-verify-gap.mjs` — 3 KB
- `.tmp-cream-scan.mjs` — 3 KB
- `.tmp-compress-upload-results.json` — 3 KB
- `.tmp-suites-pass03-scrub.mjs` — 3 KB
- `_local/booking-admin-rpc.sql` — 3 KB
- `.tmp-suites-type-final.mjs` — 3 KB
- `.tmp-live-storage-keys.json` — 3 KB
- `.tmp-verify-underlap.mjs` — 3 KB
- `.tmp-suites-final-qa-sections.mjs` — 3 KB
- `.tmp-live-storage-keys.txt` — 3 KB
- `.tmp-bar-fine.json` — 3 KB
- `.tmp-probe-bar-title.mjs` — 3 KB
- `_local/map-probe.cjs` — 3 KB
- `.tmp-voy-seam.mjs` — 3 KB
- `_local/stage-measure.cjs` — 2 KB
- `.tmp-springs-iintro.css` — 2 KB
- `.tmp-springs-iopening.css` — 2 KB
- `.tmp-springs-islider.css` — 2 KB
- `.tmp-springs-ivideo.css` — 2 KB
- `.tmp-debug-script-font.mjs` — 2 KB
- `.tmp-fix-site-nav-utf8.mjs` — 2 KB
- `_local/suites-footer-check.cjs` — 2 KB
- `.tmp-probe-bar-fine.mjs` — 2 KB
- `.tmp-seam-compare.mjs` — 2 KB
- `_local/seam-probe.cjs` — 2 KB
- `.tmp-frames.json` — 2 KB
- `.tmp-cmp-local.json` — 2 KB
- `.tmp-bg-chain.mjs` — 2 KB
- `_local/rail-check.cjs` — 2 KB
- `_local/we.tmp.cjs` — 2 KB
- `_local/perf-measure-codex.cjs` — 2 KB
- `_local/suites-probe.cjs` — 2 KB
- `.tmp-local-r2-delete.json` — 1 KB
- `_local/g02.tmp.cjs` — 1 KB
- `_local/ghost-edge-probe.cjs` — 1 KB
- `.tmp-springs-open-clip.mjs` — 1 KB
- `_local/post-probe.cjs` — 1 KB
- `.tmp-springs-i-slider-text.txt` — 1 KB
- `.tmp-delete-old-fat-report.json` — 1 KB
- `.tmp-springs-i-video-text.txt` — 1 KB
- `_local/map-desktop.cjs` — 1 KB
- `_local/ghost-fit.cjs` — 1 KB
- `.tmp-extract-captions.mjs` — 1 KB
- `.tmp-extract-captions2.mjs` — 1 KB
- `.tmp-prod-check-features.mjs` — 1 KB
- `_local/seam-check.cjs` — 1 KB
- `_local/home.tmp.cjs` — 1 KB
- `_local/we2.tmp.cjs` — 1 KB
- `.tmp-prod-fingerprint.mjs` — 1 KB
- `.tmp-springs-pattern-infrastructureIntroCaptionDesktop.js` — 1 KB
- `.tmp-springs-pattern-infrastructureIntroCaptionMobile.js` — 1 KB
- `.tmp-springs-pattern-infrastructureSliderScroll.js` — 1 KB
- `.tmp-springs-pattern-introImage.js` — 1 KB
- `.tmp-springs-pattern-videoCaptionMoveUp.js` — 1 KB
- `.tmp-springs-pattern-videoImage.js` — 1 KB
- `.tmp-springs-pattern-videoTitle.js` — 1 KB
- `.tmp-springs-pattern-videoTranslate.js` — 1 KB
- `.tmp-springs-pattern-videoZoom.js` — 1 KB
- `.tmp-springs-i-opening-text.txt` — 1 KB
- `.tmp-opening-metrics.json` — 1 KB
- `_local/hyd.tmp.cjs` — 1 KB
- `_local/browser-test.log` — 1 KB
- `_local/db-ping.cjs` — 1 KB
- `.tmp-springs-i-intro-text.txt` — 1 KB
- `_local/slot-ambig.txt` — 1 KB
- `_local/booking-migration-history.json` — 1 KB
- `.tmp-update-cache-control-report.json` — 1 KB
- `.tmp-dl-dining-gallery-right` — 1 KB
- `.tmp-dl-dining-intro-hero` — 1 KB
- `_local/hl-desktop-1440.png` — 1 KB

## Code audit (nothing below was moved or changed)

### Code files no live page imports

Found with knip from the app's routes. 88 files; generated Prisma files included. Check before deleting: a file may be kept for a planned page.

- `app/(public)/cruises/CruisesScrollBoot.tsx`
- `app/admin/(panel)/blogs/actions.ts`
- `app/generated/prisma/browser.ts`
- `app/generated/prisma/internal/prismaNamespaceBrowser.ts`
- `components/booking/AvailabilityCalendar.tsx`
- `components/booking/BookingCalendarPicker.tsx`
- `components/booking/BookingConfirmationColumns.tsx`
- `components/booking/BookingGuestsPanel.tsx`
- `components/booking/BookingItineraryFilter.tsx`
- `components/booking/BookingReservationFlow.tsx`
- `components/booking/BookingSearchBar.tsx`
- `components/booking/BookingSearchResults.tsx`
- `components/booking/BookingWizard.tsx`
- `components/booking/CheckoutCalendar.tsx`
- `components/booking/CheckoutForm.tsx`
- `components/booking/CountdownTimer.tsx`
- `components/booking/GuestPaymentForm.tsx`
- `components/booking/GuestRoomSelector.tsx`
- `components/booking/HathorBrandMark.tsx`
- `components/booking/PassengerDetailsStep.tsx`
- `components/booking/ProgressBar.tsx`
- `components/booking/ReviewStep.tsx`
- `components/booking/RoomSelection.tsx`
- `components/booking/RoomSelectionStep.tsx`
- `components/booking/SearchStep.tsx`
- `components/booking/SuccessStep.tsx`
- `components/home/AmenitiesTypographyLiveStyle.tsx`
- `components/home/HomeAmenitiesMaskSlider.tsx`
- `components/home/HomeAmenitiesSpringsPortal.tsx`
- `components/home/HomeTextStorySection.tsx`
- `components/layout/SiteNavLogoBar.tsx`
- `components/layout/StaggeredMenu.tsx`
- `components/pages/AccommodationSpringsDesignPage.tsx`
- `components/pages/CruisesPageContent.tsx`
- `components/pages/CruisesPageListings.tsx`
- `components/pages/EditorialSection.tsx`
- `components/pages/GastronomyMaskRevealBoot.tsx`
- `components/pages/LuxuryCabinsPageContent.tsx`
- `components/pages/MarketingCtaBand.tsx`
- `components/pages/PageScrollTransition.tsx`
- `components/pages/RoyalSuitesPageContent.tsx`
- `components/pages/SuitesSpringsHomepagePage.tsx`
- `components/pages/charter/CharterRouteSelector.tsx`
- `components/pages/home-four/useHomeFourPreviewNav.ts`
- `components/pages/pageScrollTransitionEngine.ts`
- `components/pages/rooms/ResidenceScrollPage.tsx`
- `components/pages/rooms/RoomCollectionPage.tsx`
- `components/pages/rooms/RoomsPageContent.tsx`
- `components/public/CruisesListing.tsx`
- `components/public/PageVisibilityGate.tsx`
- `components/public/PublicThemeInit.tsx`
- `components/public/RawScrollSmooth.tsx`
- `components/public/ScrollReveal.tsx`
- `components/public/TestimonialsCarousel.tsx`
- `components/public/WelcomeSplash.tsx`
- `components/ui/ChapterHeader.tsx`
- `components/ui/LuxuryCursor.tsx`
- `components/ui/ParallaxHeroImage.tsx`
- `hooks/useAccommodationMotion.ts`
- `hooks/useAmenitiesFixedMaskReveal.ts`
- `hooks/useCruisesHeroStripes.ts`
- `hooks/useCruisesRedesignMotion.ts`
- `hooks/useGastronomyFixedMaskReveal.ts`
- `hooks/useGastronomySpringsScroll.ts`
- `hooks/useHathorLuxBodyMotion.ts`
- `hooks/useHomeChapterStack.ts`
- `hooks/useHomeStoryFixedMaskReveal.ts`
- `hooks/useImmersiveVoyageMotion.ts`
- `hooks/usePageScrollTransition.ts`
- `hooks/useVoyagesPageMotion.ts`
- `lib/booking-availability-client.ts`
- `lib/booking-checkout-summary.ts`
- `lib/booking-hold-token.ts`
- `lib/booking-modal-helpers.ts`
- `lib/booking-pricing.ts`
- `lib/charter-chapters.ts`
- `lib/db-serial.ts`
- `lib/defer-editorial-motion.ts`
- `lib/fixed-mask-reveal.ts`
- `lib/gastronomy-dining-image-src.ts`
- `lib/gastronomy-springs-html.ts`
- `lib/homepage-sections.ts`
- `lib/image-loader.ts`
- `lib/raw-scroll-smooth.ts`
- `lib/responsive-media.ts`
- `lib/rooms-motion.ts`
- `lib/split-hero-title.ts`
- `lib/unsplash-images.ts`

### Packages nothing imports

`@vercel/speed-insights` (dependency), `react-day-picker` (dependency), `@eslint/eslintrc` (dev dependency), `@react-email/ui` (dev dependency), `postcss-prefixwrap` (dev dependency), `tailwindcss` (dev dependency). Build tooling can use a package without importing it (tailwindcss and postcss-prefixwrap through PostCSS, for example), so check each one before removing it.

### Stylesheets nothing imports

- `app/(public)/cruises/cruises-scroll.css`
- `app/(public)/home-story.css`
- `app/gastronomy-mask-reveal.css`
- `app/gastronomy-springs-base.css`
- `app/gastronomy-springs-design.css`
- `app/gastronomy-springs-design.raw.css`
- `app/gastronomy-springs-design.scoped.css`
- `app/gastronomy-springs-global.raw.css`
- `app/gastronomy-springs-global.scoped.css`
- `app/gastronomy-springs-hathor.css`
- `app/hathor-editorial-pages.css`
- `app/highlights-page.css`
- `app/immersive-voyage.css`
- `app/rooms/rooms-showcase.css`
- `app/voyages-page.css`

### Static bundles in public/ that only dead code loads

- `public/suites-springs/` (50 MB) — loaded only by `components/pages/SuitesSpringsHomepagePage.tsx`, which no page imports.
- `public/gastronomy-springs/` (3.5 MB) — loaded only by `lib/gastronomy-springs-html.ts` and the unimported `app/gastronomy-springs-*.css`.
- `public/home-amenities-springs/` (264 KB) — loaded only by `components/home/HomeAmenitiesSpringsPortal.tsx`, which no page imports.
- `public/accommodation-springs/` (4 MB) — its page component is unused, but `app/api/accommodation-config/route.ts` still names it; check before removing.
- `public/transition/index.html` and `public/js/transition-for-pages.js` — the page only that script opens, and nothing loads the script.

### Left in place on purpose

- `assets/NORMAL IS DEF BORING/` (18 MB) — the cloned reference site `scripts/build-suites-normal-homepage.mjs` reads.
- `assets/plates/` (35 MB) — sources of the dining plates, read by the gastronomy build script; the site serves the copies in `public/media/gastronomy-dining/`.
- `assets/LOGOS/` files that are still used: the e-mail logo the build copies, the rotating wheel the home page imports, and the logo parts the letter scripts read.
- `public/uploads/` and `public/media/hathor/r2/` — the database can point at them.
- `pages_only.txt`, `out/` and `output/` (the dashboard manual PDF) — small; not part of the site.
- 174 of 207 scripts in `scripts/` are not run by any package.json command; most are one-off tools (code, so only listed).
