"use client";

import { usePathname } from "next/navigation";
import { useCallback } from "react";
import {
  localizedHref,
  splitLocalePath,
  type PublicLocale,
} from "@/lib/i18n/locale";

/**
 * The visitor's language, read from the address (`/it/…` is Italian). Works in
 * any client component — including the root-level booking chrome — and during
 * the server render, so it never makes a route dynamic.
 */
export function usePublicLocale(): PublicLocale {
  return splitLocalePath(usePathname()).locale;
}

/** The language and the page it shows (`/it/voyages` → it + `/voyages`). */
export function usePublicRoute(): { locale: PublicLocale; path: string } {
  return splitLocalePath(usePathname());
}

/** Links that stay in the visitor's language wherever that page exists. */
export function useLocalizedHref(): (href: string) => string {
  const locale = usePublicLocale();
  return useCallback((href: string) => localizedHref(href, locale), [locale]);
}
