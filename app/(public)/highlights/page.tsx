import type { Metadata } from "next";
import { HighlightsPageContent } from "@/components/pages/highlights/HighlightsPageContent";

export const metadata: Metadata = {
  title: "Authentic Egyptian Sailing | Hathor Dahabiya Cruise Highlights",
  description:
    "Discover Dahabiya cruise highlights — the Unfinished Obelisk, Temple of Hatshepsut, Valley of the Kings, and more along the Nile.",
  openGraph: {
    title: "Dahabiya Cruise Highlights | Hathor",
    description:
      "Explore ancient wonders and serene Nile sailing aboard the luxury Hathor Dahabiya.",
  },
};

export default function HighlightsPage() {
  return <HighlightsPageContent />;
}
