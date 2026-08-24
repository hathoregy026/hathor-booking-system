import Image from "next/image";
import Link from "next/link";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { ROOM_SHOWCASES } from "@/lib/room-showcase";

export function RoomCollectionPage() {
  return (
    <div className="public-site hathor-site room-showcase-route">
      <PublicNavbar />
    <main className="room-collection">
      <section className="room-collection__hero">
        <Image src="/media/hathor/scraped/suites-hero.webp" alt="Hathor rooms and suites" fill priority sizes="100vw" />
        <div className="room-collection__wash" aria-hidden="true" />
        <div className="room-collection__hero-copy">
          <p>Hathor accommodation</p>
          <h1>Rooms,<br /><em>made for the Nile</em></h1>
          <span>Four distinct ways to wake beside the river.</span>
        </div>
      </section>

      <section className="room-collection__intro" aria-labelledby="rooms-heading">
        <p className="room-kicker">Your private space aboard</p>
        <h2 id="rooms-heading">Choose the room that<br />fits your voyage</h2>
        <p>Every room carries Hathor&apos;s quiet cream-and-gold character, panoramic river views and attentive service. Explore the photography and details before choosing an itinerary.</p>
      </section>

      <ol className="room-collection__list">
        {ROOM_SHOWCASES.map((room, index) => (
          <li key={room.slug} className="room-collection__item">
            <Link href={`/rooms/${room.slug}`} className="room-collection__media">
              <Image src={room.images[0]} alt={room.name} fill sizes="(max-width: 1024px) 100vw, 62vw" />
              <span className="room-collection__number">0{index + 1}</span>
            </Link>
            <div className="room-collection__copy">
              <p className="room-kicker">{room.eyebrow}</p>
              <h2>{room.name}</h2>
              <p>{room.description}</p>
              <dl>
                <div><dt>Space</dt><dd>{room.sizeSqm} m²</dd></div>
                <div><dt>Guests</dt><dd>Up to {room.capacity}</dd></div>
              </dl>
              <Link href={`/rooms/${room.slug}`} className="room-text-link">View room <span aria-hidden="true">→</span></Link>
            </div>
          </li>
        ))}
      </ol>

      <section className="room-collection__cta">
        <p className="room-kicker">Your Nile story awaits</p>
        <h2>Find your sailing</h2>
        <BookNowTrigger className="room-pill">Book now</BookNowTrigger>
      </section>
    </main>
    </div>
  );
}
