import type { Metadata } from "next";
import { CruisesPageContent } from "@/components/pages/CruisesPageContent";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";

export const metadata: Metadata = {
  title: "Dahabiya Cruises List | Hathor Nile Cruise",
  description:
    "Browse Hathor Dahabiya cruise itineraries from $4,500 — luxury cabins, suites, and royal suites on 3, 4, and 7-night Nile sailings.",
  openGraph: {
    title: "Dahabiya Cruises List | Hathor",
    description:
      "Explore exclusive Hathor itineraries — Aswan to Luxor, Luxor to Aswan, and round-trip sailings.",
  },
};

export default function CruisesPage() {
  return <CruisesPageContent cruises={HATHOR_CRUISES} />;
}
