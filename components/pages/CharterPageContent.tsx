"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Cinzel, Cormorant_Garamond } from "next/font/google";
import "@/app/dark-luxury-pages.css";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { useDarkLuxuryPageMotion } from "@/hooks/useDarkLuxuryPageMotion";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-dl-cinzel",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic", "normal"],
  variable: "--font-dl-cormorant",
  display: "swap",
});

const IMG = {
  hero: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=2400&q=90",
  suite:
    "https://images.unsplash.com/photo-1590496993476-241ec45a02fa?auto=format&fit=crop&w=1600&q=90",
} as const;

export function CharterPageContent() {
  const rootRef = useRef<HTMLElement>(null);
  useDarkLuxuryPageMotion(rootRef);

  return (
    <main
      ref={rootRef}
      data-dark-luxury-page=""
      data-charter-page=""
      className={`${cinzel.variable} ${cormorant.variable}`}
      style={{
        fontFamily: "system-ui, sans-serif",
        backgroundColor: "var(--color-black)",
      }}
    >
      {/* SECTION 1 — HERO */}
      <section className="relative h-screen w-full overflow-hidden bg-[var(--color-black)]">
        <div className="absolute inset-0 h-full w-full">
          <Image
            src={IMG.hero}
            alt="Hathor yacht"
            fill
            priority
            sizes="100vw"
            quality={90}
            className="parallax-hero h-full w-full scale-110 object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="reveal-label mb-8 text-[0.75rem] uppercase tracking-[0.35em] text-[var(--color-gold)] opacity-0">
            THE HATHOR
          </p>
          <h1
            className="text-[clamp(3rem,12vw,9rem)] leading-[0.9] tracking-[-0.03em] text-[var(--color-cream)]"
            style={{ fontFamily: "var(--font-dl-cinzel), Cinzel, serif" }}
          >
            <span className="block overflow-hidden">
              <span className="reveal-text block translate-y-full">YOUR FLOATING</span>
            </span>
            <span className="block overflow-hidden">
              <span
                className="reveal-text block translate-y-full italic text-[var(--color-gold)]"
                style={{
                  fontFamily:
                    "var(--font-dl-cormorant), 'Cormorant Garamond', serif",
                }}
              >
                PALACE
              </span>
            </span>
          </h1>
        </div>
      </section>

      {/* SECTION 2 — SPECS */}
      <section className="dl-py-48 border-t border-[var(--color-charcoal)] bg-[var(--color-black)] px-6 py-48 md:dl-py-64 md:px-12 md:py-64">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-px bg-[var(--color-charcoal)] md:grid-cols-3">
            <div className="bg-[var(--color-black)] p-12 text-center md:p-16">
              <span
                className="mb-4 block text-[clamp(3rem,6vw,5rem)] text-[var(--color-cream)]"
                style={{ fontFamily: "var(--font-dl-cinzel), Cinzel, serif" }}
              >
                240
              </span>
              <span className="block text-[0.75rem] uppercase tracking-[0.25em] text-[var(--color-gray)]">
                Feet of Elegance
              </span>
            </div>
            <div className="bg-[var(--color-black)] p-12 text-center md:p-16">
              <span
                className="mb-4 block text-[clamp(3rem,6vw,5rem)] text-[var(--color-cream)]"
                style={{ fontFamily: "var(--font-dl-cinzel), Cinzel, serif" }}
              >
                24
              </span>
              <span className="block text-[0.75rem] uppercase tracking-[0.25em] text-[var(--color-gray)]">
                Royal Suites
              </span>
            </div>
            <div className="bg-[var(--color-black)] p-12 text-center md:p-16">
              <span
                className="mb-4 block text-[clamp(3rem,6vw,5rem)] text-[var(--color-cream)]"
                style={{ fontFamily: "var(--font-dl-cinzel), Cinzel, serif" }}
              >
                5
              </span>
              <span className="block text-[0.75rem] uppercase tracking-[0.25em] text-[var(--color-gray)]">
                Star Service
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — SUITES */}
      <section className="bg-[var(--color-dark)]">
        <div className="flex min-h-screen flex-col md:flex-row">
          <div className="relative sticky top-0 h-[60vh] overflow-hidden md:h-screen md:w-1/2">
            <Image
              src={IMG.suite}
              alt="Pharaoh Suite"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={90}
              className="parallax-img h-full w-full scale-110 object-cover"
            />
          </div>
          <div className="flex flex-col justify-center bg-[var(--color-black)] p-12 md:w-1/2 md:p-24">
            <p className="mb-6 text-[0.75rem] uppercase tracking-[0.3em] text-[var(--color-gold)]">
              01 / PHARAOH SUITE
            </p>
            <h3
              className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-[0.95] text-[var(--color-cream)]"
              style={{ fontFamily: "var(--font-dl-cinzel), Cinzel, serif" }}
            >
              Royal Sanctuary
            </h3>
            <p className="mb-12 text-lg leading-relaxed text-[var(--color-gray)]">
              Panoramic Nile views, private balcony, and royal Egyptian
              furnishings. A sanctuary designed for those who accept nothing less
              than perfection.
            </p>
            <p
              className="mb-12 text-[clamp(1.5rem,3vw,2.5rem)] text-[var(--color-cream)]"
              style={{ fontFamily: "var(--font-dl-cinzel), Cinzel, serif" }}
            >
              From $7,000 / night
            </p>
            <Link
              href="/Luxury-Royal-Suites-Nile-Dahabiya-Cruise"
              className="inline-block w-max border border-[var(--color-gold)] px-8 py-4 text-sm uppercase tracking-[0.2em] text-[var(--color-cream)] transition-all duration-700 hover:bg-[var(--color-gold)] hover:text-[var(--color-black)]"
            >
              View Details
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 4 — CTA */}
      <section className="dl-py-48 border-t border-[var(--color-charcoal)] bg-[var(--color-black)] px-6 py-48 text-center md:dl-py-64 md:py-64">
        <h2
          className="mb-8 text-[clamp(2.5rem,8vw,6rem)] leading-[0.95] text-[var(--color-cream)]"
          style={{ fontFamily: "var(--font-dl-cinzel), Cinzel, serif" }}
        >
          Begin Your Legacy
        </h2>
        <p className="mx-auto mb-16 max-w-xl text-lg text-[var(--color-gray)]">
          Spaces are strictly limited. Secure your private passage today.
        </p>
        <BookNowTrigger className="inline-block bg-[var(--color-gold)] px-12 py-5 text-xs uppercase tracking-[0.25em] text-[var(--color-black)] transition-colors duration-700 hover:bg-[var(--color-cream)]">
          Reserve Your Voyage
        </BookNowTrigger>
      </section>
    </main>
  );
}
