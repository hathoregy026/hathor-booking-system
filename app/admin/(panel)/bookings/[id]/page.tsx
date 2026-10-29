import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin-server-auth";
import { fetchAdminBookingById, fetchBookingDetailExtras } from "@/lib/admin-bookings-fetch";
import { paymentPlan } from "@/lib/booking-code";
import { BookingDetailView } from "@/components/admin/bookings/BookingDetailView";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage("bookings.view");
  const { id } = await params;

  const [booking, extras] = await Promise.all([fetchAdminBookingById(id), fetchBookingDetailExtras(id)]);
  if (!booking || !extras) notFound();

  return (
    <BookingDetailView
      booking={booking}
      passengers={extras.passengers}
      payments={extras.payments}
      plan={paymentPlan(extras.schedule, booking.paidCents)}
      cancellationFeeCents={extras.cancellationFeeCents}
      marketingOptIn={extras.marketingOptIn}
    />
  );
}
