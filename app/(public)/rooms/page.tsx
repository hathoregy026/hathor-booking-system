import type { Metadata } from "next";
import { RoomsPageContent } from "@/components/pages/rooms/RoomsPageContent";
import { hathorImage } from "@/lib/hathor-media";

const OG_IMAGE = hathorImage("room-luxury");

export const metadata: Metadata = {
  title: "Luxury suites on Nile cruise",
  description:
    "Experience Hathor Luxury Dahabiya — elegant Nile cruise rooms, spacious suites, and magnificent royal suites with panoramic views and exclusive privacy.",
  openGraph: {
    title: "Luxury suites on Nile cruise | Hathor Dahabiya",
    description:
      "Discover luxury rooms, elegant suites, and royal suites aboard Hathor Dahabiya — authenticity and comfort on the timeless Nile.",
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1920,
        height: 1280,
        alt: "Luxury cabin aboard Hathor Dahabiya Nile cruise",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxury suites on Nile cruise | Hathor Dahabiya",
    description:
      "Discover luxury rooms, elegant suites, and royal suites aboard Hathor Dahabiya.",
    images: [OG_IMAGE],
  },
};

export default function RoomsPage() {
  return <RoomsPageContent />;
}
