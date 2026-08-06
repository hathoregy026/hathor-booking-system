import type { Metadata } from "next";
import { HomeExperienceShell } from "@/components/pages/HomeExperienceShell";
import { HomePageClient } from "@/components/pages/HomePageClient";
import { HATHOR_HERO_POSTER_SRC } from "@/lib/branding";
import { getHomepageAccordionCruisesSafe } from "@/lib/homepage-accordion-cruises";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import {
  heroLogoTuneToImportantCss,
  heroLogoTuneToNarrowImportantCss,
} from "@/lib/hero-logo-tune-shared";
import { combineDesktopAndNarrowCss } from "@/lib/admin-device-preview";
import "./home-experience.css";
import "./home-story.css";
import "./home-story-dining.css";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Luxury Dahabiya Nile Cruise | Hathor Dahabiya",
  description:
    "Experience ultra-luxury on a private Dahabiya Nile cruise. Sail from Luxor to Aswan in exclusive suites with fine dining, spa, and timeless Egyptian elegance.",
  keywords: [
    "Dahabiya Nile Cruise",
    "Luxury Egypt Cruise",
    "Private Nile Sailing",
    "Hathor Dahabiya",
    "Ultra Luxury Dahabiya Cruise",
  ],
  openGraph: {
    title: "Hathor Dahabiya | Ultra Luxury Nile Cruise",
    description: "Your luxurious Nile escape begins with the Hathor Dahabiya",
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
    title: "Hathor Dahabiya | Ultra Luxury Nile Cruise",
    description: "Your luxurious Nile escape begins with the Hathor Dahabiya",
    images: [HATHOR_HERO_POSTER_SRC],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function HomePage() {
  /*
   * Logo tune comes from the request-scoped public CMS bundle (shared with layout).
   * Accordion must not run in parallel with the bundle — concurrent Prisma adapter
   * queries against the Supabase transaction pooler can stall indefinitely.
   */
  const cms = await loadPublicCmsBundle();
  const accordionCruises = await getHomepageAccordionCruisesSafe();
  const logoTuneCss = combineDesktopAndNarrowCss(
    heroLogoTuneToImportantCss(cms.heroLogoTune),
    heroLogoTuneToNarrowImportantCss(cms.heroLogoTuneMobile),
  );

  return (
    <HomeExperienceShell>
      <style
        data-hathor-logo-tune-ssr
        dangerouslySetInnerHTML={{ __html: logoTuneCss }}
      />
      <HomePageClient
        heroLogoTune={cms.heroLogoTune}
        heroLogoTuneMobile={cms.heroLogoTuneMobile}
        accordionCruises={accordionCruises}
        wheelStage={cms.wheelStage}
      />
    </HomeExperienceShell>
  );
}
