import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoomDetailPage } from "@/components/pages/rooms/RoomDetailPage";
import { GuestReviews } from "@/components/public/GuestReviews";
import { SiteImagesProvider } from "@/components/public/SiteImagesProvider";
import { PageStructuredData, hotelRoomNode } from "@/components/seo/PageStructuredData";
import { roomShowcaseIn } from "@/lib/i18n/rooms-copy";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import { findRoomShowcase, ROOM_SHOWCASES } from "@/lib/room-showcase";
import { buildPageMetadata } from "@/lib/seo/metadata";
import "../../../rooms/room-folio.css";

/** Each room's collection page, in Italian, for the breadcrumb trail. */
const ROOM_PARENT_IT: Record<string, { name: string; path: string }> = {
  "luxury-king-room": { name: "Cabine", path: "/it/luxury-cabins-Nile-Cruise" },
  "luxury-twin-room": { name: "Cabine", path: "/it/luxury-cabins-Nile-Cruise" },
  "luxury-suite": { name: "Luxury Suite", path: "/it/rooms" },
  "royal-suite": { name: "Royal Suite", path: "/it/royal-suites" },
};

/** What the room is, in Italian search words, after its product name. */
const ROOM_KIND_IT: Record<string, string> = {
  "luxury-king-room": "cabina con vista sul Nilo",
  "luxury-twin-room": "cabina con vista sul Nilo",
  "luxury-suite": "suite con vista sul Nilo",
  "royal-suite": "suite sul ponte principale",
};

const roomTitle = (room: { slug: string; name: string }) =>
  `${room.name}, ${ROOM_KIND_IT[room.slug] ?? "a bordo"} | Hathor Dahabiya`;

function italianRoom(slug: string) {
  const room = findRoomShowcase(slug);
  return room ? roomShowcaseIn(room, "it") : undefined;
}

export function generateStaticParams() {
  return ROOM_SHOWCASES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const room = italianRoom((await params).slug);
  if (!room) return { robots: { index: false, follow: false } };

  return buildPageMetadata({
    title: roomTitle(room),
    description: room.description,
    path: `/it/rooms/${room.slug}`,
    image: {
      url: room.images[0] ?? "/media/hathor/home-hero-poster.webp",
      width: 1600,
      height: 1067,
      alt: `${room.name} a bordo di Hathor Dahabiya`,
    },
  });
}

export default async function ItalianRoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const room = italianRoom((await params).slug);
  if (!room) notFound();
  const parent = ROOM_PARENT_IT[room.slug] ?? ROOM_PARENT_IT["luxury-suite"];
  const path = `/it/rooms/${room.slug}`;
  const cms = await loadPublicCmsBundle();

  return (
    <>
      <PageStructuredData
        path={path}
        name={roomTitle(room)}
        description={room.description}
        breadcrumbs={[{ name: "Home", path: "/it" }, parent, { name: room.name, path }]}
        image={room.images[0]}
        extra={[
          hotelRoomNode({
            path,
            name: room.name,
            description: room.description,
            occupancy: room.capacity,
            floorSizeSqm: room.sizeSqm,
          }),
        ]}
      />
      <SiteImagesProvider images={cms.siteImages}>
        <RoomDetailPage room={room} reviews={<GuestReviews placement="room" locale="it" />} />
      </SiteImagesProvider>
    </>
  );
}
