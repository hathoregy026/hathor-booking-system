import Link from "next/link";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { formatPrice } from "@/lib/client-dates";

export const revalidate = 3600;

export default async function CruisesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 sm:pt-10 lg:px-8">
      <div className="mb-6 space-y-3 text-center sm:mb-10">
        <h1 className="booking-serif text-2xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
          Dahabiya Cruises List
        </h1>
        <p
          className="mx-auto max-w-2xl text-sm leading-relaxed sm:text-base"
          style={{ color: "var(--booking-muted)" }}
        >
          Browse Hathor itineraries and find available cabins for your Nile
          journey.
        </p>
      </div>

      <div id="booking" className="text-center">
        <Link href="/book" className="public-btn-gold inline-flex px-8 py-3.5 text-sm">
          Search Availability &amp; Book
        </Link>
      </div>

      <section className="mt-12 space-y-5 sm:mt-16 sm:space-y-6">
        <h2 className="booking-serif text-xl font-semibold sm:text-3xl">
          Available cruises & cabins
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {HATHOR_CRUISES.flatMap((cruise) =>
            cruise.rooms.map((room) => (
              <article key={`${cruise.slug}-${room.roomNumber}`} className="booking-card flex h-full flex-col p-4 sm:p-6">
                <div className="flex min-w-0 flex-1 flex-col gap-4">
                  <div className="min-w-0 space-y-2">
                    <p
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--booking-muted)" }}
                    >
                      {cruise.name} · Departs {cruise.departureDay}
                    </p>
                    <h3 className="booking-serif text-lg font-semibold sm:text-2xl">
                      {room.name}
                    </h3>
                    <p
                      className="line-clamp-3 text-sm leading-relaxed"
                      style={{ color: "var(--booking-muted)" }}
                    >
                      {room.description}
                    </p>
                    <ul
                      className="mt-3 grid gap-1 text-sm sm:grid-cols-2"
                      style={{ color: "var(--booking-muted)" }}
                    >
                      {room.amenities.slice(0, 4).map((amenity) => (
                        <li key={amenity}>• {amenity}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-auto shrink-0 border-t pt-4 text-left" style={{ borderColor: "var(--booking-border)" }}>
                    <p className="booking-serif text-xl font-semibold sm:text-2xl">
                      {formatPrice(room.priceCents)}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--booking-muted)" }}
                    >
                      per cabin · up to {room.capacity} guests
                    </p>
                  </div>
                </div>
              </article>
            )),
          )}
        </div>
      </section>
    </div>
  );
}
