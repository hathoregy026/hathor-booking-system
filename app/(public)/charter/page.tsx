import type { Metadata } from "next";
import { CharterPageContent } from "@/components/pages/CharterPageContent";
import {
  PageStructuredData,
  serviceNode,
} from "@/components/seo/PageStructuredData";
import { CHARTER_PAGE } from "@/lib/page-content";
import { CHARTER_SEO, CHARTER_SEO_TITLE } from "@/lib/seo/page-metadata";
import { seoAbsoluteUrl } from "@/lib/seo/site";
import "../../charter-editorial.css";
import "../../editorial-chrome.css";

export const metadata: Metadata = CHARTER_SEO;

/** "Luxor ↔ Aswan ↔ Luxor" → where the charter boards and where it turns for home. */
function passageEnds(route: string): { departure: string; arrival: string } {
  const stops = route.split(/\s*↔\s*/).map((stop) => stop.trim()).filter(Boolean);
  const first = stops[0] ?? "";
  const last = stops[stops.length - 1] ?? first;
  const roundTrip = stops.length > 2 && first === last;
  return { departure: first, arrival: roundTrip ? (stops[1] ?? last) : last };
}

export default function CharterPage() {
  const description =
    typeof CHARTER_SEO.description === "string" ? CHARTER_SEO.description : "";
  const origin = seoAbsoluteUrl("/");

  /*
   * The charter as a Service with its real passages as the offer catalogue —
   * the same seven routes the page offers, no invented prices or dates.
   */
  const charterService = {
    ...serviceNode({
      path: "/charter",
      name: "Private Dahabiya Charter",
      description,
      serviceType: "Private Nile cruise charter",
    }),
    url: seoAbsoluteUrl("/charter"),
    image: seoAbsoluteUrl("/media/hathor/r2/charter-hero.webp"),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Private Nile cruise charter passages",
      itemListElement: CHARTER_PAGE.overview.routes.map((route) => {
        const { departure, arrival } = passageEnds(route);
        return {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          itemOffered: {
            "@type": "BoatTrip",
            name: `Private Dahabiya charter · ${route}`,
            provider: { "@id": `${origin}#organization` },
            departureBoatTerminal: { "@type": "BoatTerminal", name: departure },
            arrivalBoatTerminal: { "@type": "BoatTerminal", name: arrival },
          },
        };
      }),
    },
  };

  return (
    <>
      <PageStructuredData
        path="/charter"
        name={CHARTER_SEO_TITLE}
        description={description}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Charter Dahabiya Cruise", path: "/charter" },
        ]}
        image="/media/hathor/r2/charter-hero.webp"
        extra={[charterService]}
      />
      <CharterPageContent />
    </>
  );
}
