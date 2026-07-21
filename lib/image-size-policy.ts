/**
 * Site image size / compression policy.
 *
 * Next/Vercel image optimization rejects many sources above ~3 MB, so delivered
 * CMS files must stay under 2 MB. Keep original bytes under that cap; compress
 * anything larger down to ≤ 2 MB at the highest quality that fits.
 */

export const KB = 1024;
export const MB = 1024 * KB;

/** Safe ceiling for Next.js `/_next/image` on Vercel (3 MB+ uploads often 400). */
const DELIVERED_MAX = 2 * MB;

export type ImageProcessKind = "hero" | "gallery" | "content";

export const IMAGE_SIZE_POLICY = {
  /** Delivered / stored images must stay at or under this size. */
  maxBytes: DELIVERED_MAX,
  /** Only run lossy compression when the source is above maxBytes. */
  compressAboveBytes: DELIVERED_MAX,
  /** Target size when compressing oversized sources (same for all kinds). */
  compressTargetBytes: {
    hero: DELIVERED_MAX,
    gallery: DELIVERED_MAX,
    content: DELIVERED_MAX,
  },
  /** Alias used by UI copy — full quality is kept up to maxBytes. */
  fullQualityMaxBytes: {
    hero: DELIVERED_MAX,
    gallery: DELIVERED_MAX,
    content: DELIVERED_MAX,
  },
  /**
   * Hard ceiling for the raw file the browser may upload before compression.
   * Larger than maxBytes so oversized masters can still be accepted and shrunk.
   */
  hardUploadMaxBytes: 25 * MB,
  /** Prefer full resolution; only shrink edges if still over target after quality steps. */
  compressMaxEdgeSteps: [4096, 2560, 1920, 1600, 1280] as const,
  /** Start near-original quality; step down only as needed to hit ≤ maxBytes. */
  compressQuality: { start: 92, min: 62, step: 3 },
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
