"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { ERROR_COPY_IT, NOT_FOUND_COPY_IT } from "@/lib/i18n/system-pages-copy";

/** The Italian 404's words and links, inside whichever chrome the route has. */
export function ItalianNotFoundScreen() {
  const t = NOT_FOUND_COPY_IT;
  return (
    <main className="it-404">
      <p className="it-404__eyebrow">{t.eyebrow}</p>
      <h1 className="it-404__title">{t.title}</h1>
      <p className="it-404__lede">{t.lede}</p>
      <div className="it-404__actions">
        <Link href="/it" className="public-btn-outline-gold">
          {t.home}
        </Link>
        <Link href="/it/voyages" className="public-btn-dark">
          {t.voyages}
        </Link>
      </div>
    </main>
  );
}

/** The Italian error screen. Plain anchor home: the app may be what failed. */
export function ItalianErrorScreen({
  digest,
  reset,
}: {
  digest?: string;
  reset: () => void;
}) {
  const t = ERROR_COPY_IT;
  /* The route's own title never loaded, so the browser tab would show the English default. */
  useEffect(() => {
    document.title = t.pageTitle;
  }, [t.pageTitle]);
  return (
    <main className="it-404">
      <p className="it-404__eyebrow">{t.eyebrow}</p>
      <h1 className="it-404__title">{t.title}</h1>
      <p className="it-404__lede">
        {t.lede} <a href={`mailto:${PUBLIC_CONTACT.email}`}>{PUBLIC_CONTACT.email}</a>.
      </p>
      <div className="it-404__actions">
        <button type="button" onClick={reset} className="public-btn-dark">
          {t.retry}
        </button>
        <a href="/it" className="public-btn-outline-gold">
          {t.home}
        </a>
      </div>
      {digest ? (
        <p className="it-404__eyebrow">
          {t.reference} {digest}
        </p>
      ) : null}
    </main>
  );
}
