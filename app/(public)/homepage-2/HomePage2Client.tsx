"use client";

import { useRef } from "react";
import { HomePage2BookBar } from "./HomePage2BookBar";
import { HomePage2ScrollReveal } from "./HomePage2ScrollReveal";
import { HomePage2SheetFooterLogo } from "./HomePage2SheetFooterLogo";

export function HomePage2Client() {
  const transitionRef = useRef<HTMLElement>(null);

  return (
    <div className="homepage-2-root">
      <HomePage2BookBar />

      <HomePage2ScrollReveal
        ref={transitionRef}
        imageName="home-hero-poster"
        imageAlt="Luxury Nile cruise at sunset"
      />

      <HomePage2SheetFooterLogo transitionRef={transitionRef} />
    </div>
  );
}
