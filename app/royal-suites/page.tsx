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
import { ROYAL_SUITES_SEO } from "@/lib/seo/page-metadata";
import "../page-visibility.css";
import "../site-coming-soon.css";

export const metadata: Metadata = ROYAL_SUITES_SEO;

export default async function RoyalSuitesPage() {
  const cms = await loadPublicCmsBundle();
  const description =
    typeof ROYAL_SUITES_SEO.description === "string"
      ? ROYAL_SUITES_SEO.description
      : "";

  return (
    <StandalonePageVisibilityShell
      path="/royal-suites"
      pageLabel="Royal Suites"
      settings={cms.pageVisibility}
      liveSite={cms.liveSite}
    >
      <PageStructuredData
        path="/royal-suites"
        name="Royal Suite Nile Cruise | Hathor Dahabiya"
        description={description}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Royal Suites", path: "/royal-suites" },
        ]}
        image="/media/hathor/r2/room-royal.webp"
        extra={[
          hotelRoomNode({
            path: "/royal-suites",
            name: "Hathor Royal Suite",
            description,
            occupancy: 4,
            floorSizeSqm: 56,
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
          variant="royal"
          rooms={ROOM_SHOWCASES.filter((room) => room.slug === "royal-suite")}
        />
      </PublicCmsTextRuntime>
    </StandalonePageVisibilityShell>
  );
}
