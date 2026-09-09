import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeExperienceShell } from "@/components/pages/HomeExperienceShell";
import { HomeEditorialPage } from "@/components/pages/HomeEditorialPage";
import {
  PageStructuredData,
  boatTripNode,
} from "@/components/seo/PageStructuredData";
import { HATHOR_HERO_POSTER_SRC } from "@/lib/branding";
import { combineDesktopAndNarrowCss } from "@/lib/admin-device-preview";
import { getHomepageAccordionCruisesSafe } from "@/lib/homepage-accordion-cruises";
import {
  heroLogoTuneToImportantCss,
  heroLogoTuneToNarrowImportantCss,
} from "@/lib/hero-logo-tune-shared";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import { heroPosterDelivery } from "@/lib/local-optimized-site-images";
import { mainHomeTwoPreviewEnabled } from "@/lib/local-home-preview";
import { HOME_SEO } from "@/lib/seo/page-metadata";
import "../home-dining-slider.css";
import "../home-experience.css";
import "../home-responsive.css";
import "../home-editorial.css";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Main Home 2",
  robots: { index: false, follow: false },
};

export default async function MainHomeTwoPage() {
  if (!(await mainHomeTwoPreviewEnabled())) {
    notFound();
  }

  const [cms, accordionCruises] = await Promise.all([
    loadPublicCmsBundle(),
    getHomepageAccordionCruisesSafe(),
  ]);
  const logoTuneCss = combineDesktopAndNarrowCss(
    heroLogoTuneToImportantCss(cms.heroLogoTune),
    heroLogoTuneToNarrowImportantCss(cms.heroLogoTuneMobile),
  );
  const heroPosterSrc = cms.siteImages["home-hero-poster"]?.src?.trim();
  const heroPoster = heroPosterSrc ? heroPosterDelivery(heroPosterSrc) : null;

  return (
    <HomeExperienceShell>
      <PageStructuredData
        path="/home-2"
        name="Main Home 2 (local)"
        description={
          typeof HOME_SEO.description === "string" ? HOME_SEO.description : ""
        }
        breadcrumbs={[{ name: "Main Home 2", path: "/home-2" }]}
        image={HATHOR_HERO_POSTER_SRC}
        extra={[
          boatTripNode({
            path: "/home-2",
            name: "Hathor Dahabiya — luxury Nile cruise, Luxor to Aswan",
            description:
              "A private twelve-guest Dahabiya sailing between Luxor and Aswan, with cabins, suites and Royal Suites.",
            departure: "Luxor",
            arrival: "Aswan",
          }),
        ]}
      />
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
