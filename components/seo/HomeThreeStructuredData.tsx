import { localizedGuide } from "@/lib/i18n/route-copy";
import {
  indexedSiteLanguages,
  localizedHref,
  PUBLIC_LOCALE_HTML_LANG,
  type PublicLocale,
} from "@/lib/i18n/locale";
import { SEO_SITE_ORIGIN } from "@/lib/seo/site";

const SITE = SEO_SITE_ORIGIN;

/* The page's own words per language; the facts (vessel, contact) are shared. */
const PAGE_WORDS: Record<
  PublicLocale,
  {
    url: string;
    name: string;
    description: string;
    caption: string;
    home: string;
    trip: string;
    departure: string;
    arrival: string;
    itineraries: string;
    voyages: readonly [string, string, string];
  }
> = {
  en: {
    url: `${SITE}/`,
    name: "Hathor Dahabiya — Luxury Nile Cruise from Luxor to Aswan",
    description:
      "Hathor is a private luxury Dahabiya sailing the Nile between Luxor and Aswan for 32 guests: eight cabins, two suites, two Royal Suites, Seneb Spa, two restaurants and shore days at Esna, Edfu and Kom Ombo.",
    caption: "Hathor Dahabiya under sail on the Nile",
    home: "Home",
    trip: "Hathor Dahabiya — private Nile cruise, Luxor to Aswan",
    departure: "Luxor",
    arrival: "Aswan",
    itineraries: "Hathor Nile itineraries",
    voyages: [
      "Three nights — Aswan to Luxor",
      "Four nights — Luxor to Aswan",
      "Seven nights — round trip",
    ],
  },
  it: {
    url: `${SITE}/it`,
    name: "Hathor Dahabiya — Crociera di lusso sul Nilo da Luxor ad Assuan",
    description:
      "Hathor è una dahabiya privata di lusso che naviga sul Nilo tra Luxor e Assuan per 32 ospiti: otto cabine, due suite, due Royal Suite, la Seneb Spa, due ristoranti ed escursioni a terra a Esna, Edfu e Kom Ombo.",
    caption: "Hathor Dahabiya a vela sul Nilo",
    home: "Home",
    trip: "Hathor Dahabiya — crociera privata sul Nilo, da Luxor ad Assuan",
    departure: "Luxor",
    arrival: "Assuan",
    itineraries: "Gli itinerari di Hathor sul Nilo",
    voyages: [
      "Tre notti — da Assuan a Luxor",
      "Quattro notti — da Luxor ad Assuan",
      "Sette notti — andata e ritorno",
    ],
  },
};

/**
 * Structured data for the live homepage. Everything asserted here is visible on the page —
 * the vessel, the twelve rooms, the moorings, the three itinerary lengths and
 * the contact channels — so the markup describes the page rather than padding it.
 */
export function HomeThreeStructuredData({ locale = "en" }: { locale?: PublicLocale }) {
  const words = PAGE_WORDS[locale];
  const PAGE_URL = words.url;
  const PAGE_NAME = words.name;
  const PAGE_DESCRIPTION = words.description;
  const pageUrl = (path: string) => `${SITE}${localizedHref(path, locale)}`;
  const graph = [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: PAGE_NAME,
      description: PAGE_DESCRIPTION,
      inLanguage: PUBLIC_LOCALE_HTML_LANG[locale],
      isPartOf: { "@id": `${SITE}/#website` },
      primaryImageOfPage: { "@id": `${PAGE_URL}#primaryimage` },
      breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: `${SITE}/`,
      name: "Hathor Dahabiya",
      inLanguage: indexedSiteLanguages(),
      publisher: { "@id": `${SITE}/#organization` },
    },
    {
      "@type": "ImageObject",
      "@id": `${PAGE_URL}#primaryimage`,
      url: `${SITE}/media/hathor/home-hero-poster.webp`,
      caption: words.caption,
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: words.home, item: PAGE_URL },
      ],
    },
    {
      "@type": "TravelAgency",
      "@id": `${SITE}/#organization`,
      name: "Hathor Cruise",
      url: `${SITE}/`,
      email: "reservations@hathorcruise.com",
      telephone: "+201270496896",
      address: {
        "@type": "PostalAddress",
        streetAddress:
          "One Kattamiya, Tower 211, Floor 11, Flat 111, Ring Road",
        addressLocality: "Cairo",
        addressCountry: "EG",
      },
      areaServed: { "@type": "Country", name: "Egypt" },
      openingHours: "Sa-Th 09:00-17:00",
    },
    {
      "@type": "BoatTrip",
      "@id": `${PAGE_URL}#trip`,
      name: words.trip,
      description: PAGE_DESCRIPTION,
      provider: { "@id": `${SITE}/#organization` },
      departureBoatTerminal: { "@type": "BoatTerminal", name: words.departure },
      arrivalBoatTerminal: { "@type": "BoatTerminal", name: words.arrival },
    },
    {
      "@type": "ItemList",
      "@id": `${PAGE_URL}#itineraries`,
      name: words.itineraries,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: words.voyages[0],
          url: pageUrl("/voyages/aswan-to-luxor"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: words.voyages[1],
          url: pageUrl("/voyages/luxor-to-aswan"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: words.voyages[2],
          url: pageUrl("/voyages"),
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
      /* The same questions the guide shows on the page (lib/home-guide-content),
         so the markup never describes content a visitor cannot see. */
      mainEntity: localizedGuide(locale).faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ];

  return (
    <script
      type="application/ld+json"
      /* one graph, server-rendered: no client cost, no hydration mismatch */
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c"),
      }}
    />
  );
}
