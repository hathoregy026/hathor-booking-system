import type { Metadata } from "next";
import { HomeExperienceShell } from "@/components/pages/HomeExperienceShell";
import { HomeEditorialPage } from "@/components/pages/HomeEditorialPage";
import { HATHOR_HERO_POSTER_SRC } from "@/lib/branding";
import { combineDesktopAndNarrowCss } from "@/lib/admin-device-preview";
import { getHomepageAccordionCruisesSafe } from "@/lib/homepage-accordion-cruises";
import {
  heroLogoTuneToImportantCss,
  heroLogoTuneToNarrowImportantCss,
} from "@/lib/hero-logo-tune-shared";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import { heroPosterDelivery } from "@/lib/local-optimized-site-images";
import "./home-dining-slider.css";
import "./home-experience.css";
import "./home-responsive.css";
import "./home-editorial.css";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Luxury Dahabiya Nile Cruise | Hathor Dahabiya",
  description:
    "A private editorial journey through Hathor Dahabiya itineraries, life aboard, Nile landmarks, fine dining and luxury sailing.",
  alternates: { canonical: "/" },
  keywords: [
    "Dahabiya Nile Cruise",
    "Luxury Egypt Cruise",
    "Private Nile Sailing",
    "Hathor Dahabiya",
    "Ultra Luxury Dahabiya Cruise",
  ],
  openGraph: {
    title: "Luxury Dahabiya Nile Cruise | Hathor Dahabiya",
    description:
      "An editorial journey through the complete Hathor Dahabiya experience on the Nile.",
    locale: "en_US",
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
  twitter: {
    card: "summary_large_image",
    title: "Luxury Dahabiya Nile Cruise | Hathor Dahabiya",
    description:
      "An editorial journey through the complete Hathor Dahabiya experience on the Nile.",
    images: [HATHOR_HERO_POSTER_SRC],
  },
};

export default async function HomePage() {
  const cms = await loadPublicCmsBundle();
  const accordionCruises = await getHomepageAccordionCruisesSafe();
  const logoTuneCss = combineDesktopAndNarrowCss(
    heroLogoTuneToImportantCss(cms.heroLogoTune),
    heroLogoTuneToNarrowImportantCss(cms.heroLogoTuneMobile),
  );
  const heroPosterSrc = cms.siteImages["home-hero-poster"]?.src?.trim();
  const heroPoster = heroPosterSrc ? heroPosterDelivery(heroPosterSrc) : null;

  return (
    <HomeExperienceShell>
      {heroPoster ? (
        <link
          rel="preload"
          as="image"
          imageSrcSet={heroPoster.srcSet}
          imageSizes={heroPoster.sizes}
          fetchPriority="high"
        />
      ) : null}
      <style
        data-hathor-logo-tune-ssr
        dangerouslySetInnerHTML={{ __html: logoTuneCss }}
      />
      <HomeEditorialPage
        heroLogoTune={cms.heroLogoTune}
        heroLogoTuneMobile={cms.heroLogoTuneMobile}
        accordionCruises={accordionCruises}
        wheelStage={cms.wheelStage}
      />
    </HomeExperienceShell>
  );
}
