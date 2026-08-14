import type { Metadata } from "next";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import { WebsiteTextProvider } from "@/components/public/WebsiteTextProvider";
import { SuitesNativeBoot } from "@/components/suites-native/SuitesNativeBoot";
import { SuitesNativePage } from "@/components/suites-native/SuitesNativePage";
import { StandalonePageVisibilityShell } from "@/components/public/StandalonePageVisibilityShell";
import { LUXURY_SUITES_PAGE } from "@/lib/page-content";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import { resolveSiteImageMap } from "@/lib/resolve-site-images";
import { SUITES_DASHBOARD_SLOT_NAMES } from "@/lib/site-image-usage";
import { SUITES_NATIVE_SLOT_DEFAULTS } from "@/lib/suites-native-content";
import { getAmenitiesTypography } from "@/lib/amenities-typography";
import { DEFAULT_AMENITIES_TYPOGRAPHY } from "@/lib/amenities-typography-shared";
import { hathorFontStackForAdmin } from "@/lib/typography-settings-shared";
import "../suites-native.css";
import "../page-visibility.css";
import "../site-coming-soon.css";

const OG_IMAGE = "/media/hathor/scraped/suites-hero.webp";

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
 * Deliberately outside (public): the page is a complete captured document
 * inside an isolated frame and must not inherit PublicLayout infrastructure.
 * Hathor footer is injected into the static Suites document itself.
 */
export default async function SuitesPage() {
  const cms = await loadPublicCmsBundle();
  const [amenitiesType, amenitiesTypeMobile] = await Promise.all([
    getAmenitiesTypography().catch(() => DEFAULT_AMENITIES_TYPOGRAPHY),
    getAmenitiesTypography(true).catch(() => DEFAULT_AMENITIES_TYPOGRAPHY),
  ]);
  const images: Record<string, string> = { ...SUITES_NATIVE_SLOT_DEFAULTS };

  try {
    const map = await resolveSiteImageMap();
    for (const name of SUITES_DASHBOARD_SLOT_NAMES) {
      const resolved = map[name]?.src?.trim();
      if (resolved) images[name] = resolved;
    }
  } catch {
    // The bundled defaults keep the page complete if the CMS is unavailable.
  }

  return (
    <StandalonePageVisibilityShell
      path="/suites"
      pageLabel="Suites"
      settings={cms.pageVisibility}
      liveSite={cms.liveSite}
    >
      <WebsiteTextProvider
        initial={cms.websiteText}
        initialMobile={cms.websiteTextMobile}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
.suites-native-route {
  --sn-amenities-title-font: ${hathorFontStackForAdmin(amenitiesType.title.fontFamily)};
  --sn-amenities-title-size: ${amenitiesType.title.fontSize}px;
  --sn-amenities-title-leading: ${amenitiesType.title.lineHeight};
  --sn-amenities-title-tracking: ${amenitiesType.title.letterSpacing}px;
  --sn-amenities-indication-font: ${hathorFontStackForAdmin(amenitiesType.indication.fontFamily)};
  --sn-amenities-indication-size: ${amenitiesType.indication.fontSize}px;
  --sn-amenities-indication-leading: ${amenitiesType.indication.lineHeight};
  --sn-amenities-indication-tracking: ${amenitiesType.indication.letterSpacing}px;
  --sn-amenities-body-font: ${hathorFontStackForAdmin(amenitiesType.body.fontFamily)};
  --sn-amenities-body-size: ${amenitiesType.body.fontSize}px;
  --sn-amenities-body-leading: ${amenitiesType.body.lineHeight};
  --sn-amenities-body-tracking: ${amenitiesType.body.letterSpacing}px;
  --sn-amenities-title-to-indication: ${amenitiesType.spacing.titleToIndication}px;
  --sn-amenities-indication-to-body: ${amenitiesType.spacing.indicationToBody}px;
  --sn-amenities-body-to-cta: ${amenitiesType.spacing.bodyToCta}px;
}
@media (max-width: 480px) {
  .suites-native-route {
    --sn-amenities-title-size: ${amenitiesTypeMobile.title.fontSize}px;
    --sn-amenities-title-leading: ${amenitiesTypeMobile.title.lineHeight};
    --sn-amenities-title-tracking: ${amenitiesTypeMobile.title.letterSpacing}px;
    --sn-amenities-indication-size: ${amenitiesTypeMobile.indication.fontSize}px;
    --sn-amenities-indication-leading: ${amenitiesTypeMobile.indication.lineHeight};
    --sn-amenities-indication-tracking: ${amenitiesTypeMobile.indication.letterSpacing}px;
    --sn-amenities-body-size: ${amenitiesTypeMobile.body.fontSize}px;
    --sn-amenities-body-leading: ${amenitiesTypeMobile.body.lineHeight};
    --sn-amenities-body-tracking: ${amenitiesTypeMobile.body.letterSpacing}px;
    --sn-amenities-title-to-indication: ${amenitiesTypeMobile.spacing.titleToIndication}px;
    --sn-amenities-indication-to-body: ${amenitiesTypeMobile.spacing.indicationToBody}px;
    --sn-amenities-body-to-cta: ${amenitiesTypeMobile.spacing.bodyToCta}px;
  }
}`,
          }}
        />
        <div className="public-site suites-native-shell">
          <BookingModalProvider>
            <PublicNavbar />
            <SuitesNativeBoot>
              <main className="suites-native-route">
                <SuitesNativePage images={images} />
              </main>
            </SuitesNativeBoot>
          </BookingModalProvider>
        </div>
      </WebsiteTextProvider>
    </StandalonePageVisibilityShell>
  );
}
