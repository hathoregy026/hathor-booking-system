import Image from "next/image";
import Link from "next/link";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import type { RoomShowcase } from "@/lib/room-showcase";

export function RoomDetailPage({ room }: { room: RoomShowcase }) {
  return (
    <div className="public-site hathor-site room-showcase-route">
      <PublicNavbar />
    <main className="room-detail">
      <section className="room-detail__hero">
        <Image src={room.images[0]} alt={room.name} fill priority sizes="100vw" />
        <div className="room-detail__shade" aria-hidden="true" />
        <Link href="/rooms" className="room-detail__back">← All rooms</Link>
        <div className="room-detail__hero-copy">
          <p>{room.eyebrow}</p>
          <h1>{room.name}</h1>
          <div className="room-detail__facts">
            <span>{room.sizeSqm} m²</span><span>Up to {room.capacity} guests</span><span>Panoramic Nile view</span>
          </div>
        </div>
      </section>

      <section className="room-detail__story">
        <div><p className="room-kicker">Inside your room</p><h2>A private place<br /><em>to let the Nile in</em></h2></div>
        <div><p>{room.description}</p><p className="room-detail__children">{room.childrenAllowed ? "Children are welcome in this room type." : "This room type does not accommodate children."}</p></div>
      </section>

      <section className="room-detail__gallery" aria-label={`${room.name} gallery`}>
        {room.images.slice(1).map((src, index) => (
          <figure key={src} className={index % 3 === 0 ? "room-detail__photo room-detail__photo--wide" : "room-detail__photo"}>
            <Image src={src} alt={`${room.name}, view ${index + 2}`} fill sizes="(max-width: 700px) 100vw, 50vw" />
          </figure>
        ))}
      </section>

      <section className="room-detail__amenities">
        <div className="room-detail__amenities-heading"><p className="room-kicker">Utilities & comforts</p><h2>Everything,<br />considered</h2></div>
        <ul>{room.amenities.map((amenity) => <li key={amenity}><span aria-hidden="true">✦</span>{amenity}</li>)}</ul>
      </section>

      <section className="room-detail__reserve">
        <p className="room-kicker">Choose a date and itinerary</p>
        <h2>Stay in the {room.name}</h2>
        <div><BookNowTrigger className="room-pill">Check availability</BookNowTrigger><Link href="/rooms" className="room-text-link">Explore other rooms</Link></div>
      </section>
    </main>
    </div>
  );
}
