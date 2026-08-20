import type { Metadata } from "next";

import { SuitesNormalHomepagePage } from "@/components/pages/SuitesNormalHomepagePage";
import { StandalonePageVisibilityShell } from "@/components/public/StandalonePageVisibilityShell";
import { LUXURY_SUITES_PAGE } from "@/lib/page-content";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";

import "../page-visibility.css";
import "../site-coming-soon.css";
import "../suites-normal-clone.css";

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
 * Outside (public): Suites owns its own layout. Still must honor dashboard
 * Pages + Live Site gates on the custom domain (Vercel / localhost stay open).
 */
export default async function SuitesPage() {
  const cms = await loadPublicCmsBundle();

  return (
    <StandalonePageVisibilityShell
      path="/suites"
      pageLabel="Suites"
      settings={cms.pageVisibility}
      liveSite={cms.liveSite}
    >
      <SuitesNormalHomepagePage />
    </StandalonePageVisibilityShell>
  );
}
