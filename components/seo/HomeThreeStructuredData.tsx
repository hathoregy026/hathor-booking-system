import { SEO_SITE_ORIGIN } from "@/lib/seo/site";

const SITE = SEO_SITE_ORIGIN;
const PAGE_URL = `${SITE}/`;
const PAGE_NAME = "Hathor Dahabiya — Luxury Nile Cruise from Luxor to Aswan";
const PAGE_DESCRIPTION =
  "Hathor is a private luxury Dahabiya sailing the Nile between Luxor and Aswan for just twelve guests: eight cabins, two suites, two Royal Suites, Seneb Spa, two restaurants and shore days at Esna, Edfu and Kom Ombo.";

/**
 * Structured data for the live homepage. Everything asserted here is visible on the page —
 * the vessel, the twelve rooms, the moorings, the three itinerary lengths and
 * the contact channels — so the markup describes the page rather than padding it.
 */
export function HomeThreeStructuredData() {
  const graph = [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: PAGE_NAME,
      description: PAGE_DESCRIPTION,
      inLanguage: "en",
      isPartOf: { "@id": `${SITE}/#website` },
      primaryImageOfPage: { "@id": `${PAGE_URL}#primaryimage` },
      breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: `${SITE}/`,
      name: "Hathor Dahabiya",
      inLanguage: "en",
      publisher: { "@id": `${SITE}/#organization` },
    },
    {
      "@type": "ImageObject",
      "@id": `${PAGE_URL}#primaryimage`,
      url: `${SITE}/media/hathor/home-hero-poster.webp`,
      caption: "Hathor Dahabiya under sail on the Nile",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
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
      name: "Hathor Dahabiya — private Nile cruise, Luxor to Aswan",
      description: PAGE_DESCRIPTION,
      provider: { "@id": `${SITE}/#organization` },
      departureBoatTerminal: { "@type": "BoatTerminal", name: "Luxor" },
      arrivalBoatTerminal: { "@type": "BoatTerminal", name: "Aswan" },
    },
    {
      "@type": "ItemList",
      "@id": `${PAGE_URL}#itineraries`,
      name: "Hathor Nile itineraries",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Three nights — Aswan to Luxor",
          url: `${SITE}/voyages/aswan-to-luxor`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Four nights — Luxor to Aswan",
          url: `${SITE}/voyages/luxor-to-aswan`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Seven nights — round trip",
          url: `${SITE}/voyages`,
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "How many guests does Hathor Dahabiya carry?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Twelve. Hathor is arranged across three decks with eight cabins of 22 sqm, two suites of 46 sqm and two Royal Suites of 56 sqm.",
          },
        },
        {
          "@type": "Question",
          name: "Where does a Hathor Nile cruise sail?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Between Luxor and Aswan, mooring at Esna, Edfu and Kom Ombo. Three-night, four-night and seven-night itineraries are available, as well as private charter.",
          },
        },
        {
          "@type": "Question",
          name: "What is a Dahabiya?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A traditional Egyptian sailing boat. Because a Dahabiya travels under sail rather than engine and carries very few guests, it moors at quieter anchorages than a large Nile cruiser can reach.",
          },
        },
      ],
    },
  ];

  return (
    <script
      type="application/ld+json"
      /* one graph, server-rendered: no client cost, no hydration mismatch */
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}
