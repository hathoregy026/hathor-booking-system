import type { Metadata } from "next";
import { AccommodationSpringsDesignPage } from "@/components/pages/AccommodationSpringsDesignPage";
import { StandalonePageVisibilityShell } from "@/components/public/StandalonePageVisibilityShell";
import { LUXURY_CABINS_PAGE } from "@/lib/page-content";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import "../page-visibility.css";
import "../site-coming-soon.css";

const OG_IMAGE = "/media/hathor/r2/cabins-hero.webp";

export const metadata: Metadata = {
  title: "Small Luxury Nile Cruise Rooms",
  description: LUXURY_CABINS_PAGE.metaDescription,
  openGraph: {
    title:
      "Small Luxury Nile Cruise Rooms | Boutique Nile Cruise Hathor Dahabiya",
    description: LUXURY_CABINS_PAGE.metaDescription,
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1920,
        height: 1280,
        alt: "Luxury cabin with Nile view aboard Hathor Dahabiya",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Small Luxury Nile Cruise Rooms | Boutique Nile Cruise Hathor Dahabiya",
    description: LUXURY_CABINS_PAGE.metaDescription,
    images: [OG_IMAGE],
  },
};

/**
 * Deliberately outside (public): Springs Design document in an isolated frame.
 * Must not inherit PublicLayout scroll infrastructure.
 */
export default async function LuxuryCabinsPage() {
  const cms = await loadPublicCmsBundle();

  return (
    <StandalonePageVisibilityShell
      path="/luxury-cabins-Nile-Cruise"
      pageLabel="Luxury Rooms"
      settings={cms.pageVisibility}
      liveSite={cms.liveSite}
    >
      <AccommodationSpringsDesignPage
        frameSrc="/accommodation-springs/luxury-rooms/index.html"
        title="Luxury Rooms"
      />
    </StandalonePageVisibilityShell>
  );
}
