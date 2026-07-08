import type { Metadata } from "next";
import { HighlightsPageContent } from "@/components/pages/highlights/HighlightsPageContent";

export const metadata: Metadata = {
  title: "The Collection | Hathor Nile Highlights",
  description:
    "A curated gallery of Nile landmarks — the Unfinished Obelisk, Temple of Hatshepsut, Valley of the Kings — aboard Hathor Dahabiya.",
  openGraph: {
    title: "The Collection | Hathor Highlights",
    description:
      "Whispered opulence along the Nile. Explore ancient wonders in editorial stillness.",
  },
};

export default function HighlightsPage() {
  return <HighlightsPageContent />;
}
