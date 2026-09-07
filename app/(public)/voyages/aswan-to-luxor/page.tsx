import type { Metadata } from "next";
import "@/app/editorial-chrome.css";
import "@/app/voyages-editorial.css";
import { VoyagesPageContent } from "@/components/pages/voyages/VoyagesPageContent";
import {
  PageStructuredData,
  boatTripNode,
} from "@/components/seo/PageStructuredData";
import { getHomepageAccordionCruisesSafe } from "@/lib/homepage-accordion-cruises";
import { ASWAN_TO_LUXOR_SEO } from "@/lib/seo/page-metadata";
import { buildVoyagesPageItems } from "@/lib/voyages-page-content";

export const metadata: Metadata = ASWAN_TO_LUXOR_SEO;

export default async function AswanToLuxorVoyagePage() {
  const cruises = await getHomepageAccordionCruisesSafe();
  const voyages = buildVoyagesPageItems(cruises);
  const description =
    typeof ASWAN_TO_LUXOR_SEO.description === "string"
      ? ASWAN_TO_LUXOR_SEO.description
      : "";

  return (
    <>
      <PageStructuredData
        path="/voyages/aswan-to-luxor"
        name="Aswan to Luxor Nile Cruise | Hathor Dahabiya"
        description={description}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Voyages", path: "/voyages" },
          { name: "Aswan to Luxor", path: "/voyages/aswan-to-luxor" },
        ]}
        extra={[
          boatTripNode({
            path: "/voyages/aswan-to-luxor",
            name: "Aswan to Luxor Nile Cruise aboard Hathor Dahabiya",
            description,
            departure: "Aswan",
            arrival: "Luxor",
          }),
        ]}
      />
      <VoyagesPageContent
        voyages={voyages}
        heroTitleLinesOverride={["Aswan to", "Luxor", "Nile Cruise"]}
        nonCharterDetailsHref="/cruises-list"
      />
    </>
  );
}
