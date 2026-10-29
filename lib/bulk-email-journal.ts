import type { BulkJournalTemplate } from "@/lib/bulk-email-types";
import { getProductionOrigin, VERCEL_PRODUCTION_ORIGIN } from "@/lib/public-url";

export const BULK_JOURNAL_IMAGE_PATHS = {
  hero: "/email/bulk-journal/hero.jpg",
  introImage: "/email/bulk-journal/dining.jpg",
  galleryMainImage: "/email/bulk-journal/suite.jpg",
  galleryUpperImage: "/email/bulk-journal/sailing.jpg",
  galleryLowerImage: "/email/bulk-journal/bar.jpg",
} as const;

/** Navigation only: sender URLs are never fetched by the server. */
export function bulkJournalHttpsUrl(value: unknown): URL | null {
  if (typeof value !== "string" || value.length > 4096 || /[\u0000-\u0020\u007f\\]/.test(value)) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) return null;
    // Positive DNS-name validation also excludes numeric/IPv6 private addresses.
    if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(url.hostname)) return null;
    if (/\.(?:localhost|local|internal|lan|test|invalid|example)$/i.test(url.hostname)) return null;
    return url;
  } catch { return null; }
}

/** Fixed bundled assets always use a public HTTPS address in delivered emails. */
export function bulkJournalAssetUrl(path: string): string {
  const bundledPaths: string[] = [...Object.values(BULK_JOURNAL_IMAGE_PATHS), "/email/bulk-journal/icon.png", "/fonts/more-fonts/Italiana-Regular.woff2"];
  if (!bundledPaths.includes(path)) return "";
  const configured = bulkJournalHttpsUrl(getProductionOrigin());
  return `${configured?.origin || VERCEL_PRODUCTION_ORIGIN}${path}`;
}

export const BULK_JOURNAL_MESSAGE = "Only 32 guests. Twelve quiet rooms.\nAnd the river, always within view.\n\nDiscover an intimate passage between Luxor and Aswan, where ancient Egypt and the pleasures of life aboard share the day.";

export const BULK_JOURNAL_DEFAULTS: BulkJournalTemplate = {
  mastheadLabel: "THE HATHOR JOURNAL",
  mastheadLocation: "LUXOR · ASWAN · EGYPT",
  introImage: { show: true, alt: "Warm company and relaxed dining beside the Nile." },
  features: [
    { title: "ROOM TO RETREAT", body: "A private room, a quiet morning,\nand a window on the river." },
    { title: "TIME TO SAVOUR", body: "Fresh flavours. A long lunch.\nThe pleasure of staying a little." },
    { title: "EGYPT, UP CLOSE", body: "Step ashore for ancient stories.\nReturn to the calm of Hathor." },
    { title: "AN OPEN HORIZON", body: "Golden hours on the sun deck.\nEvenings without a hurry." },
  ],
  galleryHeading: "the art of\nbeing here.",
  galleryBody: "A long lunch. A quiet morning.\nAn evening beneath an open sky.\nSome moments need nothing more.",
  galleryCaption: "THE LITTLE THINGS. THE LASTING MEMORIES.",
  galleryMainImage: { show: true, alt: "A private moment for two beside the Nile at sunset." },
  galleryUpperImage: { show: true, alt: "HATHOR passing an Egyptian temple on the river." },
  galleryLowerImage: { show: true, alt: "Lantern-lit evenings on the HATHOR sun deck." },
  journeyHeading: "MAKE IT\nYOUR JOURNEY.",
  journeyBody: "Three, four or seven nights on the Nile.\nChoose your sailing.\nWe will take care of the rest.",
  discoverButton: { label: "DISCOVER HATHOR", url: `${VERCEL_PRODUCTION_ORIGIN}/voyages` },
  journeyButton: { label: "EXPLORE VOYAGES", url: `${VERCEL_PRODUCTION_ORIGIN}/cruises-list` },
  address: "One Katameya, Tower 211, Floor 11, Flat 111,\nRing Road, Cairo, Egypt",
  preferencesLabel: "Email preferences",
  preferencesUrl: "",
};
