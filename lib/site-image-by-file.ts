import { SITE_IMAGE_SLOTS, getSiteImageSlot } from "@/lib/site-image-slots";

/**
 * Which dashboard slot owns a hard-coded image URL.
 *
 * Pages and the booking journey still carry literal `/media/...` paths in
 * catalog data. This resolves those paths back to the slot that controls the
 * same photograph, so the dashboard edits them like every other site image.
 */

const OPTIMIZED_PREFIX = "/media/hathor/optimized/";
const STORAGE_MARKER = "/site-images/";

/** Strip the optimizer wrapper, the origin and any query string. */
export function siteImageFileKey(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";

  let value = trimmed;
  if (value.startsWith("/_next/image?")) {
    try {
      const params = new URLSearchParams(value.slice(value.indexOf("?") + 1));
      value = params.get("url")?.trim() || value;
      value = decodeURIComponent(value);
    } catch {
      /* keep the raw value */
    }
  }

  if (/^https?:\/\//i.test(value)) {
    try {
      value = new URL(value).pathname;
    } catch {
      /* keep the raw value */
    }
  }

  return value.split("?")[0];
}

/** Default file → slot, kept only where exactly one slot owns that file. */
const SLOT_BY_DEFAULT_FILE: ReadonlyMap<string, string> = (() => {
  const owners = new Map<string, string[]>();
  for (const slot of SITE_IMAGE_SLOTS) {
    const key = siteImageFileKey(slot.url);
    if (!key) continue;
    const list = owners.get(key);
    if (list) list.push(slot.name);
    else owners.set(key, [slot.name]);
  }

  const unique = new Map<string, string>();
  for (const [key, names] of owners) {
    if (names.length === 1) unique.set(key, names[0]);
  }
  return unique;
})();

/**
 * The slot a URL belongs to, or null when the photo is not managed.
 * Ambiguous defaults (one file reused as the seed of several slots) stay null
 * so an edit never lands on the wrong slot.
 */
export function siteImageSlotForFile(url: string): string | null {
  const key = siteImageFileKey(url);
  if (!key) return null;

  /* A dashboard upload: /storage/.../site-images/{slot}/{file} */
  const storageIndex = key.indexOf(STORAGE_MARKER);
  if (storageIndex >= 0) {
    const name = key.slice(storageIndex + STORAGE_MARKER.length).split("/")[0];
    if (name && getSiteImageSlot(name)) return name;
  }

  /* A local mirror: /media/hathor/optimized/{slot}.webp */
  if (key.startsWith(OPTIMIZED_PREFIX)) {
    const name = key.slice(OPTIMIZED_PREFIX.length).replace(/\.[a-z0-9]+$/i, "");
    if (name && getSiteImageSlot(name)) return name;
  }

  return SLOT_BY_DEFAULT_FILE.get(key) ?? null;
}
