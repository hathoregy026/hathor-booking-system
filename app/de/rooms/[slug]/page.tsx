import type { Metadata } from "next";
import { LocaleRoomPage, localeRoomMetadata } from "@/components/pages/locale/LocaleRoomPages";
import { notFoundMetadata } from "@/lib/i18n/not-found";
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
  const { slug } = await params;
  /* A missing room shows the German 404, so it carries the German 404's title too. */
  if (!ROOM_SHOWCASES.some((room) => room.slug === slug)) return notFoundMetadata("de");
  return localeRoomMetadata("de", slug);
}

export default async function GermanRoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <LocaleRoomPage locale="de" slug={(await params).slug} />;
}
