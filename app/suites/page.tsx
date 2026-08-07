import type { Metadata } from "next";
import { SuitesSpringsHomepagePage } from "@/components/pages/SuitesSpringsHomepagePage";
import { StandalonePageVisibilityShell } from "@/components/public/StandalonePageVisibilityShell";
import { LUXURY_SUITES_PAGE } from "@/lib/page-content";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import "../page-visibility.css";

const OG_IMAGE = "/media/hathor/scraped/suites-hero.webp";

export const metadata: Metadata = {
  title: "Luxury Suites on the Nile",
  description: LUXURY_SUITES_PAGE.metaDescription,
  openGraph: {
    title: "Luxury Suites on the Nile | Hathor Dahabiya Cruise",
    description: LUXURY_SUITES_PAGE.metaDescription,
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1920,
        height: 1280,
        alt: "Luxury suites aboard Hathor Dahabiya",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxury Suites on the Nile | Hathor Dahabiya Cruise",
    description: LUXURY_SUITES_PAGE.metaDescription,
    images: [OG_IMAGE],
  },
};

/**
 * Deliberately outside (public): the page is a complete captured document
 * inside an isolated frame and must not inherit PublicLayout infrastructure.
 * Hathor footer is injected into the static Suites document itself.
 */
export default async function SuitesPage() {
  const cms = await loadPublicCmsBundle();

  return (
    <StandalonePageVisibilityShell
      path="/suites"
      pageLabel="Suites"
      settings={cms.pageVisibility}
    >
      <SuitesSpringsHomepagePage />
    </StandalonePageVisibilityShell>
  );
}
