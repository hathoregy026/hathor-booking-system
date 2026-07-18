import { z } from "zod";

/** Temporary homepage HATHOR letter tune — will be hardcoded then removed. */
export const HERO_LOGO_TUNE_KEY = "hero-logo-tune";

export const heroLogoAlignSchema = z.enum(["top", "center", "bottom"]);
export type HeroLogoAlign = z.infer<typeof heroLogoAlignSchema>;

export const heroLogoTuneSchema = z.object({
  size: z.number().min(0.55).max(1.45),
  y: z.number().min(-220).max(160),
  ctaNudge: z.number().min(-80).max(80),
  /** Letter land duration in seconds (higher = slower). */
  animDuration: z.number().min(0.6).max(5),
  /** Vertical alignment of letters to each other. */
  align: heroLogoAlignSchema,
  /** Inset from left/right screen edges (px). */
  edgeInset: z.number().min(0).max(120),
  /** Space between neighboring letters (px). */
  letterGap: z.number().min(-20).max(80),
  /** Center gap width for Book Now (px). */
  centerGap: z.number().min(100).max(280),
});

export type HeroLogoTune = z.infer<typeof heroLogoTuneSchema>;

export const DEFAULT_HERO_LOGO_TUNE: HeroLogoTune = {
  size: 1,
  y: 0,
  ctaNudge: 0,
  animDuration: 2.6,
  align: "bottom",
  edgeInset: 0,
  letterGap: 0,
  centerGap: 168,
};

const ALIGN_TO_FLEX: Record<HeroLogoAlign, string> = {
  top: "flex-start",
  center: "center",
  bottom: "flex-end",
};

const ALIGN_TO_OBJECT: Record<HeroLogoAlign, string> = {
  top: "top center",
  center: "center center",
  bottom: "bottom center",
};

export function parseHeroLogoTune(raw: unknown): HeroLogoTune {
  const merged =
    raw && typeof raw === "object"
      ? { ...DEFAULT_HERO_LOGO_TUNE, ...(raw as Record<string, unknown>) }
      : DEFAULT_HERO_LOGO_TUNE;
  const parsed = heroLogoTuneSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_HERO_LOGO_TUNE;
}

export function heroLogoTuneToCssVars(tune: HeroLogoTune): Record<string, string> {
  return {
    "--hathor-logo-size": String(tune.size),
    "--hathor-logo-y": `${tune.y}px`,
    "--hathor-cta-y-nudge": `${tune.ctaNudge}px`,
    "--hathor-logo-anim-duration": String(tune.animDuration),
    "--hathor-logo-align": ALIGN_TO_FLEX[tune.align],
    "--hathor-logo-object-position": ALIGN_TO_OBJECT[tune.align],
    "--hathor-logo-edge": `${tune.edgeInset}px`,
    "--hathor-letter-gap": `${tune.letterGap}px`,
    "--hathor-logo-gap": `${tune.centerGap}px`,
  };
}

export function isHeroLogoTuneEqual(a: HeroLogoTune, b: HeroLogoTune): boolean {
  return (
    a.size === b.size &&
    a.y === b.y &&
    a.ctaNudge === b.ctaNudge &&
    a.animDuration === b.animDuration &&
    a.align === b.align &&
    a.edgeInset === b.edgeInset &&
    a.letterGap === b.letterGap &&
    a.centerGap === b.centerGap
  );
}
