import type { Metadata } from "next";
import { CharterPageContent } from "@/components/pages/CharterPageContent";

export const metadata: Metadata = {
  title: "Private Dahabiya Charter on the Nile in Egypt",
  description:
    "Charter Hathor Dahabiya for a private Nile sailing between Luxor and Aswan, with exclusive suites, fine dining, and a dedicated crew.",
  keywords: [
    "private Dahabiya charter Egypt",
    "private Nile cruise Luxor Aswan",
    "luxury Nile boat charter",
    "exclusive Dahabiya cruise",
    "Hathor Dahabiya private charter",
  ],
  alternates: {
    canonical: "/charter",
  },
  openGraph: {
    title: "Private Dahabiya Charter on the Nile | Hathor",
    description:
      "Reserve Hathor Dahabiya exclusively for your party with a tailored Nile itinerary, private chef, dedicated crew, and luxury suites.",
    type: "website",
    images: [
      {
        url: "/media/hathor/r2/charter-hero.webp",
        width: 1920,
        height: 1280,
        alt: "Private Hathor Dahabiya charter sailing the Nile in Egypt",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Private Dahabiya Charter on the Nile | Hathor",
    description:
      "A private luxury Nile sailing between Luxor and Aswan, composed entirely around your party.",
    images: ["/media/hathor/r2/charter-hero.webp"],
  },
};

export default function CharterPage() {
  return <CharterPageContent />;
}
