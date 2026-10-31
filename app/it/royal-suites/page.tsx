import type { Metadata } from "next";
import { ItalianRoomCollectionPage } from "@/components/pages/rooms/ItalianRoomCollectionPage";
import { ITALIAN_ROOM_COLLECTIONS } from "@/lib/i18n/rooms-seo-it";
import "../../page-visibility.css";
import "../../site-coming-soon.css";

export const metadata: Metadata = ITALIAN_ROOM_COLLECTIONS.royal.metadata;

export default function ItalianRoomCollectionRoute() {
  return <ItalianRoomCollectionPage variant="royal" />;
}
