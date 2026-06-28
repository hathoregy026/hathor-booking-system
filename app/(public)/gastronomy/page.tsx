import type { Metadata } from "next";
import { GastronomyPageContent } from "@/components/pages/GastronomyPageContent";

export const metadata: Metadata = {
  title: "Top Nile Cruise: Luxury & Culinary Experience Aboard Hathor",
  description:
    "Hathor Flavors — gourmet Nile cruise dining with Egyptian and international cuisine, elegant restaurants, and lounge bars.",
  openGraph: {
    title: "Hathor Gastronomy | Luxury Nile Dining",
    description:
      "Savor expertly prepared dishes, magical Nile views, and candlelit dinners aboard Hathor Dahabiya.",
  },
};

export default function GastronomyPage() {
  return <GastronomyPageContent />;
}
