import type { Metadata } from "next";
import { HighlightsPageContent } from "@/components/pages/highlights/HighlightsPageContent";

export const metadata: Metadata = {
  title: "Dahabiya Cruise Highlights | Hathor Nile Cruise",
  description:
    "Discover Dahabiya cruise highlights — the Unfinished Obelisk, Temple of Hatshepsut, Valley of the Kings, and more along the Nile.",
  openGraph: {
    title: "Dahabiya Cruise Highlights | Hathor",
    description:
      "An editorial journey through Egypt's Nile landmarks aboard the luxury Hathor Dahabiya.",
  },
};

export default function HighlightsPage() {
  return <HighlightsPageContent />;
}
