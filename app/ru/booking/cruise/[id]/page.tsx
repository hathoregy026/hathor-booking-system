import { notFound, redirect } from "next/navigation";
import { getBookingRoomDetails } from "@/lib/booking-room-details";
import { notFoundMetadata } from "@/lib/i18n/not-found";
import type { PhysicalRoomType } from "@/lib/physical-inventory";

/* A known address redirects, so this page only ever renders as the Russian 404. */
export const metadata = notFoundMetadata("ru");

const ROOM_PAGE: Record<PhysicalRoomType, string> = {
  "Luxury King Cabin": "/ru/rooms/luxury-king-room",
  "Luxury Twin Cabin": "/ru/rooms/luxury-twin-room",
  "Luxury Suite": "/ru/rooms/luxury-suite",
  "Royal Suite": "/ru/rooms/royal-suite",
};

/**
 * An old cabin address in Russian: the guest goes to that cabin's Russian room
 * page, which shows the same details, photographs and way into the booking.
 */
export default async function RussianBookingCruiseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const details = await getBookingRoomDetails(id);
  if (!details) notFound();
  redirect(ROOM_PAGE[details.roomType as PhysicalRoomType] ?? "/ru/rooms");
}
