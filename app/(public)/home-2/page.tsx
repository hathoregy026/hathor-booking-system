import type { Metadata } from "next";
import { HomeExperienceShell } from "@/components/pages/HomeExperienceShell";
import { Home2EditorialPage } from "@/components/pages/Home2EditorialPage";
import { HATHOR_HERO_POSTER_SRC } from "@/lib/branding";
import { combineDesktopAndNarrowCss } from "@/lib/admin-device-preview";
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
  title: "Home 2 Editorial Voyage | Hathor Dahabiya",
  description:
    "A private editorial journey through Hathor Dahabiya itineraries, life aboard, Nile landmarks, fine dining and luxury sailing.",
  alternates: { canonical: "/home-2" },
  openGraph: {
    title: "Home 2 Editorial Voyage | Hathor Dahabiya",
    description:
      "An editorial journey through the complete Hathor Dahabiya experience on the Nile.",
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
  const logoTuneCss = combineDesktopAndNarrowCss(
    heroLogoTuneToImportantCss(cms.heroLogoTune),
    heroLogoTuneToNarrowImportantCss(cms.heroLogoTuneMobile),
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
      <Home2EditorialPage
        heroLogoTune={cms.heroLogoTune}
        heroLogoTuneMobile={cms.heroLogoTuneMobile}
        accordionCruises={accordionCruises}
        wheelStage={cms.wheelStage}
      />
    </HomeExperienceShell>
  );
}
