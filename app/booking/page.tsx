import { BookingJourneyFlow, type JourneyStart } from "@/components/booking/journey/BookingJourneyFlow";
import { getBookingRoomDetails } from "@/lib/booking-room-details";
import { PHYSICAL_ROOM_TYPES, type PhysicalRoomType } from "@/lib/physical-inventory";
import { HATHOR_ITINERARIES } from "@/lib/booking-itineraries";
import type { StayDurationValue } from "@/lib/booking-search-config";

export const metadata = {
  title: "Book Your Luxury Dahabiya Cruise | Hathor",
  description:
    "Choose your Nile voyage, sailing date and cabin aboard Hathor Dahabiya, then send your booking request to our reservations team.",
  robots: { index: false, follow: false },
};

function isDuration(value: string | null | undefined): value is StayDurationValue {
  return Boolean(value && value in HATHOR_ITINERARIES);
}

/** A room page can start the journey on its voyage and cabin type. */
export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ roomId?: string | string[]; duration?: string | string[] }>;
}) {
  const params = await searchParams;
  const roomId = typeof params.roomId === "string" ? params.roomId : null;
  const durationParam = typeof params.duration === "string" ? params.duration : null;
  let start: JourneyStart | null = isDuration(durationParam) ? { duration: durationParam, roomType: null } : null;

  if (roomId && roomId.length <= 128) {
    const details = await getBookingRoomDetails(roomId);
    const roomType = PHYSICAL_ROOM_TYPES.find(type => type === details?.roomType) as PhysicalRoomType | undefined;
    const duration = isDuration(details?.stayDuration) ? details.stayDuration : start?.duration;
    if (roomType || duration) {
      start = {
        duration: duration ?? "7-nights-luxor-aswan-luxor",
        roomType: roomType ?? null,
      };
    }
  }

  return <BookingJourneyFlow start={start} />;
}
