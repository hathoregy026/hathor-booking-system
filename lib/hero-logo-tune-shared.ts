import { z } from "zod";
import {
  HATHOR_LOGO_PARTS_VARIANTS,
  isHathorLogoPartsVariant,
  type HathorLogoPartsVariant,
} from "@/lib/hathor-logo-letters";

/** Temporary homepage HATHOR letter tune — will be hardcoded then removed. */
export const HERO_LOGO_TUNE_KEY = "hero-logo-tune";
/** Phone-only logo tune (applied on live site at max-width 767px). */
export const HERO_LOGO_TUNE_MOBILE_KEY = "hero-logo-tune-mobile";

const px = (min: number, max: number) => z.number().min(min).max(max);

export const heroLogoVAlignSchema = z.enum(["top", "middle", "bottom"]);
export type HeroLogoVAlign = z.infer<typeof heroLogoVAlignSchema>;

export const heroLogoPartsVariantSchema = z.enum(HATHOR_LOGO_PARTS_VARIANTS);
export type { HathorLogoPartsVariant };

/** Desktop Book Now slot width — matches live .hero-cta / Discover More. */
export const HATHOR_BTN_SLOT_PX = 200;
export const HATHOR_BTN_HEIGHT_PX = 46;

/** Admin preview viewport — desktop hero is full-bleed 100vw; we mirror 1440px. */
export const HERO_DESKTOP_PREVIEW_WIDTH = 1440;

export const heroLogoTuneSchema = z.object({
  size: z.number().min(0.2).max(2.5),
  /** CSS `bottom` offset (px). Negative lowers / tucks under the cream sheet. */
  y: px(-800, 600),
  ctaNudge: px(-300, 300),
  animDuration: z.number().min(0.2).max(8),
  /** Space from screen left edge to H (left). */
  edgeLeft: px(0, 400),
  /** Space from R to screen right edge. */
  edgeRight: px(0, 400),
  /** Exact px between T and Book Now (no practical dashboard cap). */
  gapTButton: px(-200, 2400),
  /** Exact px between Book Now and right-side H. */
  gapButtonH: px(-200, 2400),
  /** Shared vertical alignment line for all letters (Figma-style). */
  vAlign: heroLogoVAlignSchema,
  /** Exact px between letters (absolute control in the free zone). */
  gapHA: px(-200, 2400),
  gapAT: px(-200, 2400),
  gapHO: px(-200, 2400),
  gapOR: px(-200, 2400),
  /** Extra per-letter vertical nudge after vAlign (px). − up, + down. */
  yH1: px(-300, 300),
  yA: px(-300, 300),
  yT: px(-300, 300),
  yH2: px(-300, 300),
  yO: px(-300, 300),
  yR: px(-300, 300),
  /**
   * Letter colour set. Default `current` = existing live WebPs.
   * `regular` / `white` / `empty-bg` swap images only — same seats, gaps, and animation.
   */
  partsVariant: heroLogoPartsVariantSchema,
});

export type HeroLogoTune = z.infer<typeof heroLogoTuneSchema>;

/** Locked live baseline — forced from dashboard Save 2026-07-19. */
export const DEFAULT_HERO_LOGO_TUNE: HeroLogoTune = {
  size: 0.8,
  y: -200,
  ctaNudge: 20,
  animDuration: 2,
  edgeLeft: 3,
  edgeRight: 3,
  gapTButton: 24,
  gapButtonH: 24,
  vAlign: "middle",
  gapHA: 10,
  gapAT: 10,
  gapHO: 15,
  gapOR: 15,
  yH1: 0,
  yA: 0,
  yT: 0,
  yH2: 0,
  yO: 0,
  yR: 0,
  partsVariant: "current",
};

/**
 * Phone/tablet baseline — desktop y:-200 tucks under the cream sheet and
 * fully clips the logo + Book Now under overflow:hidden below ~810px width.
 */
