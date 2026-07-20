import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Plus_Jakarta_Sans } from "next/font/google";
import { PublicLayout } from "@/components/public/PublicLayout";
import { SiteImagesProvider } from "@/components/public/SiteImagesProvider";
import { TypographySettingsProvider } from "@/components/public/TypographySettingsProvider";
import { resolveSiteImageMap } from "@/lib/resolve-site-images";
import { getHeroLogoTuneSafe } from "@/lib/hero-logo-tune";
import { heroLogoTuneToImportantCss } from "@/lib/hero-logo-tune-shared";
import {
  getTypographySettingsSafe,
  typographyToImportantCss,
} from "@/lib/typography-settings";
import "../hathor-fonts.css";
import "../public.css";
import "../site-nav.css";
import "../public-site-hero.css";
import "../hero-tint.css";
import "../hieroglyph-pattern.css";
import "../booking-modal.css";
import "../hathor-lux-pages.css";

export const dynamic = "force-dynamic";

const agraham = localFont({
  src: "../../public/fonts/agraham-regular.ttf",
  variable: "--font-hathor-agraham",
  display: "swap",
});

const gabigaile = localFont({
  src: "../../public/fonts/Gabigaile.otf",
  variable: "--font-hathor-gabigaile",
  display: "swap",
});

const gamgote = localFont({
  src: [
    {
      path: "../../public/fonts/Gamgote-Regular.otf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-hathor-gamgote",
  display: "swap",
  weight: "400",
  style: "normal",
  declarations: [{ prop: "font-synthesis", value: "none" }],
});

const quietLuxury = localFont({
  src: "../../public/fonts/quietluxury-script.otf",
  variable: "--font-hathor-quiet-luxury",
  display: "swap",
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
  children: ReactNode;
}>) {
  const [siteImages, typography, heroLogoTune] = await Promise.all([
    resolveSiteImageMap(),
    getTypographySettingsSafe(),
    getHeroLogoTuneSafe(),
  ]);

  const displayFontStyle = {
    /* Installed local display face until Playfair file is added */
    ["--font-hathor-display" as string]: '"Gamgote", Georgia, serif',
  } as CSSProperties;

  return (
    <div
      className={`${agraham.variable} ${gabigaile.variable} ${gamgote.variable} ${quietLuxury.variable} ${plusJakarta.variable}`}
      style={displayFontStyle}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: typographyToImportantCss(typography),
        }}
      />
      <style
        data-hathor-logo-tune-site
        dangerouslySetInnerHTML={{
          __html: heroLogoTuneToImportantCss(heroLogoTune),
        }}
      />
      <SiteImagesProvider images={siteImages}>
        <TypographySettingsProvider initial={typography}>
          <PublicLayout>{children}</PublicLayout>
        </TypographySettingsProvider>
      </SiteImagesProvider>
    </div>
  );
}
