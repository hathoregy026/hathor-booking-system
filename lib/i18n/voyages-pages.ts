import type { Metadata } from "next";

export type VoyagePageKey = "voyages" | "luxor-to-aswan" | "aswan-to-luxor" | "luxor-aswan-luxor";

/** Shared shape of a translated Voyages page. Server-only. */
export type LocaleVoyagePage = {
  path: string;
  metadata: Metadata;
  /** WebPage name and breadcrumb label in structured data. */
  name: string;
  crumb: string;
  trip: { name: string; description: string; departure: string; arrival: string };
  /** Three lines; the third is the gold, most indented one and never wraps, so it stays short. */
  heroLines: readonly string[];
  /** Shown only while the dashboard statement is empty, as in English. */
  statement?: string;
  /** Itinerary links go to the scheduled sailings, as on the English route pages. */
  detailsHref?: string;
};
