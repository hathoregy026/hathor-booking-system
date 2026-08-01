"use client";

import { useRef } from "react";
import { Cinzel, Cormorant_Garamond, Inter } from "next/font/google";
import { useHighlightsPageMotion } from "@/hooks/useHighlightsPageMotion";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-aw-cinzel",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-aw-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic", "normal"],
  variable: "--font-aw-cormorant",
  display: "swap",
});

export function HighlightsPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  useHighlightsPageMotion(rootRef);

  return (
    <div
      ref={rootRef}
      data-highlights-page=""
      className={`${cinzel.variable} ${inter.variable} ${cormorant.variable}`}
      style={{
        backgroundColor: "var(--color-cream)",
        color: "var(--color-charcoal)",
        fontFamily: "var(--font-aw-inter), Inter, sans-serif",
        fontWeight: 300,
        lineHeight: 1.8,
        letterSpacing: "0.02em",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* SECTION 1 - HERO */}
      <div className="min-h-screen flex flex-col justify-center items-center px-6 bg-[var(--color-cream)]">
        <p className="label mb-8 reveal-label">THE JOURNEY</p>
        <h1
          className="text-[clamp(3rem,8vw,7rem)] text-[var(--color-nile-blue)] text-center leading-[1.05] tracking-[-0.02em] mb-4"
          style={{ fontFamily: "var(--font-aw-cinzel), Cinzel, serif", fontWeight: 400 }}
        >
          <span className="block overflow-hidden">
            <span className="block reveal-text">Where Time</span>
          </span>
          <span className="block overflow-hidden">
            <span
              className="block reveal-text italic text-[var(--color-charcoal)]"
              style={{ fontFamily: "var(--font-aw-cormorant), 'Cormorant Garamond', serif" }}
            >
              Stands Still.
            </span>
          </span>
        </h1>
        <p className="text-[clamp(1rem,1.5vw,1.125rem)] text-[var(--color-gray-600)] max-w-xl mx-auto mt-8 leading-relaxed reveal-subtext">
          A curated voyage through the heart of ancient Egypt, designed for those
          who seek the extraordinary.
        </p>
      </div>

      {/* SECTION 2 - TEMPLES SPLIT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 px-6 md:px-12 max-w-7xl mx-auto py-32 md:py-48">
        <div className="md:col-span-5 relative overflow-hidden aspect-[3/4]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1568322445389-d6a4c9f3b7h5?auto=format&fit=crop&w=1200&q=90"
            className="w-full h-full object-cover parallax-img scale-110"
            alt="Luxor Temple"
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=1200&q=90";
            }}
          />
        </div>
        <div className="md:col-span-6 md:col-start-7 flex flex-col justify-center">
          <p className="label mb-6">01 / ANCIENT WONDERS</p>
          <h2
            className="text-[clamp(2rem,4vw,3.5rem)] text-[var(--color-nile-blue)] mb-8 leading-tight"
            style={{ fontFamily: "var(--font-aw-cinzel), Cinzel, serif", fontWeight: 400 }}
          >
            Temples of the Gods
          </h2>
          <p className="text-[clamp(1rem,1.5vw,1.125rem)] text-[var(--color-gray-600)] leading-relaxed mb-12">
            Stand before monuments that have witnessed millennia of human
            devotion. From the towering columns of Karnak to the intimate
            sanctuaries of Luxor, each stone tells a story carved by the hands of
            masters.
          </p>
          <div className="w-16 h-px bg-[var(--color-gold)] mb-8" />
          <a
            href="/cruises"
            className="text-sm tracking-[0.15em] uppercase text-[var(--color-charcoal)] border-b border-[var(--color-charcoal)] pb-2 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] w-max"
          >
            Read the Story
          </a>
        </div>
      </div>

      {/* SECTION 3 - FULL BLEED NILE */}
      <div className="relative h-[80vh] w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=2400&q=90"
          className="absolute inset-0 w-full h-full object-cover parallax-bg"
          alt="Nile at sunset"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-cream)] via-[var(--color-cream)]/80 to-transparent" />
        <div className="absolute bottom-12 left-12 md:bottom-24 md:left-24 max-w-2xl">
          <blockquote
            className="text-[clamp(1.5rem,3vw,3rem)] text-[var(--color-charcoal)] italic leading-tight"
            style={{ fontFamily: "var(--font-aw-cinzel), Cinzel, serif" }}
          >
            &ldquo;The Nile has been the lifeblood of civilization for 5,000 years.
            Now, it carries you through time itself.&rdquo;
          </blockquote>
        </div>
      </div>

      {/* SECTION 4 - MASONRY GRID */}
      <div className="bg-[var(--color-sandstone)] py-32 md:py-48 px-6 md:px-12">
        <div className="max-w-7xl mx-auto mb-20">
          <p className="label mb-6">02 / ONBOARD LUXURY</p>
          <h2
            className="text-[clamp(2rem,4vw,3.5rem)] text-[var(--color-nile-blue)]"
            style={{ fontFamily: "var(--font-aw-cinzel), Cinzel, serif", fontWeight: 400 }}
          >
            Sanctuaries at Sea
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-7xl mx-auto">
          <div className="md:row-span-2 relative overflow-hidden group aspect-[3/4]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1590496993476-241ec45a02fa?auto=format&fit=crop&w=1000&q=90"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
              alt="Suite"
            />
          </div>
          <div className="relative overflow-hidden group aspect-[4/3]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=90"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
              alt="Dining"
            />
          </div>
          <div className="relative overflow-hidden group aspect-[4/3]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=90"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
              alt="Spa"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
