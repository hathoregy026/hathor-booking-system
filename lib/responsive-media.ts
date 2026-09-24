import manifest from "./responsive-media-manifest.json";

type ResponsiveEntry = { widths: number[]; version: string };

/** Only route to derivatives that are checked in; all other URLs stay intact. */
export function responsiveMediaSrc(src: string, requestedWidth: number): string | null {
  const pathname = src.split(/[?#]/, 1)[0];
  const entry = (manifest as Record<string, ResponsiveEntry>)[pathname];
  const width = entry?.widths.find((available) => available >= requestedWidth);
  if (!width) return null;
  const extension = pathname.lastIndexOf(".");
  if (extension < 0) return null;
  return `/media/hathor/responsive${pathname.slice("/media/hathor".length, extension)}-${width}.webp?v=${entry.version}`;
}
