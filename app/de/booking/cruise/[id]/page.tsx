import { notFound, redirect } from "next/navigation";
import { getBookingRoomDetails } from "@/lib/booking-room-details";
import { notFoundMetadata } from "@/lib/i18n/not-found";
import type { PhysicalRoomType } from "@/lib/physical-inventory";

/* A known address redirects, so this page only ever renders as the German 404. */
export const metadata = notFoundMetadata("de");

const ROOM_PAGE: Record<PhysicalRoomType, string> = {
  "Luxury King Cabin": "/de/rooms/luxury-king-room",
  "Luxury Twin Cabin": "/de/rooms/luxury-twin-room",
  "Luxury Suite": "/de/rooms/luxury-suite",
  "Royal Suite": "/de/rooms/royal-suite",
};

/**
 * An old cabin address in German: the guest goes to that cabin's German room
 * page, which shows the same details, photographs and way into the booking.
 */
export default async function GermanBookingCruiseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const details = await getBookingRoomDetails(id);
  if (!details) notFound();
  redirect(ROOM_PAGE[details.roomType as PhysicalRoomType] ?? "/de/rooms");
}
