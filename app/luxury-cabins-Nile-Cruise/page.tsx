import type { Metadata } from "next";
import { RoomCollectionEditorialPage } from "@/components/pages/rooms/RoomCollectionEditorialPage";
import { ROOM_SHOWCASES } from "@/lib/room-showcase";
import { StandalonePageVisibilityShell } from "@/components/public/StandalonePageVisibilityShell";
import { LUXURY_CABINS_PAGE } from "@/lib/page-content";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import { PublicCmsTextRuntime } from "@/components/public/PublicCmsTextRuntime";
import "../page-visibility.css";
import "../site-coming-soon.css";

const OG_IMAGE = "/media/hathor/r2/cabins-hero.webp";

export const metadata: Metadata = {
  title: "Luxury Nile Cruise Rooms in Egypt",
  description: LUXURY_CABINS_PAGE.metaDescription,
  keywords: [
    "luxury Nile cruise rooms",
    "Dahabiya cabins Egypt",
    "Hathor Dahabiya rooms",
    "boutique Nile cruise cabin",
    "Nile view cabin Luxor Aswan",
  ],
  alternates: { canonical: "/luxury-cabins-Nile-Cruise" },
  openGraph: {
    title: "Luxury Nile Cruise Rooms in Egypt | Hathor Dahabiya",
    description: LUXURY_CABINS_PAGE.metaDescription,
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1920,
        height: 1280,
        alt: "Luxury Nile view room aboard Hathor Dahabiya in Egypt",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxury Nile Cruise Rooms in Egypt | Hathor Dahabiya",
    description: LUXURY_CABINS_PAGE.metaDescription,
    images: [OG_IMAGE],
  },
};

export default async function LuxuryCabinsPage() {
  const cms = await loadPublicCmsBundle();

  return (
    <StandalonePageVisibilityShell
      path="/luxury-cabins-Nile-Cruise"
      pageLabel="Luxury Rooms"
      settings={cms.pageVisibility}
      liveSite={cms.liveSite}
    >
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
