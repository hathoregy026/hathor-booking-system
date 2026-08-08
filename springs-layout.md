# Springs Infrastructure Layout Audit — Manual for `/test-slide`

Literal clone rebuild guide for Hathor `/test-slide`.  
**Do not invent layout. Do not remap Springs colors/copy to Hathor gold.**

---

## 0. How `/test-slide` is served (this repo)

| Piece | Path | Role |
|-------|------|------|
| Route | `app/test-slide/route.ts` | Returns the clone HTML document (no Hathor nav/layout) |
| Static clone | `public/springs-layout/index.html` | Prepared HTML from Springs infrastructure |
| Local CSS/JS | `public/springs-layout/assets/{stylesheets,javascripts}/` | `global.css`, `infrastructure.css`, `shared.js`, … |
| Prep script | `scripts/prepare-test-slide-clone.mjs` | Regenerates `public/springs-layout` from the clone folder |
| Nav | — | **Not linked** in `lib/public-nav.ts` / PublicNavbar |

Open: `/test-slide`  
Media/fonts/icons resolve to `https://springs.estate/…` (literal Springs assets).  
Regenerate clone files: `node scripts/prepare-test-slide-clone.mjs`

---

## 1. Purpose / source of truth

| Role | Path |
|------|------|
| Canonical HTML (DOM, sticky classes, parallax attrs, section IDs) | `assets/CLONE. httpssprings.estate/infrastructure/index.html` |
| Page CSS (section heights, clip-paths, opening/nature/interiors…) | `assets/CLONE. httpssprings.estate/assets/stylesheets/infrastructure.css` |
| Global tokens + sticky grammar + UI theme | `assets/CLONE. httpssprings.estate/assets/stylesheets/global.css` |
| Sticky extract (readable) | `_tmp_sticky_extract.css` / `.tmp-springs-sticky-infra.css` |
| Section CSS extracts | `.tmp-springs-iintro.css`, `.tmp-springs-ivideo.css`, `.tmp-springs-islider.css`, `.tmp-springs-iopening-full.css` |
| Parallax pattern extracts | `.tmp-springs-pattern-*.js` |
| Live reference | `https://springs.estate/infrastructure` |

**Target route:** `/test-slide` must match this clone’s section order, sticky grammar, runway heights, clip polygons, and Springs palette — not Hathor brand tokens.

**Breakpoint note (Springs “lg-up”):**

```css
@media (min-width: 1440px), (min-width: 980px) and (min-aspect-ratio: 10/11) { /* lg-up */ }
```

**md-down / not-lg (sticky disable branch):**

```css
@media (max-aspect-ratio: 10/11) and (max-width: 1439px),
       (max-aspect-ratio: 13/9) and (max-width: 667px),
       (max-width: 979px) { /* sticky:lg-up becomes block / sticky off */ }
```

---

## 2. Page section order (IDs)

Exact order inside `<main id="top">` → `.section` → content:

| # | ID | Block class | Notes |
|---|----|-------------|--------|
| 1 | `#i-intro` | `.i-intro` | Hero / Amenities |
| — | `#i-next` | (absolute marker) | Desktop scroll target `top: 100svh` inside intro |
| — | `#i-next-mobile` | `.i-intro__text` | Mobile text block after intro |
| 2 | `#i-video` | `.i-video` | Vimeo + title + wellness caption |
| 3 | `#i-slider` | `.i-slider` | Desktop-only sticky slider (`is-hidden--md-down`) |
| — | *(sibling)* | `.i-slider__mobile-scrollable-container` | Mobile replacement (`is-hidden--lg-up`) |
| 4 | `#i-opening` | `.i-opening` | Sticky left + scrolling right + 3 cards |
| — | *(sibling)* | `.i-opening__caption__text-mobile` | Mobile cards/text (`is-hidden--lg-up`) |
| 5 | `#i-nature` | `.i-nature` | Full-bleed nature quote |
| 6 | `#i-interiors` | `.i-interiors` | Caption carousel + stacked images |
| 7 | `#i-forest` | `.i-forest` | Forest video + bottom slider |
| 8 | `#i-terrace` | `.i-terrace` | Terrace plan + pins |
| 9 | `#i-parking` | `.i-parking` | Parking hero + list |
| 10 | `#i-more` | `.more-block` | Location teaser → next page |

---

## 3. Sticky grammar cheat sheet

### Core grid

