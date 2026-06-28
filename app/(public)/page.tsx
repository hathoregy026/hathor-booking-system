import type { Metadata } from "next";
import { HomePageContent } from "@/components/home/HomePageContent";

export const metadata: Metadata = {
  title: "Luxury Dahabiya Nile Cruise | Hathor Dahabiya",
  description:
    "Experience ultra-luxury on a private Dahabiya Nile cruise. Sail from Luxor to Aswan in exclusive suites with fine dining, spa, and timeless Egyptian elegance.",
  keywords: [
    "Dahabiya Nile Cruise",
    "Luxury Egypt Cruise",
    "Private Nile Sailing",
    "Hathor Dahabiya",
  ],
  openGraph: {
    title: "Hathor Dahabiya | Ultra Luxury Nile Cruise",
    description: "Your luxurious Nile escape begins here",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hathor Dahabiya | Ultra Luxury Nile Cruise",
    description: "Your luxurious Nile escape begins here",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Home() {
  return <HomePageContent />;
}
