import type { Metadata } from "next";
import { HomeExperienceShell } from "@/components/pages/HomeExperienceShell";
import { HomePageClient } from "@/components/pages/HomePageClient";
import { HATHOR_HERO_POSTER_SRC } from "@/lib/branding";
import { getHomepageAccordionCruisesSafe } from "@/lib/homepage-accordion-cruises";
import { getHeroLogoTuneSafe, getHeroLogoTuneMobileSafe } from "@/lib/hero-logo-tune";
import { heroLogoTuneToImportantCss } from "@/lib/hero-logo-tune-shared";
import { combineDesktopAndPhoneCss } from "@/lib/admin-device-preview";
import "./home-experience.css";

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
  const [heroLogoTune, heroLogoTuneMobile, accordionCruises] = await Promise.all([
    getHeroLogoTuneSafe(),
    getHeroLogoTuneMobileSafe(),
    getHomepageAccordionCruisesSafe(),
  ]);
  const logoTuneCss = combineDesktopAndPhoneCss(
    heroLogoTuneToImportantCss(heroLogoTune),
    heroLogoTuneToImportantCss(heroLogoTuneMobile),
  );

  return (
    <HomeExperienceShell>
      <style
        data-hathor-logo-tune-ssr
        dangerouslySetInnerHTML={{ __html: logoTuneCss }}
      />
      <HomePageClient
        heroLogoTune={heroLogoTune}
        heroLogoTuneMobile={heroLogoTuneMobile}
        accordionCruises={accordionCruises}
      />
    </HomeExperienceShell>
  );
}