```css
.sticky {
  display: grid;
  grid-auto-rows: 1fr;
  grid-template-areas: "sticky_content";
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  --sticky-under-previous-distance: calc(100 * var(--svh));
  --sticky-under-next-distance: calc(100 * var(--svh));
}

.sticky__layer {
  align-self: start;
  grid-area: sticky_content; /* ALL layers share one cell → stack */
  min-width: 0;
  position: relative;
}

.sticky__layer--sticky {
  contain: content;
  position: sticky;
  top: 0;
}

.sticky__layer--top { position: relative; z-index: 1; }

.sticky__spacer { height: calc(100 * var(--svh)); }
```

**Meaning:** Multiple `.sticky__layer` children occupy the same grid area. The `--sticky` layer pins; non-sticky layers scroll through the same cell (this is how `#i-opening` left sticks while the right column scrolls).

### Full-height pin

```css
.sticky--full-height,
.sticky--full-height .sticky__layer { min-height: calc(100 * var(--svh)); }
.sticky--full-height .sticky__layer--sticky { height: calc(100 * var(--svh)); }
```

### Under-next (section extends into / under the following runway)

```css
.sticky--under-next {
  margin-bottom: calc(var(--sticky-under-next-distance) * -1);
  position: relative;
}
.sticky--under-next:after {
  content: "";
  display: block;
  height: var(--sticky-under-next-distance); /* default 100svh */
}
```

### Under-previous (section pulls up under the previous)

```css
.sticky--under-previous {
  margin-top: calc(var(--sticky-under-previous-distance) * -1);
  position: relative;
}
.sticky--under-previous:after {
  content: "";
  display: block;
  height: var(--sticky-under-previous-distance);
}
```

### Both under-previous + under-next

```css
.sticky--under-previous.sticky--under-next .sticky__layer--sticky { max-height: 200svh; }
.sticky--under-previous.sticky--under-next:after {
  height: calc(var(--sticky-under-previous-distance) + var(--sticky-under-next-distance));
}
```

### After-next (section that follows a `sticky--under-next` neighbor)

```css
.sticky--under-next + .sticky--under-previous,
.sticky--under-previous--after-next {
  clip-path: inset(calc(100 * var(--svh)) 0 0);
  margin-top: calc(
    var(--sticky-under-previous-distance) * -1 +
    var(--sticky-under-next-distance) * -1
  );
}
/* + translateZ(1px) compositing hack */
```

Responsive variant used on `#i-opening`:

```html
sticky--under-previous--after-next:lg-up
```

```css
@media (min-width: 1440px), (min-width: 980px) and (min-aspect-ratio: 10/11) {
  .sticky--under-previous--after-next\:lg-up {
    clip-path: inset(calc(100 * var(--svh)) 0 0);
    margin-top: calc(
      var(--sticky-under-previous-distance) * -1 +
      var(--sticky-under-next-distance) * -1
    );
  }
}
```

### LocoScroll vs CSS sticky

```css
.has-scroll-smooth .sticky__layer--sticky {
  contain: unset;
  position: relative; /* CSS sticky OFF when loco smooth-scroll is on */
}
```

When `html.has-scroll-smooth`:

- Pinning is driven by Locoscroll attrs on the sticky layer:
  - `data-scroll`
  - `data-scroll-sticky`
  - `data-scroll-target="#i-…"`
- Without smooth scroll, native `position: sticky; top: 0` applies.

### Responsive kill switches

- `sticky:lg-up` — sticky only on lg-up; becomes `display:block` + sticky layers `position:relative` on md-down.
- `sticky--under-next:lg-up` / `sticky--under-previous:lg-up` — zero the distances and hide `::after` spacers on md-down.

---

## 4. Parallax attribute grammar

Springs uses `data-plugin="parallax"` with keyframes named:

```text
data-parallax-{elementOffset}-{viewportOffset}='{"cssProp": "value", ...}'
```

Examples from clone:

- `data-parallax-0-0` — at section start
- `data-parallax--100-0` — after ~100vh of sticky progress past start
- `data-parallax-100-0` — before section enters (positive = ahead)

Common modifiers:

| Attr | Role |
|------|------|
| `data-parallax-clamp="true"` | Clamp progress |
| `data-parallax-measure-selector=".sticky"` | Measure against nearest `.sticky` runway |
| `data-parallax-enable-mq="lg-up" \| "md-up" \| "md-down" \| "sm-down" \| "null"` | Gate by MQ |
| `data-parallax-pattern="name"` | Named pattern from `shared.js` / `infrastructure.js` |

Named patterns used on this page (extracts in repo):

