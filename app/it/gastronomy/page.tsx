import type { Metadata } from "next";
import { GastronomyDiningRuntime } from "@/components/pages/GastronomyDiningRuntime";
import { GastronomyPageContent } from "@/components/pages/GastronomyPageContent";
import { PublicCmsTextRuntime } from "@/components/public/PublicCmsTextRuntime";
import { SiteImagesProvider } from "@/components/public/SiteImagesProvider";
import { StandalonePageVisibilityShell } from "@/components/public/StandalonePageVisibilityShell";
import { PageStructuredData } from "@/components/seo/PageStructuredData";
import { ITALIAN_PAGES } from "@/lib/i18n/pages-seo-it";
import { localizeWebsiteText } from "@/lib/i18n/website-text-it";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import "../../page-visibility.css";
import "../../site-coming-soon.css";

const PAGE = ITALIAN_PAGES.gastronomy;

export const metadata: Metadata = PAGE.metadata;

/** Italian Dining: the English page's stage, with Italian words and search settings. */
export default async function ItalianGastronomyPage() {
  const cms = await loadPublicCmsBundle();

  return (
    <StandalonePageVisibilityShell
      path="/gastronomy"
      pageLabel="Dining"
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
      />
      <PublicCmsTextRuntime
        websiteText={localizeWebsiteText(cms.websiteText, "it")}
        websiteTextMobile={localizeWebsiteText(cms.websiteTextMobile, "it")}
        typography={cms.typography}
        typographyMobile={cms.typographyMobile}
      >
        <GastronomyDiningRuntime />
        <SiteImagesProvider images={cms.siteImages}>
          <GastronomyPageContent />
        </SiteImagesProvider>
      </PublicCmsTextRuntime>
    </StandalonePageVisibilityShell>
  );
}
