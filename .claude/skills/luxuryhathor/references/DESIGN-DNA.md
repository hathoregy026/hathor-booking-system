# LuxuryHathor Design DNA

## Contents

1. Definition
2. Fixed DNA and variable expression
3. Visual foundations
4. Exact scroll signature
5. Generative composition method
6. Compositional primitives
7. Responsive transformation
8. Interaction and imagery
9. Originality guardrails
10. Layout integrity
11. Acceptance standard

## 1. Definition

LuxuryHathor is a generative art-direction system distilled from the live About and Contact pages. It is not a component template and not a library of pages to duplicate.

Its character is warm Egyptian luxury expressed through museum-catalogue restraint, fashion-editorial typography, asymmetric image direction, spacious pacing, and quiet cinematic motion.

The references demonstrate how the system behaves. A new page must share their visual genetics while forming its own silhouette around its content.

## 2. Fixed DNA and variable expression

### Fixed DNA

Keep these consistent across LuxuryHathor pages:

- Typography families and role hierarchy
- Paper, ink, warm neutral washes, and gold accent
- Fractional grid logic and generous spatial bands
- Desktop vertical-scroll-driven horizontal storytelling
- `950px` switch to vertical document flow
- Clipped text reveals, restrained parallax, and directional image wipes
- Hairline rules, tracked metadata, pill buttons, and animated underlines
- Translucent cream site header treatment
- Custom editorial closing act instead of a generic footer interruption
- Reduced-motion completion states

### Variable expression

Invent these from the target content:

- Number and order of scenes
- Scene widths and negative space
- Dominant layout geometry
- Image ratios, crop positions, pairings, and overlaps
- Balance of display type, editorial serif, metadata, and body copy
- Information devices: ledger, index, chronology, quote field, specification wall, visual essay, route line, archive, or another content-native idea
- Wash sequence and dramatic pauses
- CTA timing and epilogue composition

Consistency comes from shared rules, not identical arrangements.

## 3. Visual foundations

### Palette

Gold is the only accent. Apply color at scene scale more often than component scale.

```css
:root {
  --lh-paper: #ece4da;
  --lh-paper-warm: #f3ede4;
  --lh-ink: #14120e;
  --lh-ink-soft: #4a453c;
  --lh-gold: #b69f64;
  --lh-gold-deep: #806b35;
  --lh-wash-sand: #ded4c6;
  --lh-wash-stone: #cfc7ba;
  --lh-wash-olive: #adaa8a;
  --lh-black: #0b0a08;
  --lh-hairline: rgb(20 18 14 / 16%);
}
```

Use paper as the primary ground. Alternate warm paper, sand, stone, olive, or near-black to shape narrative rhythm. Use deep gold for small emphasis. Avoid pure white, generic gray, blue, indigo, and purple.

### Typography

Display:

- `Italiana`, existing Hathor display fallback, serif
- Uppercase, weight `400`, line-height near `0.86`, slightly negative tracking
- XL `clamp(3.1rem, 9.4vw, 11rem)`
- Large `clamp(2.5rem, 6.6vw, 7.6rem)`
- Medium near `clamp(1.9rem, 4vw, 4.4rem)`
- Use for dominant titles, names, and scene-scale words

Editorial serif:

- `Playfair Display`
- Weight `300`; italic where appropriate
- Use for lyrical statements, numerals, counts, and eyebrows

Metadata and utility:

- Existing Hathor body family with `Piloner Thin` behavior
- Approximately `clamp(0.66rem, 0.72vw, 0.8rem)`
- Uppercase with `0.14em–0.22em` tracking
- Use for navigation, captions, buttons, specifications, labels, and legal text

Support copy:

- Use `Rollgates Luxury Italic` where shared editorial chrome applies it
- `clamp(0.875rem, 0.95vw, 1.0625rem)` with line-height near `1.55`
- Keep paragraphs narrow and intentionally placed

Do not introduce a monospace family. Do not make every heading Italiana; role contrast creates the editorial richness.

### Grid and rhythm

```css
:root {
  --lh-pad: clamp(1rem, 2.4vw, 2.6rem);
  --lh-gap: clamp(0.75rem, 1.5vw, 1.5rem);
  --lh-col: calc((100vw - (var(--lh-pad) * 2) - (var(--lh-gap) * 11)) / 12);
  --lh-band: clamp(3.5rem, 9vw, 11rem);
  --lh-ease-soft: cubic-bezier(0.22, 0.61, 0.36, 1);
}
```