- `introImage`
- `infrastructureIntroCaptionDesktop` / `infrastructureIntroCaptionMobile`
- `videoZoom` / `videoTranslate` / `videoTitle` / `videoImage` / `videoCaptionMoveUp`
- `infrastructureSliderScroll`
- `interiorsScroll` (+ mobile card patterns)
- `forestImage` / `forestCaption` / `forestCaptionOpacity` / `forestBottomSlider`
- `parkingImage` / `parkingCaption`

---

## 5. Color tokens (clone — keep as-is)

From `global.css` (`:root` / theme). **Do not remap to Hathor gold.**

### Raw palette (`--c-*`)

| Token | Value |
|-------|-------|
| `--c-dark-green` | `#162d24` |
| `--c-dark-green-rgb` | `22,45,36` |
| `--c-green` | `#1b4732` |
| `--c-green-rgb` | `27,71,50` |
| `--c-olive` | `#758535` |
| `--c-olive-rgb` | `117,133,53` |
| `--c-light-green` | `#a7b431` |
| `--c-beige` | `#e0d1b6` |
| `--c-beige-rgb` | `224,209,182` |
| `--c-beige-background` | `#f5e8d1` |
| `--c-beige-background-rgb` | `245,232,209` |
| `--c-blue` | `#005160` |
| `--c-blue-rgb` | `0,81,96` |
| `--c-dark-blue` | `#101e27` |
| `--c-dark-blue-rgb` | `16,30,39` |
| `--c-light-blue` | `#67bfda` |
| `--c-sky` | `#bee5ee` |
| `--c-black` | `#030303` |
| `--c-white` | `#fff` |
| `--c-error` | `#e1c35b` |

### Theme roles

**Light UI (default / `.ui-light`):**

- `--t-background: var(--c-beige-background)` → `#f5e8d1`
- `--t-text` / `--t-heading` / `--t-primary: var(--c-dark-green)` → `#162d24`
- `--t-secondary: var(--c-green)` → `#1b4732`
- `--t-line: rgba(var(--c-dark-green-rgb), 0.2)`

**Dark UI (`.ui-dark`):**

- `--t-background: var(--c-dark-green)` → `#162d24`
- `--t-text` / `--t-heading: var(--c-beige)` → `#e0d1b6`
- `--t-primary: var(--c-beige-background)` → `#f5e8d1`
- `--t-secondary: var(--c-beige)` → `#e0d1b6`
- `--t-line: rgba(var(--c-beige-rgb), 0.2)`

**Background utility classes:**

```css
.ui-light-background { background: var(--c-beige-background); } /* #f5e8d1 */
.ui-dark-background  { background: var(--c-dark-green); }       /* #162d24 */
.ui-background       { background: var(--t-background); }       /* themed */
```

Boot styles in HTML head:

```css
body { background: #F5E8D1; color: #F5E8D1; }
```

`<meta name="theme-color" content="#162D24">`

**Gradient blobs on page (exact vars):**

- Opening gradient: `radial-gradient(circle, var(--c-blue) 0, rgba(var(--c-blue-rgb),.8) 5%, rgba(var(--c-blue-rgb),0) 62%)`
- Nature / slider olive: `var(--c-olive)` / `var(--c-olive-rgb)`
- Slider also uses `var(--c-blue)` and `var(--c-dark-blue)`

---

## 6. Required CSS / JS files

### CSS (from clone `<head>`)

1. `/assets/stylesheets/global.css` — tokens, sticky system, grid, UI themes, utilities  
2. `/assets/stylesheets/infrastructure.css` — all `.i-*` section rules  

For `/test-slide` in Hathor: port or mirror these (or scoped copies), **not** Hathor `public.css` gold tokens.

### JS (from clone footer)

1. `/assets/javascripts/browser-message/browser-message.js`  
2. `/assets/javascripts/shared.js` — Locoscroll, sticky, parallax engine, contentAnimation, reveal  
3. `/assets/javascripts/infrastructure.js` — page-specific parallax patterns  

Critical HTML boot classes:

```html
<html class="has-hover no-js not-ready"> <!-- JS flips to js -->
<body data-barba="wrapper">
```

Page shell:

```html
<div class="page-content-wrapper ui-light-background" data-barba="container" data-barba-namespace="infrastructure">
  <div class="page-content js-page-content">
    <main id="top">
      <section class="section ui-dark-background" data-scroll-section data-plugin="reveal">
        <!-- sections -->
```

---

## 7. Section-by-section layout

Desktop (“lg-up”) is the primary rebuild target; mobile notes included where markup forks.

---

