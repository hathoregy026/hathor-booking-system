import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";
import { fetchAdminBookingById, fetchBookingDetailExtras } from "@/lib/admin-bookings-fetch";
import { paymentPlan } from "@/lib/booking-code";
import { BookingDetailView } from "@/components/admin/bookings/BookingDetailView";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!verifySessionToken((await cookies()).get(ADMIN_SESSION_COOKIE)?.value)) redirect("/admin/login");
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
