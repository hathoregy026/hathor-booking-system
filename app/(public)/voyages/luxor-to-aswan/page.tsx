import type { Metadata } from "next";
import "@/app/editorial-chrome.css";
import "@/app/voyages-editorial.css";
import { VoyagesPageContent } from "@/components/pages/voyages/VoyagesPageContent";
import {
  PageStructuredData,
  boatTripNode,
} from "@/components/seo/PageStructuredData";
import { getHomepageAccordionCruisesSafe } from "@/lib/homepage-accordion-cruises";
import { LUXOR_TO_ASWAN_SEO } from "@/lib/seo/page-metadata";
import { buildVoyagesPageItems } from "@/lib/voyages-page-content";

export const metadata: Metadata = LUXOR_TO_ASWAN_SEO;

export default async function LuxorToAswanVoyagePage() {
  const cruises = await getHomepageAccordionCruisesSafe();
  const voyages = buildVoyagesPageItems(cruises);
  const description =
    typeof LUXOR_TO_ASWAN_SEO.description === "string"
      ? LUXOR_TO_ASWAN_SEO.description
      : "";

  return (
    <>
      <PageStructuredData
        path="/voyages/luxor-to-aswan"
        name="Luxor to Aswan Nile Cruise | Hathor Dahabiya"
        description={description}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Voyages", path: "/voyages" },
          { name: "Luxor to Aswan", path: "/voyages/luxor-to-aswan" },
        ]}
        extra={[
          boatTripNode({
            path: "/voyages/luxor-to-aswan",
            name: "Luxor to Aswan Nile Cruise aboard Hathor Dahabiya",
            description,
            departure: "Luxor",
            arrival: "Aswan",
          }),
        ]}
      />
      <VoyagesPageContent
        voyages={voyages}
        heroTitleLinesOverride={["Luxor to", "Aswan", "Nile Cruise"]}
        nonCharterDetailsHref="/cruises-list"
      />
    </>
  );
}
