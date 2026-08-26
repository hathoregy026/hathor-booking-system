import type { Metadata } from "next";
import { GastronomyPageContent } from "@/components/pages/GastronomyPageContent";
import { GastronomyDiningRuntime } from "@/components/pages/GastronomyDiningRuntime";
import { SiteImagePreviewScroll } from "@/components/public/SiteImagePreviewScroll";
import { SiteImagesProvider } from "@/components/public/SiteImagesProvider";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import { PublicCmsTextRuntime } from "@/components/public/PublicCmsTextRuntime";
import { StandalonePageVisibilityShell } from "@/components/public/StandalonePageVisibilityShell";
import "../page-visibility.css";
import "../site-coming-soon.css";

export const metadata: Metadata = {
  title: "Dining on the Nile | Hathor Dahabiya",
  description:
    "Discover private dining aboard Hathor Dahabiya, where Egyptian flavours, thoughtful service and the Nile shape every course.",
};

/**
 * Deliberately outside (public): Dining owns a full-viewport editorial scroll
 * composition while sharing Hathor's public navigation, footer and typography.
 */
export default async function GastronomyPage() {
  const cms = await loadPublicCmsBundle();

  return (
    <StandalonePageVisibilityShell
      path="/gastronomy"
      pageLabel="Dining"
      settings={cms.pageVisibility}
      liveSite={cms.liveSite}
    >
      <PublicCmsTextRuntime
        websiteText={cms.websiteText}
        websiteTextMobile={cms.websiteTextMobile}
        typography={cms.typography}
        typographyMobile={cms.typographyMobile}
      >
        <GastronomyDiningRuntime />
        <SiteImagesProvider images={cms.siteImages}>
          <SiteImagePreviewScroll />
          <GastronomyPageContent />
        </SiteImagesProvider>
      </PublicCmsTextRuntime>
    </StandalonePageVisibilityShell>
  );
}
