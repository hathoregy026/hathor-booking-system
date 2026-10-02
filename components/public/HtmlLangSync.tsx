"use client";

import { useLayoutEffect } from "react";
import { usePublicLocale } from "@/hooks/usePublicLocale";
import { PUBLIC_LOCALE_HTML_LANG } from "@/lib/i18n/locale";

/** Keeps `<html lang>` on the visitor's language across client-side navigation. */
export function HtmlLangSync() {
  const locale = usePublicLocale();

  useLayoutEffect(() => {
    document.documentElement.lang = PUBLIC_LOCALE_HTML_LANG[locale];
  }, [locale]);

  return null;
}
