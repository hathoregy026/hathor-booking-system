import type { Metadata } from "next";
import { RoomCollectionPage } from "@/components/pages/rooms/RoomCollectionPage";
import { ROOM_SHOWCASES } from "@/lib/room-showcase";
import { StandalonePageVisibilityShell } from "@/components/public/StandalonePageVisibilityShell";
import { LUXURY_SUITES_PAGE } from "@/lib/page-content";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import { PublicCmsTextRuntime } from "@/components/public/PublicCmsTextRuntime";
import "../page-visibility.css";
import "../site-coming-soon.css";

const OG_IMAGE = "/media/hathor/scraped/suites-hero.webp";

export const metadata: Metadata = {
  title: "Luxury Nile Cruise Suites in Egypt",
  description: LUXURY_SUITES_PAGE.metaDescription,
  keywords: [
    "luxury Nile cruise suites",
    "Dahabiya suites Egypt",
    "Hathor Dahabiya suites",
    "Nile view suite Luxor Aswan",
    "private luxury Nile cruise accommodation",
  ],
  alternates: { canonical: "/rooms" },
  openGraph: {
    title: "Luxury Nile Cruise Suites in Egypt | Hathor Dahabiya",
    description: LUXURY_SUITES_PAGE.metaDescription,
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1920,
        height: 1280,
        alt: "Luxury Nile view suite aboard Hathor Dahabiya in Egypt",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxury Nile Cruise Suites in Egypt | Hathor Dahabiya",
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
      <PublicCmsTextRuntime
        websiteText={cms.websiteText}
        websiteTextMobile={cms.websiteTextMobile}
        typography={cms.typography}
        typographyMobile={cms.typographyMobile}
      >
        <RoomCollectionPage
          variant="suites"
          rooms={ROOM_SHOWCASES.filter((room) => room.slug === "luxury-suite")}
          eyebrow="Luxury suites aboard Hathor"
          title="Luxury Suites"
          secondTitle="Room to Drift"
          support="Generous lower-deck residences where panoramic Nile light, quiet privacy and considered comfort meet."
          heroImage="/media/hathor/scraped/luxsuite-1.webp"
        />
      </PublicCmsTextRuntime>
    </StandalonePageVisibilityShell>
  );
}
