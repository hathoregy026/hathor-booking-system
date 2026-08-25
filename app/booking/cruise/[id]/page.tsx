import { notFound } from "next/navigation";
import { RoomDetailsEditorial } from "@/components/booking/RoomDetailsEditorial";
import { getBookingRoomDetails } from "@/lib/booking-room-details";

type PageProps = { params: Promise<{ id: string }> };

export default async function BookingCruiseDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const details = await getBookingRoomDetails(id);
  if (!details) notFound();

  return <RoomDetailsEditorial details={details} />;
}
