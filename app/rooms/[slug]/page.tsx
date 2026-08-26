import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoomDetailPage } from "@/components/pages/rooms/RoomDetailPage";
import { findRoomShowcase, ROOM_SHOWCASES } from "@/lib/room-showcase";
import "../rooms-showcase.css";

export function generateStaticParams() {
  return ROOM_SHOWCASES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const room = findRoomShowcase((await params).slug);
  return room ? { title: `${room.name} | Hathor Dahabiya`, description: room.description } : {};
}

export default async function RoomPage({ params }: { params: Promise<{ slug: string }> }) {
  const room = findRoomShowcase((await params).slug);
  if (!room) notFound();
  return <RoomDetailPage room={room} />;
}