### 7.1 `#i-intro` — Amenities hero

**Root classes:**

```html
class="ui-dark ui-light-background i-intro sticky sticky--full-height sticky--under-next sticky--under-next:lg-up"
id="i-intro"
data-scroll-snap-point='[{ "viewport": 0, "element": 0}, { "viewport": 0, "element": 33}]'
```

**Desktop height / runway:**

```css
.i-intro { height: 150svh; } /* base */
/* lg-up */
.i-intro { height: 300svh; }
```

**DOM skeleton:**

```text
#i-intro.sticky…
  .sticky__layer.sticky__layer--sticky.sticky--full-height
    [data-scroll data-scroll-sticky data-scroll-target="#i-intro"]
    .i-intro__content
      .background.background--cover [parallax pattern=introImage]
        picture.img-cover [translateX/scale parallax lg-up]
        .dim [opacity 1→0]
      .i-intro__caption [pattern=infrastructureIntroCaptionDesktop + Mobile]
        h1.h0 "Amenities" (desktop)
        title SVG (mobile)
        .text-c1 "Beauty at Your Fingertips"
        a.i-intro__next → #i-next / #i-next-mobile
    .i-intro__text.col.col--md-6.ui-light (desktop only)
      clip-path reveal left←right
  #i-next { position:absolute; top:100svh }
#i-next-mobile.i-intro__text (mobile text after section)
```

**What sticks vs scrolls:**

- Sticky layer pins for the 300svh runway (desktop).
- Content stays pinned; parallax animates image clip / caption / dim / text clip.
- `sticky--under-next` + `::after` 100svh spacer lets `#i-video` slide under.

**Key parallax:**

| Target | Attrs / pattern |
|--------|------------------|
| `.i-intro__content` | md-down: height `100svh` → `70svh` |
| `.background` | pattern `introImage` — lg-up clips to 50% width; mobile width 250%→125% |
| `picture` | lg-up: `translateX(0%) scale(1.2)` → `translateX(-36%) scale(1.0)` over `--200-0` |
| `.dim` | opacity `1` → `0` (`0-0` → `--50-0`) |
| caption | patterns Desktop/Mobile |
| `.i-intro__text` | clip-path closed right edge → full rect (`0-0` → `--100-0`) |

**Handoff → `#i-video`:** under-next overlap; video uses `sticky--under-previous`.

---

### 7.2 `#i-video` — Where Change Becomes Art

**Root classes:**

```html
class="ui-dark ui-background i-video sticky sticky--full-height sticky--under-previous sticky--under-previous:lg-up sticky--under-next"
id="i-video"
data-scroll-snap-point='[{ "viewport": -100, "element": 0}, { "viewport": -300, "element": 0}, { "viewport": -400, "element": 0}]'
```

**Heights:**

```css
.i-video { height: 350svh; }
/* lg-up */
.i-video {
  clip-path: polygon(0 100svh, 100% 100svh, 100% 100%, 0 100%);
  height: 600svh;
  margin-top: -200svh;
}
```

**DOM skeleton:**

```text
#i-video
  .i-anchor [data-themed-class=ui-dark]
  .sticky__layer.sticky__layer--sticky
    .background [scale 1→1.2]
    .i-video__video-wrapper [pattern=videoTranslate] sm-down
      .i-video__video [pattern=videoZoom]
        posters + Vimeo iframes (desktop 1086359103 / mobile 1086359033)
    .i-video__text-container [pattern=videoTitle]
      .i-video__text + .i-video__title.h0
    .i-video__image [pattern=videoImage]  /* gym still cover */
    .i-video__caption [pattern=videoCaptionMoveUp] data-distance="1"
      title + text + CTA
```

**Sticks:** full sticky layer 100svh.  
**Scrolls:** long runway drives zoom (0.29→1), title fade, image cover clip, caption clip+translate up.

**Handoff → `#i-slider`:** under-next; slider has under-previous + under-next.

---

### 7.3 `#i-slider` — Amenities feature carousel (desktop)

**Root classes:**

```html
class="ui-dark i-slider sticky sticky--full-height sticky--under-next sticky--under-next:lg-up sticky--under-previous sticky--under-previous:lg-up is-hidden--md-down"
id="i-slider"
```

**Height:**

```css
.i-slider { height: 600svh; }
.sticky--under-previous + .i-slider { clip-path: none; }
.i-slider__content { height: calc(100 * var(--svh)); }
```

**DOM skeleton:**

