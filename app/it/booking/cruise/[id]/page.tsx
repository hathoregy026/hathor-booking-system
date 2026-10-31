import { notFound, redirect } from "next/navigation";
import { getBookingRoomDetails } from "@/lib/booking-room-details";
import type { PhysicalRoomType } from "@/lib/physical-inventory";

const ROOM_PAGE: Record<PhysicalRoomType, string> = {
  "Luxury King Cabin": "/it/rooms/luxury-king-room",
  "Luxury Twin Cabin": "/it/rooms/luxury-twin-room",
  "Luxury Suite": "/it/rooms/luxury-suite",
  "Royal Suite": "/it/rooms/royal-suite",
};

/**
 * An old cabin address in Italian: the guest goes to that cabin's Italian room
 * page, which shows the same details, photographs and way into the booking.
 */
export default async function ItalianBookingCruiseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const details = await getBookingRoomDetails(id);
  if (!details) notFound();
  redirect(ROOM_PAGE[details.roomType as PhysicalRoomType] ?? "/it/rooms");
}
