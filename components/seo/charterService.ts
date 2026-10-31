import { serviceNode } from "@/components/seo/PageStructuredData";
import { CHARTER_PAGE } from "@/lib/page-content";
import { seoAbsoluteUrl } from "@/lib/seo/site";

/** "Luxor ↔ Aswan ↔ Luxor" → where the charter boards and where it turns for home. */
function passageEnds(route: string): { departure: string; arrival: string } {
  const stops = route.split(/\s*↔\s*/).map((stop) => stop.trim()).filter(Boolean);
  const first = stops[0] ?? "";
  const last = stops[stops.length - 1] ?? first;
  const roundTrip = stops.length > 2 && first === last;
  return { departure: first, arrival: roundTrip ? (stops[1] ?? last) : last };
}

/*
 * The charter as a Service with its real passages as the offer catalogue —
 * the same seven routes the page offers, no invented prices or dates. Each
 * language passes its own words; `place` names a stop in that language.
 */
export function charterServiceNode(input: {
  path: string;
  name: string;
  description: string;
  serviceType: string;
  catalogName: string;
  tripName: (route: string) => string;
  place?: (name: string) => string;
}) {
  const origin = seoAbsoluteUrl("/");
  const place = input.place ?? ((name: string) => name);
  return {
    ...serviceNode({
      path: input.path,
      name: input.name,
      description: input.description,
      serviceType: input.serviceType,
    }),
    url: seoAbsoluteUrl(input.path),
    image: seoAbsoluteUrl("/media/hathor/r2/charter-hero.webp"),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: input.catalogName,
      itemListElement: CHARTER_PAGE.overview.routes.map((route) => {
        const { departure, arrival } = passageEnds(route);
        return {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          itemOffered: {
            "@type": "BoatTrip",
            name: input.tripName(place(route)),
            provider: { "@id": `${origin}#organization` },
            departureBoatTerminal: { "@type": "BoatTerminal", name: place(departure) },
            arrivalBoatTerminal: { "@type": "BoatTerminal", name: place(arrival) },
          },
        };
      }),
    },
  };
}
