"use client";

import { getHathorLogoSrc, HATHOR_BRAND_NAME } from "@/lib/branding";
import { useAdminTheme } from "./ThemeProvider";

type HathorLogoProps = {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /** Use "none" for transparent brand mark (sidebar, login). */
  rounded?: "none" | "full" | "2xl" | "xl";
};

const SIZE_CLASSES = {
  sm: "h-9 w-9",
  md: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-16 w-16",
};

const ROUNDED_CLASSES = {
  none: "",
  full: "rounded-full",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
};

export function HathorLogo({
  size = "md",
  className = "",
  rounded = "none",
}: HathorLogoProps) {
  const { theme } = useAdminTheme();

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={getHathorLogoSrc(theme)}
      alt={HATHOR_BRAND_NAME}
      className={`shrink-0 object-contain ${SIZE_CLASSES[size]} ${ROUNDED_CLASSES[rounded]} ${className}`}
    />
  );
}
