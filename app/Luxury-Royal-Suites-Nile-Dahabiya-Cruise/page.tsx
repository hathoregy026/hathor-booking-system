import type { Metadata } from "next";
import { RoomCollectionPage } from "@/components/pages/rooms/RoomCollectionPage";
import { ROOM_SHOWCASES } from "@/lib/room-showcase";
import { StandalonePageVisibilityShell } from "@/components/public/StandalonePageVisibilityShell";
import { ROYAL_SUITES_PAGE } from "@/lib/page-content";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import "../page-visibility.css";
import "../site-coming-soon.css";

const OG_IMAGE = "/media/hathor/r2/room-royal.webp";

export const metadata: Metadata = {
  title: "Luxury Dahabiya Royal Suite",
  description: ROYAL_SUITES_PAGE.metaDescription,
  openGraph: {
    title: "Luxury Dahabiya Royal Suite | Private Dahabiya Nile cruise",
    description: ROYAL_SUITES_PAGE.metaDescription,
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1920,
        height: 1280,
        alt: "Royal suite with panoramic Nile view aboard Hathor Dahabiya",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxury Dahabiya Royal Suite | Private Dahabiya Nile cruise",
    description: ROYAL_SUITES_PAGE.metaDescription,
    images: [OG_IMAGE],
  },
};

/**
 * Deliberately outside (public): Springs Design document in an isolated frame.
 * Must not inherit PublicLayout scroll infrastructure.
 */
export default async function RoyalSuitesPage() {
  const cms = await loadPublicCmsBundle();

  return (
    <StandalonePageVisibilityShell
      path="/Luxury-Royal-Suites-Nile-Dahabiya-Cruise"
      pageLabel="Royal Suites"
      settings={cms.pageVisibility}
      liveSite={cms.liveSite}
    >
      <RoomCollectionPage
        rooms={ROOM_SHOWCASES.filter((room) => room.slug === "royal-suite")}
        eyebrow="Hathor's signature residence"
        title="Royal, by nature"
        support="The most expansive private residence aboard, framed by Main Deck views and exceptional space."
      />
    </StandalonePageVisibilityShell>
  );
}
