import type { Metadata } from "next";
import { RoyalSuitesPageContent } from "@/components/pages/RoyalSuitesPageContent";
import { ROYAL_SUITES_PAGE } from "@/lib/page-content";
import { hathorImage } from "@/lib/hathor-media";

const OG_IMAGE = hathorImage("room-royal");

export const metadata: Metadata = {
  title: "Royal Suites Nile Dahabiya",
  description: ROYAL_SUITES_PAGE.metaDescription,
  openGraph: {
    title: "Royal Suites Nile Dahabiya | Hathor",
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
    title: "Royal Suites Nile Dahabiya | Hathor",
    description: ROYAL_SUITES_PAGE.metaDescription,
    images: [OG_IMAGE],
  },
};

export default function RoyalSuitesPage() {
  return <RoyalSuitesPageContent />;
}
