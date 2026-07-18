import { z } from "zod";

/** Temporary homepage HATHOR letter tune — will be hardcoded then removed. */
export const HERO_LOGO_TUNE_KEY = "hero-logo-tune";

const px = (min: number, max: number) => z.number().min(min).max(max);

export const heroLogoVAlignSchema = z.enum(["top", "middle", "bottom"]);
export type HeroLogoVAlign = z.infer<typeof heroLogoVAlignSchema>;

/** Fixed Book Now slot width — button stays viewport-centered in this slot. */
export const HATHOR_BTN_SLOT_PX = 168;

export const heroLogoTuneSchema = z.object({
  size: z.number().min(0.55).max(1.45),
  /** CSS `bottom` offset (px). Negative lowers / tucks under the cream sheet. */
  y: px(-600, 400),
  ctaNudge: px(-80, 80),
  animDuration: z.number().min(0.6).max(5),
  /** Space from screen left edge to H (left). */
  edgeLeft: px(0, 160),
  /** Space from R to screen right edge. */
  edgeRight: px(0, 160),
  /** Space between T and the Book Now button (button stays centered). */
  gapTButton: px(0, 200),
  /** Space between Book Now and the right-side H. */
  gapButtonH: px(0, 200),
  /** Shared vertical alignment line for all letters (Figma-style). */
  vAlign: heroLogoVAlignSchema,
  /** Space after each letter toward the next (px). */
  gapHA: px(-40, 120),
  gapAT: px(-40, 120),
  gapHO: px(-40, 120),
  gapOR: px(-40, 120),
  /** Extra per-letter vertical nudge after vAlign (px). − up, + down. */
  yH1: px(-80, 80),
  yA: px(-80, 80),
  yT: px(-80, 80),
  yH2: px(-80, 80),
  yO: px(-80, 80),
  yR: px(-80, 80),
});

export type HeroLogoTune = z.infer<typeof heroLogoTuneSchema>;

/** Locked live baseline — only change when the user says to hardcode a new one. */
export const DEFAULT_HERO_LOGO_TUNE: HeroLogoTune = {
  size: 0.92,
  y: -220,
  ctaNudge: 20,
  animDuration: 3,
  edgeLeft: 0,
  edgeRight: 0,
  gapTButton: 0,
  gapButtonH: 0,
  vAlign: "top",
  gapHA: 0,
  gapAT: 0,
  gapHO: 0,
  gapOR: 0,
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

  // Old single centerGap → split leftover evenly into T→btn and btn→H wings
  const legacyCenter = asFiniteNumber(src.centerGap);
  const migratedWing =
    legacyCenter != null
      ? Math.max(0, Math.round((legacyCenter - HATHOR_BTN_SLOT_PX) / 2))
      : undefined;

  // Old shared edgeInset → both sides
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
  return parsed.success ? parsed.data : DEFAULT_HERO_LOGO_TUNE;
}

export function heroLogoTuneToCssVars(tune: HeroLogoTune): Record<string, string> {
  // Defaults 0 leave the locked live edge-to-edge pose unchanged.
  return {
    "--hathor-logo-size": String(tune.size),
    "--hathor-logo-y": `${tune.y}px`,
    "--hathor-cta-y-nudge": `${tune.ctaNudge}px`,
    "--hathor-logo-anim-duration": String(tune.animDuration),
    "--hathor-logo-edge-l": `${tune.edgeLeft}px`,
    "--hathor-logo-edge-r": `${tune.edgeRight}px`,
    "--hathor-logo-gap": `${HATHOR_BTN_SLOT_PX}px`,
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

export function isHeroLogoTuneEqual(a: HeroLogoTune, b: HeroLogoTune): boolean {
  return (Object.keys(DEFAULT_HERO_LOGO_TUNE) as (keyof HeroLogoTune)[]).every(
    (key) => a[key] === b[key],
  );
}
