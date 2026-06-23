import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/booking/CheckoutForm";
import { getCheckoutSummary } from "@/lib/booking-checkout-summary";

type PageProps = {
  searchParams: Promise<{
    roomId?: string;
    cruiseId?: string;
    scheduleId?: string;
    checkInDate?: string;
    checkIn?: string;
    duration?: string;
    priceCents?: string;
    price?: string;
    adults?: string;
    children?: string;
  }>;
};

export default async function BookingCheckoutPage({ searchParams }: PageProps) {
  const query = await searchParams;

  const roomId = query.roomId;
  const cruiseId = query.cruiseId;

  if (!roomId || !cruiseId) {
    notFound();
  }

  const summary = await getCheckoutSummary({
    roomId,
    cruiseId,
    scheduleId: query.scheduleId,
    checkInDate: query.checkInDate ?? query.checkIn,
    duration: query.duration,
    priceCents: query.priceCents ?? query.price,
    adults: query.adults,
    children: query.children,
  });

  if (!summary) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6 sm:py-20">
        <div className="booking-card p-4 sm:p-8">
          <h1 className="booking-serif text-xl font-semibold sm:text-2xl">
            Booking unavailable
          </h1>
          <p className="mt-3 text-sm" style={{ color: "var(--booking-muted)" }}>
            We could not load this checkout session. The room or departure may no
            longer be available.
          </p>
          <Link
            href="/#booking"
            className="booking-btn-primary mt-6 inline-flex px-6 py-3 text-sm"
          >
            Start a new search
          </Link>
        </div>
      </div>
    );
  }

  return <CheckoutForm summary={summary} />;
}
