"use client";

import { HomePage2Footer } from "./HomePage2Footer";
import { HomePage2FooterGiantLogo } from "./HomePage2FooterGiantLogo";
import { HomePage2ScrollReveal } from "./HomePage2ScrollReveal";

export function HomePage2Client() {
  return (
    <div className="homepage-2-root">
      {/* Pin theater only — hero, stripes, dome sheet (Venetian pin-wrapper pattern) */}
      <HomePage2ScrollReveal
        imageName="home-hero-poster"
        imageAlt="Luxury Nile cruise at sunset"
      />

      {/* Post-pin cream column — flush sibling, no gap (Venetian content-section pattern) */}
      <section className="homepage-2-content-section" aria-label="Page content">
        <div className="homepage-2-dome-content" />

        <div className="homepage-2-column-tail">
          <HomePage2FooterGiantLogo />
          <HomePage2Footer />
        </div>
      </section>
    </div>
  );
}
