import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { homeFourPreviewEnabled } from "@/lib/home-four-preview";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import { originSrcForNextImage } from "@/lib/local-optimized-site-images";
import { HATHOR_HERO_POSTER_SRC } from "@/lib/branding";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { HomeFourExperience } from "@/components/pages/home-four/HomeFourExperience";
import { HomeFourHero } from "@/components/pages/home-four/HomeFourHero";
import { HomeFourAtlas } from "@/components/pages/home-four/HomeFourAtlas";
import { H4_STOPS } from "@/components/pages/home-four/atlas-data";
import "./home-four.css";

export const dynamic = "force-dynamic";
const title = "Hathor on the Nile — Home 4 local preview";
const description = "Discover life aboard Hathor Dahabiya, Nile journeys between Luxor and Aswan, river-view accommodation and private charter.";
export const metadata: Metadata = {
  title: { absolute: title }, description,
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
  alternates: { canonical: null },
  openGraph: { title, description, type: "website", images: [{ url: HATHOR_HERO_POSTER_SRC, alt: "Hathor Dahabiya on the Nile" }] },
  twitter: { card: "summary_large_image", title, description, images: [HATHOR_HERO_POSTER_SRC] },
};

export default async function HomeFourPage() {
  if (!await homeFourPreviewEnabled()) notFound();
  const cms=await loadPublicCmsBundle();
  function media(slot: string, alt: string, className="", sizes="(max-width: 950px) 90vw, 45vw") {
    const image=cms.siteImages[slot];
    // Explicit existing assets are used where a legacy CMS slot describes a different photograph.
    return <figure className={`h4-media ${className}`}><Image src={originSrcForNextImage(slot.startsWith("/") ? slot : image?.src || HATHOR_HERO_POSTER_SRC)} alt={alt} fill sizes={sizes} quality={90} /></figure>;
  }
  const voyages=HATHOR_CRUISES.filter(v=>[3,4,7].includes(v.nights));
  return <HomeFourExperience>
    <main>
      <HomeFourHero poster={cms.siteImages["home-hero-poster"]?.src || HATHOR_HERO_POSTER_SRC} />
      <section className="h4-run" aria-label="The Hathor story"><div className="h4-stage"><div className="h4-track">
        <section className="h4-scene h4-intro" id="h4-introduction" tabIndex={-1} aria-labelledby="h4-intro-title">
          <div className="h4-intro-copy"><p className="h4-eyebrow">The river, at home</p><h2 id="h4-intro-title">Unpack.<br />The landscape<br /><em>will move.</em></h2><p className="h4-copy">A room of your own. A table by the water. A different stretch of Egypt beyond the window each day.</p><p className="h4-copy">Hathor brings eight cabins, two suites and two Royal Suites to the Nile, with space to gather on deck and retreat in private.</p><Link className="h4-link" href="/about">Meet Hathor</Link></div>
          <div className="h4-intro-images">{media("/media/hathor/r2/home-split-courtyard.webp","Hathor seen from above, with its open deck surrounded by the Nile","h4-intro-main")}
            <div className="h4-wipe">{media("/media/hathor/r2/home-story-craft-large.webp","A woven chair beside a river-view window")}{media("/media/hathor/scraped/luxsuite-2.webp","The sitting area of a suite aboard Hathor","h4-wipe-over")}</div><p className="h4-caption">Egypt outside. A home within.</p></div>
        </section>
        <HomeFourAtlas images={H4_STOPS.map(s=>media(s.slot,s.alt,"h4-place-image","(max-width: 950px) 90vw, 26vw"))} />
        <section className="h4-scene h4-voyages" id="h4-voyages" tabIndex={-1} aria-labelledby="h4-voyages-title">
          <div className="h4-voyages-head"><p className="h4-eyebrow">Choose your passage</p><h2 id="h4-voyages-title">One river.<br /><em>Your direction.</em></h2><p className="h4-copy">Begin in Aswan, begin in Luxor, or return to where you started. Choose the time you want to spend aboard.</p></div>
          <div className="h4-voyage-list">{voyages.map(v=><article key={v.slug} className="h4-voyage"><div className="h4-duration"><strong>{v.nights}</strong><span>nights<br />{v.days} days</span></div><div><h3>{v.nights===3?"Aswan to Luxor":v.nights===4?"Luxor to Aswan":"Luxor, Aswan & back"}</h3><p className="h4-caption">{v.nights===3?"Northbound · downstream":v.nights===4?"Southbound · upstream":"A return passage on the Nile"}</p><Link className="h4-link" href={v.nights===3?"/voyages/aswan-to-luxor":v.nights===4?"/voyages/luxor-to-aswan":"/voyages"}>Explore the {v.nights}-night voyage</Link></div></article>)}<p className="h4-caption">Sailing dates, prices and available rooms are shown in the reservation flow.</p><Link className="h4-btn" href="/cruises-list">See scheduled sailings</Link></div>
        </section>
        <section className="h4-scene h4-stay" aria-labelledby="h4-stay-title">
          {media("/media/hathor/scraped/royal-1.webp","A Royal Suite aboard Hathor with views of the Nile","h4-stay-main","(max-width: 950px) 100vw, 54vw")}
          <div className="h4-stay-copy"><p className="h4-eyebrow">Life aboard · your own quarters</p><h2 id="h4-stay-title">Keep the<br /><em>river close.</em></h2><p className="h4-copy">River views, air conditioning and a private bathroom make the return from shore a welcome part of the day.</p><p className="h4-copy">Choose a cabin, a Luxury Suite or a Royal Suite. Explore the individual rooms for layouts, facilities and occupancy.</p><Link className="h4-btn" href="/suites">Explore rooms & suites</Link>{media("/media/hathor/scraped/cabin-1.webp","A cabin aboard Hathor Dahabiya","h4-stay-detail","(max-width: 950px) 65vw, 20vw")}</div>
        </section>
        <section className="h4-scene h4-rhythm" aria-labelledby="h4-rhythm-title">
          <div className="h4-rhythm-title"><p className="h4-eyebrow">Between shore and supper</p><h2 id="h4-rhythm-title">Leave room<br /><em>in the day.</em></h2></div>
          <div className="h4-rhythm-dining">{media("/media/hathor/r2/gastronomy-hero.webp","Tables set for dining aboard Hathor","","(max-width: 950px) 90vw, 35vw")}<h3>Take your time at the table.</h3><p className="h4-copy">Egyptian flavours and international dishes, served aboard between days of exploring.</p><Link className="h4-link" href="/gastronomy">Dining on the Nile</Link></div>
          <div className="h4-rhythm-rest">{media("/media/hathor/r2/charter-hero.webp","Guests relaxing beside the pools on Hathor's deck","","(max-width: 950px) 75vw, 25vw")}<h3>A quieter afternoon.</h3><p className="h4-copy">Return to the deck, or discover the treatments at Seneb Spa. Ask about arrangements for your sailing.</p><div className="h4-link-pair"><Link className="h4-link" href="/wellness">Seneb Spa</Link><Link className="h4-link" href="/highlights">Days ashore</Link></div></div>
        </section>
        <section className="h4-scene h4-charter" aria-labelledby="h4-charter-title">
          <div className="h4-charter-copy"><p className="h4-eyebrow">Private charter</p><h2 id="h4-charter-title">All aboard.<br /><em>All yours.</em></h2><p className="h4-copy">Bring your people together on Hathor. Exclusive use of the vessel gives your gathering a place of its own on the Nile.</p><p className="h4-copy">Share your dates, group size and ideas with the team to discuss a private itinerary.</p><Link className="h4-btn" href="/charter">Discover private charter</Link></div>{media("/media/hathor/r2/cruises-hero.webp","The open deck of Hathor at sunset","h4-charter-image","(max-width: 950px) 100vw, 50vw")}
        </section>
      </div></div></section>
      <section className="h4-close" id="h4-invitation" tabIndex={-1} aria-labelledby="h4-close-title">
        <div className="h4-close-head"><p className="h4-eyebrow">Your place on the river</p><h2 id="h4-close-title">Shall we<br /><em>make a plan?</em></h2></div>
        <div className="h4-close-grid">{media("/media/hathor/r2/about-hero.webp","Lounge chairs on Hathor’s deck beside the Nile","h4-close-image")}
          <div className="h4-close-copy"><p className="h4-lead">Start with a month.<br />A few names.<br />A direction that calls to you.</p><p className="h4-copy">Explore scheduled departures, or speak to reservations about the right room and route for your party.</p><div className="h4-actions"><BookNowTrigger className="h4-btn">Check availability</BookNowTrigger><Link className="h4-btn" href="/contact">Speak to reservations</Link></div>
            <div className="h4-practical"><h3>Before you travel</h3><p>Confirm embarkation details, transfers and the inclusions for your chosen sailing. For mobility, dietary or room requirements, contact the team before booking.</p><Link className="h4-link" href="/terms-and-conditions">Booking terms</Link></div>
          </div></div>
        <footer className="h4-footer"><p className="h4-footer-mark">Hathor<br /><em>Dahabiya</em></p><div><p className="h4-eyebrow">Reservations</p><a href={`mailto:${PUBLIC_CONTACT.email}`}>{PUBLIC_CONTACT.email}</a><a href={`tel:${PUBLIC_CONTACT.phone}`}>{PUBLIC_CONTACT.phoneDisplay}</a></div><nav aria-label="Home 4 footer"><Link href="/voyages">Voyages</Link><Link href="/suites">Rooms & suites</Link><Link href="/charter">Private charter</Link><Link href="/contact">Contact</Link></nav><p className="h4-caption">Hathor Dahabiya · Egypt</p></footer>
      </section>
    </main>
  </HomeFourExperience>;
}