Use the 12-column calculation as a proportional language, not a fixed wireframe. Vary scene width. Alternate density and silence. Prefer unequal columns and purposeful offsets over centered containers and equal grids.

## 4. Exact scroll signature

The horizontal story is fixed DNA, not an optional decorative effect.

### Desktop activation

Activate when viewport width is greater than `950px` and reduced motion is not requested.

Structure:

```text
scroll runway
└── sticky stage: top 0; height 100svh; overflow hidden
    └── horizontal flex track: width max-content; height 100%
        └── original page-specific scenes with varied widths
```

Use the reference mechanics:

```text
travel = max(1, track.scrollWidth - window.innerWidth)
scrollDistance = max(1, travel * 0.74)
run.height = scrollDistance + window.innerHeight
target = clamp(-run.getBoundingClientRect().top / scrollDistance)
current += (target - current) * 0.14
x = current * travel
track.transform = translate3d(-x, 0, 0)
```

Update every scene from the same horizontal position:

```text
left = scene.offsetLeft - x
width = scene.offsetWidth
reveal = clamp((viewportWidth * 0.96 - left) / max(viewportWidth * 0.5, width * 0.35))
parallax = clamp((viewportWidth - left) / max(1, viewportWidth + width))
focus = max(0, sin(parallax * PI))
```

Write `--reveal`, `--parallax`, `--scene-progress`, and `--focus` per scene. Drive directional image flips from their viewport position. Scale the fixed two-pixel gold progress line from `current` with left transform origin.

Use passive scroll/resize listeners, `requestAnimationFrame`, font-ready remeasurement, cleanup, and width-change handling. Ensure all travel completes before the normal-flow epilogue begins.

The constants above define the reference feel. Change them only when testing proves a target page's total travel makes the experience unusable; document any change.

### Tablet, phone, and reduced motion

At `950px` and below, or under reduced motion:

- Set runway height to auto
- Remove sticky pinning and horizontal transforms
- Make the track a normal block
- Calculate reveal/parallax variables from each scene's vertical viewport position
- Hide or reset horizontal progress where appropriate
- Preserve all content and visual hierarchy

Reduced motion must show completed text and image states without forced animation.

## 5. Generative composition method

### Start from meaning

Identify:

- The page's central promise
- The visitor's questions
- The information that deserves scale
- The evidence best carried by imagery
- The decision or action the page should produce

Turn those into a page-specific narrative arc. Do not begin by choosing About or Contact sections.

### Compose cadence

Build contrast across the horizontal journey:

- Type-dominant versus image-dominant
- Wide versus narrow scene
- Dense information versus visual pause
- Paper versus deeper wash
- Single focal point versus layered composition

Avoid repeating the same geometry in adjacent scenes. Avoid using every available primitive.

### Create a unique entry

The opening remains typography-led rather than a conventional photo hero, but its composition is variable. It may use split title placement, vertical indexing, a typographic field, cropped edge imagery, a specification fragment, or another content-native arrangement.

Required traits:

- Paper-based first impression
- Oversized Italiana hierarchy
- Small tracked metadata/navigation
- Clear horizontal-scroll cue on desktop
- No retained legacy hero above it

Do not duplicate the exact About/Contact intro layout, line breaks, rotated-nav position, or bottom labels by default.

### Create a unique ending

Return from horizontal travel to a normal vertical editorial close. Design the epilogue for the page's action: reservation, enquiry, exploration, article continuation, partner contact, or another purpose. Keep the shared type, palette, form, button, and legal language without copying either reference epilogue.

## 6. Compositional primitives

These are ingredients, not templates or a checklist.

### Layered image field

Combine one dominant crop with one or more smaller frames. Vary their axis, size, and overlap according to the content. Reveal secondary imagery with directional clipping rather than fading.

### Typographic field

Use a scene-scale Italiana word or multi-line Playfair statement with deliberately placed metadata. Create original line breaks and offsets from the target message.

### Editorial ledger

Organize repeated information with hairline rules, small numbering, strong display words, restrained details, and optional uniform actions. Adapt columns to the actual data rather than copying Contact rows or About principles.

### Framed datum

Place a key number, date, specification, quotation, or location inside a sparse outlined field. Corner metadata is available, but its number and placement should follow the content.