```text
#i-slider
  .sticky__layer.sticky__layer--sticky
    .i-slider__content.row [pattern=infrastructureSliderScroll]
      .i-slider__caption.col.col--md-6.ui-background.ui-dark
        [clip-path bottom→full]
        .i-slider__gradient.blur-fix > 3 divs (olive / blue / dark-blue)
        .js-slider-content [contentAnimation] items 1–4
        .i-slider__scrollbar > .js-scroll-progress-line
      .i-slider__images.col.col--md-6.parallax-image-move
        stacked image slides with per-slide clip+scale keyframes
```

**Pattern `infrastructureSliderScroll` (md-up):**

- Progress `0 → 1` over `parallax-0-0` … `parallax-200-100`
- Updates `.js-scroll-progress-line` height to `progress * 100%`
- Opens `contentAnimation` item by progress buckets

**Mobile:** separate `.i-slider__mobile-scrollable-container.is-hidden--lg-up` (not sticky 600svh).

**Handoff → `#i-opening`:** slider under-next; opening uses `sticky--under-previous--after-next:lg-up`.

---

### 7.4 `#i-opening` — Riverside Promenade (**deep detail**)

This is the hardest layout handoff. Rebuild literally.

#### Root

```html
class="ui-dark i-opening sticky sticky--under-previous sticky--under-previous--after-next:lg-up sticky--under-next sticky--full-height"
id="i-opening"
data-themed-class="ui-dark"
data-scroll-snap-point='[
  { "viewport": -100, "element": 0, "scrollable": true },
  { "viewport": 200, "element": 100 }
]'
```

#### Heights / clip

```css
.i-opening { height: 250svh; position: relative; }

/* lg-up */
.i-opening {
  clip-path: none;
  height: 400svh;
  min-height: 2700px;
}
.has-hover .i-opening { overflow: hidden; }

.i-opening .sticky__layer--sticky {
  pointer-events: none;
  z-index: 2;
}
.i-opening__caption__title { pointer-events: all; }

/* lg-up — THE critical right-column spacer */
.i-opening__right-column { padding-top: 100svh; }

/* lg-up list spacing */
.i-opening__list-item { margin-top: calc(var(--scale-px) * 15); }
```

Mobile:

```css
/* md-down */
.i-opening { pointer-events: none; z-index: 4; }
.i-opening__caption__text-mobile { padding-top: 70svh; }
```

#### Two-layer sticky grid (essential)

```text
#i-opening.sticky  (grid area sticky_content)
│
├─ LAYER A — STICKY (pins)
│    .sticky__layer.sticky__layer--sticky.sticky--full-height
│    data-scroll data-scroll-sticky data-scroll-target="#i-opening"
│    └── .i-opening__content.row
│         ├── .i-opening__images.col.col--xs-4.col--lg-6
│         └── .i-opening__caption.col.col--xs-4.col--lg-6
│
└─ LAYER B — NOT sticky (scrolls in same grid cell)
     .sticky__layer.ui-background.is-hidden--md-down.i-opening__right-column
     └── .col.col--lg-6.offset--lg-6.pt-2.5
          ├── .i-opening__caption__text
          └── .mt-5
               ├── .i-opening__list-item (card 1) "Luscious trees"
               ├── .i-opening__list-item (card 2) "Decorative flowerbeds"
               └── .i-opening__list-item (card 3) "Botanical zones"
```

**What sticks:** Layer A (left image + left caption title + blue gradient) — full viewport height.  
**What scrolls:** Layer B (right beige/dark panel copy + 3 cards). Because both share `grid-area: sticky_content`, the right column scrolls *over/through* the pinned left while the section runway is 400svh.

`padding-top: 100svh` on `.i-opening__right-column` delays the right content until after the first viewport of the sticky left reveal.

#### Left column parallax (md-up)

**Images wrapper** `.i-opening__images`:

```html
data-parallax-0-0='{"clip-path": "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)"}'
data-parallax--100-0='{"clip-path": "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"}'
```

Reveal: collapsed at bottom → full rect (wipes up).

**Caption panel** `.i-opening__caption`:

```html
data-parallax-0-0='{"clip-path": "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)"}'
data-parallax--100-0='{"clip-path": "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"}'
```

Reveal: collapsed at top → full rect (wipes down).

**Hero image scale** (on `<img>`):

```html
data-parallax-0-0='{"transform": "scale(1.2)"}'
data-parallax--300-0='{"transform": "scale(1.0)"}'
```

**Title** `.i-opening__caption__title` (md-down fade):

