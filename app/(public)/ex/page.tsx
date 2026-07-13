import type { Metadata } from "next";
import { preload } from "react-dom";
import { ExClient } from "./ExClient";
import { HATHOR_HERO_POSTER_SRC, HATHOR_HERO_VIDEO_SRC } from "@/lib/branding";
import "./ex.css";

export const metadata: Metadata = {
  title: "EX | Hathor Dahabiya",
  description:
    "Experience ultra-luxury on a private Dahabiya Nile cruise. Sail from Luxor to Aswan in exclusive suites with fine dining, spa, and timeless Egyptian elegance.",
  openGraph: {
    title: "EX | Hathor Dahabiya",
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
  robots: {
    index: false,
    follow: false,
  },
};

export default function ExPage() {
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
      <ExClient />
    </>
  );
}
