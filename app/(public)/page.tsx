import type { Metadata } from "next";
import { HomeExperienceShell } from "@/components/pages/HomeExperienceShell";
import { HomeThreePageContent } from "@/components/pages/HomeThreePageContent";
import { HomeThreeStructuredData } from "@/components/seo/HomeThreeStructuredData";
import { GuestReviews } from "@/components/public/GuestReviews";
import { PartnersCompanyStrip } from "@/components/partners/PartnersCompanyStrip";
import { heroPosterDelivery } from "@/lib/local-optimized-site-images";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import { HOME_SEO } from "@/lib/seo/page-metadata";
/*
 * Live homepage is the Home 3 editorial. Hero sheets stay shared with the
 * former main home; everything below the hero is home-3's own system.
 */
import "./home-experience.css";
import "./home-responsive.css";
import "./home-3/home-three.css";
import "../partners-company-strip.css";

export const revalidate = 300;

export const metadata: Metadata = HOME_SEO;

export default async function HomePage() {
  const cms = await loadPublicCmsBundle();

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
      <HomeThreeStructuredData />
      {/* The saved logo tune is rendered once for every page, by the public layout. */}
      <HomeThreePageContent
        heroLogoTune={cms.heroLogoTune}
        heroLogoTuneMobile={cms.heroLogoTuneMobile}
        reviews={<GuestReviews placement="home" />}
      />
      <PartnersCompanyStrip variant="teaser" />
    </HomeExperienceShell>
  );
}
