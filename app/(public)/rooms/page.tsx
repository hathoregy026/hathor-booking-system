import type { Metadata } from "next";
import { RoomsPageContent } from "@/components/pages/rooms/RoomsPageContent";
import { LUXURY_SUITES_PAGE } from "@/lib/page-content";
const OG_IMAGE = "/media/hathor/scraped/suites-hero.jpg";

export const metadata: Metadata = {
  title: "Luxury suites on Nile cruise",
  description: LUXURY_SUITES_PAGE.metaDescription,
  openGraph: {
    title: "Luxury suites on Nile cruise | Hathor Dahabiya Cruise",
    description: LUXURY_SUITES_PAGE.metaDescription,
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1920,
        height: 1280,
        alt: "Cabins and suites aboard Hathor Dahabiya",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxury suites on Nile cruise | Hathor Dahabiya Cruise",
    description: LUXURY_SUITES_PAGE.metaDescription,
    images: [OG_IMAGE],
  },
};

export default function RoomsPage() {
  return <RoomsPageContent />;
}
