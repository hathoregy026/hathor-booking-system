import type { Metadata } from "next";
import { LuxuryCabinsPageContent } from "@/components/pages/LuxuryCabinsPageContent";
import { LUXURY_CABINS_PAGE } from "@/lib/page-content";
const OG_IMAGE = "/media/hathor/r2/room-luxury.webp";

export const metadata: Metadata = {
  title: "Small Luxury Nile Cruise Rooms",
  description: LUXURY_CABINS_PAGE.metaDescription,
  openGraph: {
    title: "Small Luxury Nile Cruise Rooms | Boutique Nile Cruise Hathor Dahabiya",
    description: LUXURY_CABINS_PAGE.metaDescription,
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1920,
        height: 1280,
        alt: "Luxury cabin with Nile view aboard Hathor Dahabiya",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Small Luxury Nile Cruise Rooms | Boutique Nile Cruise Hathor Dahabiya",
    description: LUXURY_CABINS_PAGE.metaDescription,
    images: [OG_IMAGE],
  },
};

export default function LuxuryCabinsPage() {
  return <LuxuryCabinsPageContent />;
}
