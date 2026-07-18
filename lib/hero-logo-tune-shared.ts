import { z } from "zod";

/** Temporary homepage HATHOR letter tune — will be hardcoded then removed. */
export const HERO_LOGO_TUNE_KEY = "hero-logo-tune";

export const heroLogoTuneSchema = z.object({
  size: z.number().min(0.55).max(1.45),
  y: z.number().min(-220).max(160),
  ctaNudge: z.number().min(-80).max(80),
  /** Letter land duration in seconds (higher = slower). */
  animDuration: z.number().min(0.6).max(5),
});

export type HeroLogoTune = z.infer<typeof heroLogoTuneSchema>;

export const DEFAULT_HERO_LOGO_TUNE: HeroLogoTune = {
  size: 1,
  y: 0,
  ctaNudge: 0,
  animDuration: 2.6,
};

export function parseHeroLogoTune(raw: unknown): HeroLogoTune {
  const parsed = heroLogoTuneSchema.safeParse(raw);
  return parsed.success ? parsed.data : DEFAULT_HERO_LOGO_TUNE;
}

export function heroLogoTuneToCssVars(tune: HeroLogoTune): Record<string, string> {
  return {
    "--hathor-logo-size": String(tune.size),
    "--hathor-logo-y": `${tune.y}px`,
    "--hathor-cta-y-nudge": `${tune.ctaNudge}px`,
    "--hathor-logo-anim-duration": String(tune.animDuration),
  };
}