### Asymmetric visual essay

Pair unequal images and narrow copy across a deliberately broken grid. Vary crop ratios and vertical offsets so the composition belongs to this page.

### Immersive presentation

Use a large image and a color-wash information plane for one important subject. Metadata and action can orbit the focal title without reproducing the About accommodation cards.

### Quiet bridge

Use negative space, a single image, or a restrained phrase to reset pacing before a dense scene or the epilogue.

Create a new primitive when the target content demands it, provided it uses the fixed typography, palette, grid, motion, and interaction rules.

## 7. Responsive transformation

At `950px` and below:

- Convert the experience into a deliberate vertical document
- Recompose scenes instead of merely stacking desktop coordinates
- Unrotate navigation and metadata that would harm reading
- Remove fractional line indents that crowd the viewport
- Turn absolute overlaps into controlled negative-margin layers
- Remove unsuitable viewport-height caps
- Convert multi-column closings to one column

At `620px` and below:

- Reduce display scales with fluid clamps
- Collapse complex ledgers to a number rail plus content column
- Convert corner-pinned metadata into readable flow when necessary
- Let CTA groups fill available width
- Retain asymmetry only where it remains legible

At `480px` and below:

- Use approximately `1.25rem` gutters
- Keep support copy in flow and left aligned
- Prevent titles, navigation, legal links, and CTA groups from overflowing

Mobile must feel intentionally art-directed, not like a disabled desktop effect.

## 8. Interaction and imagery

### Images

- Use optimized site imagery and deliberate `object-fit: cover` crops
- Choose aspect ratios for the composition; reference ratios are examples, not mandatory templates
- Scale near `1.06` to protect parallax edges
- Keep parallax travel around four percent
- Use `clip-path: inset(...)` for directional swaps and reveals
- Avoid carousels, automatic sliders, glass panels, and arbitrary zoom

### Buttons

- One-pixel ink border
- Fully rounded pill derived from vertical padding
- Thin uppercase metadata face near `0.14em` tracking
- Transparent default with a corner-origin sliding ink fill
- Solid ink variant may transition to gold
- Keep peer actions consistently sized

### Links

Use a one-pixel underline that grows from zero to full width. Do not rely only on opacity changes.

### Forms

Use transparent surfaces, bottom rules, restrained labels, and editorial spacing. Avoid boxed dashboard inputs.

## 9. Originality guardrails

Never:

- Copy full JSX sections, CSS blocks, class namespaces, content, or scene order from About or Contact
- Treat the reference primitives as required sections
- Produce multiple unrelated pages from one generic composition with swapped content
- Preserve a legacy conventional hero
- Substitute `PublicSiteHero` or the Venetian hero transition
- Use equal card grids, uniform rounded cards, glassmorphism, or default Tailwind styling
- Introduce a new palette or font pairing
- Call a recolor or typography swap a LuxuryHathor redesign

Use two tests:

Family test: obscure the text. The palette, typography hierarchy, motion, spacing, and interactions should still identify Hathor.

Originality test: obscure the text. The page silhouette and scene rhythm should not be mistaken for About or Contact.

## 10. Layout integrity

Read and enforce [LAYOUT-INTEGRITY.md](LAYOUT-INTEGRITY.md). It defines the required alignment system, text-safe areas, image roles, stack rules, uniform controls, horizontal clipping prevention, and viewport QA. A composition is not LuxuryHathor if its drama depends on accidental overlap or clipped content.

## 11. Acceptance standard

- The target content determines the narrative and composition
- The opening is typography-led but not cloned
- Desktop uses the exact rightward horizontal scroll signature
- The horizontal sequence has varied, content-driven widths and cadence
- Tablet and phone are deliberately recomposed vertically
- Typography roles remain distinct
- Imagery is asymmetric, carefully cropped, and quietly animated
- Buttons, links, header, and closing share the established language
- Text, images, buttons, and scene edges follow explicit visual anchors
- All essential content is fully visible at its scene's focus point
- There are no accidental collisions at any required viewport
- Peer buttons have identical boxes and aligned labels
- Mobile stacks preserve hierarchy without negative-margin collisions
- No reference copy, full section, or scene sequence was duplicated
- All original information and actions remain available
- Every viewport is aligned, readable, reachable, and free of horizontal overflow
