import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

/**
 * Search settings and structured-data words for the Italian content pages
 * (about, contact, dining, wellness, highlights, partners, terms). Language,
 * hreflang and the search switch come from the shared builder. Server-only.
 */
type ItalianPage = {
  path: string;
  metadata: Metadata;
  /** WebPage name and the page's own breadcrumb label. */
  name: string;
  crumb: string;
  description: string;
};

const page = (input: {
  path: string;
  title: string;
  description: string;
  name: string;
  crumb: string;
  image?: { url: string; width: number; height: number; alt: string };
}): ItalianPage => ({
  path: input.path,
  name: input.name,
  crumb: input.crumb,
  description: input.description,
  metadata: buildPageMetadata({
    title: input.title,
    description: input.description,
    path: input.path,
    image: input.image,
  }),
});

export const ITALIAN_PAGES = {
  about: page({
    path: "/it/about",
    title: "Crociera in dahabiya sul Nilo in Egitto | Chi siamo, Hathor",
    description:
      "Hathor è una dahabiya di lusso per 32 ospiti in crociera sul Nilo, in Egitto: otto cabine, due suite e due Royal Suite, tra Luxor e Assuan con un equipaggio dedicato.",
    name: "Chi siamo: Hathor Dahabiya, una navigazione privata sul Nilo",
    crumb: "Chi siamo",
  }),
  contact: page({
    path: "/it/contact",
    title: "Contatti Hathor Dahabiya | Prenotazioni crociere sul Nilo",
    description:
      "Contatti l’ufficio prenotazioni di Hathor al Cairo per date di partenza, charter privati e disponibilità delle suite. Tutti i giorni 09:00–17:00, chiuso il venerdì.",
    name: "Contatti Hathor Dahabiya | Prenotazioni crociere sul Nilo",
    crumb: "Contatti",
  }),
} as const;
