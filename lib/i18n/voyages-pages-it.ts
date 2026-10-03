import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SEO_DEFAULT_OG_IMAGE } from "@/lib/seo/site";

/**
 * The four Italian Voyages pages: search settings, structured data words and
 * the page-specific hero / statement. Keyword-led titles use the Italian head
 * terms ("crociera sul Nilo", "Luxor", "Assuan"). Server-only.
 */

export type VoyagePageKey = "voyages" | "luxor-to-aswan" | "aswan-to-luxor" | "luxor-aswan-luxor";

type ItalianVoyagePage = {
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

const image = {
  ...SEO_DEFAULT_OG_IMAGE,
  alt: "Hathor Dahabiya in navigazione sul Nilo, crociera di lusso tra Luxor e Assuan",
};

const page = (
  path: string,
  title: string,
  description: string,
): { path: string; metadata: Metadata } => ({
  path,
  metadata: buildPageMetadata({ title, description, path, image }),
});

export const ITALIAN_VOYAGE_PAGES: Record<VoyagePageKey, ItalianVoyagePage> = {
  voyages: {
    ...page(
      "/it/voyages",
      "Crociere sul Nilo da Luxor e Assuan: gli itinerari | Hathor Dahabiya",
      "Scelga il Suo itinerario in dahabiya tra Luxor e Assuan: tre, quattro o sette notti di navigazione privata, visite ai templi e vita a bordo tutto incluso.",
    ),
    name: "Crociere sul Nilo da Luxor e Assuan | Hathor Dahabiya",
    crumb: "Viaggi",
    trip: {
      name: "Gli itinerari di Hathor Dahabiya sul Nilo",
      description: "Viaggi di tre, quattro e sette notti con Hathor tra Luxor e Assuan.",
      departure: "Luxor",
      arrival: "Assuan",
    },
    heroLines: ["I nostri viaggi", "plasmati", "dal Nilo"],
  },
  "luxor-to-aswan": {
    ...page(
      "/it/voyages/luxor-to-aswan",
      "Crociera sul Nilo da Luxor ad Assuan | Hathor Dahabiya",
      "La classica crociera di quattro notti da Luxor ad Assuan a bordo di Hathor Dahabiya: Karnak, la Valle dei Re, Edfu, Kom Ombo e File al ritmo di una navigazione privata.",
    ),
    name: "Crociera sul Nilo da Luxor ad Assuan | Hathor Dahabiya",
    crumb: "Da Luxor ad Assuan",
    trip: {
      name: "Crociera sul Nilo da Luxor ad Assuan a bordo di Hathor Dahabiya",
      description:
        "La classica crociera di quattro notti da Luxor ad Assuan a bordo di Hathor Dahabiya: Karnak, la Valle dei Re, Edfu, Kom Ombo e File al ritmo di una navigazione privata.",
      departure: "Luxor",
      arrival: "Assuan",
    },
    heroLines: ["Da Luxor", "ad Assuan", "sul Nilo"],
    statement:
      "Il classico viaggio sul Nilo, dalle rive monumentali di Luxor alla grazia quieta di Assuan: quattro notti di templi, feluche e serate illuminate dal tramonto sul fiume, a bordo di una dahabiya di lusso per 32 ospiti.",
    detailsHref: "/cruises-list",
  },
  "aswan-to-luxor": {
    ...page(
      "/it/voyages/aswan-to-luxor",
      "Crociera sul Nilo da Assuan a Luxor | Hathor Dahabiya",
      "Tre notti da Assuan a Luxor su Hathor Dahabiya: File, Kom Ombo ed Edfu, poi i templi di Luxor, con soli 32 ospiti a bordo.",
    ),
    name: "Crociera sul Nilo da Assuan a Luxor | Hathor Dahabiya",
    crumb: "Da Assuan a Luxor",
    trip: {
      name: "Crociera sul Nilo da Assuan a Luxor a bordo di Hathor Dahabiya",
      description:
        "Tre notti da Assuan a Luxor su Hathor Dahabiya: File, Kom Ombo ed Edfu, poi i templi di Luxor, con soli 32 ospiti a bordo.",
      departure: "Assuan",
      arrival: "Luxor",
    },
    heroLines: ["Da Assuan", "a Luxor", "sul Nilo"],
    statement:
      "Una traversata intima da sud a nord: tre notti tra File, Kom Ombo ed Edfu al passo senza fretta di una dahabiya, fino ai templi di Luxor, a bordo di una dahabiya di lusso per 32 ospiti.",
    detailsHref: "/cruises-list",
  },
  "luxor-aswan-luxor": {
    ...page(
      "/it/voyages/luxor-aswan-luxor",
      "Crociera sul Nilo di 7 notti, Luxor–Assuan–Luxor | Hathor Dahabiya",
      "Il giro completo di 7 notti e 8 giorni su Hathor Dahabiya: da Luxor ad Assuan e ritorno, con ogni tempio lungo il percorso, a bordo di una dahabiya di lusso per 32 ospiti.",
    ),
    name: "Crociera sul Nilo di 7 notti da Luxor ad Assuan e ritorno | Hathor Dahabiya",
    crumb: "Luxor, Assuan e Luxor",
    trip: {
      name: "Crociera sul Nilo di 7 notti da Luxor ad Assuan e ritorno a bordo di Hathor Dahabiya",
      description:
        "Il giro completo di 7 notti e 8 giorni su Hathor Dahabiya: da Luxor ad Assuan e ritorno, con ogni tempio lungo il percorso, a bordo di una dahabiya di lusso per 32 ospiti.",
      departure: "Luxor",
      arrival: "Luxor",
    },
    heroLines: ["Luxor, Assuan", "e Luxor", "sul Nilo"],
    statement:
      "Il circuito completo del Nilo tra Luxor e Assuan, andata e ritorno: sette notti e otto giorni, con il tempo per ogni tempio, per la luce del fiume e per le giornate più quiete che solo un giro completo concede, a bordo di una dahabiya di lusso per 32 ospiti.",
    detailsHref: "/cruises-list",
  },
};
