"use client";

import { HomePage2BookBar } from "./HomePage2BookBar";
import { HomePage2FooterGiantLogo } from "./HomePage2FooterGiantLogo";
import { HomePage2ScrollReveal } from "./HomePage2ScrollReveal";

export function HomePage2Client() {
  return (
    <div className="homepage-2-root">
      <HomePage2BookBar />

      {/* Hero + dome pin only — cream column is a sibling below (test-scroll-reveal pattern) */}
      <HomePage2ScrollReveal
        imageName="home-hero-poster"
        imageAlt="Luxury Nile cruise at sunset"
      />

      <div className="homepage-2-cream-floor">
        <HomePage2FooterGiantLogo />
      </div>
    </div>
  );
}
