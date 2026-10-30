import type { Metadata } from "next";
import type { LocaleVoyagePage, VoyagePageKey } from "@/lib/i18n/voyages-pages";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SEO_DEFAULT_OG_IMAGE } from "@/lib/seo/site";

/**
 * The four German Voyages pages: search settings, structured data words and
 * the page-specific hero / statement. Titles lead with the German head terms
 * ("Nilkreuzfahrt", "Luxor", "Assuan"). Server-only.
 */

const image = {
  ...SEO_DEFAULT_OG_IMAGE,
  alt: "Die Hathor Dahabiya auf dem Nil, Luxuskreuzfahrt zwischen Luxor und Assuan",
};

const page = (
  path: string,
  title: string,
  description: string,
): { path: string; metadata: Metadata } => ({
  path,
  metadata: buildPageMetadata({ title, description, path, image }),
});

export const GERMAN_VOYAGE_PAGES: Record<VoyagePageKey, LocaleVoyagePage> = {
  voyages: {
    ...page(
      "/de/voyages",
      "Nilkreuzfahrten zwischen Luxor und Assuan | Hathor Dahabiya",
      "Wählen Sie Ihre Dahabiya-Route zwischen Luxor und Assuan: drei, vier oder sieben Nächte private Fahrt, Tempelbesuche und Leben an Bord, alles inklusive.",
    ),
    name: "Nilkreuzfahrten zwischen Luxor und Assuan | Hathor Dahabiya",
    crumb: "Reisen",
    trip: {
      name: "Die Routen der Hathor Dahabiya auf dem Nil",
      description: "Reisen mit drei, vier und sieben Nächten mit der Hathor zwischen Luxor und Assuan.",
      departure: "Luxor",
      arrival: "Assuan",
    },
    heroLines: ["Unsere Reisen", "geformt", "vom Nil"],
  },
  "luxor-to-aswan": {
    ...page(
      "/de/voyages/luxor-to-aswan",
      "Nilkreuzfahrt von Luxor nach Assuan | Hathor Dahabiya",
      "Die klassische Kreuzfahrt mit vier Nächten von Luxor nach Assuan auf der Hathor Dahabiya: Karnak, das Tal der Könige, Edfu, Kom Ombo und Philae, ganz privat.",
    ),
    name: "Nilkreuzfahrt von Luxor nach Assuan | Hathor Dahabiya",
    crumb: "Von Luxor nach Assuan",
    trip: {
      name: "Nilkreuzfahrt von Luxor nach Assuan an Bord der Hathor Dahabiya",
      description:
        "Die klassische Kreuzfahrt mit vier Nächten von Luxor nach Assuan an Bord der Hathor Dahabiya: Karnak, das Tal der Könige, Edfu, Kom Ombo und Philae im Rhythmus einer privaten Fahrt.",
      departure: "Luxor",
      arrival: "Assuan",
    },
    heroLines: ["Von Luxor", "nach Assuan", "auf dem Nil"],
    statement:
      "Die klassische Nilreise, von den monumentalen Ufern Luxors zur stillen Anmut Assuans: vier Nächte mit Tempeln, Feluken und Abenden im Sonnenuntergang auf dem Fluss, an Bord einer Luxus-Dahabiya für 32 Gäste.",
    detailsHref: "/cruises-list",
  },
  "aswan-to-luxor": {
    ...page(
      "/de/voyages/aswan-to-luxor",
      "Nilkreuzfahrt von Assuan nach Luxor | Hathor Dahabiya",
      "Drei Nächte von Assuan nach Luxor auf der Hathor Dahabiya: Philae, Kom Ombo und Edfu, dann die Tempel von Luxor, mit nur 32 Gästen an Bord.",
    ),
    name: "Nilkreuzfahrt von Assuan nach Luxor | Hathor Dahabiya",
    crumb: "Von Assuan nach Luxor",
    trip: {
      name: "Nilkreuzfahrt von Assuan nach Luxor an Bord der Hathor Dahabiya",
      description:
        "Drei Nächte von Assuan nach Luxor auf der Hathor Dahabiya: Philae, Kom Ombo und Edfu, dann die Tempel von Luxor, mit nur 32 Gästen an Bord.",
      departure: "Assuan",
      arrival: "Luxor",
    },
    heroLines: ["Von Assuan", "nach Luxor", "auf dem Nil"],
    statement:
      "Eine intime Passage von Süden nach Norden: drei Nächte mit Philae, Kom Ombo und Edfu im gemächlichen Tempo des Flusses bis zu den Tempeln von Luxor, an Bord einer Luxus-Dahabiya für 32 Gäste.",
    detailsHref: "/cruises-list",
  },
  "luxor-aswan-luxor": {
    ...page(
      "/de/voyages/luxor-aswan-luxor",
      "Nilkreuzfahrt mit 7 Nächten, Luxor–Assuan–Luxor | Hathor",
      "Die ganze Runde mit 7 Nächten und 8 Tagen von Luxor nach Assuan und zurück: jeder Tempel entlang der Strecke, an Bord der Hathor Dahabiya, für nur 32 Gäste.",
    ),
    name: "Nilkreuzfahrt mit 7 Nächten von Luxor nach Assuan und zurück | Hathor Dahabiya",
    crumb: "Luxor, Assuan und Luxor",
    trip: {
      name: "Nilkreuzfahrt mit 7 Nächten von Luxor nach Assuan und zurück an Bord der Hathor Dahabiya",
      description:
        "Die ganze Runde mit 7 Nächten und 8 Tagen auf der Hathor Dahabiya: von Luxor nach Assuan und zurück, mit jedem Tempel entlang der Strecke, an Bord einer Luxus-Dahabiya für 32 Gäste.",
      departure: "Luxor",
      arrival: "Luxor",
    },
    heroLines: ["Luxor, Assuan", "und Luxor", "auf dem Nil"],
    statement:
      "Die ganze Nilrunde zwischen Luxor und Assuan, hin und zurück: sieben Nächte und acht Tage, mit Zeit für jeden Tempel, für das Licht des Flusses und für die stilleren Tage, die nur eine ganze Reise schenkt, an Bord einer Luxus-Dahabiya für 32 Gäste.",
    detailsHref: "/cruises-list",
  },
};
