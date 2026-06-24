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
  "linear-gradient(135deg, #8b6914 0%, #c9a96e 45%, #f5ecd8 100%)";

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
    <div className="mx-auto max-w-5xl">
      <nav className="mb-6 text-sm" style={{ color: "var(--booking-muted)" }}>
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/book" className="hover:underline">
          Search
        </Link>
        <span className="mx-2">/</span>
        <span style={{ color: "var(--booking-gold-dark)" }}>{details.roomName}</span>
      </nav>

      <article className="booking-card overflow-hidden">
        <div
          className="aspect-[21/9] bg-cover bg-center sm:aspect-[2.4/1]"
          style={imageStyle}
          role="img"
          aria-label={details.title}
        />

        <div className="grid gap-6 p-4 sm:gap-8 sm:p-8 lg:grid-cols-[1fr_280px] lg:gap-10">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-[0.16em]"
              style={{ color: "var(--booking-muted)" }}
            >
              {details.cruiseName}
            </p>
            <h1 className="booking-serif mt-2 text-xl font-semibold sm:text-3xl lg:text-4xl">
              {details.title}
            </h1>
            {details.meta && (
              <p
                className="mt-3 text-sm font-medium"
                style={{ color: "var(--booking-gold-dark)" }}
              >
                {details.meta}
              </p>
            )}

            {details.description && (
              <p
                className="mt-6 text-sm leading-relaxed sm:text-base"
                style={{ color: "var(--booking-muted)" }}
              >
                {details.description}
              </p>
            )}

            {details.amenities.length > 0 && (
              <div className="mt-8">
                <h2 className="booking-serif text-lg font-semibold sm:text-xl">
                  Amenities
                </h2>
                <ul
                  className="mt-4 grid gap-2 sm:grid-cols-2"
                  style={{ color: "var(--booking-muted)" }}
                >
                  {details.amenities.map((amenity) => (
                    <li key={amenity} className="flex items-start gap-2 text-sm">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: "var(--booking-gold-dark)" }}
                        aria-hidden
                      />
                      <span>{amenity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside
            className="h-fit rounded-2xl border p-6"
            style={{
              borderColor: "var(--booking-border)",
              background: "var(--booking-surface)",
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-[0.14em]"
              style={{ color: "var(--booking-muted)" }}
            >
              Price
            </p>
            <p className="booking-serif mt-2 text-2xl font-semibold sm:text-3xl">
              {formatPrice(details.priceCents)}
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--booking-muted)" }}>
              per {details.roomType?.toLowerCase().includes("suite") ? "suite" : "cabin"}
              {" · "}up to {details.capacity} guests
            </p>

            <Link
              href={`/booking/checkout?${checkoutParams.toString()}`}
              className="booking-btn-primary mt-6 flex w-full items-center justify-center px-6 py-3.5 text-sm font-semibold"
            >
              Book This Cruise
            </Link>

            <p
              className="mt-4 text-center text-xs leading-relaxed"
              style={{ color: "var(--booking-muted)" }}
            >
              You will confirm guest details on the next step.
            </p>
          </aside>
        </div>
      </article>
    </div>
  );
}
