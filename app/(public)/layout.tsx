import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Plus_Jakarta_Sans } from "next/font/google";
import { PublicLayout } from "@/components/public/PublicLayout";
import { HeroLogoSettingsProvider } from "@/components/public/HeroLogoSettingsProvider";
import { SiteImagesProvider } from "@/components/public/SiteImagesProvider";
import { TypographySettingsProvider } from "@/components/public/TypographySettingsProvider";
import { WebsiteTextProvider } from "@/components/public/WebsiteTextProvider";
import { resolveSiteImageMap } from "@/lib/resolve-site-images";
import { getHeroLogoTuneSafe, getHeroLogoTuneMobileSafe } from "@/lib/hero-logo-tune";
import { heroLogoTuneToImportantCss } from "@/lib/hero-logo-tune-shared";
import { getHieroglyphTuneSafe } from "@/lib/hieroglyph-tune";
import { hieroglyphTuneToImportantCss } from "@/lib/hieroglyph-tune-shared";
import {
  getTypographySettingsSafe,
  getTypographySettingsMobileSafe,
} from "@/lib/typography-settings";
import { typographyToImportantCss } from "@/lib/typography-settings-shared";
import { getWebsiteTextSafe, getWebsiteTextMobileSafe } from "@/lib/website-text";
import { combineDesktopAndPhoneCss } from "@/lib/admin-device-preview";
import "../hathor-fonts.css";
import "../public.css";
import "../lux-footer.css";
import "../interior-design-system.css";
import "../atelier-text-split.css";
import "../site-nav.css";
import "../public-site-hero.css";
import "../specular-button.css";
import "../hero-tint.css";
import "../hieroglyph-pattern.css";
import "../booking-modal.css";
import "../venetian-redesign.css";
import "../night-mode.css";

/** Public CMS data is edge-cached; admin save routes invalidate this layout. */
export const revalidate = 300;

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
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/^https?:\/\//, "")}`
      : "https://hathor-booking-system.vercel.app",
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
  const [
    siteImages,
    typography,
    typographyMobile,
    heroLogoTune,
    heroLogoTuneMobile,
    hieroglyphTune,
    websiteText,
    websiteTextMobile,
  ] = await Promise.all([
    resolveSiteImageMap(),
    getTypographySettingsSafe(),
    getTypographySettingsMobileSafe(),
    getHeroLogoTuneSafe(),
    getHeroLogoTuneMobileSafe(),
    getHieroglyphTuneSafe(),
    getWebsiteTextSafe(),
    getWebsiteTextMobileSafe(),
  ]);

  const displayFontStyle = {
    /* Installed local display face until Playfair file is added */
    ["--font-hathor-display" as string]: '"Gamgote", Georgia, serif',
  } as CSSProperties;

  const typographyCss = combineDesktopAndPhoneCss(
    typographyToImportantCss(typography),
    typographyToImportantCss(typographyMobile),
  );
  const logoTuneCss = combineDesktopAndPhoneCss(
    heroLogoTuneToImportantCss(heroLogoTune),
    heroLogoTuneToImportantCss(heroLogoTuneMobile),
  );
  const hieroglyphTuneCss = hieroglyphTuneToImportantCss(hieroglyphTune);

  return (
    <div
      className={`${agraham.variable} ${gabigaile.variable} ${gamgote.variable} ${quietLuxury.variable} ${plusJakarta.variable}`}
      style={displayFontStyle}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: typographyCss,
        }}
      />
      <style
        data-hathor-logo-tune-site
        dangerouslySetInnerHTML={{
          __html: logoTuneCss,
        }}
      />
      <style
        data-hathor-hieroglyph-tune-site
        dangerouslySetInnerHTML={{
          __html: hieroglyphTuneCss,
        }}
      />
      <HeroLogoSettingsProvider
        desktopPartsVariant={heroLogoTune.partsVariant}
        mobilePartsVariant={heroLogoTuneMobile.partsVariant}
      >
        <SiteImagesProvider images={siteImages}>
          <TypographySettingsProvider
            initial={typography}
            initialMobile={typographyMobile}
          >
            <WebsiteTextProvider
              initial={websiteText}
              initialMobile={websiteTextMobile}
            >
              <PublicLayout>{children}</PublicLayout>
            </WebsiteTextProvider>
          </TypographySettingsProvider>
        </SiteImagesProvider>
      </HeroLogoSettingsProvider>
    </div>
  );
}
