import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { preload } from "react-dom";
import { HomeExperienceShell } from "@/components/pages/HomeExperienceShell";
import { HomePageClient } from "@/components/pages/HomePageClient";
import { HATHOR_HERO_POSTER_SRC, HATHOR_HERO_VIDEO_SRC } from "@/lib/branding";
import { getHomepageAccordionCruisesSafe } from "@/lib/homepage-accordion-cruises";
import { getHeroLogoTuneSafe } from "@/lib/hero-logo-tune";
import { heroLogoTuneToImportantCss } from "@/lib/hero-logo-tune-shared";
import "./home-experience.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

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
  noStore();
  preload(HATHOR_HERO_VIDEO_SRC, { as: "fetch", fetchPriority: "high" });
  const [heroLogoTune, accordionCruises] = await Promise.all([
    getHeroLogoTuneSafe(),
    getHomepageAccordionCruisesSafe(),
  ]);
  const logoTuneCss = heroLogoTuneToImportantCss(heroLogoTune);

  return (
    <HomeExperienceShell>
      <style
        data-hathor-logo-tune-ssr
        dangerouslySetInnerHTML={{ __html: logoTuneCss }}
      />
      <link
        rel="preload"
        href={HATHOR_HERO_VIDEO_SRC}
        as="video"
        type="video/mp4"
        fetchPriority="high"
      />
      <HomePageClient
        heroLogoTune={heroLogoTune}
        accordionCruises={accordionCruises}
      />
    </HomeExperienceShell>
  );
}
