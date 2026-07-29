"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { HathorLogoPartsVariant } from "@/lib/hathor-logo-letters";

type HeroLogoSettings = {
  desktopPartsVariant: HathorLogoPartsVariant;
  mobilePartsVariant: HathorLogoPartsVariant;
};

const DEFAULT_SETTINGS: HeroLogoSettings = {
  desktopPartsVariant: "current",
  mobilePartsVariant: "current",
};

const HeroLogoSettingsContext =
  createContext<HeroLogoSettings>(DEFAULT_SETTINGS);

export function HeroLogoSettingsProvider({
  desktopPartsVariant,
  mobilePartsVariant,
  children,
}: HeroLogoSettings & { children: ReactNode }) {
  return (
    <HeroLogoSettingsContext.Provider
      value={{ desktopPartsVariant, mobilePartsVariant }}
    >
      {children}
    </HeroLogoSettingsContext.Provider>
  );
}

export function useHeroLogoSettings(): HeroLogoSettings {
  return useContext(HeroLogoSettingsContext);
}