```html
data-parallax--100-0='{"opacity": "1", "transform": "translateY(0vh)"}'
data-parallax--150-0='{"opacity": "0", "transform": "translateY(-30vh)"}'
```

**Content height shrink** (md-down on `.i-opening__content`):

```html
data-parallax--100-0='{"height": "100svh"}'
data-parallax--150-0='{"height": "70svh"}'
```

#### Right column clip (md-up) — exact polygons

```html
class="sticky__layer ui-background is-hidden--md-down i-opening__right-column"
data-plugin="parallax"
data-parallax-enable-mq="md-up"
data-parallax-clamp="true"
data-parallax-measure-selector=".sticky"
data-parallax-0-0='{"clip-path": "polygon(50vw 0vh, 100% 0vh, 100% 0vh, 50vw 0vh)"}'
data-parallax--100-0='{"clip-path": "polygon(50vw 100vh, 100% 100vh, 100% 200vh, 50vw 200vh)"}'
data-parallax--101-0='{"clip-path": "polygon(50vw 100vh, 100% 100vh, 100% 350vh, 50vw 350vh)"}'
```

Interpretation:

1. **0:** right half clipped to zero height at top (invisible strip at `50vw`).
2. **--100:** right half opens as a tall vertical band from `100vh` down to `200vh`.
3. **--101:** band extends to `350vh` so scrolling cards remain visible as the runway continues.

Inner structure:

```html
<div class="col col--lg-6 offset--lg-6 pt-2.5">
  <div class="text-t1 … i-opening__caption__text">…</div>
  <div class="mt-5">
    <div class="i-opening__list-item col col--md-2 pl-0.5">…</div> × 3
  </div>
</div>
```

Card chrome:

```css
.i-opening__list-item { position: relative; }
.i-opening__list-item__text {
  bottom: 20px;
  left: 20px;
  position: absolute;
  width: 102px;
  z-index: 1;
}
```

#### Gradient blob

```css
.i-opening__gradient {
  filter: blur(50px);
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  right: 0; top: 0; width: 100%;
  z-index: 1;
}
.i-opening__gradient div:first-child {
  background: radial-gradient(
    circle,
    var(--c-blue) 0,
    rgba(var(--c-blue-rgb), .8) 5%,
    rgba(var(--c-blue-rgb), 0) 62%
  );
  height: 80svh;
  left: -34vw;
  position: absolute;
  top: 31vw;
  width: 80vw;
}
```

#### Mobile fork (after sticky block)

```html
<div class="i-opening__caption__text-mobile is-hidden--lg-up ui-dark ui-background pb-2.5 p-relative">
  … text …
  <ul class="mobile-scrollable mt-2">
    <li class="i-opening__list-item mobile-scrollable__item">…</li> × 3
  </ul>
  <div class="i-opening__gradient blur-fix"><div></div></div>
</div>
```

#### Handoff → `#i-nature`

- Opening has `sticky--under-next`.
- Nature: `sticky--under-previous sticky--under-next` + desktop clip overlap (below).

---

### 7.5 `#i-nature` — Borges / WowHouse quote

**Root:**

```html
class="ui-dark ui-background-light i-nature sticky sticky--full-height sticky--under-previous sticky--under-next"
id="i-nature"
```

*(Class `ui-background-light` appears in clone markup; theme background still resolves via `ui-dark` / `ui-background` tokens. Keep the class string as in clone.)*

**Heights / clip:**

```css
.i-nature { position: relative; }
/* md-down */
.i-nature { height: 300svh; }
/* lg-up */
.i-nature {
  clip-path: polygon(0 100svh, 100% 100svh, 100% 200svh, 0 200svh);
  margin-top: -200svh;
  z-index: 2;
}
.i-nature__content {
  display: flex;
  flex-direction: column;
  height: calc(100 * var(--svh));
  justify-content: flex-end;
}
```

**Sticky layer** pins content; image scales `1.2 → 1.0` (`data-parallax-100-0` → `--200-0`).  
Olive flicker gradient: `var(--c-olive)`.

**Handoff → `#i-interiors`:** under-next into interiors under-previous.

---

### 7.6 `#i-interiors` — Ivy / interiors story

**Root:**

```html
class="ui-light ui-background i-interiors sticky sticky--under-previous sticky--under-previous:lg-up sticky--under-next sticky--under-next:lg-up"
id="i-interiors"
data-scroll-snap-point='[
  { "viewport": -100, "element": 0},
  { "viewport": -200, "element": 0},
  { "viewport": -300, "element": 0},
  { "viewport": -400, "element": 0}
]'
```

