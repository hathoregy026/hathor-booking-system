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
  gastronomy: page({
    path: "/it/gastronomy",
    title: "La cucina di una crociera di lusso sul Nilo | Hathor",
    description:
      "L’esperienza gastronomica di una crociera di lusso sul Nilo a bordo di Hathor Dahabiya: sapori egiziani e un servizio attento, a tavola dentro e sul ponte, tra Luxor e Assuan.",
    name: "La cucina sul Nilo | La gastronomia di Hathor Dahabiya",
    crumb: "Cucina",
  }),
  wellness: page({
    path: "/it/wellness",
    title: "Seneb Spa sul Nilo | Il benessere di Hathor Dahabiya",
    description:
      "La Seneb Spa e l’Historia Fitness a bordo di Hathor Dahabiya: trattamenti rigeneranti e movimento con vista sul fiume, tra Luxor e Assuan.",
    name: "Seneb Spa sul Nilo | Il benessere di Hathor Dahabiya",
    crumb: "Benessere",
  }),
  highlights: page({
    path: "/it/highlights",
    title: "Crociera sul Nilo: cosa vedere | Templi tra Luxor e Assuan",
    description:
      "Le giornate a terra con Hathor Dahabiya: Karnak, la Valle dei Re, Edfu, Kom Ombo e Philae, pensate come visite senza fretta, non come una lista da spuntare.",
    name: "Crociera sul Nilo: cosa vedere | Templi tra Luxor e Assuan",
    crumb: "Da non perdere",
    image: {
      url: "/media/hathor/r2/highlights-hero.webp",
      width: 1920,
      height: 1280,
      alt: "I templi da non perdere in una crociera sul Nilo con Hathor Dahabiya",
    },
  }),
} as const;