export const DEFAULT_HERO_LOGO_TUNE_MOBILE: HeroLogoTune = {
  ...DEFAULT_HERO_LOGO_TUNE,
  size: 0.8,
  y: 24,
  ctaNudge: 8,
  gapTButton: 8,
  gapButtonH: 8,
  gapHA: 4,
  gapAT: 4,
  gapHO: 5,
  gapOR: 5,
};

/** Keep logo + CTA inside the hero on narrow screens. */
export function ensurePhoneHeroLogoVisible(tune: HeroLogoTune): HeroLogoTune {
  return {
    ...tune,
    y: Math.min(48, Math.max(tune.y, 20)),
    size: Math.min(0.86, Math.max(tune.size, 0.72)),
    ctaNudge: Math.min(12, Math.max(tune.ctaNudge, -4)),
    edgeLeft: Math.min(8, Math.max(tune.edgeLeft, 0)),
    edgeRight: Math.min(8, Math.max(tune.edgeRight, 0)),
    gapTButton: Math.min(10, Math.max(tune.gapTButton, 2)),
    gapButtonH: Math.min(10, Math.max(tune.gapButtonH, 2)),
    gapHA: Math.min(8, Math.max(tune.gapHA, 2)),
    gapAT: Math.min(8, Math.max(tune.gapAT, 2)),
    gapHO: Math.min(8, Math.max(tune.gapHO, 2)),
    gapOR: Math.min(8, Math.max(tune.gapOR, 2)),
    yH1: Math.min(8, Math.max(tune.yH1, -8)),
    yA: Math.min(8, Math.max(tune.yA, -8)),
    yT: Math.min(8, Math.max(tune.yT, -8)),
    yH2: Math.min(8, Math.max(tune.yH2, -8)),
    yO: Math.min(8, Math.max(tune.yO, -8)),
    yR: Math.min(8, Math.max(tune.yR, -8)),
  };
}

const VALIGN_FLEX: Record<HeroLogoVAlign, string> = {
  top: "flex-start",
  middle: "center",
  bottom: "flex-end",
};

const VALIGN_OBJECT: Record<HeroLogoVAlign, string> = {
  top: "top center",
  middle: "center center",
  bottom: "bottom center",
};

function asFiniteNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

