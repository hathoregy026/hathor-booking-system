import type { Metadata } from "next";

import { SuitesNormalHomepagePage } from "@/components/pages/SuitesNormalHomepagePage";
import { LUXURY_SUITES_PAGE } from "@/lib/page-content";

import "../suites-normal-clone.css";

const OG_IMAGE = "/media/hathor/scraped/suites-hero.webp";

export const metadata: Metadata = {
  title: "Luxury Suites on the Nile",
  description: LUXURY_SUITES_PAGE.metaDescription,
  openGraph: {
    title: "Luxury Suites on the Nile | Hathor Dahabiya Cruise",
    description: LUXURY_SUITES_PAGE.metaDescription,
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1920,
        height: 1280,
        alt: "Luxury suites aboard Hathor Dahabiya",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxury Suites on the Nile | Hathor Dahabiya Cruise",
    description: LUXURY_SUITES_PAGE.metaDescription,
    images: [OG_IMAGE],
  },
};

export default function SuitesPage() {
  return <SuitesNormalHomepagePage />;
}
