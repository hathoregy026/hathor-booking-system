import type { Metadata } from "next";
import { RoomCollectionEditorialPage } from "@/components/pages/rooms/RoomCollectionEditorialPage";
import { ROOM_SHOWCASES } from "@/lib/room-showcase";
import { StandalonePageVisibilityShell } from "@/components/public/StandalonePageVisibilityShell";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import { PublicCmsTextRuntime } from "@/components/public/PublicCmsTextRuntime";
import {
  PageStructuredData,
  hotelRoomNode,
} from "@/components/seo/PageStructuredData";
import { ROOMS_SEO } from "@/lib/seo/page-metadata";
import "../page-visibility.css";
import "../site-coming-soon.css";

export const metadata: Metadata = ROOMS_SEO;

export default async function RoomsPage() {
  const cms = await loadPublicCmsBundle();
  const description =
    typeof ROOMS_SEO.description === "string" ? ROOMS_SEO.description : "";

  return (
    <StandalonePageVisibilityShell
      path="/rooms"
      pageLabel="Luxury Suites"
      settings={cms.pageVisibility}
      liveSite={cms.liveSite}
    >
      <PageStructuredData
        path="/rooms"
        name="Hathor Luxury Suite | 46 m² Nile Cruise Suite"
        description={description}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Luxury Suite", path: "/rooms" },
        ]}
        image="/media/hathor/scraped/suites-hero.webp"
        extra={[
          hotelRoomNode({
            path: "/rooms",
            name: "Hathor Luxury Suite",
            description,
            occupancy: 4,
            floorSizeSqm: 46,
          }),
        ]}
      />
      <PublicCmsTextRuntime
        websiteText={cms.websiteText}
        websiteTextMobile={cms.websiteTextMobile}
        typography={cms.typography}
        typographyMobile={cms.typographyMobile}
      >
        <RoomCollectionEditorialPage
          variant="suites"
          rooms={ROOM_SHOWCASES.filter((room) => room.slug === "luxury-suite")}
        />
      </PublicCmsTextRuntime>
    </StandalonePageVisibilityShell>
  );
}
