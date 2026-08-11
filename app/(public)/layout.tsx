import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Plus_Jakarta_Sans } from "next/font/google";
import { PublicLayout } from "@/components/public/PublicLayout";
import { PageVisibilityProvider } from "@/components/public/PageVisibilityProvider";
import { HeroLogoSettingsProvider } from "@/components/public/HeroLogoSettingsProvider";
import { SiteImagesProvider } from "@/components/public/SiteImagesProvider";
import { TypographySettingsProvider } from "@/components/public/TypographySettingsProvider";
import { WebsiteTextProvider } from "@/components/public/WebsiteTextProvider";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import {
  resolveComingSoonForRequest,
  resolvePageVisibilityForRequest,
} from "@/lib/live-site-gate";
import {
  getWelcomeSplashBlockingScript,
  getWelcomeSplashCriticalStyle,
} from "@/lib/public-theme";
import { WELCOME_SPLASH_PUBLIC_ENABLED } from "@/lib/welcome-splash-settings-shared";
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
  /*
   * Previously 8 parallel SiteSetting/image queries (plus mobile cascades).
   * Now one request-scoped bundle: ≤2 DB round-trips.
   */
  const cms = await loadPublicCmsBundle();
  const welcomeSplash = cms.welcomeSplash;
  const liveSite = cms.liveSite;
  const pageVisibility = await resolvePageVisibilityForRequest(
    cms.pageVisibility,
  );
  const comingSoonActive = await resolveComingSoonForRequest(liveSite);
  const siteIsLive = !comingSoonActive;

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
        <script
          dangerouslySetInnerHTML={{
            __html: getWelcomeSplashBlockingScript(
              WELCOME_SPLASH_PUBLIC_ENABLED && welcomeSplash.enabled,
              welcomeSplash.imageUrl,
            ),
          }}
        />
      ) : null}
      {siteIsLive ? (
        <style
          dangerouslySetInnerHTML={{
            __html: getWelcomeSplashCriticalStyle(),
          }}
        />
      ) : null}
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
              <PageVisibilityProvider settings={pageVisibility}>
                <PublicLayout
                  welcomeSplash={welcomeSplash}
                  liveSite={liveSite}
                  comingSoonActive={comingSoonActive}
                >
                  {children}
                </PublicLayout>
              </PageVisibilityProvider>
            </WebsiteTextProvider>
          </TypographySettingsProvider>
        </SiteImagesProvider>
      </HeroLogoSettingsProvider>
    </div>
  );
}
