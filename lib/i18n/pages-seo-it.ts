import { localePage } from "@/lib/i18n/pages-seo";

/**
 * Search settings and structured-data words for the Italian content pages
 * (about, contact, dining, wellness, highlights, partners, terms). Language,
 * hreflang and the search switch come from the shared builder. Server-only.
 */
export const ITALIAN_PAGES = {
  about: localePage({
    path: "/it/about",
    title: "Crociera in dahabiya sul Nilo in Egitto | Chi siamo, Hathor",
    description:
      "Hathor è una dahabiya di lusso per 32 ospiti sul Nilo, in Egitto: otto cabine, due suite e due Royal Suite, tra Luxor e Assuan, con un equipaggio dedicato.",
    name: "Chi siamo: Hathor Dahabiya, una navigazione privata sul Nilo",
    crumb: "Chi siamo",
  }),
  contact: localePage({
    path: "/it/contact",
    title: "Contatti Hathor Dahabiya | Prenotazioni crociere sul Nilo",
    description:
      "Contatti l’ufficio prenotazioni di Hathor al Cairo per partenze, charter privati e disponibilità delle suite. Ogni giorno 09:00–17:00, chiuso il venerdì.",
    name: "Contatti Hathor Dahabiya | Prenotazioni crociere sul Nilo",
    crumb: "Contatti",
  }),
  gastronomy: localePage({
    path: "/it/gastronomy",
    title: "La cucina di una crociera di lusso sul Nilo | Hathor",
    description:
      "La cucina di Hathor Dahabiya, crociera di lusso sul Nilo: sapori egiziani e un servizio attento, in sala e sul ponte, tra Luxor e Assuan.",
    name: "La cucina sul Nilo | La gastronomia di Hathor Dahabiya",
    crumb: "Cucina",
  }),
  suites: localePage({
    path: "/it/suites",
    title: "Suite di lusso per la crociera sul Nilo | Hathor Dahabiya",
    description:
      "Le suite di Hathor sul Nilo: ampie residenze con vetrate panoramiche, comfort riservato e la dimensione raccolta di una dahabiya per 32 ospiti.",
    name: "Suite di lusso per la crociera sul Nilo | Hathor Dahabiya",
    crumb: "Suite",
    image: {
      url: "/media/hathor/optimized/scraped-suites-hero.webp",
      width: 1920,
      height: 1280,
      alt: "Suite di lusso a bordo di Hathor Dahabiya",
    },
  }),
  wellness: localePage({
    path: "/it/wellness",
    title: "Seneb Spa sul Nilo | Il benessere di Hathor Dahabiya",
    description:
      "La Seneb Spa e l’Historia Fitness a bordo di Hathor Dahabiya: trattamenti rigeneranti e movimento con vista sul fiume, tra Luxor e Assuan.",
    name: "Seneb Spa sul Nilo | Il benessere di Hathor Dahabiya",
    crumb: "Benessere",
  }),
  highlights: localePage({
    path: "/it/highlights",
    title: "Crociera sul Nilo: cosa vedere | Templi tra Luxor e Assuan",
    description:
      "Le giornate a terra con Hathor Dahabiya: Karnak, la Valle dei Re, Edfu, Kom Ombo e Philae, visite senza fretta e non una lista da spuntare.",
    name: "Crociera sul Nilo: cosa vedere | Templi tra Luxor e Assuan",
    crumb: "Da non perdere",
    image: {
      url: "/media/hathor/r2/highlights-hero.webp",
      width: 1920,
      height: 1280,
      alt: "I templi da non perdere in una crociera sul Nilo con Hathor Dahabiya",
    },
  }),
  partners: localePage({
    path: "/it/partners",
    title: "Partner di viaggio | Hathor Dahabiya",
    description:
      "I partner del viaggio e dell’ospitalità che condividono gli standard di Hathor Dahabiya per crociere private sul Nilo e per la cura degli ospiti in Egitto.",
    name: "Partner di viaggio | Hathor Dahabiya",
    crumb: "Partner",
  }),
  terms: localePage({
    path: "/it/terms-and-conditions",
    title: "Termini e condizioni | Prenotazioni Hathor Dahabiya",
    description:
      "Condizioni di prenotazione, pagamento e cancellazione di Hathor Dahabiya: servizi inclusi, responsabilità degli ospiti e regole di viaggio sul Nilo.",
    name: "Termini e condizioni | Prenotazioni Hathor Dahabiya",
    crumb: "Termini e condizioni",
  }),
  blogs: localePage({
    path: "/it/blogs",
    title: "Crociera di lusso sul Nilo: consigli e storie | Blog Hathor",
    description:
      "Consigli e storie per una crociera sul Nilo: quando partire in dahabiya, i templi di Luxor e Assuan, cosa mettere in valigia e il ritmo dei viaggi Hathor.",
    name: "Crociera di lusso sul Nilo: consigli e storie | Blog Hathor",
    crumb: "Journal",
    image: {
      url: "/media/hathor/r2/blog-hero.webp",
      width: 1920,
      height: 1280,
      alt: "Le storie del journal di Hathor dal Nilo, in Egitto",
    },
  }),
} as const;
