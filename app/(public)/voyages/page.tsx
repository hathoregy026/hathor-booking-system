import type { Metadata } from "next";
import "@/app/voyages-page.css";
import { VoyagesPageContent } from "@/components/pages/voyages/VoyagesPageContent";
import { getHomepageAccordionCruisesSafe } from "@/lib/homepage-accordion-cruises";
import {
  buildVoyagesPageItems,
  VOYAGES_PAGE,
} from "@/lib/voyages-page-content";

export const metadata: Metadata = {
  title: "Our Voyages | Hathor Nile Cruise",
  description: VOYAGES_PAGE.hero.subtitle,
  openGraph: {
    title: "Our Voyages | Hathor Dahabiya",
    description: VOYAGES_PAGE.hero.subtitle,
  },
};

export default async function VoyagesPage() {
  const cruises = await getHomepageAccordionCruisesSafe();
  const voyages = buildVoyagesPageItems(cruises);

  return <VoyagesPageContent voyages={voyages} />;
}
