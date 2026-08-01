import {
  HIGHLIGHTS_LANDMARK_SLOTS,
  type HighlightsLandmarkSlot,
} from "@/lib/highlights-content";
import { getSiteImageSlot } from "@/lib/site-image-slots";

/**
 * Paths / filenames that must never resolve under landmark-* slots.
 * Protects against legacy CMS rows that pointed at vessel photography.
 */
const VESSEL_OR_HOSPITALITY_MARKERS = [
  "charter-hero",
  "charter.webp",
  "/charter.",
  "contact-hero",
  "home-collage",
  "home-hero",
  "home-split",
  "home-story",
  "home-cinematic",
  "home-residences",
  "home-alt-",
  "room-",
  "legacy-",
  "gastronomy",
  "wellness",
  "about-dining",
  "about-hero",
  "cruises-hero",
  "blog-hero",
  "scraped-",
] as const;

function normalizeUrl(url: string): string {
  return url.trim().toLowerCase();
}

export function isHighlightsLandmarkSlot(
  name: string,
): name is HighlightsLandmarkSlot {
  return (HIGHLIGHTS_LANDMARK_SLOTS as readonly string[]).includes(name);
}

/** True when URL clearly refers to vessel / hospitality photography. */
export function looksLikeVesselOrHospitalityAsset(url: string): boolean {
  const value = normalizeUrl(url);
  if (!value) return false;
  return VESSEL_OR_HOSPITALITY_MARKERS.some((marker) => value.includes(marker));
}

/**
 * Landmark slots: only accept CMS overrides that are not vessel imagery
 * and are not identical to a known hospitality default.
 * Official local `landmark-*.webp` defaults always win over bad overrides.
 */
export function isSafeLandmarkCmsOverride(
  slotName: string,
  cmsUrl: string,
): boolean {
  if (!isHighlightsLandmarkSlot(slotName)) return true;
  if (!cmsUrl.trim()) return false;

  const slot = getSiteImageSlot(slotName);
  const normalized = normalizeUrl(cmsUrl);

  /* Always allow the official local landmark fallback path. */
  if (slot && normalizeUrl(slot.url) === normalized) return true;
  if (normalized.includes(`/landmark-`) || /landmark-(obelisk|hatshepsut|valley-kings)/.test(normalized)) {
    return !looksLikeVesselOrHospitalityAsset(normalized);
  }

  /* Reject hospitality / vessel paths even if hosted remotely. */
  if (looksLikeVesselOrHospitalityAsset(normalized)) return false;

  /* Remote CMS uploads (Supabase /uploads) are allowed when not vessel-named. */
  return true;
}
