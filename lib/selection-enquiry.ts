import type { LuxuryRoomTypeValue } from "@/lib/booking-search-config";
import {
  findResidence,
  findVoyage,
  parseCabinSlug,
  isVoyageResidenceCompatible,
  luxuryTypeForResidence,
  luxuryTypeForResidenceSlug,
} from "@/lib/selection-catalog";
import {
  CHARTER_SLUG,
  type FavoritesState,
  type FavoriteType,
  type VoyageSelectionState,
} from "@/lib/selection-types";

/**
 * The bounded selection object carried from My Voyage into the existing
 * concierge enquiry.
 *
 * Wire contract, enforced on the server by the Zod schema in
 * app/api/contact/route.ts:
 * - stable catalog slugs and small integers only
 * - NO price, NO product names, NO routes, NO HTML from the client
 * - every human-readable string in the email is resolved here, on the server,
 *   from HATHOR_CRUISES / ROOM_SHOWCASES — never echoed back from the payload
 *
 * Pure module: no React, no Prisma, no network. Safe on both sides.
 */

export const SELECTION_ENQUIRY_LIMITS = {
  maxFavorites: 20,
  maxSlugLength: 60,
  maxGuests: 50,
} as const;

export type SelectionEnquiryFavorite = {
  type: FavoriteType;
  slug: string;
};

export type SelectionEnquiry = {
  voyageSlug?: string;
  residenceSlug?: string;
  roomType?: LuxuryRoomTypeValue;
  adults?: number;
  children?: number;
  charter?: boolean;
  favorites?: SelectionEnquiryFavorite[];
};

/** Build the wire payload from live store state. Client side. */
export function buildSelectionEnquiry(
  selection: VoyageSelectionState,
  favorites: FavoritesState,
): SelectionEnquiry | undefined {
  const hasSelection =
    Boolean(selection.voyageSlug) ||
    Boolean(selection.residenceSlug) ||
    selection.charter;

  if (!hasSelection && favorites.items.length === 0) return undefined;

  const payload: SelectionEnquiry = {};

  if (selection.voyageSlug) payload.voyageSlug = selection.voyageSlug;
  if (selection.residenceSlug) {
    payload.residenceSlug = selection.residenceSlug;
    const roomType = luxuryTypeForResidenceSlug(selection.residenceSlug);
    if (roomType) payload.roomType = roomType;
  }
  if (selection.adults !== null) payload.adults = selection.adults;
  if (selection.children !== null) payload.children = selection.children;
  if (selection.charter) payload.charter = true;

  if (favorites.items.length > 0) {
    payload.favorites = favorites.items
      .slice(0, SELECTION_ENQUIRY_LIMITS.maxFavorites)
      .map((ref) => ({ type: ref.type, slug: ref.slug }));
  }

  return payload;
}

export type SelectionSummaryLine = { label: string; value: string };

/**
 * Resolve the payload into the lines the reservations team reads.
 *
 * Everything here comes from trusted project data. A slug that no longer
 * resolves is dropped. An accommodation incompatible with the chosen journey is
 * dropped defensively and flagged, so the team never receives a pairing the
 * site itself would refuse.
 */
export function resolveSelectionSummary(
  selection: SelectionEnquiry | undefined,
): SelectionSummaryLine[] {
  if (!selection) return [];

  const lines: SelectionSummaryLine[] = [];

  const voyage = selection.voyageSlug ? findVoyage(selection.voyageSlug) : null;
  let residence = selection.residenceSlug
    ? findResidence(selection.residenceSlug)
    : null;

  const residenceType = residence ? luxuryTypeForResidence(residence) : null;

  let incompatible = false;
  if (voyage && residence && !isVoyageResidenceCompatible(voyage.slug as never, residenceType)) {
    incompatible = true;
    residence = null;
  }

  if (selection.charter) {
    lines.push({ label: "Enquiry type", value: "Private Charter" });
  }

  if (voyage) {
    lines.push({ label: "Selected Journey", value: voyage.name });
    lines.push({ label: "Route", value: voyage.ports });
    lines.push({
      label: "Duration",
      value: `${voyage.nights} Nights / ${voyage.days} Days`,
    });
    lines.push({ label: "Departure day", value: voyage.departureDay });
  }

  if (residence) {
    lines.push({ label: "Selected Accommodation", value: residence.name });
    lines.push({
      label: "Accommodation detail",
      value: `${residence.sizeSqm} m² · up to ${residence.capacity} guests`,
    });
  } else if (incompatible) {
    lines.push({
      label: "Selected Accommodation",
      value:
        "Not carried over — the saved accommodation is not offered on this itinerary.",
    });
  }

  const adults = selection.adults;
  const children = selection.children;
  if (adults !== undefined || children !== undefined) {
    const parts: string[] = [];
    if (adults !== undefined) {
      parts.push(`${adults} ${adults === 1 ? "Adult" : "Adults"}`);
    }
    if (children !== undefined && children > 0) {
      parts.push(`${children} ${children === 1 ? "Child" : "Children"}`);
    }
    if (parts.length) lines.push({ label: "Guests", value: parts.join(" · ") });
  }

  const savedLabels = resolveFavoriteLabels(selection.favorites);
  if (savedLabels.length > 0) {
    lines.push({ label: "Guest also saved", value: savedLabels.join(", ") });
  }

  /* Internal reference — stable ids only, never shown to the guest. */
  const refs: string[] = [];
  if (selection.voyageSlug) refs.push(`voyage=${selection.voyageSlug}`);
  if (selection.residenceSlug) refs.push(`residence=${selection.residenceSlug}`);
  if (selection.roomType) refs.push(`tier=${selection.roomType}`);
  if (selection.charter) refs.push("charter=true");
  if (refs.length) lines.push({ label: "Reference", value: refs.join(" · ") });

  return lines;
}

function resolveFavoriteLabels(
  favorites: SelectionEnquiryFavorite[] | undefined,
): string[] {
  if (!favorites?.length) return [];

  const labels: string[] = [];
  for (const favorite of favorites.slice(
    0,
    SELECTION_ENQUIRY_LIMITS.maxFavorites,
  )) {
    if (favorite.type === "charter") {
      if (favorite.slug === CHARTER_SLUG) labels.push("Private Charter");
      continue;
    }
    if (favorite.type === "voyage") {
      const voyage = findVoyage(favorite.slug);
      if (voyage) labels.push(voyage.ports);
      continue;
    }
    if (favorite.type === "cabin") {
      const pair = parseCabinSlug(favorite.slug);
      if (!pair) continue;
      const voyage = findVoyage(pair.voyageSlug);
      const residence = findResidence(pair.residenceSlug);
      if (voyage && residence) {
        labels.push(`${residence.name} (${voyage.nights}N ${voyage.ports})`);
      }
      continue;
    }
    const residence = findResidence(favorite.slug);
    if (residence) labels.push(residence.name);
  }

  return labels;
}
