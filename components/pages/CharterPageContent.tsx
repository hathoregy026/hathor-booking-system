"use client";

import { useRef, useState } from "react";
import { Cinzel, Cormorant_Garamond, Inter } from "next/font/google";
import {
  CharterInvite,
  CharterReveal,
  CharterSpecs,
  CharterSuites,
} from "@/components/pages/charter/CharterSections";
import { CharterRouteSelector } from "@/components/pages/charter/CharterRouteSelector";
import { CharterRequestForm } from "@/components/pages/charter/CharterRequestForm";
import { CeCursor } from "@/components/pages/awards/CeCursor";
import { useCharterPageMotion } from "@/hooks/useCharterPageMotion";
import { CHARTER_PAGE } from "@/lib/page-content";

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

export function CharterPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const routes = CHARTER_PAGE.overview.routes;
  const [preferredRoute, setPreferredRoute] = useState<string>(routes[0]!);

  useCharterPageMotion(rootRef);

  return (
    <div
      ref={rootRef}
      data-charter-page=""
      className={`ch-page ce-page ${cinzel.variable} ${inter.variable} ${cormorant.variable}`}
    >
      <CeCursor rootRef={rootRef} />
      <CharterReveal />
      <CharterSpecs />
      <CharterSuites />
      <CharterInvite />
      <CharterRouteSelector
        routes={routes}
        value={preferredRoute}
        onChange={setPreferredRoute}
      />
      <CharterRequestForm
        preferredRoute={preferredRoute}
        routes={routes}
        onPreferredRouteChange={setPreferredRoute}
      />
    </div>
  );
}
