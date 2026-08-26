import {
  BookingReservationFlow,
  type RoomBookingEntry,
} from "@/components/booking/BookingReservationFlow";
import { getBookingRoomDetails } from "@/lib/booking-room-details";
import { luxuryRoomTypeForDbRoomType } from "@/lib/booking-search-config";

export const metadata = {
  title: "Book Your Luxury Dahabiya Cruise | Hathor",
  description:
    "Select your cabin and complete your luxury Nile cruise reservation aboard Hathor Dahabiya.",
};

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ roomId?: string | string[] }>;
}) {
  const params = await searchParams;
  const roomId = typeof params.roomId === "string" ? params.roomId : null;
  let initialRoomBooking: RoomBookingEntry | null = null;

  if (roomId && roomId.length <= 128) {
    const details = await getBookingRoomDetails(roomId);
    if (details?.stayDuration) {
      initialRoomBooking = {
        duration: details.stayDuration,
        roomConfig: {
          roomType: luxuryRoomTypeForDbRoomType(details.roomType),
          adults: 1,
          children: 0,
        },
        roomId: details.roomId,
        roomName: details.roomName,
        cruiseId: details.cruiseId,
      };
    }
  }

  return <BookingReservationFlow initialRoomBooking={initialRoomBooking} />;
}
