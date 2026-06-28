import type { Metadata } from "next";
import { preload } from "react-dom";
import { HomePageContent } from "@/components/home/HomePageContent";
import { HATHOR_HERO_POSTER_SRC, HATHOR_HERO_VIDEO_SRC } from "@/lib/branding";

export const metadata: Metadata = {
  title: "Luxury Dahabiya Nile Cruise | Hathor Dahabiya",
  description:
    "Experience ultra-luxury on a private Dahabiya Nile cruise. Sail from Luxor to Aswan in exclusive suites with fine dining, spa, and timeless Egyptian elegance.",
  keywords: [
    "Dahabiya Nile Cruise",
    "Luxury Egypt Cruise",
    "Private Nile Sailing",
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
    index: true,
    follow: true,
  },
};

export default function Home() {
  preload(HATHOR_HERO_POSTER_SRC, { as: "image", fetchPriority: "high" });
  preload(HATHOR_HERO_VIDEO_SRC, { as: "fetch", fetchPriority: "high" });

  return (
    <>
      <link
        rel="preload"
        href={HATHOR_HERO_VIDEO_SRC}
        as="video"
        type="video/mp4"
        fetchPriority="high"
      />
      <HomePageContent />
    </>
  );
}
