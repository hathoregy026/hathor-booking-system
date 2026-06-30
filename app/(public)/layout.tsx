import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { PublicLayout } from "@/components/public/PublicLayout";
import { SiteImagesProvider } from "@/components/public/SiteImagesProvider";
import { resolveSiteImageMap } from "@/lib/resolve-site-images";
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.hathorcruise.com",
  ),
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

export default async function PublicSiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteImages = await resolveSiteImageMap();

  return (
    <div className={`${playfair.variable} ${plusJakarta.variable}`}>
      <SiteImagesProvider images={siteImages}>
        <PublicLayout>{children}</PublicLayout>
      </SiteImagesProvider>
    </div>
  );
}
