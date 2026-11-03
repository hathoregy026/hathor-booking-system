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
  /* A missing room shows the Russian 404, so it carries the Russian 404's title too. */
  if (!ROOM_SHOWCASES.some((room) => room.slug === slug)) return notFoundMetadata("ru");
  return localeRoomMetadata("ru", slug);
}

export default async function RussianRoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <LocaleRoomPage locale="ru" slug={(await params).slug} />;
}
