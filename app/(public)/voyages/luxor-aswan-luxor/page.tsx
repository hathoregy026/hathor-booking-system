import type { Metadata } from "next";
import "@/app/editorial-chrome.css";
import "@/app/voyages-editorial.css";
import { VoyagesPageContent } from "@/components/pages/voyages/VoyagesPageContent";
import {
  PageStructuredData,
  boatTripNode,
} from "@/components/seo/PageStructuredData";
import { getHomepageAccordionCruisesSafe } from "@/lib/homepage-accordion-cruises";
import { LUXOR_ASWAN_LUXOR_SEO } from "@/lib/seo/page-metadata";
import { buildVoyagesPageItems } from "@/lib/voyages-page-content";

export const metadata: Metadata = LUXOR_ASWAN_LUXOR_SEO;

export default async function LuxorAswanLuxorVoyagePage() {
  const cruises = await getHomepageAccordionCruisesSafe();
  const voyages = buildVoyagesPageItems(cruises);
  const description =
    typeof LUXOR_ASWAN_LUXOR_SEO.description === "string"
      ? LUXOR_ASWAN_LUXOR_SEO.description
      : "";

  return (
    <>
      <PageStructuredData
        path="/voyages/luxor-aswan-luxor"
        name="7 Night Luxor to Aswan Nile Cruise | Hathor Dahabiya"
        description={description}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Voyages", path: "/voyages" },
          { name: "Luxor, Aswan & Luxor", path: "/voyages/luxor-aswan-luxor" },
        ]}
        extra={[
          boatTripNode({
            path: "/voyages/luxor-aswan-luxor",
            name: "7 Night Luxor to Aswan Nile Cruise aboard Hathor Dahabiya",
            description,
            departure: "Luxor",
            arrival: "Luxor",
          }),
        ]}
      />
      <VoyagesPageContent
        voyages={voyages}
        heroTitleLinesOverride={["Luxor, Aswan", "& Luxor", "Nile Cruise"]}
        nonCharterDetailsHref="/cruises-list"
      />
    </>
  );
}