export function parseHeroLogoTune(raw: unknown): HeroLogoTune {
  const src =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  const legacyCenter = asFiniteNumber(src.centerGap);
  const migratedWing =
    legacyCenter != null
      ? Math.max(0, Math.round((legacyCenter - HATHOR_BTN_SLOT_PX) / 2))
      : undefined;

  const legacyEdge = asFiniteNumber(src.edgeInset);

  const vAlignRaw = src.vAlign ?? src.align;
  const vAlign: HeroLogoVAlign =
    vAlignRaw === "top" || vAlignRaw === "middle" || vAlignRaw === "bottom"
      ? vAlignRaw
      : vAlignRaw === "center"
        ? "middle"
        : DEFAULT_HERO_LOGO_TUNE.vAlign;

  const candidate: HeroLogoTune = {
    size: asFiniteNumber(src.size) ?? DEFAULT_HERO_LOGO_TUNE.size,
    y: asFiniteNumber(src.y) ?? DEFAULT_HERO_LOGO_TUNE.y,
    ctaNudge: asFiniteNumber(src.ctaNudge) ?? DEFAULT_HERO_LOGO_TUNE.ctaNudge,
    animDuration:
      asFiniteNumber(src.animDuration) ?? DEFAULT_HERO_LOGO_TUNE.animDuration,
    edgeLeft:
      asFiniteNumber(src.edgeLeft) ??
      legacyEdge ??
      DEFAULT_HERO_LOGO_TUNE.edgeLeft,
    edgeRight:
      asFiniteNumber(src.edgeRight) ??
      legacyEdge ??
      DEFAULT_HERO_LOGO_TUNE.edgeRight,
    gapTButton:
      asFiniteNumber(src.gapTButton) ??
      migratedWing ??
      DEFAULT_HERO_LOGO_TUNE.gapTButton,
    gapButtonH:
      asFiniteNumber(src.gapButtonH) ??
      migratedWing ??
      DEFAULT_HERO_LOGO_TUNE.gapButtonH,
    vAlign,
    gapHA: asFiniteNumber(src.gapHA) ?? DEFAULT_HERO_LOGO_TUNE.gapHA,
    gapAT: asFiniteNumber(src.gapAT) ?? DEFAULT_HERO_LOGO_TUNE.gapAT,
    gapHO: asFiniteNumber(src.gapHO) ?? DEFAULT_HERO_LOGO_TUNE.gapHO,
    gapOR: asFiniteNumber(src.gapOR) ?? DEFAULT_HERO_LOGO_TUNE.gapOR,
    yH1: asFiniteNumber(src.yH1) ?? DEFAULT_HERO_LOGO_TUNE.yH1,
    yA: asFiniteNumber(src.yA) ?? DEFAULT_HERO_LOGO_TUNE.yA,
    yT: asFiniteNumber(src.yT) ?? DEFAULT_HERO_LOGO_TUNE.yT,
    yH2: asFiniteNumber(src.yH2) ?? DEFAULT_HERO_LOGO_TUNE.yH2,
    yO: asFiniteNumber(src.yO) ?? DEFAULT_HERO_LOGO_TUNE.yO,
    yR: asFiniteNumber(src.yR) ?? DEFAULT_HERO_LOGO_TUNE.yR,
    partsVariant: isHathorLogoPartsVariant(src.partsVariant)
      ? src.partsVariant
      : DEFAULT_HERO_LOGO_TUNE.partsVariant,
  };

  const parsed = heroLogoTuneSchema.safeParse(candidate);
  if (parsed.success) return parsed.data;

  /* Never wipe a whole save — clamp each field independently. */
  const clamp = (
    n: number | undefined,
    min: number,
    max: number,
    fallback: number,
  ) => {
    const v = n ?? fallback;
    if (!Number.isFinite(v)) return fallback;
    return Math.min(max, Math.max(min, v));
  };

  return {
    size: clamp(candidate.size, 0.2, 2.5, DEFAULT_HERO_LOGO_TUNE.size),
    y: clamp(candidate.y, -800, 600, DEFAULT_HERO_LOGO_TUNE.y),
    ctaNudge: clamp(candidate.ctaNudge, -300, 300, DEFAULT_HERO_LOGO_TUNE.ctaNudge),
    animDuration: clamp(
      candidate.animDuration,
      0.2,
      8,
      DEFAULT_HERO_LOGO_TUNE.animDuration,
    ),
    edgeLeft: clamp(candidate.edgeLeft, 0, 400, DEFAULT_HERO_LOGO_TUNE.edgeLeft),
    edgeRight: clamp(candidate.edgeRight, 0, 400, DEFAULT_HERO_LOGO_TUNE.edgeRight),
    gapTButton: clamp(candidate.gapTButton, -200, 2400, DEFAULT_HERO_LOGO_TUNE.gapTButton),
    gapButtonH: clamp(candidate.gapButtonH, -200, 2400, DEFAULT_HERO_LOGO_TUNE.gapButtonH),
    vAlign: candidate.vAlign,
    gapHA: clamp(candidate.gapHA, -200, 2400, DEFAULT_HERO_LOGO_TUNE.gapHA),
    gapAT: clamp(candidate.gapAT, -200, 2400, DEFAULT_HERO_LOGO_TUNE.gapAT),
    gapHO: clamp(candidate.gapHO, -200, 2400, DEFAULT_HERO_LOGO_TUNE.gapHO),
    gapOR: clamp(candidate.gapOR, -200, 2400, DEFAULT_HERO_LOGO_TUNE.gapOR),
    yH1: clamp(candidate.yH1, -300, 300, DEFAULT_HERO_LOGO_TUNE.yH1),
    yA: clamp(candidate.yA, -300, 300, DEFAULT_HERO_LOGO_TUNE.yA),
    yT: clamp(candidate.yT, -300, 300, DEFAULT_HERO_LOGO_TUNE.yT),
    yH2: clamp(candidate.yH2, -300, 300, DEFAULT_HERO_LOGO_TUNE.yH2),
    yO: clamp(candidate.yO, -300, 300, DEFAULT_HERO_LOGO_TUNE.yO),
    yR: clamp(candidate.yR, -300, 300, DEFAULT_HERO_LOGO_TUNE.yR),
    partsVariant: candidate.partsVariant,
  };
}

