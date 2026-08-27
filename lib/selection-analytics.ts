import { trackGaEvent } from "@/lib/ga-browser";
import type { FavoriteType } from "@/lib/selection-types";

/**
 * Selection analytics — a thin, typed wrapper over the project's existing GA4
 * helper. No new vendor, no new script, no PII.
 *
 * Only catalog slugs and type names are ever sent. Never a name, email, phone,
 * price or booking reference. `trackGaEvent` already no-ops when gtag is absent
 * and never throws.
 */

export type SelectionAnalyticsEvent =
  | "favorite_add"
  | "favorite_remove"
  | "voyage_add"
  | "accommodation_add"
  | "voyage_request_start";

type SelectionAnalyticsParams = {
  /** Favorites only — which kind of thing was saved. */
  item_type?: FavoriteType;
  /** Catalog slug. Stable, public, non-identifying. */
  item_slug?: string;
  voyage_slug?: string;
  residence_slug?: string;
  room_type?: string;
};

export function trackSelectionEvent(
  event: SelectionAnalyticsEvent,
  params?: SelectionAnalyticsParams,
): void {
  if (!params) {
    trackGaEvent(event);
    return;
  }

  const payload: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value) payload[key] = value;
  }

  trackGaEvent(event, payload);
}
