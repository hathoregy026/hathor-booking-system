import { localePage } from "@/lib/i18n/pages-seo";

/**
 * Search settings and structured-data words for the Russian content pages.
 * Language, hreflang and the search switch come from the shared builder.
 * Titles lead with the Russian head terms ("Nilkreuzfahrt", "Dahabiya").
 * Server-only.
 */
export const RUSSIAN_PAGES = {
  about: localePage({
    path: "/ru/about",
    title: "Dahabiya-Kreuzfahrt auf dem Nil | Über die Hathor",
    description:
      "Die Hathor ist eine Luxus-Dahabiya für 32 Gäste auf dem Nil: acht Kabinen, zwei Suiten und zwei Royal Suites zwischen Luxor und Assuan, mit eigener Crew.",
    name: "Über uns: Hathor Dahabiya, eine private Fahrt auf dem Nil",
    crumb: "Über uns",
  }),
  contact: localePage({
    path: "/ru/contact",
    title: "Kontakt Hathor Dahabiya | Buchung von Nilkreuzfahrten",
    description:
      "Kontaktieren Sie die Reservierung der Hathor in Kairo zu Abfahrten, Privatchartern und freien Suiten. Täglich 09:00–17:00 Uhr, freitags geschlossen.",
    name: "Kontakt Hathor Dahabiya | Buchung von Nilkreuzfahrten",
    crumb: "Kontakt",
  }),
  gastronomy: localePage({
    path: "/ru/gastronomy",
    title: "Küche an Bord der Nilkreuzfahrt | Hathor Dahabiya",
    description:
      "Die Küche der Hathor Dahabiya, einer Luxuskreuzfahrt auf dem Nil: ägyptische Aromen und aufmerksamer Service im Saal und an Deck zwischen Luxor und Assuan.",
    name: "Küche auf dem Nil | Die Gastronomie der Hathor Dahabiya",
    crumb: "Küche",
  }),
  suites: localePage({
    path: "/ru/suites",
    title: "Luxussuiten für die Nilkreuzfahrt | Hathor Dahabiya",
    description:
      "Die Suiten der Hathor auf dem Nil: weite Residenzen mit Panoramafenstern, diskreter Komfort und die überschaubare Größe einer Dahabiya für 32 Gäste.",
    name: "Luxussuiten für die Nilkreuzfahrt | Hathor Dahabiya",
    crumb: "Suiten",
    image: {
      url: "/media/hathor/optimized/scraped-suites-hero.webp",
      width: 1920,
      height: 1280,
      alt: "Luxussuite an Bord der Hathor Dahabiya",
    },
  }),
  wellness: localePage({
    path: "/ru/wellness",
    title: "Seneb Spa auf dem Nil | Wellness der Hathor Dahabiya",
    description:
      "Das Seneb Spa und Historia Fitness an Bord der Hathor Dahabiya: wohltuende Behandlungen und Bewegung mit Blick auf den Fluss, zwischen Luxor und Assuan.",
    name: "Seneb Spa auf dem Nil | Wellness der Hathor Dahabiya",
    crumb: "Wellness",
  }),
  highlights: localePage({
    path: "/ru/highlights",
    title: "Nilkreuzfahrt: Tempel von Luxor bis Assuan | Hathor Dahabiya",
    description:
      "Die Tage an Land mit der Hathor Dahabiya: Karnak, das Tal der Könige, Edfu, Kom Ombo und Philae, in Ruhe besucht und nicht als Liste zum Abhaken.",
    name: "Nilkreuzfahrt: Tempel von Luxor bis Assuan | Hathor Dahabiya",
    crumb: "Höhepunkte",
    image: {
      url: "/media/hathor/r2/highlights-hero.webp",
      width: 1920,
      height: 1280,
      alt: "Die Tempel einer Nilkreuzfahrt mit der Hathor Dahabiya",
    },
  }),
  partners: localePage({
    path: "/ru/partners",
    title: "Reisepartner | Hathor Dahabiya",
    description:
      "Die Partner aus Reise und Gastgewerbe, die die Standards der Hathor Dahabiya für private Nilkreuzfahrten und die Betreuung der Gäste in Ägypten teilen.",
    name: "Reisepartner | Hathor Dahabiya",
    crumb: "Partner",
  }),
  terms: localePage({
    path: "/ru/terms-and-conditions",
    title: "Allgemeine Geschäftsbedingungen | Hathor Dahabiya",
    description:
      "Buchungs-, Zahlungs- und Stornobedingungen der Hathor Dahabiya: Inklusivleistungen, Pflichten der Gäste und Reiseregeln auf dem Nil.",
    name: "Allgemeine Geschäftsbedingungen | Hathor Dahabiya",
    crumb: "AGB",
  }),
  blogs: localePage({
    path: "/ru/blogs",
    title: "Nilkreuzfahrt: Tipps und Geschichten | Hathor Dahabiya",
    description:
      "Tipps und Geschichten für Ihre Nilkreuzfahrt: beste Reisezeit, Tempel von Luxor und Assuan, Packen, Kabinen und der ruhigere Rhythmus der Dahabiya Hathor.",
    name: "Nilkreuzfahrt: Tipps und Geschichten | Hathor Dahabiya",
    crumb: "Journal",
    image: {
      url: "/media/hathor/r2/blog-hero.webp",
      width: 1920,
      height: 1280,
      alt: "Geschichten aus dem Journal der Hathor vom Nil in Ägypten",
    },
  }),
} as const;
