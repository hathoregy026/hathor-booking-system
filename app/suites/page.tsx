import type { Metadata } from "next";

import { SuitesNormalHomepagePage } from "@/components/pages/SuitesNormalHomepagePage";
import { StandalonePageVisibilityShell } from "@/components/public/StandalonePageVisibilityShell";
import { combineDesktopAndPhoneCss } from "@/lib/admin-device-preview";
import { LUXURY_SUITES_PAGE } from "@/lib/page-content";
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

const OG_IMAGE = SUITES_REFERENCE_HERO_IMAGE_DEFAULTS["scraped-suites-hero"];

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
      <SuitesNormalHomepagePage images={images} css={css} />
    </StandalonePageVisibilityShell>
  );
}

