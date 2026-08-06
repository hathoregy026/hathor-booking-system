/**
 * Site image size / compression policy (future uploads).
 *
 * Always deliver WebP under kind-specific caps so new CMS uploads stay light
 * on Vercel and do not reintroduce multi‑MB Supabase egress payloads.
 */

export const KB = 1024;
export const MB = 1024 * KB;

export type ImageProcessKind = "hero" | "gallery" | "content";

export const IMAGE_SIZE_POLICY = {
  /**
   * Absolute ceiling after processing (safety net for Next `/_next/image`).
   * Kind targets below are preferred.
   */
  maxBytes: 800 * KB,
  /**
   * Always run the WebP pipeline for site uploads (no original pass-through).
   * Kept at 0 so shouldCompressImage() is true for every non-empty file.
   */
  compressAboveBytes: 0,
  /** Target size when compressing (highest quality that fits). */
  compressTargetBytes: {
    hero: 800 * KB,
    gallery: 400 * KB,
    content: 400 * KB,
  },
  /** Alias used by UI copy. */
  fullQualityMaxBytes: {
    hero: 800 * KB,
    gallery: 400 * KB,
    content: 400 * KB,
  },
  /**
   * Hard ceiling for the raw file the browser may upload before compression.
   */
  hardUploadMaxBytes: 25 * MB,
  /** Prefer full resolution; only shrink edges if still over target after quality steps. */
  compressMaxEdgeSteps: [2560, 1920, 1600, 1280, 1024] as const,
  /** Start near-original quality; step down only as needed to hit the kind target. */
  compressQuality: { start: 86, min: 52, step: 4 },
} as const;

export function fullQualityMaxBytes(kind: ImageProcessKind): number {
  return IMAGE_SIZE_POLICY.fullQualityMaxBytes[kind];
}

export function compressTargetBytes(kind: ImageProcessKind): number {
  return IMAGE_SIZE_POLICY.compressTargetBytes[kind];
}

export function shouldCompressImage(byteLength: number): boolean {
  return byteLength > IMAGE_SIZE_POLICY.compressAboveBytes;
}

/** Map admin layout / category labels to a process kind. */
export function resolveImageProcessKind(input: {
  layoutKind?: string | null;
  category?: string | null;
  slotName?: string | null;
}): ImageProcessKind {
  const layout = (input.layoutKind ?? "").toLowerCase();
  if (layout === "hero") return "hero";
  if (layout === "gallery") return "gallery";

  const category = (input.category ?? "").toLowerCase();
  if (category === "hero") return "hero";

  const slot = (input.slotName ?? "").toLowerCase();
  if (slot.includes("hero") || slot.endsWith("-poster")) return "hero";
  if (slot.includes("collage") || slot.includes("gallery")) return "gallery";

  return "content";
}

export function parseImageProcessKind(
  value: string | null | undefined,
): ImageProcessKind {
  const v = (value ?? "").trim().toLowerCase();
  if (v === "hero" || v === "gallery" || v === "content") return v;
  return "content";
}
