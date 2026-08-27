import type { Metadata } from "next";
import { HighlightsPageContent } from "@/components/pages/highlights/HighlightsPageContent";

export const metadata: Metadata = {
  title: "Dahabiya Nile Cruise Highlights in Egypt",
  description:
    "Discover Hathor Dahabiya cruise highlights: ancient temples, Nile landscapes, private suites, fine dining, and unhurried sailing between Luxor and Aswan.",
  keywords: [
    "Dahabiya Nile cruise highlights",
    "Luxor Aswan Nile attractions",
    "luxury Egypt cruise experiences",
    "Hathor Dahabiya highlights",
    "Valley of the Kings Nile cruise",
  ],
  alternates: { canonical: "/highlights" },
  openGraph: {
    title: "Dahabiya Nile Cruise Highlights | Hathor",
    description:
      "Ancient landmarks, private river living, fine dining, and the changing light of the Nile aboard Hathor Dahabiya.",
    type: "website",
    images: [
      {
        url: "/media/hathor/r2/highlights-hero.webp",
        width: 1920,
        height: 1280,
        alt: "Hathor Dahabiya cruise highlights on the Nile in Egypt",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dahabiya Nile Cruise Highlights | Hathor",
    description:
      "Explore the landmarks, river life, dining, and private comfort of a Hathor Dahabiya journey.",
    images: ["/media/hathor/r2/highlights-hero.webp"],
  },
};

export default function HighlightsPage() {
  return <HighlightsPageContent />;
}
