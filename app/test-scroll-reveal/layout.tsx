import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { PublicLayout } from "@/components/public/PublicLayout";
import { SiteImagesProvider } from "@/components/public/SiteImagesProvider";
import { resolveSiteImageMap } from "@/lib/resolve-site-images";
import "../public.css";
import "../site-nav.css";
import "../booking-modal.css";
import "./test-scroll-reveal.css";

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

export default async function TestScrollRevealLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteImages = await resolveSiteImageMap();

  return (
    <div className={`test-scroll-reveal-route ${playfair.variable} ${plusJakarta.variable}`}>
      <SiteImagesProvider images={siteImages}>
        <PublicLayout>{children}</PublicLayout>
      </SiteImagesProvider>
    </div>
  );
}
