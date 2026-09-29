/**
 * Email banner framing — the one piece of crop math shared by the dashboard
 * preview and the server that renders the saved banner, so what the editor
 * shows is exactly what every email shows. Client-safe (no Node imports).
 *
 * A frame is the centre of the visible area (0–1 across the source image)
 * plus a zoom (1 = the largest 2:1 window that fits the photo).
 */

/** The banner's shape in every email: 640×320. */
export const EMAIL_HERO_RATIO = 2;
/** Saved at twice the email width so it stays sharp on high-density screens. */
export const EMAIL_HERO_OUTPUT_WIDTH = 1280;
export const EMAIL_HERO_OUTPUT_HEIGHT = EMAIL_HERO_OUTPUT_WIDTH / EMAIL_HERO_RATIO;

export const EMAIL_HERO_MIN_ZOOM = 1;
export const EMAIL_HERO_MAX_ZOOM = 3;

export type EmailHeroFrame = {
  /** centre of the visible area, 0 (left edge) – 1 (right edge) */
  x: number;
  /** centre of the visible area, 0 (top edge) – 1 (bottom edge) */
  y: number;
  zoom: number;
};

export const DEFAULT_EMAIL_HERO_FRAME: EmailHeroFrame = { x: 0.5, y: 0.5, zoom: 1 };

export type CropRect = { left: number; top: number; width: number; height: number };

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * The source-pixel rectangle a frame shows. The window keeps the banner's
 * 2:1 shape, shrinks with zoom, and is held inside the photo — so a frame
 * can never reveal anything beyond the picture's edges.
 */
export function emailHeroCropRect(
  sourceWidth: number,
  sourceHeight: number,
  frame: EmailHeroFrame,
): CropRect {
  const zoom = clamp(frame.zoom, EMAIL_HERO_MIN_ZOOM, EMAIL_HERO_MAX_ZOOM);
  const fitsWide = sourceWidth / sourceHeight > EMAIL_HERO_RATIO;
  const baseWidth = fitsWide ? sourceHeight * EMAIL_HERO_RATIO : sourceWidth;
  const baseHeight = fitsWide ? sourceHeight : sourceWidth / EMAIL_HERO_RATIO;
  const width = baseWidth / zoom;
  const height = baseHeight / zoom;
  const left = clamp(frame.x * sourceWidth - width / 2, 0, sourceWidth - width);
  const top = clamp(frame.y * sourceHeight - height / 2, 0, sourceHeight - height);
  return { left, top, width, height };
}

/** The frame a crop rectangle corresponds to (used to settle a drag at an edge). */
export function frameFromCropRect(
  sourceWidth: number,
  sourceHeight: number,
  rect: CropRect,
  zoom: number,
): EmailHeroFrame {
  return {
    x: (rect.left + rect.width / 2) / sourceWidth,
    y: (rect.top + rect.height / 2) / sourceHeight,
    zoom,
  };
}

/** A frame from untrusted input (request body, stored JSON), or the default. */
export function parseEmailHeroFrame(value: unknown): EmailHeroFrame {
  if (!value || typeof value !== "object") return { ...DEFAULT_EMAIL_HERO_FRAME };
  const raw = value as Record<string, unknown>;
  const num = (input: unknown, fallback: number) =>
    typeof input === "number" && Number.isFinite(input) ? input : fallback;
  return {
    x: clamp(num(raw.x, 0.5), 0, 1),
    y: clamp(num(raw.y, 0.5), 0, 1),
    zoom: clamp(num(raw.zoom, 1), EMAIL_HERO_MIN_ZOOM, EMAIL_HERO_MAX_ZOOM),
  };
}
