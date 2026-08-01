"use client";

import { useRef } from "react";
import { Cinzel, Cormorant_Garamond, Inter } from "next/font/google";
import {
  HighlightsCta,
  HighlightsGallery,
  HighlightsHero,
  HighlightsNile,
  HighlightsTemples,
} from "@/components/pages/highlights/HighlightsSections";
import { useHighlightsPageMotion } from "@/hooks/useHighlightsPageMotion";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-aw-cinzel",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-aw-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
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
      className={`hl-page aw-page ${cinzel.variable} ${inter.variable} ${cormorant.variable}`}
    >
      <HighlightsHero />
      <HighlightsTemples />
      <HighlightsNile />
      <HighlightsGallery />
      <HighlightsCta />
    </div>
  );
}
