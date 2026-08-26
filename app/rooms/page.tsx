import type { Metadata } from "next";
import { AccommodationSpringsDesignPage } from "@/components/pages/AccommodationSpringsDesignPage";
import { StandalonePageVisibilityShell } from "@/components/public/StandalonePageVisibilityShell";
import { LUXURY_SUITES_PAGE } from "@/lib/page-content";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import { PublicCmsTextRuntime } from "@/components/public/PublicCmsTextRuntime";
import "../page-visibility.css";
import "../site-coming-soon.css";

const OG_IMAGE = "/media/hathor/scraped/suites-hero.webp";

export const metadata: Metadata = {
  title: "Luxury suites on Nile cruise",
  description: LUXURY_SUITES_PAGE.metaDescription,
  openGraph: {
    title: "Luxury suites on Nile cruise | Hathor Dahabiya Cruise",
    description: LUXURY_SUITES_PAGE.metaDescription,
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1920,
        height: 1280,
        alt: "Cabins and suites aboard Hathor Dahabiya",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxury suites on Nile cruise | Hathor Dahabiya Cruise",
    description: LUXURY_SUITES_PAGE.metaDescription,
    images: [OG_IMAGE],
  },
};

/**
 * Deliberately outside (public): Springs Design document in an isolated frame.
 * Must not inherit PublicLayout scroll infrastructure.
 */
export default async function RoomsPage() {
  const cms = await loadPublicCmsBundle();

  return (
    <StandalonePageVisibilityShell
      path="/rooms"
      pageLabel="Luxury Suites"
      settings={cms.pageVisibility}
      liveSite={cms.liveSite}
    >
      <PublicCmsTextRuntime
        websiteText={cms.websiteText}
        websiteTextMobile={cms.websiteTextMobile}
        typography={cms.typography}
        typographyMobile={cms.typographyMobile}
      >
        <AccommodationSpringsDesignPage
          frameSrc="/accommodation-springs/luxury-suites/index.html"
          title="Luxury Suites"
        />
      </PublicCmsTextRuntime>
    </StandalonePageVisibilityShell>
  );
}
