"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Occasion } from "@/lib/occasions";

const OccasionsContext = createContext<Occasion[]>([]);

/** Saved occasions from the public CMS bundle (Admin → Occasions). */
export function OccasionsProvider({
  occasions,
  children,
}: {
  occasions: Occasion[];
  children: ReactNode;
}) {
  return <OccasionsContext.Provider value={occasions}>{children}</OccasionsContext.Provider>;
}

export function useOccasions(): Occasion[] {
  return useContext(OccasionsContext);
}
