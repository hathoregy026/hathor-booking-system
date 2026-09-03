import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ComingSoonGate } from "@/components/public/ComingSoonGate";
import { PublicLayout } from "@/components/public/PublicLayout";
import { PageVisibilityProvider } from "@/components/public/PageVisibilityProvider";
import { HeroLogoSettingsProvider } from "@/components/public/HeroLogoSettingsProvider";
import { SiteImagesProvider } from "@/components/public/SiteImagesProvider";
import { TypographySettingsProvider } from "@/components/public/TypographySettingsProvider";
import { WebsiteTextProvider } from "@/components/public/WebsiteTextProvider";
import { WebsiteTextPageScope } from "@/components/public/WebsiteTextPageScope";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import { TEMPORARY_DEPLOYMENT_ROBOTS } from "@/lib/temporary-deployment-seo";
import {
  heroLogoTuneToImportantCss,
  heroLogoTuneToNarrowImportantCss,
} from "@/lib/hero-logo-tune-shared";
import { hieroglyphTuneToImportantCss } from "@/lib/hieroglyph-tune-shared";
import { typographyToImportantCss } from "@/lib/typography-settings-shared";
import {
  combineDesktopAndPhoneCss,
  combineDesktopAndNarrowCss,
} from "@/lib/admin-device-preview";
import "../hathor-fonts.css";
import "../public.css";
import "../lux-footer.css";
import "../interior-design-system.css";
import "../atelier-text-split.css";
import "../anima-title-split.css";
import "../site-nav.css";
import "../public-site-hero.css";
import "../specular-button.css";
import "../hero-tint.css";
import "../hieroglyph-pattern.css";
import "../booking-modal.css";
import "../venetian-redesign.css";
import "../night-mode.css";
import "../page-visibility.css";
import "../site-coming-soon.css";
import "../button-system.css";
import "../nav-controls.css";

/** Public CMS data is edge-cached; admin save routes invalidate this layout. */
export const revalidate = 300;

const agraham = localFont({
  src: "../../public/fonts/agraham-regular.woff2",
  variable: "--font-hathor-agraham",
  display: "swap",
});

const gabigaile = localFont({
  src: "../../public/fonts/Gabigaile.woff2",
  variable: "--font-hathor-gabigaile",
  display: "swap",
});

const gamgote = localFont({
  src: [
    {
      path: "../../public/fonts/Gamgote-Regular.woff2",
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
  src: "../../public/fonts/quietluxury-script.woff2",
  variable: "--font-hathor-quiet-luxury",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-hathor-body",
  weight: ["300", "400", "500", "600", "700"],
});

/*
 * Soft-launch: keep metadata conservative. Host-specific noindex for
 * *.vercel.app / easytravegypt is reinforced by middleware X-Robots-Tag —
 * do not call headers() here or every public route becomes dynamic.
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://www.hathorcruise.com"),
  title: {
    default: "Luxury Dahabiya Nile Cruise | Hathor Dahabiya",
    template: "%s | Hathor Dahabiya",
  },
  description:
    "Step into an aura of elegance and tranquility aboard the Hathor Dahabiya, where luxury glides gracefully along the Nile and the timeless beauty of Egypt surrounds you.",
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
  robots: TEMPORARY_DEPLOYMENT_ROBOTS,
};

export default async function PublicSiteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  /*
   * One request-scoped CMS bundle (unstable_cache, 300s). No headers()/connection()
   * so marketing HTML can ISR at the CDN.
   */
  const cms = await loadPublicCmsBundle();
  const welcomeSplash = cms.welcomeSplash;
  const liveSite = cms.liveSite;
  /* Visitor settings — work hosts unlock client-side via PageVisibilityChrome. */
  const pageVisibility = cms.pageVisibility;
  const siteIsLive = liveSite.enabled;

  const displayFontStyle = {
    /* Installed local display face until Playfair file is added */
    ["--font-hathor-display" as string]: '"Gamgote", Georgia, serif',
  } as CSSProperties;

  const typographyCss = combineDesktopAndPhoneCss(
    typographyToImportantCss(cms.typography),
    typographyToImportantCss(cms.typographyMobile),
  );
  const logoTuneCss = combineDesktopAndNarrowCss(
    heroLogoTuneToImportantCss(cms.heroLogoTune),
    heroLogoTuneToNarrowImportantCss(cms.heroLogoTuneMobile),
  );
  const hieroglyphTuneCss = hieroglyphTuneToImportantCss(cms.hieroglyphTune);

  return (
    <div
      className={`${agraham.variable} ${gabigaile.variable} ${gamgote.variable} ${quietLuxury.variable} ${plusJakarta.variable}`}
      style={displayFontStyle}
    >
      {siteIsLive ? (
        <style
          dangerouslySetInnerHTML={{
            __html: typographyCss,
          }}
        />
      ) : null}
      {siteIsLive ? (
        <style
          data-hathor-logo-tune-site
          dangerouslySetInnerHTML={{
            __html: logoTuneCss,
          }}
        />
      ) : null}
      {siteIsLive ? (
        <style
          data-hathor-hieroglyph-tune-site
          dangerouslySetInnerHTML={{
            __html: hieroglyphTuneCss,
          }}
        />
      ) : null}
      <HeroLogoSettingsProvider
        desktopPartsVariant={cms.heroLogoTune.partsVariant}
        mobilePartsVariant={cms.heroLogoTuneMobile.partsVariant}
      >
        <SiteImagesProvider images={cms.siteImages}>
          <TypographySettingsProvider
            initial={cms.typography}
            initialMobile={cms.typographyMobile}
          >
            <WebsiteTextProvider
              initial={cms.websiteText}
              initialMobile={cms.websiteTextMobile}
            >
              <WebsiteTextPageScope />
              <PageVisibilityProvider settings={pageVisibility}>
                <ComingSoonGate liveSite={liveSite}>
                  <PublicLayout
                    welcomeSplash={welcomeSplash}
                    liveSite={liveSite}
                  >
                    {children}
                  </PublicLayout>
                </ComingSoonGate>
              </PageVisibilityProvider>
            </WebsiteTextProvider>
          </TypographySettingsProvider>
        </SiteImagesProvider>
      </HeroLogoSettingsProvider>
    </div>
  );
}
