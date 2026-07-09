"use client";

import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";

const BACK_LOGO_SRC =
  "/branding/hathor-logo-behing-the-sheet-egypt-toors-pyramids.svg";

export function HomePage2Client() {
  return (
    <div className="homepage-2-root">
      <div className="top-book-buttons" aria-label="Booking shortcuts">
        <BookNowTrigger className="book-now-btn">BOOK NOW</BookNowTrigger>
        <BookNowTrigger className="book-now-btn">BOOK NOW</BookNowTrigger>
      </div>

      <div className="giant-logo-container" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={BACK_LOGO_SRC} alt="" />
      </div>

      <PageScrollTransition
        title="The Hathor Experience"
        heroTitle="Hathor"
        subtitle="Nile · Luxor to Aswan"
        breadcrumb="Home"
        imageName="home-hero-poster"
        imageAlt="Luxury Nile cruise at sunset"
      >
        <section className="homepage-2-placeholder" aria-label="Homepage content">
          <p className="homepage-2-placeholder__eyebrow">Hathor</p>
          <h1>The Hathor Experience</h1>
        </section>
      </PageScrollTransition>
    </div>
  );
}
