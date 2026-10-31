import { notFound, redirect } from "next/navigation";
import { RoomDetailsEditorial } from "@/components/booking/RoomDetailsEditorial";
import { getBookingRoomDetails } from "@/lib/booking-room-details";
import { arrivedFromItalian } from "@/lib/i18n/arrived-from-italian";

type PageProps = { params: Promise<{ id: string }> };

export default async function BookingCruiseDetailsPage({ params }: PageProps) {
  const { id } = await params;
  if (await arrivedFromItalian()) redirect(`/it/booking/cruise/${encodeURIComponent(id)}`);
  const details = await getBookingRoomDetails(id);
  if (!details) notFound();

  return <RoomDetailsEditorial details={details} />;
}
