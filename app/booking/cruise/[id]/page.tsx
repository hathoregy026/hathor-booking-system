import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { getBookingRoomDetails } from "@/lib/booking-room-details";
import { formatPrice } from "@/lib/client-dates";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    checkInDate?: string;
    duration?: string;
    scheduleId?: string;
    adults?: string;
    children?: string;
  }>;
};

const ROOM_PLACEHOLDER =
  "linear-gradient(135deg, #1a1a1a 0%, #3d2e1a 50%, #0a0a0a 100%)";

export default async function BookingCruiseDetailsPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const details = await getBookingRoomDetails(id);

  if (!details) {
    notFound();
  }

  const checkoutParams = new URLSearchParams({
    roomId: details.roomId,
    cruiseId: details.cruiseId,
    priceCents: String(details.priceCents),
  });

  if (query.checkInDate) checkoutParams.set("checkInDate", query.checkInDate);
  if (query.duration) checkoutParams.set("duration", query.duration);
  if (query.scheduleId) checkoutParams.set("scheduleId", query.scheduleId);
  if (query.adults) checkoutParams.set("adults", query.adults);
  if (query.children) checkoutParams.set("children", query.children);

  const imageStyle = details.imageUrl
    ? { backgroundImage: `url(${details.imageUrl})` }
    : { background: ROOM_PLACEHOLDER };

  return (
    <div className="mx-auto max-w-6xl">
      <nav
        className="mb-8 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.12em]"
        style={{ color: "var(--booking-muted)" }}
      >
        <Link href="/" className="transition-colors hover:text-[var(--booking-gold-dark)]">
          Home
        </Link>
        <span>/</span>
        <Link href="/book" className="transition-colors hover:text-[var(--booking-gold-dark)]">
          Search
        </Link>
        <span>/</span>
        <span style={{ color: "var(--booking-gold-dark)" }}>{details.roomName}</span>
      </nav>

      <div
        className="relative mb-10 overflow-hidden"
        style={{ minHeight: "320px" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={imageStyle}
          role="img"
          aria-label={details.title}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgb(0 0 0 / 0.3) 0%, rgb(10 10 10 / 0.85) 100%)",
          }}
        />
        <div className="relative flex min-h-[320px] flex-col justify-end p-6 sm:p-10">
          <p
            className="text-xs font-medium uppercase tracking-[0.2em]"
            style={{ color: "var(--booking-gold)" }}
          >
            {details.cruiseName}
          </p>
          <h1 className="booking-serif mt-2 text-3xl font-medium text-white sm:text-4xl lg:text-5xl">
            {details.title}
          </h1>
          {details.meta && (
            <p className="mt-3 text-sm font-light text-[var(--booking-gold-cream,#f4e5c2)]">
              {details.meta}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-12">
        <div>
          {details.description && (
            <section className="mb-10">
              <h2 className="booking-serif text-2xl font-medium">Overview</h2>
              <div
                className="mt-3 h-px w-16"
                style={{ background: "var(--booking-gold)" }}
              />
              <p
                className="mt-6 text-sm leading-relaxed sm:text-base"
                style={{ color: "var(--booking-muted)" }}
              >
                {details.description}
              </p>
            </section>
          )}

          {details.amenities.length > 0 && (
            <section>
              <h2 className="booking-serif text-2xl font-medium">
                Amenities &amp; Features
              </h2>
              <div
                className="mt-3 h-px w-16"
                style={{ background: "var(--booking-gold)" }}
              />
              <ul
                className="mt-6 grid gap-3 sm:grid-cols-2"
                style={{ color: "var(--booking-muted)" }}
              >
                {details.amenities.map((amenity) => (
                  <li key={amenity} className="flex items-start gap-3 text-sm">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: "var(--booking-gold-dark)" }}
                      aria-hidden
                    />
                    <span>{amenity}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="lux-booking-widget h-fit">
          <p
            className="text-xs font-medium uppercase tracking-[0.18em]"
            style={{ color: "var(--booking-gold)" }}
          >
            Reserve
          </p>
          <p className="booking-serif mt-3 text-3xl font-medium text-white">
            {formatPrice(details.priceCents)}
          </p>
          <p className="mt-1 text-xs text-[var(--lux-text-grey,#b8b8b8)]">
            per {details.roomType?.toLowerCase().includes("suite") ? "suite" : "cabin"}
            {" · "}up to {details.capacity} guests
          </p>

          <Link
            href={`/booking/checkout?${checkoutParams.toString()}`}
            className="booking-btn-primary mt-6 flex w-full items-center justify-center px-6 py-3.5 text-sm font-semibold"
          >
            Check Availability
          </Link>

          <Link
            href="/book"
            className="mt-3 block text-center text-xs uppercase tracking-wider text-[var(--booking-gold)] hover:underline"
          >
            Or search all sailings
          </Link>

          <p className="mt-6 text-center text-xs leading-relaxed text-[var(--lux-text-grey,#b8b8b8)]">
            Guest details confirmed on the next step. No payment required to
            request a booking.
          </p>
        </aside>
      </div>
    </div>
  );
}
