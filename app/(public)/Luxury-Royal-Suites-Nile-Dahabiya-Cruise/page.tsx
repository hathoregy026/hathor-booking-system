import type { Metadata } from "next";
import { RoyalSuitesPageContent } from "@/components/pages/RoyalSuitesPageContent";
import { ROYAL_SUITES_PAGE } from "@/lib/page-content";
const OG_IMAGE = "/media/hathor/scraped/royal-1.webp";

export const metadata: Metadata = {
  title: "Luxury Dahabiya Royal Suite",
  description: ROYAL_SUITES_PAGE.metaDescription,
  openGraph: {
    title: "Luxury Dahabiya Royal Suite | Private Dahabiya Nile cruise",
    description: ROYAL_SUITES_PAGE.metaDescription,
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1920,
        height: 1280,
        alt: "Royal suite with panoramic Nile view aboard Hathor Dahabiya",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxury Dahabiya Royal Suite | Private Dahabiya Nile cruise",
    description: ROYAL_SUITES_PAGE.metaDescription,
    images: [OG_IMAGE],
  },
};

export default function RoyalSuitesPage() {
  return <RoyalSuitesPageContent />;
}
