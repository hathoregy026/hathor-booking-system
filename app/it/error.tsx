"use client";

import { LocaleErrorScreen } from "@/components/public/LocaleErrorScreen";
import "../hathor-fonts.css";
import "../public.css";
import "../button-system.css";
import "../locale-not-found.css";

/** The standalone Italian pages (Dining, Suites, rooms): no site chrome to sit inside. */
export default function ItalianStandaloneError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="public-site hathor-site">
      <LocaleErrorScreen locale="it" digest={error.digest} reset={reset} />
    </div>
  );
}
