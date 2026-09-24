import manifest from "./responsive-media-manifest.json";
import { freshMediaSrc } from "./fresh-media-src";

/** Only route to derivatives that are checked in; all other URLs stay intact. */
export function responsiveMediaSrc(src: string, requestedWidth: number): string | null {
  const pathname = src.split(/[?#]/, 1)[0];
  const widths = (manifest as Record<string, number[]>)[pathname];
  const width = widths?.find((available) => available >= requestedWidth);
  if (!width) return null;
  const extension = pathname.lastIndexOf(".");
  if (extension < 0) return null;
  return freshMediaSrc(
    `/media/hathor/responsive${pathname.slice("/media/hathor".length, extension)}-${width}.webp`,
  );
}
