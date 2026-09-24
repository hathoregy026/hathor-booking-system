import { freshMediaSrc, isVersionedMediaPath } from "./fresh-media-src";

/**
 * Local /media files are already on this origin. Serving them through
 * /_next/image kept the cached miss from when those files were not deployed.
 * Remote dashboard uploads still use the optimizer.
 */
export default function hathorImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // Vercel's image optimizer rejects SVGs. Branding vectors are trusted local
  // public assets and should be served directly instead of returning HTTP 400.
  if (/^\/branding\/[^/?#]+\.svg(?:[?#].*)?$/i.test(src)) {
    return src;
  }
  if (isVersionedMediaPath(src)) {
    const file = freshMediaSrc(src);
    return `${file}${file.includes("?") ? "&" : "?"}w=${width}`;
  }
  const params = new URLSearchParams({
    url: src,
    w: String(width),
    q: String(quality ?? 75),
  });
  return `/_next/image?${params.toString()}`;
}
