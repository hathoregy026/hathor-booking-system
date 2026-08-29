import type { Metadata } from "next";
import { HomeExperienceShell } from "@/components/pages/HomeExperienceShell";
import { HomePageClient } from "@/components/pages/HomePageClient";
import { AmenitiesTypographyLiveStyle } from "@/components/home/AmenitiesTypographyLiveStyle";
import { HATHOR_HERO_POSTER_SRC } from "@/lib/branding";
import { getHomepageAccordionCruisesSafe } from "@/lib/homepage-accordion-cruises";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import {
  amenitiesTypographyToCss,
  getAmenitiesTypography,
} from "@/lib/amenities-typography";
import {
  heroLogoTuneToImportantCss,
  heroLogoTuneToNarrowImportantCss,
} from "@/lib/hero-logo-tune-shared";
import {
  combineDesktopAndNarrowCss,
  combineDesktopAndPhoneCss,
} from "@/lib/admin-device-preview";
import "./home-experience.css";
import "./home-dining-slider.css";
/*
 * Phone + tablet adaptation. MUST stay last: every rule inside is bounded by a
 * max-width media query and scoped to html[data-ex-experience], so it only ever
 * affects this page below 1025px. Desktop is untouched.
 */
import "./home-responsive.css";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Luxury Dahabiya Nile Cruise | Hathor Dahabiya",
  description:
    "Step into an aura of elegance and tranquility aboard the Hathor Dahabiya, where luxury glides gracefully along the Nile and the timeless beauty of Egypt surrounds you.",
  alternates: {
    canonical: "/",
  },
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
      "Step into an aura of elegance and tranquility aboard the Hathor Dahabiya, where luxury glides gracefully along the Nile and the timeless beauty of Egypt surrounds you.",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: HATHOR_HERO_POSTER_SRC,
        width: 1920,
        height: 1080,
        alt: "Luxury Nile cruise at sunset",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxury Dahabiya Nile Cruise | Hathor Dahabiya",
    description:
      "Step into an aura of elegance and tranquility aboard the Hathor Dahabiya, where luxury glides gracefully along the Nile and the timeless beauty of Egypt surrounds you.",
    images: [HATHOR_HERO_POSTER_SRC],
  },
};

export default async function HomePage() {
  /*
   * Logo tune comes from the request-scoped public CMS bundle (shared with layout).
   * Accordion must not run in parallel with the bundle — concurrent Prisma adapter
   * queries against the Supabase transaction pooler can stall indefinitely.
   */
  const cms = await loadPublicCmsBundle();
  /* After CMS bundle — avoid concurrent pooler stalls with the accordion query. */
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
      <HomePageClient
        heroLogoTune={cms.heroLogoTune}
        heroLogoTuneMobile={cms.heroLogoTuneMobile}
        accordionCruises={accordionCruises}
        wheelStage={cms.wheelStage}
        amenitiesTypography={amenitiesTypo}
        amenitiesTypographyMobile={amenitiesTypoMobile}
      />
    </HomeExperienceShell>
  );
}
