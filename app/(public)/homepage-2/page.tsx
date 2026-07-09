import type { Metadata } from "next";
import { HATHOR_HERO_POSTER_SRC } from "@/lib/branding";
import { HomePage2Client } from "./HomePage2Client";
import "./homepage-2.css";

const BACK_LOGO_SRC =
  "/branding/hathor-logo-behing-the-sheet-egypt-toors-pyramids.svg";

export const metadata: Metadata = {
  title: "Homepage 2 | Hathor Dahabiya",
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
    title: "Homepage 2 | Hathor Dahabiya",
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
    title: "Homepage 2 | Hathor Dahabiya",
    description: "Your luxurious Nile escape begins with the Hathor Dahabiya",
    images: [HATHOR_HERO_POSTER_SRC],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function HomePage2() {
  return (
    <>
      <link rel="preload" href={BACK_LOGO_SRC} as="image" type="image/svg+xml" />
      <HomePage2Client />
    </>
  );
}
