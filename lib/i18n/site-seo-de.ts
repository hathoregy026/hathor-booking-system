import type { Metadata } from "next";
import { HATHOR_HERO_POSTER_SRC } from "@/lib/branding";
import { buildPageMetadata } from "@/lib/seo/metadata";

/**
 * German search settings for the homepage, private charter and scheduled
 * sailings. Language, hreflang, og:locale and the search switch
 * (LOCALE_INDEXED in lib/i18n/locale.ts) come from the shared builder.
 */
export const HOME_SEO_DE: Metadata = buildPageMetadata({
  title: "Nilkreuzfahrt mit der Luxus-Dahabiya | Hathor Dahabiya",
  description:
    "Nilkreuzfahrt mit der Luxus-Dahabiya zwischen Luxor und Assuan: 32 Gäste, Suiten mit Nilblick, feine Küche und Tempelbesuche ohne Eile an Bord der Hathor.",
  path: "/de",
  image: {
    url: HATHOR_HERO_POSTER_SRC,
    width: 1920,
    height: 1080,
    alt: "Hathor Dahabiya, Luxus-Dahabiya-Kreuzfahrt auf dem Nil zwischen Luxor und Assuan",
  },
});

export const CHARTER_SEO_TITLE_DE = "Privater Dahabiya-Charter auf dem Nil | Hathor Dahabiya";

export const CHARTER_SEO_DE: Metadata = buildPageMetadata({
  title: CHARTER_SEO_TITLE_DE,
  description:
    "Chartern Sie die Hathor exklusiv, eine Luxus-Dahabiya für bis zu 32 Gäste, mit eigener Crew und eigenem Küchenchef: eine private Nilkreuzfahrt von Luxor nach Assuan.",
  path: "/de/charter",
  image: {
    url: "/media/hathor/r2/charter-hero.webp",
    width: 1920,
    height: 1280,
    alt: "Privatcharter der Hathor Dahabiya auf dem Nil in Ägypten",
  },
});

export const CRUISES_LIST_SEO_DE: Metadata = buildPageMetadata({
  title: "Termine und Kabinen der Nilkreuzfahrten | Hathor Dahabiya",
  description:
    "Sehen Sie die Abfahrten und freien Kabinen der Hathor Dahabiya: Nilkreuzfahrten mit drei, vier und sieben Nächten zwischen Luxor und Assuan.",
  path: "/de/cruises-list",
});

export const CRUISES_LIST_PAGE_DE = {
  name: "Abfahrtstermine der Hathor | Dahabiya-Kreuzfahrt auf dem Nil buchen",
  breadcrumbs: [
    { name: "Startseite", path: "/de" },
    { name: "Reisen", path: "/de/voyages" },
    { name: "Abfahrtstermine", path: "/de/cruises-list" },
  ],
} as const;
