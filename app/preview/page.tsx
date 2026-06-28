import type { Metadata } from "next";
import { PreviewHero } from "@/components/preview/PreviewHero";
import { PreviewPostHeroIntro } from "@/components/preview/PreviewPostHeroIntro";
import { PreviewPostHeroMedia } from "@/components/preview/PreviewPostHeroMedia";
import { PreviewItineraries } from "@/components/preview/PreviewItineraries";

export const metadata: Metadata = {
  title: "Homepage Preview | Hathor Dahabiya",
  description:
    "Preview of the Hathor Dahabiya luxury homepage — hero, itineraries, and upcoming sections.",
  keywords: [
    "Dahabiya Nile Cruise",
    "Luxury Egypt Cruise",
    "Hathor Dahabiya",
  ],
  openGraph: {
    title: "Hathor Dahabiya | Ultra Luxury Nile Cruise",
    description: "Your luxurious Nile escape begins with the Hathor Dahabiya",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function PreviewPage() {
  return (
    <>
      <PreviewHero />
      <PreviewPostHeroIntro />
      <PreviewPostHeroMedia />
      <PreviewItineraries />
      <div className="preview-scroll-spacer" aria-hidden="true" />
    </>
  );
}
