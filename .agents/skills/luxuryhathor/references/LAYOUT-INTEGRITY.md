# LuxuryHathor Layout Integrity

## Contents

1. Release gate
2. Alignment contract
3. Text safety
4. Image sizing and placement
5. Overlap and stacking
6. Uniform buttons
7. Horizontal-scene visibility
8. Responsive recomposition
9. Required validation

## 1. Release gate

Do not call a page complete while any of these exist:

- Text touching, crossing, or covering other text
- An image hiding text or an action
- Text visible only partially because of clipping or fixed height
- A button with different height, padding, radius, baseline, or peer width
- Elements aligned by unrelated arbitrary offsets
- Images sized without a declared visual role
- A mobile stack depending on desktop absolute coordinates
- Essential content cut by the viewport while the page scrolls horizontally

Intentional overlap is permitted only when declared in the scene map and proven readable at every viewport.

## 2. Alignment contract

### Declare anchors before styling

For each scene, record:

- Outer scene bounds and safe padding
- Dominant grid columns
- Text column start and end
- Image column start and end
- Shared top, center, baseline, or bottom anchors
- Which element is dominant, supporting, and decorative
- Focus point during horizontal travel
- Vertical reflow order

If two edges appear aligned, make them share the same grid line or token. Do not approximate alignment with unrelated pixel values.

### Use structural layout first

- Use grid or flex for primary text, media, and actions.
- Keep `min-width: 0` on grid/flex children that contain text.
- Keep `box-sizing: border-box` throughout the page.
- Use `gap` for stack rhythm instead of chains of unrelated margins.
- Keep primary content in normal flow.
- Reserve absolute positioning for supporting media, labels, decorative marks, or a tested on-image composition.
- Avoid fixed heights on text containers.
- Avoid transforms for ordinary alignment.

### Spacing rhythm

Derive spacing from a small fluid set:

```css
:root {
  --lh-space-xs: clamp(0.4rem, 0.6vw, 0.7rem);
  --lh-space-s: clamp(0.75rem, 1.1vw, 1.15rem);
  --lh-space-m: clamp(1.2rem, 2vw, 2rem);
  --lh-space-l: clamp(2rem, 4vw, 4rem);
  --lh-control-height: 44px;
  --lh-safe-edge: clamp(1rem, 2.4vw, 2.6rem);
}
```

Use custom offsets only when they create a visible editorial relationship. Name or comment the relationship.

## 3. Text safety

### Text containers

- Give headings and copy explicit column spans or `max-inline-size` values.
- Use `text-wrap: balance` for short display headings and `text-wrap: pretty` for body copy when supported.
- Use `overflow-wrap: anywhere` only for URLs, emails, and unavoidable long tokens.
- Never use `white-space: nowrap` on page titles or body copy.
- Never use line clamping for required page content.
- Never hide required text with `overflow: hidden`; restrict clipping to the outer reveal wrapper around a separate inner line.
- Keep display line-height near the DNA value only at display sizes. Use readable line-height for wrapped text.
- Recheck layout after the actual fonts load; fallback metrics are not proof of fit.

### Text-safe areas

Every essential text/action cluster needs a safe rectangle inside its scene. At the scene's focus point:

- Its full rectangle must be inside the viewport safe edges.
- Its full rectangle must be inside the scene's intended content bounds.
- No non-background image may intersect it unless the scene is explicitly designed as on-image type.
- No other text or action may intersect it.

If a heading wraps differently at a breakpoint, recompose the scene. Do not push neighboring content away with arbitrary translations.

### On-image type exception

Use text over an image only when it is the declared concept. Then:

- Reserve a crop-safe negative-space region in the image.
- Provide sufficient tonal contrast or a restrained approved veil.
- Keep all glyphs away from crop edges and moving overlays.
- Verify every responsive crop and every flip state.
- Move the text out of the image on smaller screens if the safe region disappears.

Z-index alone does not solve readability.

## 4. Image sizing and placement

Assign every image one role before implementation:

- Dominant: carries the scene and receives the largest grid span.
- Supporting: creates counterpoint and stays subordinate in area.
- Detail: small crop used for rhythm or evidence.
- Background: may sit behind content only with a defined text-safe region.
- Transition: bridges two scenes and must not cover either scene's essential content.

For every image define:

- Grid span or proportional width
- Aspect ratio chosen for its subject and role
- Maximum height relative to the usable stage height
- `object-position` for the focal subject
- Mobile ratio and stack position
- Whether overlap is allowed

Do not choose dimensions by visual guessing alone. Align at least one image edge with a text/grid anchor. Keep the size hierarchy obvious: dominant > supporting > detail.

Use `object-fit: cover` only with an inspected crop. Never let an uncontrolled crop remove the image's subject.

