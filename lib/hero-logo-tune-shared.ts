import { z } from "zod";

/** Temporary homepage HATHOR letter tune — will be hardcoded then removed. */
export const HERO_LOGO_TUNE_KEY = "hero-logo-tune";

const px = (min: number, max: number) => z.number().min(min).max(max);

export const heroLogoVAlignSchema = z.enum(["top", "middle", "bottom"]);
export type HeroLogoVAlign = z.infer<typeof heroLogoVAlignSchema>;

export const heroLogoTuneSchema = z.object({
  size: z.number().min(0.55).max(1.45),
  y: px(-220, 160),
  ctaNudge: px(-80, 80),
  animDuration: z.number().min(0.6).max(5),
  edgeInset: px(0, 120),
  centerGap: px(80, 320),
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

/** Current live pose — do not change unless the user asks to hardcode a new baseline. */
export const DEFAULT_HERO_LOGO_TUNE: HeroLogoTune = {
  size: 0.92,
  y: -220,
  ctaNudge: 20,
  animDuration: 3,
  edgeInset: 0,
  centerGap: 168,
  vAlign: "bottom",
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

  // Legacy edge-lock payloads used T→button / button→H instead of centerGap
  const gapT = asFiniteNumber(src.gapTButton);
  const gapB = asFiniteNumber(src.gapButtonH);
  const legacyCenterFromWings =
    gapT != null || gapB != null
      ? Math.min(
          320,
          Math.max(80, Math.round(168 + (gapT ?? 0) + (gapB ?? 0))),
        )
      : undefined;

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
    edgeInset: asFiniteNumber(src.edgeInset) ?? DEFAULT_HERO_LOGO_TUNE.edgeInset,
    centerGap:
      asFiniteNumber(src.centerGap) ??
      legacyCenterFromWings ??
      DEFAULT_HERO_LOGO_TUNE.centerGap,
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
  return {
    "--hathor-logo-size": String(tune.size),
    "--hathor-logo-y": `${tune.y}px`,
    "--hathor-cta-y-nudge": `${tune.ctaNudge}px`,
    "--hathor-logo-anim-duration": String(tune.animDuration),
    "--hathor-logo-edge": `${tune.edgeInset}px`,
    "--hathor-logo-gap": `${tune.centerGap}px`,
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
