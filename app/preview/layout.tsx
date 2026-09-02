import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { PublicThemeProvider } from "@/components/public/PublicThemeProvider";
import { resolveSiteImageMap } from "@/lib/resolve-site-images";
import { SiteImagesProvider } from "@/components/public/SiteImagesProvider";
import { Footer } from "@/components/layout/Footer";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import "../public.css";
import "../site-nav.css";
import "../night-mode.css";
import "./preview.css";
import "../nav-controls.css";

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
  title: "Design Preview | Hathor Dahabiya",
  description:
    "Preview of the Hathor Dahabiya luxury homepage: header and hero section.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PreviewLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteImages = await resolveSiteImageMap();

  return (
    <div className={`${playfair.variable} ${plusJakarta.variable}`}>
      <PublicThemeProvider>
        <SiteImagesProvider images={siteImages}>
          <div className="public-site preview-site hathor-site">
            <PublicNavbar />
            <main className="preview-main">{children}</main>
            <Footer />
          </div>
        </SiteImagesProvider>
      </PublicThemeProvider>
    </div>
  );
}
