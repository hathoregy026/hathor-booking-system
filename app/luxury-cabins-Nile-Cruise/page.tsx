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
import { CABINS_SEO } from "@/lib/seo/page-metadata";
import "../page-visibility.css";
import "../site-coming-soon.css";

export const metadata: Metadata = CABINS_SEO;

export default async function LuxuryCabinsPage() {
  const cms = await loadPublicCmsBundle();

  return (
    <StandalonePageVisibilityShell
      path="/luxury-cabins-Nile-Cruise"
      pageLabel="Luxury Rooms"
      settings={cms.pageVisibility}
      liveSite={cms.liveSite}
    >
      <PageStructuredData
        path="/luxury-cabins-Nile-Cruise"
        name="Luxury Nile Cruise Cabins and Rooms | Hathor Dahabiya"
        description={
          typeof CABINS_SEO.description === "string" ? CABINS_SEO.description : ""
        }
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Luxury Rooms", path: "/luxury-cabins-Nile-Cruise" },
        ]}
        image="/media/hathor/r2/cabins-hero.webp"
        extra={[
          hotelRoomNode({
            path: "/luxury-cabins-Nile-Cruise",
            name: "Hathor luxury Nile cruise cabin",
            description:
              "A 22 m² Nile-view cabin for two guests aboard Hathor Dahabiya.",
            occupancy: 2,
            floorSizeSqm: 22,
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
          variant="cabins"
          rooms={ROOM_SHOWCASES.filter((room) => room.slug.includes("room"))}
        />
      </PublicCmsTextRuntime>
    </StandalonePageVisibilityShell>
  );
}
