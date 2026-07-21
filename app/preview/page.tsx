import type { Metadata } from "next";
import { PreviewHero } from "@/components/preview/PreviewHero";
import { PreviewPostHeroIntro } from "@/components/preview/PreviewPostHeroIntro";
import { PreviewItineraries } from "@/components/preview/PreviewItineraries";
import { HATHOR_HERO_POSTER_SRC } from "@/lib/branding";

export const metadata: Metadata = {
  title: "Homepage Preview | Hathor Dahabiya",
  description:
    "Preview of the Hathor Dahabiya luxury homepage — hero video, itineraries, and upcoming sections.",
  keywords: [
    "Dahabiya Nile Cruise",
    "Luxury Egypt Cruise",
    "Hathor Dahabiya",
    "Ultra Luxury Dahabiya Cruise",
  ],
  openGraph: {
    title: "Hathor Dahabiya | Ultra Luxury Nile Cruise",
    description: "Your luxurious Nile escape begins with the Hathor Dahabiya",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: HATHOR_HERO_POSTER_SRC,
        width: 1920,
        height: 1080,
        alt: "Luxury Nile cruise at sunset",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hathor Dahabiya | Ultra Luxury Nile Cruise",
    description: "Your luxurious Nile escape begins with the Hathor Dahabiya",
    images: [HATHOR_HERO_POSTER_SRC],
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
      <PreviewItineraries />
      <div className="preview-scroll-spacer" aria-hidden="true" />
    </>
  );
}
