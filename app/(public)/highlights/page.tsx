import type { Metadata } from "next";
import { HighlightsPageContent } from "@/components/pages/highlights/HighlightsPageContent";
import "../../awards-cinema.css";
import "../../highlights-page.css";

export const metadata: Metadata = {
  title: "Highlights | Hathor Nile Cruise",
  description:
    "Discover the moments that define your journey through ancient Egypt aboard Hathor.",
  openGraph: {
    title: "Highlights | Hathor",
    description:
      "A cinematic passage through temples, tombs and the eternal Nile.",
  },
};

export default function HighlightsPage() {
  return <HighlightsPageContent />;
}
