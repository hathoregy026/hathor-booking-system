import { notFound, redirect } from "next/navigation";
import { RoomDetailsEditorial } from "@/components/booking/RoomDetailsEditorial";
import { getBookingRoomDetails } from "@/lib/booking-room-details";
import { arrivedLanguage } from "@/lib/i18n/arrived-language";

type PageProps = { params: Promise<{ id: string }> };

export default async function BookingCruiseDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const arrived = await arrivedLanguage();
  if (arrived !== "en") redirect(`/${arrived}/booking/cruise/${encodeURIComponent(id)}`);
  const details = await getBookingRoomDetails(id);
  if (!details) notFound();

  return <RoomDetailsEditorial details={details} />;
}
