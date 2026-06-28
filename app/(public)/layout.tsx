import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { PublicLayout } from "@/components/public/PublicLayout";
import "../public.css";
import "../booking-modal.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-hathor-display",
  weight: ["400", "500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-hathor-body",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Luxury Dahabiya Nile Cruise | Hathor Dahabiya",
    template: "%s | Hathor Dahabiya",
  },
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

export default function PublicSiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${playfair.variable} ${plusJakarta.variable}`}>
      <PublicLayout>{children}</PublicLayout>
    </div>
  );
}
