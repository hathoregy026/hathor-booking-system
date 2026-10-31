import type { Metadata } from "next";

import { SuitesNormalHomepagePage } from "@/components/pages/SuitesNormalHomepagePage";
import { PublicCmsTextRuntime } from "@/components/public/PublicCmsTextRuntime";
import { StandalonePageVisibilityShell } from "@/components/public/StandalonePageVisibilityShell";
import {
  PageStructuredData,
  hotelRoomNode,
} from "@/components/seo/PageStructuredData";
import { combineDesktopAndPhoneCss } from "@/lib/admin-device-preview";
import { ITALIAN_PAGES } from "@/lib/i18n/pages-seo-it";
import { localizeWebsiteText } from "@/lib/i18n/website-text-it";
import { resolvePageVisibilityForRequest } from "@/lib/live-site-gate";
import { isPageLive } from "@/lib/page-visibility-shared";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import { getPageScopedSiteImageName } from "@/lib/site-image-page-scope";
import { SUITES_DASHBOARD_SLOT_NAMES } from "@/lib/site-image-usage";
import { SUITES_REFERENCE_HERO_IMAGE_DEFAULTS } from "@/lib/suites-reference-hero";
import {
  DEFAULT_SUITES_TYPOGRAPHY,
  DEFAULT_SUITES_TYPOGRAPHY_PHONE,
  getSuitesTypography,
} from "@/lib/suites-typography";
import { suitesTypographyToCss } from "@/lib/suites-typography-shared";

import "../../page-visibility.css";
import "../../site-coming-soon.css";
import "../../suites-normal-clone.css";

const PAGE = ITALIAN_PAGES.suites;

/** Same self-correcting noindex as the English page while /suites is off. */
export async function generateMetadata(): Promise<Metadata> {
  const cms = await loadPublicCmsBundle();
  const effectiveVisibility = await resolvePageVisibilityForRequest(cms.pageVisibility);
  if (!isPageLive("/suites", effectiveVisibility)) {
    return { ...PAGE.metadata, robots: { index: false, follow: false } };
  }
  return PAGE.metadata;
}

/** Italian Suites: the English page's stage, with Italian words and search settings. */
export default async function ItalianSuitesPage() {
  const [cms, desktop, phone] = await Promise.all([
    loadPublicCmsBundle(),
    getSuitesTypography(),
    getSuitesTypography(true),
  ]);

  const images: Record<string, string> = {
    ...SUITES_REFERENCE_HERO_IMAGE_DEFAULTS,
  };
  for (const name of SUITES_DASHBOARD_SLOT_NAMES) {
    const scopedName = getPageScopedSiteImageName("/suites", name);
    const src = (
      cms.siteImages[scopedName] ?? cms.siteImages[name]
    )?.src?.trim();
    if (src) images[name] = src;
  }

  const css = combineDesktopAndPhoneCss(
    suitesTypographyToCss(desktop, DEFAULT_SUITES_TYPOGRAPHY),
    suitesTypographyToCss(phone, DEFAULT_SUITES_TYPOGRAPHY_PHONE),
  );

  return (
    <StandalonePageVisibilityShell
      path="/suites"
      pageLabel="Suite"
      settings={cms.pageVisibility}
      liveSite={cms.liveSite}
    >
      <PageStructuredData
        path={PAGE.path}
        name={PAGE.name}
        description={PAGE.description}
        breadcrumbs={[
          { name: "Home", path: "/it" },
          { name: PAGE.crumb, path: PAGE.path },
        ]}
        image="/media/hathor/optimized/scraped-suites-hero.webp"
        extra={[
          hotelRoomNode({
            path: PAGE.path,
            name: "Le suite di lusso di Hathor per la crociera sul Nilo",
            description:
              "Suite con vista sul Nilo a bordo di Hathor Dahabiya, una navigazione di lusso per 32 ospiti tra Luxor e Assuan.",
            occupancy: 4,
            floorSizeSqm: 46,
          }),
        ]}
      />
      <PublicCmsTextRuntime
        websiteText={localizeWebsiteText(cms.websiteText, "it")}
        websiteTextMobile={localizeWebsiteText(cms.websiteTextMobile, "it")}
        typography={cms.typography}
        typographyMobile={cms.typographyMobile}
      >
        <SuitesNormalHomepagePage images={images} css={css} />
      </PublicCmsTextRuntime>
    </StandalonePageVisibilityShell>
  );
}