export function heroLogoTuneToCssVars(tune: HeroLogoTune): Record<string, string> {
  const logoH = `calc((100vw - ${HATHOR_BTN_SLOT_PX}px) / 2 * 2200 / 2683 * ${tune.size})`;
  return {
    "--hathor-logo-size": String(tune.size),
    /* Keep letter-width math + mobile-touch.css in sync with Size edits */
    "--hathor-logo-h": logoH,
    "--hathor-logo-y": `${tune.y}px`,
    "--hathor-logo-bottom": `${tune.y}px`,
    "--hathor-cta-y-nudge": `${tune.ctaNudge}px`,
    "--hathor-logo-anim-duration": String(tune.animDuration),
    "--hathor-logo-edge-l": `${tune.edgeLeft}px`,
    "--hathor-logo-edge-r": `${tune.edgeRight}px`,
    "--hathor-logo-gap": `${HATHOR_BTN_SLOT_PX}px`,
    "--hathor-btn-slot": `${HATHOR_BTN_SLOT_PX}px`,
    "--hathor-gap-t-btn": `${tune.gapTButton}px`,
    "--hathor-gap-btn-h": `${tune.gapButtonH}px`,
    "--hathor-logo-align-items": VALIGN_FLEX[tune.vAlign],
    "--hathor-logo-object-position": VALIGN_OBJECT[tune.vAlign],
    "--hathor-gap-ha": `${tune.gapHA}px`,
    "--hathor-gap-at": `${tune.gapAT}px`,
    "--hathor-gap-ho": `${tune.gapHO}px`,
    "--hathor-gap-or": `${tune.gapOR}px`,
    "--hathor-y-h1": `${tune.yH1}px`,
    "--hathor-y-a": `${tune.yA}px`,
    "--hathor-y-t": `${tune.yT}px`,
    "--hathor-y-h2": `${tune.yH2}px`,
    "--hathor-y-o": `${tune.yO}px`,
    "--hathor-y-r": `${tune.yR}px`,
  };
}

/** Beats stylesheet cascade so Save → live always shows. */
export function heroLogoTuneToImportantCss(tune: HeroLogoTune): string {
  const vars = heroLogoTuneToCssVars(tune);
  const rootBody = Object.entries(vars)
    .map(([key, value]) => `  ${key}: ${value} !important;`)
    .join("\n");

  return `
html[data-ex-experience] .ex-root,
html[data-ex-experience] .ex-root .home-hero-container,
.public-site .home-hero-container,
.public-site .home-hero-container:has(.hero-logo-mark--split) {
${rootBody}
}
html[data-ex-experience] .ex-root .hathor-logo-split.hero-logo-img,
html[data-ex-experience] .ex-root .hathor-logo-split,
.public-site .home-hero-container .hathor-logo-split.hero-logo-img,
.public-site .home-hero-container .hathor-logo-split {
  height: var(--hathor-logo-h) !important;
}
html[data-ex-experience] .ex-root .hero-logo-mark--split,
.public-site .home-hero-container .hero-logo-mark--split {
  bottom: ${tune.y}px !important;
}
html[data-ex-experience] .ex-root .hathor-logo-split__side--left,
.public-site .home-hero-container .hathor-logo-split__side--left {
  padding-left: ${tune.edgeLeft}px !important;
  padding-right: 0 !important;
  overflow: hidden !important;
}
html[data-ex-experience] .ex-root .hathor-logo-split__side--right,
.public-site .home-hero-container .hathor-logo-split__side--right {
  padding-left: 0 !important;
  padding-right: ${tune.edgeRight}px !important;
  overflow: hidden !important;
}
html[data-ex-experience] .ex-root .home-hero-container:has(.hero-logo-mark--split) .hero-button,
.public-site .home-hero-container:has(.hero-logo-mark--split) .hero-button {
  bottom: calc(${tune.y}px + (var(--hathor-logo-h) / 2) - 26px + ${tune.ctaNudge}px) !important;
}
`.trim();
}

