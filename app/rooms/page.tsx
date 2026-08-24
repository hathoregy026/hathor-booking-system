import type { Metadata } from "next";
import { RoomCollectionPage } from "@/components/pages/rooms/RoomCollectionPage";
import { StandalonePageVisibilityShell } from "@/components/public/StandalonePageVisibilityShell";
import { LUXURY_SUITES_PAGE } from "@/lib/page-content";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import "../page-visibility.css";
import "../site-coming-soon.css";

const OG_IMAGE = "/media/hathor/scraped/suites-hero.webp";

export const metadata: Metadata = {
  title: "Luxury suites on Nile cruise",
  description: LUXURY_SUITES_PAGE.metaDescription,
  openGraph: {
    title: "Luxury suites on Nile cruise | Hathor Dahabiya Cruise",
    description: LUXURY_SUITES_PAGE.metaDescription,
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1920,
        height: 1280,
        alt: "Cabins and suites aboard Hathor Dahabiya",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxury suites on Nile cruise | Hathor Dahabiya Cruise",
    description: LUXURY_SUITES_PAGE.metaDescription,
    images: [OG_IMAGE],
  },
};

/**
 * Deliberately outside (public): Springs Design document in an isolated frame.
 * Must not inherit PublicLayout scroll infrastructure.
 */
export default async function RoomsPage() {
  const cms = await loadPublicCmsBundle();

  return (
    <StandalonePageVisibilityShell
      path="/rooms"
      pageLabel="Luxury Suites"
      settings={cms.pageVisibility}
      liveSite={cms.liveSite}
    >
      <RoomCollectionPage />
    </StandalonePageVisibilityShell>
  );
}