## 5. Overlap and stacking

### Default rule

Text, actions, and required metadata do not overlap anything. Images may overlap images when the relationship is deliberate.

### Layer contract

Use a small predictable layer system:

```text
0  scene background
1  dominant media
2  supporting/overlap media
3  primary text and metadata
4  actions and navigation
5  global header/progress when required
```

Do not solve collisions by continually increasing `z-index`. Fix the geometry.

### Approved overlap checklist

An overlap is approved only when:

- It is described in the scene map.
- The covered area is decorative, never required text or an action.
- Both elements retain recognizable shapes.
- The overlap survives all required viewport sizes.
- The mobile version reduces, relocates, or removes the overlap before collision.

Use `isolation: isolate` at scene level so layers cannot unexpectedly cross into neighboring scenes.

## 6. Uniform buttons

Create one page-level button system. Do not hand-style individual buttons.

All peer buttons must share:

- `box-sizing: border-box`
- Minimum height of `44px`
- Identical vertical padding, border width, radius, font, font size, tracking, and line-height
- Centered label alignment
- The same icon gap and icon box when icons are used
- `flex: 0 0 auto` unless the entire group intentionally stretches

Use one width rule per group:

- Content width for unrelated standalone actions
- One shared `min-width` for ledger peers
- Equal grid columns for grouped actions
- Full available width on narrow phones when appropriate

Never mix these width rules inside one peer group. Test the longest translated/real label, not the shortest placeholder.

## 7. Horizontal-scene visibility

The sticky stage clips the track by design; it must not clip essential content when a scene reaches its intended focus point.

### Scene fit

- Keep scene width large enough for its complete grid plus both safe edges.
- Keep essential content clusters within one viewport-safe area at focus.
- Size vertical content against usable height: `100svh` minus header clearance and scene padding.
- If content is too tall, widen or split the scene, reduce decorative media, or change the composition. Do not clip text or add an inner scroll area.
- Account for image overlaps in scene width so they do not trespass into adjacent required content.
- Keep the last scene's trailing safe edge inside the measured track width.

### Measurement lifecycle

Measure horizontal travel only after:

- DOM content is mounted
- `document.fonts.ready` resolves
- Priority images expose stable dimensions or decode

Remeasure on meaningful width/orientation changes and content-size changes. Use `ResizeObserver` where dynamic CMS copy or images can alter geometry. Cancel frames and observers on cleanup.

### Focus-point audit

For every scene, scroll to the point where its essential content is intended to be read and verify:

- Full heading and body rectangles are visible.
- All actions are visible and clickable.
- No glyph is cut by the viewport, scene, media wrapper, or reveal wrapper.
- No essential content is already leaving before its reveal completes.
- The final scene is fully readable before the epilogue begins.

Partially visible neighboring scenes are acceptable; partially visible essential content in the focused scene is not.

## 8. Responsive recomposition

At `950px` and below:

- Return primary content to normal flow.
- Remove desktop absolute coordinates and transforms from text/actions.
- Convert layered media into a tested vertical order.
- Clamp or remove negative margins before they touch text.
- Remove desktop-only fixed heights and max-height cropping.
- Keep consistent left/right gutters across adjacent scenes.

At `620px` and below:

- Use one primary content column plus only necessary metadata rails.
- Stack buttons consistently.
- Let headings wrap naturally within the safe width.
- Move image overlaps after the related text if simultaneous visibility becomes crowded.

Test narrow and short devices separately. A layout that works at `390x844` may fail at `375x667` because vertical space is smaller.

## 9. Required validation

### Viewports

Check at least:

- `1920x1080`
- `1440x900`
- `1024x1366`
- `768x1024`
- `430x932`
- `390x844`
- `375x667`
- `360x800`

### Horizontal sampling

Inspect the desktop experience at:

- Start and end
- Each scene's focus point
- Transitions between every pair of scenes
- At least `25%`, `50%`, and `75%` total progress

### Collision audit

Check bounding rectangles for essential text, actions, and non-background media. Any intersection is a failure unless explicitly approved as on-image type or an image/image overlap.

Check both initial and final states of wipes/reveals. Check after fonts load and after dynamic content appears.

### Alignment audit

- Verify repeated left edges share a real grid line.
- Verify text baselines and image edges have an intentional relationship.
- Verify adjacent scenes use consistent safe edges.
- Verify stacks use shared gaps.
- Verify dominant/supporting image hierarchy is obvious.

### Control audit

Compare computed button rectangles and typography. Peer buttons must have equal heights and follow their declared width rule.

### Completion rule

Do not report success until all required viewports have:

- Zero accidental collisions
- Zero clipped essential content
- Zero unexplained misalignments
- Uniform peer controls
- Deliberate image hierarchy
- Complete horizontal reachability
