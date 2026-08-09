import type { CSSProperties, ReactNode } from "react";
import { Inter, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import { BookingPageLayout } from "@/components/booking/BookingPageLayout";
import { HeroLogoSettingsProvider } from "@/components/public/HeroLogoSettingsProvider";
import { SiteComingSoon } from "@/components/public/SiteComingSoon";
import { SiteImagesProvider } from "@/components/public/SiteImagesProvider";
import { TypographySettingsProvider } from "@/components/public/TypographySettingsProvider";
import {
  combineDesktopAndNarrowCss,
  combineDesktopAndPhoneCss,
} from "@/lib/admin-device-preview";
import {
  heroLogoTuneToImportantCss,
  heroLogoTuneToNarrowImportantCss,
} from "@/lib/hero-logo-tune-shared";
import { resolveComingSoonForRequest } from "@/lib/live-site-gate";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import { typographyToImportantCss } from "@/lib/typography-settings-shared";
import "../hathor-fonts.css";
import "../public.css";
import "../site-nav.css";
import "../public-site-hero.css";
import "../hero-tint.css";
import "../night-mode.css";
import "../site-coming-soon.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-booking-serif",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-booking-sans",
  weight: ["300", "400", "500", "600", "700"],
});

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

export default async function BookingFlowLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cms = await loadPublicCmsBundle();
  const comingSoonActive = await resolveComingSoonForRequest(cms.liveSite);
  if (comingSoonActive) {
    return (
      <SiteComingSoon backgroundImageUrl={cms.liveSite.backgroundImageUrl} />
    );
  }

  const displayFontStyle = {
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

  return (
    <div
      className={`${playfair.variable} ${inter.variable} ${agraham.variable} ${gabigaile.variable} ${gamgote.variable} ${quietLuxury.variable} ${plusJakarta.variable}`}
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
      <HeroLogoSettingsProvider
        desktopPartsVariant={cms.heroLogoTune.partsVariant}
        mobilePartsVariant={cms.heroLogoTuneMobile.partsVariant}
      >
        <SiteImagesProvider images={cms.siteImages}>
          <TypographySettingsProvider
            initial={cms.typography}
            initialMobile={cms.typographyMobile}
          >
            <BookingPageLayout>{children}</BookingPageLayout>
          </TypographySettingsProvider>
        </SiteImagesProvider>
      </HeroLogoSettingsProvider>
    </div>
  );
}
