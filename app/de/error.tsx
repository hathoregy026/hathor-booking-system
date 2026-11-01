"use client";

import { LocaleErrorScreen } from "@/components/public/LocaleErrorScreen";
import "../hathor-fonts.css";
import "../public.css";
import "../button-system.css";
import "../locale-not-found.css";

/** The standalone German pages (Dining, Suites, rooms): no site chrome to sit inside. */
export default function GermanStandaloneError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="public-site hathor-site">
      <LocaleErrorScreen locale="de" digest={error.digest} reset={reset} />
    </div>
  );
}