**Heights:**

```css
/* lg-up */
.i-interiors { height: 600svh; position: relative; z-index: 2; }
.i-interiors__content { height: 100svh; }
/* md-down */
.i-interiors { height: 350svh; }
```

**Structure:**

```text
#i-interiors
  .sticky__layer.sticky__layer--sticky
    [parallax translateY 0 → -50svh on outer wrapper lg-up]
    .i-interiors__content
      .i-interiors__caption [pattern=interiorsScroll]
        contentAnimation items 1–4 titles
      .i-interiors__text (desktop)
        .i-interiors__images with 3 absolute items (aspect 72/42)
  /* mobile: separate sticky layers per card */
  .i-interiors__images__item-sticky.sticky__layer.sticky__layer--sticky.is-hidden--md-up × 3
```

Desktop images: centered absolute, dim gradients using beige `hsla(38,64%,89%,…)`.  
Pattern drives `contentAnimation("open", i)` across sticky progress.

**Handoff → `#i-forest`.**

---

### 7.7 `#i-forest` — Private Forest Land

**Root:**

```html
class="ui-dark ui-background i-forest sticky sticky--full-height sticky--under-previous sticky--under-next sticky--under-next:lg-up"
id="i-forest"
data-scroll-snap-point='[{ "viewport": 0, "element": 25}, { "viewport": 0, "element": 50}]'
```

**Heights:**

```css
/* lg-up */
.i-forest { height: 400svh; position: relative; z-index: 3; }
/* md-down */
.i-forest { height: 250svh; }
.i-forest__content { height: calc(100 * var(--svh)); }
```

**Contents:** Vimeo backgrounds + caption (`forestCaption` / `forestCaptionOpacity`) + bottom row slider (`forestBottomSlider`) with `contentAnimation` image clips.  
Gradient blob desktop-only (`.i-forest__gradient.is-hidden--md-down`).

**Handoff → `#i-terrace`** via under-next + terrace’s negative margin clip.

---

### 7.8 `#i-terrace` — Terrace plan + pins

**Root:**

```html
class="ui-dark i-terrace p-relative sticky sticky--full-height sticky--under-previous sticky--under-next sticky--under-next:lg-up"
id="i-terrace"
data-scroll-snap-point='[{ "viewport": 0, "element": 33.3}]'
```

**Heights / clip:**

```css
/* lg-up */
.i-terrace {
  clip-path: polygon(0 100svh, 100% 100svh, 100% 100%, 0 100%);
  height: 300svh;
  margin-top: -200svh;
  position: relative;
  z-index: 4;
}
/* md-down */
.i-terrace {
  clip-path: polygon(
    0 calc(100 * var(--svh)),
    100% calc(100 * var(--svh)),
    100% 250svh,
    0 250svh
  );
  height: 350svh;
}
```

Sticky full-bleed terrace image + `.i-terrace__pins` with absolutely positioned `.i-terrace__pin` (`--left` / `--top`) and hover tooltips.

**Handoff → `#i-parking`.**

---

### 7.9 `#i-parking`

**Root:**

```html
class="ui-dark ui-light-background i-parking sticky sticky--full-height sticky--under-previous sticky--under-next sticky--under-next:lg-up"
id="i-parking"
```

**Heights:**

```css
/* lg-up */
.i-parking { height: 390svh; position: relative; z-index: 4; }
/* md-down */
.i-parking { height: 250svh; }
```

Sticky content with `parkingImage` / height shrink on md-down; absolute `.i-parking__text` column on desktop; list items bordered with `var(--t-line)`.

**Handoff → `#i-more`.**

---

### 7.10 `#i-more` — Location teaser

**Root:**

```html
class="ui-dark ui-background-light more-block sticky sticky:lg-up sticky--full-height sticky--under-previous"
id="i-more"
data-plugin="reveal"
```

**Heights / clip (lg-up):**

```css
.more-block {
  clip-path: polygon(0 100svh, 100% 100svh, 100% 100%, 0 100%);
  height: 200svh;
  margin-top: -200svh !important;
  position: relative;
  z-index: 5;
}
.more-block__content { height: 100svh; } /* lg-up */
```

Ends the infrastructure sticky chain; CTA toward Location page. Image scale parallax `1.2 → 1.0`.

---

## 8. Desktop runway summary (lg-up)

