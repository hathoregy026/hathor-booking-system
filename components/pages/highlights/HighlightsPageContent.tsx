"use client";

import { useRef } from "react";
import Image from "next/image";
import { Cinzel, Cormorant_Garamond } from "next/font/google";
import "@/app/dark-luxury-pages.css";
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
  hero: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=2400&q=90",
  temple:
    "https://images.unsplash.com/photo-1568322445389-d6a4c9f3b7h5?auto=format&fit=crop&w=1600&q=90",
  felucca:
    "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=2400&q=90",
  suite:
    "https://images.unsplash.com/photo-1590496993476-241ec45a02fa?auto=format&fit=crop&w=1200&q=90",
  dining:
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=90",
  spa: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1000&q=90",
} as const;

export function HighlightsPageContent() {
  const rootRef = useRef<HTMLElement>(null);
  useDarkLuxuryPageMotion(rootRef);

  return (
    <main
      ref={rootRef}
      data-dark-luxury-page=""
      data-highlights-page=""
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
            alt="Nile at golden hour"
            fill
            priority
            sizes="100vw"
            quality={90}
            className="parallax-hero h-full w-full scale-110 object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="reveal-label mb-8 text-[0.75rem] uppercase tracking-[0.35em] text-[var(--color-gold)] opacity-0">
            THE JOURNEY
          </p>
          <h1
            className="mb-6 text-[clamp(3rem,12vw,9rem)] leading-[0.9] tracking-[-0.03em] text-[var(--color-cream)]"
            style={{ fontFamily: "var(--font-dl-cinzel), Cinzel, serif" }}
          >
            <span className="block overflow-hidden">
              <span className="reveal-text block translate-y-full">WHERE TIME</span>
            </span>
            <span className="block overflow-hidden">
              <span
                className="reveal-text block translate-y-full italic text-[var(--color-gold)]"
                style={{
                  fontFamily:
                    "var(--font-dl-cormorant), 'Cormorant Garamond', serif",
                }}
              >
                STANDS STILL
              </span>
            </span>
          </h1>
          <p className="reveal-subtext mx-auto mt-12 max-w-lg text-lg text-[var(--color-gray)] opacity-0">
            A curated voyage through ancient Egypt, designed for those who seek
            the extraordinary.
          </p>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
          <div className="h-24 w-px animate-pulse bg-gradient-to-b from-[var(--color-gold)] to-transparent" />
        </div>
      </section>

      {/* SECTION 2 — TEMPLES */}
      <section className="dl-py-48 relative overflow-hidden bg-[var(--color-black)] px-6 py-48 md:dl-py-64 md:px-12 md:py-64">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-12 md:gap-24">
            <div className="relative md:col-span-7">
              <div className="relative aspect-[4/5] overflow-hidden md:aspect-[3/4]">
                <Image
                  src={IMG.temple}
                  alt="Luxor Temple"
                  fill
                  sizes="(max-width: 768px) 100vw, 58vw"
                  quality={90}
                  className="parallax-img h-full w-full scale-110 object-cover"
                />
              </div>
              <div className="absolute -bottom-12 -right-12 hidden h-48 w-48 border border-[var(--color-gold)]/30 md:block" />
            </div>

            <div className="md:col-span-5 md:col-start-8">
              <p className="reveal-label mb-6 text-[0.75rem] uppercase tracking-[0.3em] text-[var(--color-gold)]">
                01 / ANCIENT WONDERS
              </p>
              <h2
                className="mb-8 text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-[-0.02em] text-[var(--color-cream)]"
                style={{ fontFamily: "var(--font-dl-cinzel), Cinzel, serif" }}
              >
                <span className="block overflow-hidden">
                  <span className="reveal-text block translate-y-full">TEMPLES</span>
                </span>
                <span className="block overflow-hidden">
                  <span
                    className="reveal-text block translate-y-full italic text-[var(--color-gold)]"
                    style={{
                      fontFamily:
                        "var(--font-dl-cormorant), 'Cormorant Garamond', serif",
                    }}
                  >
                    OF THE GODS
                  </span>
                </span>
              </h2>
              <p className="reveal-subtext mb-12 text-lg leading-relaxed text-[var(--color-gray)] opacity-0">
                Stand before monuments that have witnessed millennia of human
                devotion. From the towering columns of Karnak to the intimate
                sanctuaries of Luxor, each stone tells a story carved by the
                hands of masters.
              </p>
              <a
                href="/cruises"
                className="inline-block border-b border-[var(--color-gold)] pb-2 text-sm uppercase tracking-[0.2em] text-[var(--color-cream)] transition-colors duration-500 hover:text-[var(--color-gold)]"
              >
                Explore the Temples
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — FULL BLEED QUOTE */}
      <section className="relative h-[100vh] w-full overflow-hidden">
        <Image
          src={IMG.felucca}
          alt="Nile felucca"
          fill
          sizes="100vw"
          quality={90}
          className="parallax-bg absolute inset-0 h-full w-full scale-110 object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 flex h-full items-end px-6 pb-32 md:px-24">
          <div className="max-w-3xl">
            <blockquote
              className="text-[clamp(2rem,5vw,4rem)] leading-[1.1] tracking-[-0.02em] text-[var(--color-cream)]"
              style={{ fontFamily: "var(--font-dl-cinzel), Cinzel, serif" }}
            >
              &ldquo;The Nile has been the lifeblood of civilization for 5,000
              years. Now, it carries you through time itself.&rdquo;
            </blockquote>
          </div>
        </div>
      </section>

      {/* SECTION 4 — MASONRY GALLERY */}
      <section className="dl-py-48 bg-[var(--color-dark)] px-6 py-48 md:dl-py-64 md:px-12 md:py-64">
        <div className="mx-auto mb-24 max-w-7xl">
          <p className="mb-6 text-[0.75rem] uppercase tracking-[0.3em] text-[var(--color-gold)]">
            02 / ONBOARD LUXURY
          </p>
          <h2
            className="text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] text-[var(--color-cream)]"
            style={{ fontFamily: "var(--font-dl-cinzel), Cinzel, serif" }}
          >
            Sanctuaries at Sea
          </h2>
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
          <div className="group relative aspect-[3/4] overflow-hidden md:row-span-2">
            <Image
              src={IMG.suite}
              alt="Suite"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={90}
              className="h-full w-full object-cover transition-transform duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors duration-700 group-hover:bg-black/40" />
            <div className="absolute bottom-0 left-0 p-8 opacity-0 transition-opacity duration-700 group-hover:opacity-100 md:p-12">
              <h3
                className="mb-2 text-3xl text-[var(--color-cream)]"
                style={{ fontFamily: "var(--font-dl-cinzel), Cinzel, serif" }}
              >
                Pharaoh Suite
              </h3>
              <p className="text-sm uppercase tracking-[0.15em] text-[var(--color-gold)]">
                850 SQ FT
              </p>
            </div>
          </div>

          <div className="group relative aspect-[4/3] overflow-hidden">
            <Image
              src={IMG.dining}
              alt="Dining"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={90}
              className="h-full w-full object-cover transition-transform duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors duration-700 group-hover:bg-black/40" />
          </div>
          <div className="group relative aspect-[4/3] overflow-hidden">
            <Image
              src={IMG.spa}
              alt="Spa"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={90}
              className="h-full w-full object-cover transition-transform duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors duration-700 group-hover:bg-black/40" />
          </div>
        </div>
      </section>
    </main>
  );
}
