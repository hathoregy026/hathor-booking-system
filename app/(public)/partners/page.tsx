import type { Metadata } from "next";
import { PartnersPageContent } from "@/components/pages/PartnersPageContent";

export const metadata: Metadata = {
  title: "Hathor Dahabiya Travel and Hospitality Partners",
  description:
    "Meet the trusted travel and hospitality partners who share Hathor Dahabiya's standards for luxury Nile journeys, guest care, and thoughtful Egyptian travel.",
  keywords: [
    "Hathor Dahabiya partners",
    "Egypt luxury travel partners",
    "Nile cruise hospitality partners",
    "Dahabiya travel trade Egypt",
    "luxury Egypt tourism partnership",
  ],
  alternates: { canonical: "/partners" },
  openGraph: {
    title: "Travel and Hospitality Partners | Hathor Dahabiya",
    description:
      "Trusted worldwide: partners who share our care for the Nile, Egypt, and every Hathor guest.",
    type: "website",
    images: [
      {
        url: "/media/hathor/r2/about-hero.webp",
        width: 1920,
        height: 1280,
        alt: "Hathor Dahabiya and its trusted travel partners in Egypt",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Travel and Hospitality Partners | Hathor Dahabiya",
    description: "The trusted travel circle behind thoughtful Hathor journeys on the Nile.",
    images: ["/media/hathor/r2/about-hero.webp"],
  },
};

export default function PartnersPage() {
  return <PartnersPageContent />;
}
