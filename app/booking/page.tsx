import { BookingJourneyFlow, type JourneyStart } from "@/components/booking/journey/BookingJourneyFlow";
import { getBookingRoomDetails } from "@/lib/booking-room-details";
import { PARTY_MAX_ADULTS, PARTY_MAX_CHILDREN, PHYSICAL_ROOM_TYPES, type PhysicalRoomType } from "@/lib/physical-inventory";
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

/** The cart stores the public room-page slug; the journey works in cabin types. */
const ROOM_TYPE_BY_SLUG: Record<string, PhysicalRoomType> = {
  "luxury-king-room": "Luxury King Cabin",
  "luxury-twin-room": "Luxury Twin Cabin",
  "luxury-suite": "Luxury Suite",
  "royal-suite": "Royal Suite",
};

const single = (value: string | string[] | undefined) => (typeof value === "string" ? value : null);

function count(value: string | null, min: number, max: number): number | null {
  if (value === null || !/^[0-9]{1,2}$/.test(value)) return null;
  return Math.min(max, Math.max(min, Number(value)));
}

/** A room page can start the journey on its voyage and cabin type. */
export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const roomId = single(params.roomId);
  const durationParam = single(params.duration);
  const roomSlug = single(params.room);
  const sailing = single(params.sailing);
  let start: JourneyStart | null = isDuration(durationParam)
    ? {
        duration: durationParam,
        roomType: roomSlug ? ROOM_TYPE_BY_SLUG[roomSlug] ?? null : null,
        // From the cart: the saved departure day and whole party, re-checked live.
        sailingDate: sailing && /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(sailing) ? sailing : null,
        adults: count(single(params.adults), 1, PARTY_MAX_ADULTS),
        children: count(single(params.children), 0, PARTY_MAX_CHILDREN),
      }
    : null;

  if (roomId && roomId.length <= 128) {
    const details = await getBookingRoomDetails(roomId);
    const roomType = PHYSICAL_ROOM_TYPES.find(type => type === details?.roomType) as PhysicalRoomType | undefined;
    const duration = isDuration(details?.stayDuration) ? details.stayDuration : start?.duration;
    if (roomType || duration) {
      start = {
        ...start,
        duration: duration ?? "7-nights-luxor-aswan-luxor",
        roomType: roomType ?? start?.roomType ?? null,
      };
    }
  }

  // Keyed on the start, so continuing from the cart while already on this page
  // starts the journey afresh with the cart's sailing, cabin and party.
  return <BookingJourneyFlow key={JSON.stringify(start)} start={start} />;
}
