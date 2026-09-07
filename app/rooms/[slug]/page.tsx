import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoomDetailPage } from "@/components/pages/rooms/RoomDetailPage";
import {
  PageStructuredData,
  hotelRoomNode,
} from "@/components/seo/PageStructuredData";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { findRoomShowcase, ROOM_SHOWCASES } from "@/lib/room-showcase";
import "../rooms-showcase.css";

const ROOM_CANONICAL: Record<string, string> = {
  "luxury-king-room": "/luxury-cabins-Nile-Cruise",
  "luxury-twin-room": "/luxury-cabins-Nile-Cruise",
  "luxury-suite": "/rooms",
  "royal-suite": "/royal-suites",
};

export function generateStaticParams() {
  return ROOM_SHOWCASES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const room = findRoomShowcase((await params).slug);
  if (!room) return { robots: { index: false, follow: false } };

  return buildPageMetadata({
    title: `${room.name} | Hathor Dahabiya`,
    description: room.description,
    path: `/rooms/${room.slug}`,
    image: {
      url: room.images[0] ?? "/media/hathor/home-hero-poster.webp",
      width: 1600,
      height: 1067,
      alt: `${room.name} aboard Hathor Dahabiya`,
    },
  });
}

export default async function RoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const room = findRoomShowcase((await params).slug);
  if (!room) notFound();
  const parent = ROOM_CANONICAL[room.slug] ?? "/suites";

  return (
    <>
      <PageStructuredData
        path={`/rooms/${room.slug}`}
        name={`${room.name} | Hathor Dahabiya`}
        description={room.description}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Suites", path: parent },
          { name: room.name, path: `/rooms/${room.slug}` },
        ]}
        image={room.images[0]}
        extra={[
          hotelRoomNode({
            path: `/rooms/${room.slug}`,
            name: room.name,
            description: room.description,
            occupancy: room.capacity,
            floorSizeSqm: room.sizeSqm,
          }),
        ]}
      />
      <RoomDetailPage room={room} />
    </>
  );
}
