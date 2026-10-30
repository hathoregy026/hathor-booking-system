import Link from "next/link";
import type { TranslatedLocale } from "@/lib/i18n/locale";
import { NOT_FOUND_COPY } from "@/lib/i18n/not-found";

/** The 404 for every address of a language that has no page, inside the public site chrome. */
export function LocaleNotFound({ locale }: { locale: TranslatedLocale }) {
  const copy = NOT_FOUND_COPY[locale];
  return (
    <main className="locale-404">
      <p className="locale-404__eyebrow">{copy.eyebrow}</p>
      <h1 className="locale-404__title">{copy.title}</h1>
      <p className="locale-404__lede">{copy.lede}</p>
      <div className="locale-404__actions">
        <Link href={`/${locale}`} className="public-btn-outline-gold">
          {copy.home}
        </Link>
        <Link href={`/${locale}/voyages`} className="public-btn-dark">
          {copy.voyages}
        </Link>
      </div>
    </main>
  );
}
