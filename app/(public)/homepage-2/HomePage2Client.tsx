"use client";

import { HomePage2BookBar } from "./HomePage2BookBar";
import { HomePage2Footer } from "./HomePage2Footer";
import { HomePage2FooterGiantLogo } from "./HomePage2FooterGiantLogo";
import { HomePage2ScrollReveal } from "./HomePage2ScrollReveal";
import { useHomePage2PinHandoff } from "./useHomePage2PinHandoff";

export function HomePage2Client() {
  useHomePage2PinHandoff();

  return (
    <div className="homepage-2-root">
      <HomePage2BookBar />

      <div className="homepage-2-dome-column">
        {/* Zone 1 — hero + dome pin only */}
        <HomePage2ScrollReveal
          imageName="home-hero-poster"
          imageAlt="Luxury Nile cruise at sunset"
        />

        {/* Zone 2 — cream column cap: content + footer logo + footer */}
        <div className="homepage-2-cream-floor">
          <div className="homepage-2-dome-content" aria-hidden="true" />

          <div className="homepage-2-column-tail">
            <HomePage2FooterGiantLogo />
            <HomePage2Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
