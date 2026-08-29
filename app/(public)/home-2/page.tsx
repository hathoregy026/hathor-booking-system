import type { Metadata } from "next";
import { AmenitiesTypographyLiveStyle } from "@/components/home/AmenitiesTypographyLiveStyle";
import { HomeExperienceShell } from "@/components/pages/HomeExperienceShell";
import { HomePageClient } from "@/components/pages/HomePageClient";
import { HATHOR_HERO_POSTER_SRC } from "@/lib/branding";
import {
  combineDesktopAndNarrowCss,
  combineDesktopAndPhoneCss,
} from "@/lib/admin-device-preview";
import {
  amenitiesTypographyToCss,
  getAmenitiesTypography,
} from "@/lib/amenities-typography";
import { getHomepageAccordionCruisesSafe } from "@/lib/homepage-accordion-cruises";
import {
  heroLogoTuneToImportantCss,
  heroLogoTuneToNarrowImportantCss,
} from "@/lib/hero-logo-tune-shared";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import "../home-dining-slider.css";
import "../home-experience.css";
import "../home-responsive.css";
import "./home-2.css";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Home 2 Suites Study | Hathor Dahabiya",
  description:
    "A private Suites-inspired study of the Hathor Dahabiya homepage and luxury Nile journey.",
  alternates: { canonical: "/home-2" },
  openGraph: {
    title: "Home 2 Suites Study | Hathor Dahabiya",
    description:
      "A private Suites-inspired study of the Hathor Dahabiya homepage and luxury Nile journey.",
    type: "website",
    images: [
      {
        url: HATHOR_HERO_POSTER_SRC,
        width: 1920,
        height: 1080,
        alt: "Hathor Dahabiya sailing the Nile",
      },
    ],
  },
  robots: { index: false, follow: false },
};

export default async function Home2Page() {
  const cms = await loadPublicCmsBundle();
  const accordionCruises = await getHomepageAccordionCruisesSafe();
  const amenitiesTypo = await getAmenitiesTypography();
  const amenitiesTypoMobile = await getAmenitiesTypography(true);
  const logoTuneCss = combineDesktopAndNarrowCss(
    heroLogoTuneToImportantCss(cms.heroLogoTune),
    heroLogoTuneToNarrowImportantCss(cms.heroLogoTuneMobile),
  );
  const amenitiesTypoCss = combineDesktopAndPhoneCss(
    amenitiesTypographyToCss(amenitiesTypo),
    amenitiesTypographyToCss(amenitiesTypoMobile),
  );
  const heroPosterSrc = cms.siteImages["home-hero-poster"]?.src?.trim();

  return (
    <HomeExperienceShell>
      {heroPosterSrc ? (
        <link rel="preload" as="image" href={heroPosterSrc} fetchPriority="high" />
      ) : null}
      <style
        data-hathor-logo-tune-ssr
        dangerouslySetInnerHTML={{ __html: logoTuneCss }}
      />
      <AmenitiesTypographyLiveStyle css={amenitiesTypoCss} />
      <div className="home2-suites-study">
        <HomePageClient
          heroLogoTune={cms.heroLogoTune}
          heroLogoTuneMobile={cms.heroLogoTuneMobile}
          accordionCruises={accordionCruises}
          wheelStage={cms.wheelStage}
          amenitiesTypography={amenitiesTypo}
          amenitiesTypographyMobile={amenitiesTypoMobile}
          showHome2WordStage
        />
      </div>
    </HomeExperienceShell>
  );
}
