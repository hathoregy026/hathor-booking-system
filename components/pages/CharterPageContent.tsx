"use client";

import { useRef } from "react";
import { Cinzel, Cormorant_Garamond, Inter } from "next/font/google";
import { useCharterPageMotion } from "@/hooks/useCharterPageMotion";

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

export function CharterPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  useCharterPageMotion(rootRef);

  return (
    <div
      ref={rootRef}
      data-charter-page=""
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
        <p className="label mb-8 reveal-label">THE HATHOR</p>
        <h1
          className="text-[clamp(3rem,9vw,8rem)] text-center leading-[1.05] tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-aw-cinzel), Cinzel, serif", fontWeight: 400 }}
        >
          <span className="block overflow-hidden">
            <span className="block reveal-text text-[var(--color-nile-blue)]">
              Your Floating
            </span>
          </span>
          <span className="block overflow-hidden">
            <span
              className="block reveal-text italic text-[var(--color-charcoal)]"
              style={{ fontFamily: "var(--font-aw-cormorant), 'Cormorant Garamond', serif" }}
            >
              Palace.
            </span>
          </span>
        </h1>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1600&q=90"
          className="w-full max-w-5xl mx-auto mt-16 aspect-[16/9] object-cover shadow-[0_40px_80px_-20px_rgba(27,73,101,0.15)] reveal-image"
          alt="Hathor ship"
        />
      </div>

      {/* SECTION 2 - SPECS GRID */}
      <div className="py-32 md:py-48 px-6 md:px-12 bg-[var(--color-cream)]" data-ch-specs="">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200 max-w-6xl mx-auto border border-gray-200">
          <div className="bg-[var(--color-cream)] p-12 md:p-16 text-center flex flex-col items-center">
            <span
              className="text-[clamp(3rem,5vw,4.5rem)] text-[var(--color-nile-blue)] counter-anim"
              data-ch-count=""
              data-target="240"
              style={{ fontFamily: "var(--font-aw-cinzel), Cinzel, serif" }}
            >
              240
            </span>
            <span className="text-[0.75rem] tracking-[0.2em] uppercase text-[var(--color-gray-600)] mt-4 block">
              Feet of Pure Elegance
            </span>
          </div>
          <div className="bg-[var(--color-cream)] p-12 md:p-16 text-center flex flex-col items-center">
            <span
              className="text-[clamp(3rem,5vw,4.5rem)] text-[var(--color-nile-blue)] counter-anim"
              data-ch-count=""
              data-target="24"
              style={{ fontFamily: "var(--font-aw-cinzel), Cinzel, serif" }}
            >
              24
            </span>
            <span className="text-[0.75rem] tracking-[0.2em] uppercase text-[var(--color-gray-600)] mt-4 block">
              Royal Suites
            </span>
          </div>
          <div className="bg-[var(--color-cream)] p-12 md:p-16 text-center flex flex-col items-center">
            <span
              className="text-[clamp(3rem,5vw,4.5rem)] text-[var(--color-nile-blue)] counter-anim"
              data-ch-count=""
              data-target="5"
              style={{ fontFamily: "var(--font-aw-cinzel), Cinzel, serif" }}
            >
              5
            </span>
            <span className="text-[0.75rem] tracking-[0.2em] uppercase text-[var(--color-gray-600)] mt-4 block">
              Star Service
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 3 - SUITES (Sticky Image) */}
      <div className="bg-[var(--color-nile-blue)] text-[var(--color-cream)]">
        <div className="min-h-screen flex flex-col md:flex-row">
          <div className="md:w-1/2 h-[50vh] md:h-screen sticky top-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1590496993476-241ec45a02fa?auto=format&fit=crop&w=1200&q=90"
              className="w-full h-full object-cover"
              alt="Pharaoh Suite"
            />
          </div>
          <div className="md:w-1/2 p-12 md:p-24 flex flex-col justify-center">
            <h3
              className="text-[clamp(2rem,4vw,3rem)] mb-4"
              style={{ fontFamily: "var(--font-aw-cinzel), Cinzel, serif", fontWeight: 400 }}
            >
              Pharaoh Suite
            </h3>
            <p className="text-[var(--color-gold)] text-sm tracking-[0.15em] uppercase mb-8">
              850 SQ FT
            </p>
            <p className="text-[clamp(1rem,1.5vw,1.125rem)] leading-relaxed opacity-80 mb-12">
              Panoramic Nile views, private balcony, and royal Egyptian
              furnishings. A sanctuary designed for those who accept nothing less
              than perfection.
            </p>
            <p
              className="text-[clamp(1.5rem,3vw,2rem)] mb-12"
              style={{ fontFamily: "var(--font-aw-cinzel), Cinzel, serif" }}
            >
              From $7,000 / night
            </p>
            <a
              href="/booking"
              className="inline-block border border-[var(--color-gold)] text-[var(--color-gold)] px-8 py-4 text-xs tracking-[0.2em] uppercase hover:bg-[var(--color-gold)] hover:text-[var(--color-nile-blue)] transition-all duration-700 w-max"
            >
              View Suite Details
            </a>
          </div>
        </div>
      </div>

      {/* SECTION 4 - CTA */}
      <div className="py-48 px-6 text-center bg-[var(--color-cream)]">
        <h2
          className="text-[clamp(2.5rem,6vw,5rem)] text-[var(--color-nile-blue)] mb-8"
          style={{ fontFamily: "var(--font-aw-cinzel), Cinzel, serif", fontWeight: 400 }}
        >
          Begin Your Legacy.
        </h2>
        <p className="text-[clamp(1rem,1.5vw,1.125rem)] text-[var(--color-gray-600)] max-w-xl mx-auto mb-16 leading-relaxed">
          Spaces are strictly limited to ensure an intimate, bespoke experience.
          Secure your private passage today.
        </p>
        <a
          href="/booking"
          className="inline-block bg-[var(--color-charcoal)] text-[var(--color-cream)] px-12 py-5 text-xs tracking-[0.2em] uppercase hover:bg-[var(--color-gold)] hover:text-[var(--color-charcoal)] transition-all duration-700"
        >
          Reserve Your Voyage
        </a>
      </div>
    </div>
  );
}
