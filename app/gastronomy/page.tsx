import type { Metadata } from "next";
import { GastronomyPageContent } from "@/components/pages/GastronomyPageContent";
import { StandalonePageVisibilityShell } from "@/components/public/StandalonePageVisibilityShell";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import "../page-visibility.css";
import "../site-coming-soon.css";

export const metadata: Metadata = {
  title: "Springs Design",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Deliberately outside (public): the page is a complete captured document
 * inside an isolated frame and must not inherit PublicLayout infrastructure.
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
      <GastronomyPageContent />
    </StandalonePageVisibilityShell>
  );
}
