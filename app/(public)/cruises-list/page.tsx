import type { Metadata } from "next";
import { MaskRevealPageContent } from "@/components/pages/MaskRevealPageContent";

export const metadata: Metadata = {
  title: "Dahabiya Cruises List | Hathor Nile Cruise",
  description:
    "Browse Hathor Dahabiya cruise itineraries from $4,500 — luxury cabins, suites, and royal suites on 3, 4, and 7-night Nile sailings.",
  alternates: {
    canonical: "/cruises-list",
  },
  openGraph: {
    title: "Dahabiya Cruises List | Hathor",
    description:
      "Explore exclusive Hathor itineraries — Aswan to Luxor, Luxor to Aswan, and round-trip sailings.",
  },
};

export default function CruisesListPage() {
  return <MaskRevealPageContent />;
}
