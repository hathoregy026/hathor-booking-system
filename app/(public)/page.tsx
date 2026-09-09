import type { Metadata } from "next";
import { HomeExperienceShell } from "@/components/pages/HomeExperienceShell";
import { HomeThreePageContent } from "@/components/pages/HomeThreePageContent";
import { HomeThreeStructuredData } from "@/components/seo/HomeThreeStructuredData";
import { combineDesktopAndNarrowCss } from "@/lib/admin-device-preview";
import {
  heroLogoTuneToImportantCss,
  heroLogoTuneToNarrowImportantCss,
} from "@/lib/hero-logo-tune-shared";
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

export const revalidate = 300;

export const metadata: Metadata = HOME_SEO;

export default async function HomePage() {
  const cms = await loadPublicCmsBundle();

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
      <HomeThreeStructuredData />
      <style
        data-hathor-logo-tune-ssr
        dangerouslySetInnerHTML={{ __html: logoTuneCss }}
      />
      <HomeThreePageContent
        heroLogoTune={cms.heroLogoTune}
        heroLogoTuneMobile={cms.heroLogoTuneMobile}
      />
    </HomeExperienceShell>
  );
}
