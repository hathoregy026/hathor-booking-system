import type { Metadata } from "next";
import { RoomCollectionEditorialPage } from "@/components/pages/rooms/RoomCollectionEditorialPage";
import { ROOM_SHOWCASES } from "@/lib/room-showcase";
import { StandalonePageVisibilityShell } from "@/components/public/StandalonePageVisibilityShell";
import { ROYAL_SUITES_PAGE } from "@/lib/page-content";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import { PublicCmsTextRuntime } from "@/components/public/PublicCmsTextRuntime";
import "../page-visibility.css";
import "../site-coming-soon.css";

const OG_IMAGE = "/media/hathor/r2/room-royal.webp";

export const metadata: Metadata = {
  title: "Royal Suites on a Luxury Nile Cruise",
  description: ROYAL_SUITES_PAGE.metaDescription,
  keywords: [
    "luxury Nile cruise royal suite",
    "Dahabiya royal suite Egypt",
    "Hathor Dahabiya royal suites",
    "panoramic Nile view suite",
    "private Nile cruise luxury suite",
  ],
  alternates: {
    canonical: "/royal-suites",
  },
  openGraph: {
    title: "Royal Suites on a Luxury Nile Cruise | Hathor Dahabiya",
    description: ROYAL_SUITES_PAGE.metaDescription,
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1920,
        height: 1280,
        alt: "Royal suite with panoramic Nile views aboard Hathor Dahabiya",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Royal Suites on a Luxury Nile Cruise | Hathor Dahabiya",
    description: ROYAL_SUITES_PAGE.metaDescription,
    images: [OG_IMAGE],
  },
};

export default async function RoyalSuitesPage() {
  const cms = await loadPublicCmsBundle();

  return (
    <StandalonePageVisibilityShell
      path="/royal-suites"
      pageLabel="Royal Suites"
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
          variant="royal"
          rooms={ROOM_SHOWCASES.filter((room) => room.slug === "royal-suite")}
        />
      </PublicCmsTextRuntime>
    </StandalonePageVisibilityShell>
  );
}
