import { z } from "zod";

export const HIEROGLYPH_TUNE_KEY = "hieroglyph-tune";

/** Matches live defaults in `app/hieroglyph-pattern.css` + night-mode. */
export const hieroglyphTuneSchema = z.object({
  /** Day-mode glyph layer opacity (0 = invisible, 1 = solid). */
  dayOpacity: z.number().min(0).max(1),
  /** Night-mode glyph layer opacity. */
  nightOpacity: z.number().min(0).max(1),
  /** Desktop tile width (px). Height scales with image aspect. */
  tileSize: z.number().min(80).max(800),
  /** Phone tile width (px), applied at max-width 768px. */
  tileSizeMobile: z.number().min(60).max(600),
});

export type HieroglyphTune = z.infer<typeof hieroglyphTuneSchema>;

export const DEFAULT_HIEROGLYPH_TUNE: HieroglyphTune = {
  dayOpacity: 0.056,
  nightOpacity: 0.02,
  tileSize: 320,
  tileSizeMobile: 240,
};

function asFiniteNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function clamp(n: number | undefined, min: number, max: number, fallback: number) {
  const v = n ?? fallback;
  if (!Number.isFinite(v)) return fallback;
  return Math.min(max, Math.max(min, v));
}

export function parseHieroglyphTune(raw: unknown): HieroglyphTune {
  const src =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  const candidate: HieroglyphTune = {
    dayOpacity:
      asFiniteNumber(src.dayOpacity) ?? DEFAULT_HIEROGLYPH_TUNE.dayOpacity,
    nightOpacity:
      asFiniteNumber(src.nightOpacity) ?? DEFAULT_HIEROGLYPH_TUNE.nightOpacity,
    tileSize: asFiniteNumber(src.tileSize) ?? DEFAULT_HIEROGLYPH_TUNE.tileSize,
    tileSizeMobile:
      asFiniteNumber(src.tileSizeMobile) ??
      DEFAULT_HIEROGLYPH_TUNE.tileSizeMobile,
  };

  const parsed = hieroglyphTuneSchema.safeParse(candidate);
  if (parsed.success) return parsed.data;

  return {
    dayOpacity: clamp(candidate.dayOpacity, 0, 1, DEFAULT_HIEROGLYPH_TUNE.dayOpacity),
    nightOpacity: clamp(
      candidate.nightOpacity,
      0,
      1,
      DEFAULT_HIEROGLYPH_TUNE.nightOpacity,
    ),
    tileSize: clamp(candidate.tileSize, 80, 800, DEFAULT_HIEROGLYPH_TUNE.tileSize),
    tileSizeMobile: clamp(
      candidate.tileSizeMobile,
      60,
      600,
      DEFAULT_HIEROGLYPH_TUNE.tileSizeMobile,
    ),
  };
}

/**
 * Beats stylesheet cascade (hieroglyph-pattern.css + night-mode.css) so
 * Save → live always shows.
 */
export function hieroglyphTuneToImportantCss(tune: HieroglyphTune): string {
  const day = tune.dayOpacity;
  const night = tune.nightOpacity;
  const size = `${tune.tileSize}px`;
  const sizeMobile = `${tune.tileSizeMobile}px`;

  return `
.public-site,
html[data-public-theme="day"] .public-site,
html[data-public-theme="day"] .public-page-body,
html[data-public-theme="day"][data-ex-experience] .ex-root,
html[data-public-theme="day"] .cruises-scroll-route .cruises-sheet,
html[data-public-theme="day"] .public-site .hathor-section--cream,
html[data-public-theme="day"] .public-site .lux-section--cream {
  --hieroglyph-opacity: ${day} !important;
  --hieroglyph-tile-size: ${size} !important;
}
html[data-public-theme="night"] .public-site,
html[data-public-theme="night"] .hathor-site,
html[data-public-theme="night"] .preview-site,
html[data-public-theme="night"] .public-main,
html[data-public-theme="night"] .page-transition,
html[data-public-theme="night"] .public-page-body,
html[data-public-theme="night"] .home-experience-route,
html[data-public-theme="night"][data-ex-experience] .ex-root,
html[data-public-theme="night"] .cruises-scroll-route .cruises-sheet,
html[data-public-theme="night"] .public-site .hathor-section--cream,
html[data-public-theme="night"] .public-site .lux-section--cream {
  --hieroglyph-opacity: ${night} !important;
  --hieroglyph-tile-size: ${size} !important;
}
@media (max-width: 768px) {
  .public-site,
  html[data-public-theme="day"] .public-site,
  html[data-public-theme="night"] .public-site,
  html[data-public-theme="day"] .public-page-body,
  html[data-public-theme="night"] .public-page-body,
  html[data-public-theme="day"][data-ex-experience] .ex-root,
  html[data-public-theme="night"][data-ex-experience] .ex-root,
  html[data-public-theme="day"] .cruises-scroll-route .cruises-sheet,
  html[data-public-theme="night"] .cruises-scroll-route .cruises-sheet {
    --hieroglyph-tile-size: ${sizeMobile} !important;
  }
}
`.trim();
}

export function isHieroglyphTuneEqual(
  a: HieroglyphTune,
  b: HieroglyphTune,
): boolean {
  return (Object.keys(DEFAULT_HIEROGLYPH_TUNE) as (keyof HieroglyphTune)[]).every(
    (key) => a[key] === b[key],
  );
}
