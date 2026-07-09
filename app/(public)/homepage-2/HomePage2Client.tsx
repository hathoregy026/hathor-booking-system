"use client";

import { HomePage2BookBar } from "./HomePage2BookBar";
import { HomePage2ScrollReveal } from "./HomePage2ScrollReveal";

export function HomePage2Client() {
  return (
    <div className="homepage-2-root">
      <HomePage2BookBar />

      <HomePage2ScrollReveal
        title="The Hathor Experience"
        imageName="home-hero-poster"
        imageAlt="Luxury Nile cruise at sunset"
      >
        <section className="homepage-2-placeholder" aria-label="Homepage content">
          <p className="homepage-2-placeholder__eyebrow">Hathor</p>
          <h1>The Hathor Experience</h1>
        </section>
      </HomePage2ScrollReveal>
    </div>
  );
}
