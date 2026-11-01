import type { Metadata } from "next";

import { SuitesNormalHomepagePage } from "@/components/pages/SuitesNormalHomepagePage";
import { PublicCmsTextRuntime } from "@/components/public/PublicCmsTextRuntime";
import { StandalonePageVisibilityShell } from "@/components/public/StandalonePageVisibilityShell";
import {
  PageStructuredData,
  hotelRoomNode,
} from "@/components/seo/PageStructuredData";
import { combineDesktopAndPhoneCss } from "@/lib/admin-device-preview";
import type { TranslatedLocale } from "@/lib/i18n/locale";
import { LOCALE_CRUMBS, LOCALE_PAGES, LOCALE_SUITES_WORDS } from "@/lib/i18n/locale-pages";
import { localizeWebsiteText } from "@/lib/i18n/website-text";
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

/** Same self-correcting noindex as the English page while /suites is off. */
export async function localeSuitesMetadata(locale: TranslatedLocale): Promise<Metadata> {
  const { metadata } = LOCALE_PAGES[locale].suites;
  const cms = await loadPublicCmsBundle();
  const effectiveVisibility = await resolvePageVisibilityForRequest(cms.pageVisibility);
  if (!isPageLive("/suites", effectiveVisibility)) {
    return { ...metadata, robots: { index: false, follow: false } };
  }
  return metadata;
}

/** Suites: the English page's stage, with this language's words and search settings. */
export async function LocaleSuitesPage({ locale }: { locale: TranslatedLocale }) {
  const page = LOCALE_PAGES[locale].suites;
  const words = LOCALE_SUITES_WORDS[locale];
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
      pageLabel={words.pageLabel}
      settings={cms.pageVisibility}
      liveSite={cms.liveSite}
    >
      <PageStructuredData
        path={page.path}
        name={page.name}
        description={page.description}
        breadcrumbs={[
          { name: LOCALE_CRUMBS[locale].home, path: `/${locale}` },
          { name: page.crumb, path: page.path },
        ]}
        image="/media/hathor/optimized/scraped-suites-hero.webp"
        extra={[
          hotelRoomNode({
            path: page.path,
            name: words.roomName,
            description: words.roomDescription,
            occupancy: 4,
            floorSizeSqm: 46,
          }),
        ]}
      />
      <PublicCmsTextRuntime
        websiteText={localizeWebsiteText(cms.websiteText, locale)}
        websiteTextMobile={localizeWebsiteText(cms.websiteTextMobile, locale)}
        typography={cms.typography}
        typographyMobile={cms.typographyMobile}
      >
        <SuitesNormalHomepagePage images={images} css={css} />
      </PublicCmsTextRuntime>
    </StandalonePageVisibilityShell>
  );
}
