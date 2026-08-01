"use client";

import { useRef } from "react";
import { Cinzel, Cormorant_Garamond, Inter } from "next/font/google";
import {
  HighlightsHook,
  HighlightsInvite,
  HighlightsNile,
  HighlightsOnboard,
  HighlightsTemples,
} from "@/components/pages/highlights/HighlightsSections";
import { CeCursor } from "@/components/pages/awards/CeCursor";
import { useHighlightsPageMotion } from "@/hooks/useHighlightsPageMotion";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-aw-cinzel",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-aw-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400"],
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
      className={`hl-page ce-page ${cinzel.variable} ${inter.variable} ${cormorant.variable}`}
    >
      <CeCursor rootRef={rootRef} />
      <HighlightsHook />
      <HighlightsTemples />
      <HighlightsNile />
      <HighlightsOnboard />
      <HighlightsInvite />
    </div>
  );
}
