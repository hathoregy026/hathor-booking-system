import type { Metadata } from "next";
import { RoomsPageContent } from "@/components/pages/rooms/RoomsPageContent";
import { LUXURY_SUITES_PAGE } from "@/lib/page-content";
import { hathorImage } from "@/lib/hathor-media";

const OG_IMAGE = hathorImage("room-suite");

export const metadata: Metadata = {
  title: "Luxury suites on Nile cruise",
  description: LUXURY_SUITES_PAGE.metaDescription,
  openGraph: {
    title: "Luxury suites on Nile cruise | Hathor Dahabiya",
    description: LUXURY_SUITES_PAGE.metaDescription,
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1920,
        height: 1280,
        alt: "Luxury suite aboard Hathor Dahabiya Nile cruise",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxury suites on Nile cruise | Hathor Dahabiya",
    description: LUXURY_SUITES_PAGE.metaDescription,
    images: [OG_IMAGE],
  },
};

export default function RoomsPage() {
  return <RoomsPageContent />;
}
