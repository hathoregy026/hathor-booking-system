"use client";

import { HomePage2BookBar } from "./HomePage2BookBar";
import { HomePage2ScrollReveal } from "./HomePage2ScrollReveal";

export function HomePage2Client() {
  return (
    <div className="homepage-2-root">
      <HomePage2BookBar />

      <HomePage2ScrollReveal
        imageName="home-hero-poster"
        imageAlt="Luxury Nile cruise at sunset"
      />
    </div>
  );
}
