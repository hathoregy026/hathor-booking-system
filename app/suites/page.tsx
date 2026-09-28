import type { Metadata } from "next";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { SuitesNativeBoot } from "@/components/suites-native/SuitesNativeBoot";
import { SuitesNativePage } from "@/components/suites-native/SuitesNativePage";
import { StandalonePageVisibilityShell } from "@/components/public/StandalonePageVisibilityShell";
import { SUITES_SEO } from "@/lib/seo/page-metadata";
import {
  PageStructuredData,
  hotelRoomNode,
} from "@/components/seo/PageStructuredData";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import { SUITES_DASHBOARD_SLOT_NAMES } from "@/lib/site-image-usage";
import { SUITES_NATIVE_SLOT_DEFAULTS } from "@/lib/suites-native-content";

import "../page-visibility.css";
import "../site-coming-soon.css";
import "../suites-native.css";

export const metadata: Metadata = SUITES_SEO;

/**
 * Outside (public): Suites owns its own layout. Still must honor dashboard
 * Pages + Live Site gates on the custom domain (Vercel / localhost stay open).
 *
 * Renders the native rebuild (server-rendered content, one H1) instead of
 * the Springs iframe clone: the iframe's content was populated entirely by
 * client JS, so crawlers saw only the nav shell. This is the same component
 * already proven at the internal /suites-preview route.
 */
export default async function SuitesPage() {
  const cms = await loadPublicCmsBundle();

  const images: Record<string, string> = { ...SUITES_NATIVE_SLOT_DEFAULTS };
  for (const name of SUITES_DASHBOARD_SLOT_NAMES) {
    const src = cms.siteImages[name]?.src?.trim();
    if (src) images[name] = src;
  }

  return (
    <StandalonePageVisibilityShell
      path="/suites"
      pageLabel="Suites"
      settings={cms.pageVisibility}
      liveSite={cms.liveSite}
    >
      <PageStructuredData
        path="/suites"
        name="Luxury Nile Cruise Suites | Hathor Dahabiya"
        description={
          typeof SUITES_SEO.description === "string" ? SUITES_SEO.description : ""
        }
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Suites", path: "/suites" },
        ]}
        image="/media/hathor/optimized/scraped-suites-hero.webp"
        extra={[
          hotelRoomNode({
            path: "/suites",
            name: "Hathor luxury Nile cruise suites",
            description:
              "Nile-view suites aboard Hathor Dahabiya, a 32-guest luxury sailing between Luxor and Aswan.",
            occupancy: 4,
            floorSizeSqm: 46,
          }),
        ]}
      />
      <SuitesNativeBoot>
        <PublicNavbar />
        <SuitesNativePage images={images} />
        <Footer />
      </SuitesNativeBoot>
    </StandalonePageVisibilityShell>
  );
}