/**
 * Phone/tablet logo CSS with hard visual bounds.
 *
 * Saved dashboard values may be valid on a 1440px hero yet impossible inside
 * a 320px viewport. This keeps the same split HAT · CTA · HOR composition while
 * guaranteeing that all six letters and the CTA fit at 320–1024px.
 */
export function heroLogoTuneToNarrowImportantCss(tune: HeroLogoTune): string {
  const safe = ensurePhoneHeroLogoVisible(tune);
  const sizeFactor = safe.size / 0.8;
  const logoHeight = `clamp(52px, calc(13vw * ${sizeFactor}), 120px)`;
  const centerSlot = "clamp(156px, 22vw, 220px)";
  const bottom = "max(20px, env(safe-area-inset-bottom))";
  const vars: Record<string, string> = {
    ...heroLogoTuneToCssVars(safe),
    "--hathor-logo-h": logoHeight,
    "--hathor-logo-y": bottom,
    "--hathor-logo-bottom": bottom,
    "--hathor-logo-gap": centerSlot,
    "--hathor-btn-slot": centerSlot,
  };
  const rootBody = Object.entries(vars)
    .map(([key, value]) => `  ${key}: ${value} !important;`)
    .join("\n");

  return `
html[data-ex-experience] .ex-root,
html[data-ex-experience] .ex-root .home-hero-container,
.public-site .home-hero-container,
.public-site .home-hero-container:has(.hero-logo-mark--split) {
${rootBody}
}
html[data-ex-experience] .ex-root .hathor-logo-split.hero-logo-img,
html[data-ex-experience] .ex-root .hathor-logo-split,
.public-site .home-hero-container .hathor-logo-split.hero-logo-img,
.public-site .home-hero-container .hathor-logo-split {
  height: var(--hathor-logo-h) !important;
}
html[data-ex-experience] .ex-root .hero-logo-mark--split,
.public-site .home-hero-container .hero-logo-mark--split {
  bottom: ${bottom} !important;
}
html[data-ex-experience] .ex-root .hathor-logo-split__side--left,
.public-site .home-hero-container .hathor-logo-split__side--left {
  padding-left: ${safe.edgeLeft}px !important;
  padding-right: 0 !important;
  overflow: hidden !important;
}
html[data-ex-experience] .ex-root .hathor-logo-split__side--right,
.public-site .home-hero-container .hathor-logo-split__side--right {
  padding-left: 0 !important;
  padding-right: ${safe.edgeRight}px !important;
  overflow: hidden !important;
}
html[data-ex-experience] .ex-root .home-hero-container:has(.hero-logo-mark--split) .hero-button,
.public-site .home-hero-container:has(.hero-logo-mark--split) .hero-button {
  bottom: calc(${bottom} + (var(--hathor-logo-h) / 2) - 26px + ${safe.ctaNudge}px) !important;
}
`.trim();
}

/** Apply tune vars directly on DOM nodes (bypasses stylesheet fights). */
export function applyHeroLogoTuneToElement(
  el: HTMLElement | null | undefined,
  tune: HeroLogoTune,
): void {
  if (!el) return;
  const vars = heroLogoTuneToCssVars(tune);
  for (const [key, value] of Object.entries(vars)) {
    el.style.setProperty(key, value, "important");
  }
}

export function isHeroLogoTuneEqual(a: HeroLogoTune, b: HeroLogoTune): boolean {
  return (Object.keys(DEFAULT_HERO_LOGO_TUNE) as (keyof HeroLogoTune)[]).every(
    (key) => a[key] === b[key],
  );
}
