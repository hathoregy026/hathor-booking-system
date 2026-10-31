"use client";

import { useEffect } from "react";
import type { TranslatedLocale } from "@/lib/i18n/locale";
import { ERROR_COPY } from "@/lib/i18n/system-pages-copy";
import { PUBLIC_CONTACT } from "@/lib/public-contact";

/** A translated error screen. Plain anchor home: the app may be what failed. */
export function LocaleErrorScreen({
  locale,
  digest,
  reset,
}: {
  locale: TranslatedLocale;
  digest?: string;
  reset: () => void;
}) {
  const t = ERROR_COPY[locale];
  /* The route's own title never loaded, so the browser tab would show the English default. */
  useEffect(() => {
    document.title = t.pageTitle;
  }, [t.pageTitle]);
  return (
    <main className="locale-404">
      <p className="locale-404__eyebrow">{t.eyebrow}</p>
      <h1 className="locale-404__title">{t.title}</h1>
      <p className="locale-404__lede">
        {t.lede} <a href={`mailto:${PUBLIC_CONTACT.email}`}>{PUBLIC_CONTACT.email}</a>.
      </p>
      <div className="locale-404__actions">
        <button type="button" onClick={reset} className="public-btn-dark">
          {t.retry}
        </button>
        <a href={`/${locale}`} className="public-btn-outline-gold">
          {t.home}
        </a>
      </div>
      {digest ? (
        <p className="locale-404__eyebrow">
          {t.reference} {digest}
        </p>
      ) : null}
    </main>
  );
}
