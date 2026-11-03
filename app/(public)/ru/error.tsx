"use client";

import { LocaleErrorScreen } from "@/components/public/LocaleErrorScreen";
import "../../locale-not-found.css";

/** Any failure on a Russian page in the public site, inside the site chrome. */
export default function RussianPublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <LocaleErrorScreen locale="ru" digest={error.digest} reset={reset} />;
}
