/**
 * Site image size / compression policy.
 *
 * - Gallery & content: full quality allowed up to 500 KB
 * - Heroes: full quality allowed up to 800 KB
 * - Lossy compression runs only when the source is above 1 MB
 */

export const KB = 1024;
export const MB = 1024 * KB;

export type ImageProcessKind = "hero" | "gallery" | "content";

export const IMAGE_SIZE_POLICY = {
  /** Never run lossy compression at or below this size. */
  compressAboveBytes: 1 * MB,
  /** Preferred / full-quality ceilings by kind. */
  fullQualityMaxBytes: {
    hero: 800 * KB,
    gallery: 500 * KB,
    content: 500 * KB,
  },
  /** When compressing (>1 MB), aim to land near these sizes. */
  compressTargetBytes: {
    hero: 800 * KB,
    gallery: 500 * KB,
    content: 500 * KB,
  },
  /** Max edge length when compressing large sources. */
  compressMaxEdge: 1920,
  /** Lossy WebP quality range used only when source > 1 MB. */
  compressQuality: { start: 86, min: 68, step: 6 },
  /** Near-lossless WebP when we must normalize format under the 1 MB rule. */
  fullQualityWebp: 100,
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
