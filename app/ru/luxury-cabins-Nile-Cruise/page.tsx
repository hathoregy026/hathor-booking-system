import type { Metadata } from "next";
import { LocaleRoomCollectionPage } from "@/components/pages/rooms/LocaleRoomCollectionPage";
import { LOCALE_ROOM_COLLECTIONS } from "@/lib/i18n/locale-pages";
import "../../page-visibility.css";
import "../../site-coming-soon.css";

export const metadata: Metadata = LOCALE_ROOM_COLLECTIONS.ru.cabins.metadata;

export default function RussianRoomCollectionRoute() {
  return <LocaleRoomCollectionPage locale="ru" variant="cabins" />;
}
