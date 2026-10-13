import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { SiteComingSoon } from "@/components/public/SiteComingSoon";
import { SiteImagesProvider } from "@/components/public/SiteImagesProvider";
import { resolveComingSoonForRequest } from "@/lib/live-site-gate";
import { getLiveSiteSettingsSafe } from "@/lib/live-site-settings";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import "../public.css";
import "../site-nav.css";
import "../night-mode.css";
import "../site-coming-soon.css";
import "../button-system.css";
import "../nav-controls.css";

/*
 * preload: false — the production build packs these font rules into a CSS file
 * the public pages share, so a preload here was fetched on every public page.
 * They still load wherever this layout's text uses them.
 */
const playfair = localFont({
  src: "../../public/fonts/Dynalight,Playfair_Display/PlayfairDisplay-VariableFont_wght.woff2",
  variable: "--font-booking-serif",
  weight: "400 700",
  style: "normal",
  display: "swap",
  adjustFontFallback: "Times New Roman",
  preload: false,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-booking-sans",
  weight: ["300", "400", "500", "600", "700"],
  preload: false,
});

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function BookRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const liveSite = await getLiveSiteSettingsSafe();
  const comingSoonActive = await resolveComingSoonForRequest(liveSite);
  if (comingSoonActive) {
    return (
      <SiteComingSoon backgroundImageUrl={liveSite.backgroundImageUrl} />
    );
  }

  const cms = await loadPublicCmsBundle();

  return (
    <div className={`${playfair.variable} ${inter.variable}`}>
      <SiteImagesProvider images={cms.siteImages}>{children}</SiteImagesProvider>
    </div>
  );
}