| Section | Approx height | Sticky? | Overlap notes |
|---------|---------------|---------|---------------|
| `#i-intro` | `300svh` | yes full | under-next |
| `#i-video` | `600svh`, `margin-top: -200svh` | yes | clip starts at 100svh; under-prev + under-next |
| `#i-slider` | `600svh` | yes | desktop only; under-prev + under-next |
| `#i-opening` | `400svh` / `min-height: 2700px` | left sticky + right scroll | after-next:lg-up; under-next |
| `#i-nature` | clip band + `-200svh` margin | yes | under-prev + under-next |
| `#i-interiors` | `600svh` | yes | under-prev + under-next |
| `#i-forest` | `400svh` | yes | under-prev + under-next |
| `#i-terrace` | `300svh`, `margin-top: -200svh` | yes | clip under previous |
| `#i-parking` | `390svh` | yes | under-prev + under-next |
| `#i-more` | `200svh`, `margin-top: -200svh !important` | sticky:lg-up | under-previous only |

---

## 9. Rebuild rules for `/test-slide`

1. **No inventing** — copy DOM order, class names, sticky modifiers, runway heights, and clip polygons from the clone.
2. **No Hathor color remaps** — keep `#162d24`, `#f5e8d1`, `#e0d1b6`, `#005160`, `#758535`, etc.
3. **No Hathor copy remaps** on the test page — keep Springs English strings while validating layout.
4. **Preserve two-layer opening** — Layer A `sticky__layer--sticky` + Layer B `i-opening__right-column` with `padding-top: 100svh` and the three right-column clip polygons.
5. **Preserve sticky `::after` spacers** — do not replace under-next/previous with ad-hoc margins unless they match the calc formulas.
6. **Respect loco vs sticky** — if using smooth scroll with `has-scroll-smooth`, wire `data-scroll-sticky` + targets; otherwise rely on CSS sticky.
7. **Keep MQ forks** — `is-hidden--md-down` / `is-hidden--lg-up` siblings for slider + opening cards.
8. **Parallax keys are part of the layout** — clip-path / scale / opacity timings are structural, not decoration.
9. **Fonts from clone** — display/serif uses `Victor Serif, Helvetica, Arial, sans-serif` on intro/nature/interiors headings (as in CSS). Do not substitute Hathor display fonts on `/test-slide`.
10. **Protected areas** — this manual is for `/test-slide` only; do not alter `/cruises`, booking, or admin while rebuilding.

---

## 10. Practical rebuild checklist

- [ ] Port `global.css` sticky block + color tokens into scoped `/test-slide` styles  
- [ ] Port `infrastructure.css` section rules (or import extract sheets)  
- [ ] Markup sections `#i-intro` → `#i-more` in order with exact sticky class strings  
- [ ] Wire Locoscroll **or** verify native sticky without `has-scroll-smooth`  
- [ ] Implement parallax engine consuming `data-parallax-*` + named patterns  
- [ ] Verify `#i-opening` desktop: left pin, right scroll, 3 cards, `padding-top: 100svh`, clip polygons  
- [ ] Verify under-next → under-previous handoffs (video under intro, opening after slider, terrace under forest, more under parking)  
- [ ] Check palette: beige page bg `#F5E8D1`, dark panels `#162D24`, olive/blue blobs  
- [ ] Desktop 1440×900 + tablet/phone forks matching Springs MQ, not Hathor breakpoints alone  

---

## 11. Quick reference — sticky class strings per section

```text
#i-intro
  sticky sticky--full-height sticky--under-next sticky--under-next:lg-up

#i-video
  sticky sticky--full-height sticky--under-previous sticky--under-previous:lg-up sticky--under-next

#i-slider
  sticky sticky--full-height sticky--under-next sticky--under-next:lg-up sticky--under-previous sticky--under-previous:lg-up is-hidden--md-down

#i-opening
  sticky sticky--under-previous sticky--under-previous--after-next:lg-up sticky--under-next sticky--full-height

#i-nature
  sticky sticky--full-height sticky--under-previous sticky--under-next

#i-interiors
  sticky sticky--under-previous sticky--under-previous:lg-up sticky--under-next sticky--under-next:lg-up

#i-forest
  sticky sticky--full-height sticky--under-previous sticky--under-next sticky--under-next:lg-up

#i-terrace
  sticky sticky--full-height sticky--under-previous sticky--under-next sticky--under-next:lg-up

#i-parking
  sticky sticky--full-height sticky--under-previous sticky--under-next sticky--under-next:lg-up

#i-more
  sticky sticky:lg-up sticky--full-height sticky--under-previous
```

---

*End of manual. Source of truth remains the clone HTML/CSS under `assets/CLONE. httpssprings.estate/`.*
