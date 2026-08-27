---
name: luxuryhathor
description: Art-direct original, collision-free Hathor pages from the design DNA distilled from the live About and Contact experiences. Use when the user says "use luxuryhathor", "LuxuryHathor", "match About and Contact", or requests the same Hathor editorial feeling. Preserve the exact horizontal scroll behavior, typography, palette, image motion, interactions, alignment discipline, uniform controls, responsive transformation, and complete content visibility while creating a unique content-led composition instead of copying either reference page.
---

# LuxuryHathor

Create an original page that unmistakably belongs to the About/Contact family. Inherit their design logic and scroll behavior; never duplicate their page composition.

## Read before designing

Read these live references completely:

- `components/pages/AboutPageContent.tsx`
- `app/about-editorial.css`
- `hooks/useAboutEditorialFlow.ts`
- `components/pages/ContactPageContent.tsx`
- `app/contact-editorial.css`
- `hooks/useContactEditorialScroll.ts`
- `app/editorial-chrome.css`

Then read both references completely:

- [DESIGN-DNA.md](references/DESIGN-DNA.md)
- [LAYOUT-INTEGRITY.md](references/LAYOUT-INTEGRITY.md)

Study the references as evidence of a system, not as templates. Keep About and Contact unchanged unless the user explicitly asks to edit them.

## Core instruction

Hold two layers separately:

### Fixed DNA

Preserve:

- The desktop vertical-input-to-horizontal-scroll engine
- The `950px` structural switch to natural vertical flow
- Reduced-motion behavior
- The type roles and scale relationships
- The paper, ink, warm-wash, and restrained-gold palette
- Hairline rules, asymmetric image direction, clipped reveals, and wipe motion
- Pill-button and animated-link behavior
- Translucent cream header and custom editorial close
- Collision-free grid alignment, text-safe areas, role-based image sizing, uniform controls, and complete focused-scene visibility

### Original expression

Design uniquely for the target page:

- Scene count and order
- Narrative pacing
- Section geometry and width
- Image count, crop, overlap, and placement
- Which content becomes large type, metadata, a ledger, a visual field, or a quiet pause
- CTA placement within the established interaction language
- Color-wash sequence
- Epilogue content and conversion goal

Do not reproduce the About sequence, Contact sequence, copy, headings, JSX blocks, class names, or complete CSS sections.

## Workflow

### 1. Understand the target

1. Read the full target page and all of its content/data dependencies.
2. Inventory every heading, paragraph, image, CTA, link, list, form, and dynamic state.
3. Identify the page's one narrative idea and primary conversion goal.
4. Preserve all required information; remove legacy presentation, not content.

### 2. Create an original composition map

Before coding, describe each proposed scene in one line:

- Its communication purpose
- Its dominant visual device
- Its width/rhythm in the horizontal story
- Its mobile transformation

Use the compositional primitives in the DNA as ingredients. Combine, alter, or extend them when the result still obeys the fixed DNA. Do not mechanically select one of every reference scene.

Reject the map if:

- Its scene order mirrors About or Contact
- It retains the target's old conventional hero
- It could be reused for a different page by merely swapping text and images
- The content hierarchy was chosen to imitate a reference rather than explain the target

### 3. Implement the system, not the reference page

- Use a page-specific root and scene namespace.
- Reuse shared providers, image handling, content sources, booking triggers, and low-level motion utilities.
- Reuse or extract the horizontal-scroll engine when safe; do not copy an entire reference page component.
- Build original semantic markup for the target content.
- Preserve heading order, accessible labels, link meaning, form behavior, image `alt`, optimized loading, and correct `sizes`.
- When several target pages are explicitly required to share one layout, create one shared composition for those targets only.
- Keep metadata accurate and useful. Never use keyword stuffing or promise rankings.
- Treat [LAYOUT-INTEGRITY.md](references/LAYOUT-INTEGRITY.md) as a release gate, not optional polish.

### 4. Enforce layout integrity

- Keep primary text and actions in grid/flex flow; use absolute positioning mainly for decorative or supporting media.
- Assign every image a composition role and grid relationship before sizing it.
- Define text-safe areas and prevent unapproved image/text intersections.
- Use one shared button geometry and one peer-group width rule.
- Make every essential text/action cluster fully visible when its scene is focused during horizontal travel.
- Recompose crowded layouts at breakpoints; do not merely reduce font sizes.
- Run the collision, clipping, alignment, stack, and control checks in `LAYOUT-INTEGRITY.md` at every required viewport.

Zero accidental overlaps and zero clipped essential content are completion requirements.

### 5. Preserve the exact scroll signature

Above `950px`, when reduced motion is not enabled:

- Pin a `100svh` stage.
- Translate one horizontal scene track from vertical page progress.
- Use the reference travel, runway, interpolation, scene-progress, parallax, focus, flip, and top progress-line behavior documented in the DNA.
- Let scenes have different widths so the story has cadence.
- Finish the full horizontal travel before returning to a normal vertical epilogue.

At `950px` and below, remove pinning and horizontal translation. Render the same content as a deliberate vertical editorial document—not a squeezed desktop strip.

### 6. Verify originality, family resemblance, and layout safety

Check at minimum:

- Desktop: `1440x900`, `1920x1080`
- Tablet: `1024x1366`, `768x1024`
- Phone: `390x844`, `375x667`
- Reduced motion

The page must pass both tests:

- Family test: without reading the words, it still feels like Hathor About/Contact.
- Originality test: without reading the words, it is not mistaken for either About or Contact.

Also verify the full horizontal story is reachable, essential content is fully visible at each scene's focus point, vertical layouts do not overflow, text does not collide, approved overlaps remain intentional, image sizes follow a composition concept, button boxes are consistent, stacks align, and no content or requested route was skipped.

## Prohibitions

- No copy-pasting About or Contact page structure.
- No prescribed About/Contact scene sequence.
- No reused reference copy or headings.
- No conventional photo hero or retained legacy hero.
- No `PublicSiteHero` or Venetian hero transition as a substitute.
- No generic card grids, glass cards, default Tailwind sections, or random decorative gradients.
- No new palette or font pairing.
- No surface-only recolor presented as LuxuryHathor.
- No primary text or CTA positioned with unexplained absolute coordinates.
- No arbitrary image dimensions without a declared role and grid anchor.
- No inconsistent button height, padding, label alignment, or peer width.
- No accidental text/text, text/image, text/button, or button/image intersection.
- No essential content clipped by the sticky stage, scene boundary, viewport edge, or horizontal travel endpoint.

## Completion report

State:

- The target page's original narrative concept
- Which DNA rules stayed fixed
- How the composition differs from About and Contact
- How desktop horizontal flow becomes tablet/phone vertical flow
- Files changed and validations completed
