import type { Metadata } from "next";
import { LocaleRoomPage, localeRoomMetadata } from "@/components/pages/locale/LocaleRoomPages";
import { ROOM_SHOWCASES } from "@/lib/room-showcase";
import "../../../rooms/room-folio.css";

export function generateStaticParams() {
  return ROOM_SHOWCASES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return localeRoomMetadata("it", (await params).slug);
}

export default async function ItalianRoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <LocaleRoomPage locale="it" slug={(await params).slug} />;
}
