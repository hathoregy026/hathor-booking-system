import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Baby, Bath, Check, Coffee, Maximize2, ShieldCheck, Sparkles, Tv, Users, Waves, Wifi, Wind, type LucideIcon } from "lucide-react";
import { getBookingRoomDetails } from "@/lib/booking-room-details";
import { formatPrice } from "@/lib/client-dates";

type PageProps = { params: Promise<{ id: string }> };

const ROOM_PLACEHOLDER = "linear-gradient(135deg, #1a1a1a 0%, #3d2e1a 50%, #0a0a0a 100%)";

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

export default async function BookingCruiseDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const details = await getBookingRoomDetails(id);
  if (!details) notFound();
  const imageStyle = details.imageUrl ? { backgroundImage: `url(${details.imageUrl})` } : { background: ROOM_PLACEHOLDER };

  return (
    <article className="booking-room-editorial">
      <nav className="booking-room-editorial__crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span>/</span><Link href="/book">Search</Link><span>/</span><span>{details.roomName}</span>
      </nav>

      <header className="booking-room-editorial__hero">
        <div className="booking-room-editorial__hero-media" style={imageStyle} role="img" aria-label={details.title} />
        <div className="booking-room-editorial__hero-wash" aria-hidden="true" />
        <div className="booking-room-editorial__hero-copy">
          <p>{details.cruiseName}</p>
          <h1>{details.title}</h1>
          {details.meta ? <span>{details.meta}</span> : null}
        </div>
      </header>

      <section className="booking-room-editorial__intro">
        <div>
          <p className="booking-room-editorial__eyebrow">Your private room</p>
          <h2>A quieter way<br /><em>to meet the Nile</em></h2>
        </div>
        <div>
          {details.description ? <p>{details.description}</p> : null}
          <dl className="booking-room-facts">
            <div><Maximize2 aria-hidden /><dt>Room size</dt><dd>{details.sizeSqm} m²</dd></div>
            <div><Users aria-hidden /><dt>Occupancy</dt><dd>Up to {details.capacity} guests</dd></div>
            <div><Baby aria-hidden /><dt>Children</dt><dd>{details.childrenAllowed ? "Welcome" : "Adults only"}</dd></div>
          </dl>
        </div>
      </section>

      <section className="booking-room-gallery" aria-label={`${details.roomName} gallery`}>
        <header className="booking-room-gallery__head">
          <p className="booking-room-editorial__eyebrow">Room gallery</p>
          <h2>Move through<br /><em>your space</em></h2>
          <p>Swipe or scroll sideways to explore every view.</p>
        </header>
        <div className="booking-room-gallery__track" tabIndex={0} aria-label={`Scrollable images of ${details.roomName}`}>
        {details.galleryImages.slice(0, 5).map((image, index) => (
          <figure key={image} className={`booking-room-gallery__item booking-room-gallery__item--${index + 1}`}>
            <Image src={image} alt={`${details.roomName}, view ${index + 1}`} fill sizes="(max-width: 600px) 88vw, (max-width: 1024px) 72vw, 68vw" className="object-cover" />
            <figcaption><span>View {String(index + 1).padStart(2, "0")}</span><span>{details.roomName}</span></figcaption>
          </figure>
        ))}
        </div>
      </section>

      <section className="booking-room-editorial__utilities">
        <header><p className="booking-room-editorial__eyebrow">Utilities &amp; comforts</p><h2>Everything<br />considered</h2></header>
        <ul>
          {details.amenities.map((amenity) => {
            const Icon = amenityIcon(amenity);
            return <li key={amenity}><Icon aria-hidden /><span>{amenity}</span></li>;
          })}
        </ul>
      </section>

      <section className="booking-room-editorial__included">
        <div><p className="booking-room-editorial__eyebrow">Part of every voyage</p><h2>Included,<br /><em>with our care</em></h2></div>
        <ul>{details.inclusions.map((inclusion) => <li key={inclusion}><Check aria-hidden /><span>{inclusion}</span></li>)}</ul>
      </section>

      <aside className="booking-room-editorial__reserve">
        <div><p className="booking-room-editorial__eyebrow">Reserve this room</p><h2>{formatPrice(details.priceCents)}</h2><span>per {details.roomType?.toLowerCase().includes("suite") ? "suite" : "cabin"} · up to {details.capacity} guests</span></div>
        <div className="booking-room-editorial__actions">
          <Link href="/?book=1" className="public-btn-outline-gold">Check availability</Link>
          <Link href="/book" className="public-btn-outline-gold">Search all sailings</Link>
        </div>
      </aside>
    </article>
  );
}
