import type { Metadata } from "next";
import { HighlightsPageContent } from "@/components/pages/highlights/HighlightsPageContent";

export const metadata: Metadata = {
  title: "Highlights | Hathor Nile Cruise",
  description:
    "A curated voyage through the heart of ancient Egypt aboard Hathor.",
};

export default function HighlightsPage() {
  return <HighlightsPageContent />;
}
