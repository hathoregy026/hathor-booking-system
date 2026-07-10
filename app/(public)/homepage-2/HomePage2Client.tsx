"use client";

import { HomePage2BookBar } from "./HomePage2BookBar";
import { HomePage2Footer } from "./HomePage2Footer";
import { HomePage2FooterGiantLogo } from "./HomePage2FooterGiantLogo";
import { HomePage2ScrollReveal } from "./HomePage2ScrollReveal";

export function HomePage2Client() {
  return (
    <div className="homepage-2-root">
      <HomePage2BookBar />

      {/* Zone 1 — hero + dome pin only (scroll engine untouched) */}
      <HomePage2ScrollReveal
        imageName="home-hero-poster"
        imageAlt="Luxury Nile cruise at sunset"
      />

      {/* Zone 2 — dome column: content canvas + footer logo + footer cap */}
      <div className="homepage-2-cream-floor">
        <div className="homepage-2-dome-content" aria-hidden="true" />

        <div className="homepage-2-column-tail">
          <HomePage2FooterGiantLogo />
          <HomePage2Footer />
        </div>
      </div>
    </div>
  );
}
