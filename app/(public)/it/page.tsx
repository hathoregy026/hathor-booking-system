import type { Metadata } from "next";
import { HomeExperienceShell } from "@/components/pages/HomeExperienceShell";
import { HomeThreePageContent } from "@/components/pages/HomeThreePageContent";
import { GuestReviews } from "@/components/public/GuestReviews";
import { PartnersCompanyStrip } from "@/components/partners/PartnersCompanyStrip";
import { heroPosterDelivery } from "@/lib/local-optimized-site-images";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import { HOME_SEO_IT } from "@/lib/i18n/home-seo";
import "../home-experience.css";
import "../home-responsive.css";
import "../home-3/home-three.css";
import "../../partners-company-strip.css";

export const revalidate = 300;

/*
 * The Italian homepage: the same page as `/`, its words in Italian. The
 * components read the language from the address. Kept out of search (noindex,
 * no sitemap entry, no hreflang) until the full SEO pass translates titles,
 * structured data and alternates.
 */
export const metadata: Metadata = HOME_SEO_IT;

export default async function ItalianHomePage() {
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
      <HomeThreePageContent
        heroLogoTune={cms.heroLogoTune}
        heroLogoTuneMobile={cms.heroLogoTuneMobile}
        reviews={<GuestReviews placement="home" locale="it" />}
      />
      <PartnersCompanyStrip variant="teaser" />
    </HomeExperienceShell>
  );
}
