import type { Metadata } from "next";
import { Home2PageContent } from "@/components/pages/Home2PageContent";
import { HomeExperienceShell } from "@/components/pages/HomeExperienceShell";
import { HATHOR_HERO_POSTER_SRC } from "@/lib/branding";
import { combineDesktopAndNarrowCss } from "@/lib/admin-device-preview";
import {
  heroLogoTuneToImportantCss,
  heroLogoTuneToNarrowImportantCss,
} from "@/lib/hero-logo-tune-shared";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import "../home-experience.css";
import "../home-responsive.css";
import "./home-2.css";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Home 2 Editorial Study | Hathor Dahabiya",
  description:
    "A private editorial study of the Hathor Dahabiya homepage experience and luxury Nile journey.",
  alternates: { canonical: "/home-2" },
  openGraph: {
    title: "Home 2 Editorial Study | Hathor Dahabiya",
    description:
      "A private editorial study of the Hathor Dahabiya homepage experience and luxury Nile journey.",
    type: "website",
    images: [
      {
        url: HATHOR_HERO_POSTER_SRC,
        width: 1920,
        height: 1080,
        alt: "Hathor Dahabiya sailing the Nile",
      },
    ],
  },
  robots: { index: false, follow: false },
};

export default async function Home2Page() {
  const cms = await loadPublicCmsBundle();
  const logoTuneCss = combineDesktopAndNarrowCss(
    heroLogoTuneToImportantCss(cms.heroLogoTune),
    heroLogoTuneToNarrowImportantCss(cms.heroLogoTuneMobile),
  );
  const heroPosterSrc = cms.siteImages["home-hero-poster"]?.src?.trim();

  return (
    <HomeExperienceShell>
      {heroPosterSrc ? (
        <link rel="preload" as="image" href={heroPosterSrc} fetchPriority="high" />
      ) : null}
      <style
        data-hathor-logo-tune-ssr
        dangerouslySetInnerHTML={{ __html: logoTuneCss }}
      />
      <Home2PageContent
        logoPartsVariant={cms.heroLogoTune.partsVariant}
        mobileLogoPartsVariant={cms.heroLogoTuneMobile.partsVariant}
      />
    </HomeExperienceShell>
  );
}
