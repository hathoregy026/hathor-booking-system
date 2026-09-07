import type { Metadata } from "next";

import { SuitesNormalHomepagePage } from "@/components/pages/SuitesNormalHomepagePage";
import { StandalonePageVisibilityShell } from "@/components/public/StandalonePageVisibilityShell";
import { combineDesktopAndPhoneCss } from "@/lib/admin-device-preview";
import { SUITES_SEO } from "@/lib/seo/page-metadata";
import {
  PageStructuredData,
  hotelRoomNode,
} from "@/components/seo/PageStructuredData";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import { SUITES_DASHBOARD_SLOT_NAMES } from "@/lib/site-image-usage";
import { SUITES_REFERENCE_HERO_IMAGE_DEFAULTS } from "@/lib/suites-reference-hero";
import {
  DEFAULT_SUITES_TYPOGRAPHY,
  DEFAULT_SUITES_TYPOGRAPHY_PHONE,
  getSuitesTypography,
} from "@/lib/suites-typography";
import { suitesTypographyToCss } from "@/lib/suites-typography-shared";

import "../page-visibility.css";
import "../site-coming-soon.css";
import "../suites-normal-clone.css";

export const metadata: Metadata = SUITES_SEO;

/**
 * Outside (public): Suites owns its own layout. Still must honor dashboard
 * Pages + Live Site gates on the custom domain (Vercel / localhost stay open).
 */
export default async function SuitesPage() {
  const [cms, desktop, phone] = await Promise.all([
    loadPublicCmsBundle(),
    getSuitesTypography(),
    getSuitesTypography(true),
  ]);

  const images: Record<string, string> = {
    ...SUITES_REFERENCE_HERO_IMAGE_DEFAULTS,
  };
  for (const name of SUITES_DASHBOARD_SLOT_NAMES) {
    const src = cms.siteImages[name]?.src?.trim();
    if (src) images[name] = src;
  }

  const css = combineDesktopAndPhoneCss(
    suitesTypographyToCss(desktop, DEFAULT_SUITES_TYPOGRAPHY),
    suitesTypographyToCss(phone, DEFAULT_SUITES_TYPOGRAPHY_PHONE),
  );

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
              "Nile-view suites aboard Hathor Dahabiya, a twelve-guest luxury sailing between Luxor and Aswan.",
            occupancy: 4,
            floorSizeSqm: 46,
          }),
        ]}
      />
      <SuitesNormalHomepagePage images={images} css={css} />
    </StandalonePageVisibilityShell>
  );
}

