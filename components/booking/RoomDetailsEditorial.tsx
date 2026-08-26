"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Baby,
  Bath,
  Check,
  Coffee,
  Maximize2,
  ShieldCheck,
  Sparkles,
  Tv,
  Users,
  Waves,
  Wifi,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { useRef } from "react";
import { useRoomDetailsViewportScroll } from "@/hooks/useRoomDetailsViewportScroll";
import type { BookingRoomDetails } from "@/lib/booking-room-details";
import {
  luxuryRoomTypeForDbRoomType,
} from "@/lib/booking-search-config";
import { formatPrice } from "@/lib/client-dates";
import { useBookingStore } from "@/store/bookingStore";

function amenityIcon(amenity: string): LucideIcon {
  const value = amenity.toLowerCase();
  if (value.includes("wifi") || value.includes("internet")) return Wifi;
  if (value.includes("bath") || value.includes("shower") || value.includes("jacuzzi")) return Bath;
  if (value.includes("coffee") || value.includes("tea") || value.includes("minibar")) return Coffee;
  if (value.includes("screen") || value.includes("tv") || value.includes("entertainment")) return Tv;
  if (value.includes("air condition")) return Wind;
  if (value.includes("safe") || value.includes("doctor")) return ShieldCheck;
  if (value.includes("nile") || value.includes("view")) return Waves;
  return Sparkles;
}

export function RoomDetailsEditorial({ details }: { details: BookingRoomDetails }) {
  const router = useRouter();
  const rootRef = useRef<HTMLElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const setCheckoutStep = useBookingStore((state) => state.setCheckoutStep);
  useRoomDetailsViewportScroll({ rootRef, runRef, trackRef });

  const images = details.galleryImages.slice(0, 5);
  const bookNowHref = details.stayDuration
    ? `/booking?roomId=${encodeURIComponent(details.roomId)}`
    : "/?book=1";

  const handleBookNow = () => {
    if (!details.stayDuration) return;

    useBookingStore.setState({
      duration: details.stayDuration,
      roomConfigs: [{
        roomType: luxuryRoomTypeForDbRoomType(details.roomType),
        adults: 1,
        children: 0,
      }],
      itineraryConfigured: true,
      checkoutStep: 2,
      checkInDate: null,
      startDate: null,
      endDate: null,
      searchAttempted: false,
      availableSchedules: [],
      availableRooms: [],
      selectedRoomIds: [],
      selectedRatePlan: "standard",
      selectedScheduleId: null,
      selectedCruiseId: details.cruiseId,
      preferredRoomId: details.roomId,
      preferredRoomName: details.roomName,
      totalPrice: 0,
      error: null,
    });
  };

  const handleBackToRooms = () => {
    setCheckoutStep(3);
    router.push("/booking");
  };

  return (
    <article ref={rootRef} className="booking-room-editorial">
      <span className="booking-room-editorial__progress" aria-hidden="true"><i data-room-progress /></span>

      <section ref={runRef} className="booking-room-run" aria-label={`${details.roomName} details`}>
        <div className="booking-room-stage">
          <div ref={trackRef} className="booking-room-track">
            <section className="booking-room-scene booking-room-scene--hero">
              <Image src={images[0]} alt={details.title} fill priority sizes="100vw" className="booking-room-scene__image" />
              <div className="booking-room-scene__wash" aria-hidden="true" />
              <nav className="booking-room-editorial__crumbs" aria-label="Breadcrumb">
                <Link href="/">Home</Link><span>/</span><Link href="/book">Search</Link><span>/</span><span>{details.roomName}</span>
              </nav>
              <div className="booking-room-hero-copy">
                <p className="booking-room-kicker">({details.cruiseName})</p>
                <h1>{details.title}</h1>
                {details.meta ? <p className="booking-room-meta">{details.meta}</p> : null}
                <span className="booking-room-scroll-hint"><i /> Scroll sideways</span>
              </div>
            </section>

            <section className="booking-room-scene booking-room-scene--statement">
              <div>
                <p className="booking-room-kicker">(Your private room)</p>
                <h2>A quieter way<br /><em>to meet the Nile</em></h2>
              </div>
              <div className="booking-room-statement-copy">
                {details.description ? <p>{details.description}</p> : null}
                <dl className="booking-room-facts">
                  <div><Maximize2 aria-hidden /><dt>Room size</dt><dd>{details.sizeSqm} m²</dd></div>
                  <div><Users aria-hidden /><dt>Occupancy</dt><dd>Up to {details.capacity} guests</dd></div>
                  <div><Baby aria-hidden /><dt>Children</dt><dd>{details.childrenAllowed ? "Welcome" : "Adults only"}</dd></div>
                </dl>
              </div>
            </section>

            {images.map((image, index) => (
              <section key={image} className={`booking-room-scene booking-room-scene--image booking-room-scene--image-${index + 1}`}>
                <figure>
                  <Image src={image} alt={`${details.roomName}, view ${index + 1}`} fill sizes="(max-width: 950px) 100vw, 78vw" className="booking-room-scene__image" />
                  <figcaption><span>View {String(index + 1).padStart(2, "0")}</span><span>{details.roomName}</span></figcaption>
                </figure>
              </section>
            ))}

            <section className="booking-room-scene booking-room-scene--utilities">
              <header><p className="booking-room-kicker">(Utilities &amp; comforts)</p><h2>Everything<br />considered</h2></header>
              <ol>
                {details.amenities.map((amenity, index) => {
                  const Icon = amenityIcon(amenity);
                  return <li key={amenity}><span>{String(index + 1).padStart(2, "0")}</span><Icon aria-hidden /><p>{amenity}</p></li>;
                })}
              </ol>
            </section>

            <section className="booking-room-scene booking-room-scene--included">
              <header><p className="booking-room-kicker">(Part of every voyage)</p><h2>Included,<br /><em>with our care</em></h2></header>
              <ul>{details.inclusions.map((inclusion) => <li key={inclusion}><Check aria-hidden /><span>{inclusion}</span></li>)}</ul>
            </section>

            <section className="booking-room-scene booking-room-scene--reserve">
              <div>
                <p className="booking-room-kicker">(Reserve this room)</p>
                <h2>{formatPrice(details.priceCents)}</h2>
                <p>Per {details.roomType?.toLowerCase().includes("suite") ? "suite" : "cabin"} · up to {details.capacity} guests</p>
              </div>
              <div className="booking-room-editorial__actions">
                <Link href={bookNowHref} className="public-btn-outline-gold" onClick={handleBookNow}>Book Now</Link>
                <button type="button" className="public-btn-outline-gold" onClick={handleBackToRooms}>Back to rooms</button>
              </div>
            </section>
          </div>
        </div>
      </section>
    </article>
  );
}
