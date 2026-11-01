import { CharterPageContent } from "@/components/pages/CharterPageContent";
import { GastronomyDiningRuntime } from "@/components/pages/GastronomyDiningRuntime";
import { GastronomyPageContent } from "@/components/pages/GastronomyPageContent";
import { HomeExperienceShell } from "@/components/pages/HomeExperienceShell";
import { HomeThreePageContent } from "@/components/pages/HomeThreePageContent";
import { MaskRevealPageContent } from "@/components/pages/MaskRevealPageContent";
import { PartnersCompanyStrip } from "@/components/partners/PartnersCompanyStrip";
import { GuestReviews } from "@/components/public/GuestReviews";
import { LocaleWebsiteText } from "@/components/public/LocaleWebsiteText";
import { PublicCmsTextRuntime } from "@/components/public/PublicCmsTextRuntime";
import { SiteImagesProvider } from "@/components/public/SiteImagesProvider";
import { StandalonePageVisibilityShell } from "@/components/public/StandalonePageVisibilityShell";
import { charterServiceNode } from "@/components/seo/charterService";
import { HomeThreeStructuredData } from "@/components/seo/HomeThreeStructuredData";
import { PageStructuredData } from "@/components/seo/PageStructuredData";
import { CHARTER_COPY } from "@/lib/i18n/charter-copy";
import type { TranslatedLocale } from "@/lib/i18n/locale";
import {
  LOCALE_CHARTER_SEO,
  LOCALE_CRUISES_SEO,
  LOCALE_CRUMBS,
  LOCALE_PAGES,
} from "@/lib/i18n/locale-pages";
import { localizeWebsiteText } from "@/lib/i18n/website-text";
import { heroPosterDelivery } from "@/lib/local-optimized-site-images";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";

/** The homepage: the same page as `/`, its words read from the address. */
export async function LocaleHomePage({ locale }: { locale: TranslatedLocale }) {
  const cms = await loadPublicCmsBundle();

  const heroPosterSrc = cms.siteImages["home-hero-poster"]?.src?.trim();
  const heroPoster = heroPosterSrc ? heroPosterDelivery(heroPosterSrc) : null;

  return (
    <HomeExperienceShell>
      {heroPoster ? (
        <link
          rel="preload"
          as="image"
          imageSrcSet={heroPoster.srcSet}
          imageSizes={heroPoster.sizes}
          fetchPriority="high"
        />
      ) : null}
      <HomeThreeStructuredData locale={locale} />
      <HomeThreePageContent
        heroLogoTune={cms.heroLogoTune}
        heroLogoTuneMobile={cms.heroLogoTuneMobile}
        reviews={<GuestReviews placement="home" locale={locale} />}
      />
      <PartnersCompanyStrip variant="teaser" />
    </HomeExperienceShell>
  );
}

/** The private charter page. */
export function LocaleCharterPage({ locale }: { locale: TranslatedLocale }) {
  const seo = LOCALE_CHARTER_SEO[locale];
  const path = `/${locale}/charter`;
  const description =
    typeof seo.metadata.description === "string" ? seo.metadata.description : "";

  const charterService = charterServiceNode({
    path,
    name: seo.crumb,
    description,
    serviceType: seo.serviceType,
    catalogName: seo.catalogName,
    tripName: (route) => `${seo.crumb} · ${route}`,
    place: CHARTER_COPY[locale].place,
  });

  return (
    <>
      <PageStructuredData
        path={path}
        name={seo.title}
        description={description}
        breadcrumbs={[
          { name: LOCALE_CRUMBS[locale].home, path: `/${locale}` },
          { name: seo.crumb, path },
        ]}
        image="/media/hathor/r2/charter-hero.webp"
        extra={[charterService]}
      />
      <LocaleWebsiteText locale={locale}>
        <CharterPageContent />
      </LocaleWebsiteText>
    </>
  );
}

/** The scheduled sailings list. */
export function LocaleCruisesListPage({ locale }: { locale: TranslatedLocale }) {
  const { metadata, page } = LOCALE_CRUISES_SEO[locale];
  return (
    <>
      <PageStructuredData
        path={`/${locale}/cruises-list`}
        name={page.name}
        description={typeof metadata.description === "string" ? metadata.description : ""}
        breadcrumbs={[...page.breadcrumbs]}
      />
      <LocaleWebsiteText locale={locale}>
        <MaskRevealPageContent />
      </LocaleWebsiteText>
    </>
  );
}

/** Dining: the English page's stage, with this language's words and search settings. */
export async function LocaleGastronomyPage({ locale }: { locale: TranslatedLocale }) {
  const page = LOCALE_PAGES[locale].gastronomy;
  const cms = await loadPublicCmsBundle();

  return (
    <StandalonePageVisibilityShell
      path="/gastronomy"
      pageLabel="Dining"
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
      />
      <PublicCmsTextRuntime
        websiteText={localizeWebsiteText(cms.websiteText, locale)}
        websiteTextMobile={localizeWebsiteText(cms.websiteTextMobile, locale)}
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
