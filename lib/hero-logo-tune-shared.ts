import { z } from "zod";

/** Temporary homepage HATHOR letter tune — will be hardcoded then removed. */
export const HERO_LOGO_TUNE_KEY = "hero-logo-tune";

const px = (min: number, max: number) => z.number().min(min).max(max);

export const heroLogoVAlignSchema = z.enum(["top", "middle", "bottom"]);
export type HeroLogoVAlign = z.infer<typeof heroLogoVAlignSchema>;

/** Fixed Book Now slot width — matches live .hero-cta. */
export const HATHOR_BTN_SLOT_PX = 168;
export const HATHOR_BTN_HEIGHT_PX = 52;

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
  /** Space between T and the Book Now button. */
  gapTButton: px(-100, 800),
  /** Space between Book Now and the right-side H. */
  gapButtonH: px(-100, 800),
  /** Shared vertical alignment line for all letters (Figma-style). */
  vAlign: heroLogoVAlignSchema,
  /** Space after each letter toward the next (px). */
  gapHA: px(-100, 800),
  gapAT: px(-100, 800),
  gapHO: px(-100, 800),
  gapOR: px(-100, 800),
  /** Extra per-letter vertical nudge after vAlign (px). − up, + down. */
  yH1: px(-300, 300),
  yA: px(-300, 300),
  yT: px(-300, 300),
  yH2: px(-300, 300),
  yO: px(-300, 300),
  yR: px(-300, 300),
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
};

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
    gapTButton: clamp(candidate.gapTButton, -100, 800, DEFAULT_HERO_LOGO_TUNE.gapTButton),
    gapButtonH: clamp(candidate.gapButtonH, -100, 800, DEFAULT_HERO_LOGO_TUNE.gapButtonH),
    vAlign: candidate.vAlign,
    gapHA: clamp(candidate.gapHA, -100, 800, DEFAULT_HERO_LOGO_TUNE.gapHA),
    gapAT: clamp(candidate.gapAT, -100, 800, DEFAULT_HERO_LOGO_TUNE.gapAT),
    gapHO: clamp(candidate.gapHO, -100, 800, DEFAULT_HERO_LOGO_TUNE.gapHO),
    gapOR: clamp(candidate.gapOR, -100, 800, DEFAULT_HERO_LOGO_TUNE.gapOR),
    yH1: clamp(candidate.yH1, -300, 300, DEFAULT_HERO_LOGO_TUNE.yH1),
    yA: clamp(candidate.yA, -300, 300, DEFAULT_HERO_LOGO_TUNE.yA),
    yT: clamp(candidate.yT, -300, 300, DEFAULT_HERO_LOGO_TUNE.yT),
    yH2: clamp(candidate.yH2, -300, 300, DEFAULT_HERO_LOGO_TUNE.yH2),
    yO: clamp(candidate.yO, -300, 300, DEFAULT_HERO_LOGO_TUNE.yO),
    yR: clamp(candidate.yR, -300, 300, DEFAULT_HERO_LOGO_TUNE.yR),
  };
}

export function heroLogoTuneToCssVars(tune: HeroLogoTune): Record<string, string> {
  return {
    "--hathor-logo-size": String(tune.size),
    "--hathor-logo-y": `${tune.y}px`,
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

  const logoH = `calc((100vw - ${HATHOR_BTN_SLOT_PX}px) / 2 * 2200 / 2683 * ${tune.size})`;

  return `
html[data-ex-experience] .ex-root,
html[data-ex-experience] .ex-root .home-hero-container {
${rootBody}
}
html[data-ex-experience] .ex-root .hathor-logo-split.hero-logo-img,
html[data-ex-experience] .ex-root .hathor-logo-split {
  height: ${logoH} !important;
}
html[data-ex-experience] .ex-root .hero-logo-mark--split {
  bottom: ${tune.y}px !important;
}
html[data-ex-experience] .ex-root .hathor-logo-split__side--left {
  padding-left: ${tune.edgeLeft}px !important;
  justify-content: flex-start !important;
}
html[data-ex-experience] .ex-root .hathor-logo-split__side--right {
  padding-right: ${tune.edgeRight}px !important;
  justify-content: flex-end !important;
}
html[data-ex-experience] .ex-root .hathor-logo-split .letter-h1 {
  margin-right: ${tune.gapHA}px !important;
}
html[data-ex-experience] .ex-root .hathor-logo-split .letter-a {
  margin-right: ${tune.gapAT}px !important;
}
html[data-ex-experience] .ex-root .hathor-logo-split .letter-t {
  margin-right: ${tune.gapTButton}px !important;
}
html[data-ex-experience] .ex-root .hathor-logo-split .letter-h2 {
  margin-left: ${tune.gapButtonH}px !important;
  margin-right: ${tune.gapHO}px !important;
}
html[data-ex-experience] .ex-root .hathor-logo-split .letter-o {
  margin-right: ${tune.gapOR}px !important;
}
html[data-ex-experience] .ex-root .home-hero-container:has(.hero-logo-mark--split) .hero-button {
  bottom: calc(${tune.y}px + (${logoH} / 2) - 26px + ${tune.ctaNudge}px) !important;
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
